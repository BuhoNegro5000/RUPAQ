import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { ForecastResponse, Location } from '$lib/types';

export const forecast = writable<ForecastResponse | null>(null);
export const forecastLoading = writable(true);
export const forecastError = writable<string | null>(null);
export const forecastOffline = writable(false);
export const forecastUbigeo = writable<string | null>(null);

let inFlight: Promise<ForecastResponse | null> | null = null;
let inFlightUbigeo: string | null = null;
let lastAttempt = 0;

function localKey(ubigeo: string): string {
  return `rupaq.forecast.v2.${ubigeo}`;
}

function readLocal(ubigeo: string): ForecastResponse | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(localKey(ubigeo));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ForecastResponse;
    return parsed?.ok ? parsed : null;
  } catch {
    return null;
  }
}

function writeLocal(value: ForecastResponse): void {
  if (!browser) return;
  try {
    localStorage.setItem(localKey(value.location.ubigeo), JSON.stringify(value));
  } catch {
    // sin almacenamiento local; el service worker sigue siendo el segundo respaldo
  }
}

export async function loadForecast(
  location: Location,
  options: { force?: boolean } = {}
): Promise<ForecastResponse | null> {
  const current = get(forecast);
  const currentUbigeo = get(forecastUbigeo);
  const currentAge = current
    ? (Date.now() - new Date(current.generatedAt).getTime()) / 60_000
    : Infinity;

  if (
    !options.force &&
    current &&
    currentUbigeo === location.ubigeo &&
    currentAge < 12 &&
    !get(forecastError)
  ) {
    return current;
  }

  if (inFlight && inFlightUbigeo === location.ubigeo) return inFlight;

  forecastLoading.set(!current || currentUbigeo !== location.ubigeo);
  forecastError.set(null);
  forecastOffline.set(false);
  lastAttempt = Date.now();
  inFlightUbigeo = location.ubigeo;

  inFlight = (async () => {
    try {
      const response = await fetch(`/api/forecast?ubigeo=${location.ubigeo}`, {
        headers: { accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`La API respondió ${response.status}`);
      const data = (await response.json()) as ForecastResponse;
      if (!data.ok) throw new Error('Respuesta inválida');
      forecast.set(data);
      forecastUbigeo.set(location.ubigeo);
      forecastLoading.set(false);
      forecastError.set(null);
      writeLocal(data);
      return data;
    } catch (error) {
      const local = readLocal(location.ubigeo);
      if (local) {
        forecast.set(local);
        forecastUbigeo.set(location.ubigeo);
        forecastOffline.set(true);
        forecastError.set(
          'No pudimos actualizar el pronóstico. Estás viendo la última copia guardada.'
        );
        forecastLoading.set(false);
        return local;
      }
      const stored = get(forecast);
      if (stored && stored.location.ubigeo === location.ubigeo) {
        forecastOffline.set(true);
        forecastError.set(
          'No pudimos actualizar el pronóstico. Estás viendo la última predicción válida.'
        );
        forecastLoading.set(false);
        return stored;
      }
      forecastError.set(
        'No pudimos cargar el pronóstico. Revisa tu conexión o elige otro distrito.'
      );
      forecastLoading.set(false);
      return null;
    } finally {
      inFlight = null;
      inFlightUbigeo = null;
    }
  })();

  return inFlight;
}

export function refreshIfStale(location: Location): void {
  if (Date.now() - lastAttempt < 10 * 60_000) return;
  const data = get(forecast);
  if (!data || data.location.ubigeo !== location.ubigeo) {
    void loadForecast(location);
    return;
  }
  const age = (Date.now() - new Date(data.generatedAt).getTime()) / 60_000;
  if (age > 12) void loadForecast(location, { force: true });
}
