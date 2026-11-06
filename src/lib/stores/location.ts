import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { Location } from '$lib/types';
import rawFeatured from '$lib/data/featured-locations.json';

type Row = [string, string, string, string, number, number, number, string];

export const DEFAULT_LOCATION: Location = {
  ubigeo: '150101',
  departamento: 'Lima',
  provincia: 'Lima',
  distrito: 'Lima',
  lat: -12.0464,
  lon: -77.0428,
  altitud: 154,
  zona: 'costa_central'
};

export const featuredLocations = rawFeatured as Location[];
export const PLACES_KEY = 'rupaq.places.v1';
export const LOCATION_KEY = 'rupaq.location.v1';

export const selectedLocation = writable<Location>(DEFAULT_LOCATION);
export const savedPlaces = writable<Location[]>([]);
export const locationHydrated = writable(false);

let allLocations: Location[] | null = null;
let loadingPromise: Promise<Location[]> | null = null;

export function rowToLocation(row: Row): Location {
  return {
    ubigeo: row[0],
    departamento: row[1],
    provincia: row[2],
    distrito: row[3],
    lat: row[4],
    lon: row[5],
    altitud: row[6],
    zona: row[7] as Location['zona']
  };
}

function isLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.ubigeo === 'string' &&
    /^\d{6}$/.test(item.ubigeo) &&
    typeof item.distrito === 'string' &&
    typeof item.provincia === 'string' &&
    typeof item.departamento === 'string'
  );
}

export async function loadAllLocations(): Promise<Location[]> {
  if (allLocations) return allLocations;
  if (loadingPromise) return loadingPromise;
  loadingPromise = fetch('/data/ubigeo.json')
    .then(async (response) => {
      if (!response.ok) throw new Error('No se pudo cargar el ubigeo');
      const rows = (await response.json()) as Row[];
      allLocations = rows.map(rowToLocation);
      return allLocations;
    })
    .catch((error) => {
      loadingPromise = null;
      throw error;
    });
  return loadingPromise;
}

export function loadStoredLocation(): void {
  if (!browser) return;
  try {
    const rawLocation = localStorage.getItem(LOCATION_KEY);
    if (rawLocation) {
      const parsed = JSON.parse(rawLocation);
      if (isLocation(parsed)) selectedLocation.set(parsed);
    }
    const rawPlaces = localStorage.getItem(PLACES_KEY);
    if (rawPlaces) {
      const parsed = JSON.parse(rawPlaces);
      if (Array.isArray(parsed)) savedPlaces.set(parsed.filter(isLocation).slice(0, 3));
    }
  } catch {
    // El almacenamiento puede estar bloqueado; se usa Lima por defecto.
  } finally {
    locationHydrated.set(true);
  }
}

export function setLocation(location: Location, options: { save?: boolean } = {}): void {
  selectedLocation.set(location);
  if (browser) {
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
      if (options.save !== false) {
        const places = get(savedPlaces);
        const exists = places.some((place) => place.ubigeo === location.ubigeo);
        // No descartamos lugares anteriores cuando la lista está llena:
        // el usuario decide qué quitar desde "Mis lugares".
        const next =
          exists || places.length < 3
            ? [location, ...places.filter((place) => place.ubigeo !== location.ubigeo)].slice(0, 3)
            : places;
        savedPlaces.set(next);
        localStorage.setItem(PLACES_KEY, JSON.stringify(next));
      }
    } catch {
      // sin persistencia, la app sigue funcionando
    }
  }
}

export function savePlace(location: Location): { ok: boolean; reason?: string } {
  if (!browser) return { ok: false, reason: 'no-browser' };
  const places = get(savedPlaces);
  if (places.some((place) => place.ubigeo === location.ubigeo)) {
    return { ok: true };
  }
  if (places.length >= 3) {
    return { ok: false, reason: 'El límite es 3 distritos. Quita uno para agregar otro.' };
  }
  const next = [...places, location].slice(0, 3);
  savedPlaces.set(next);
  try {
    localStorage.setItem(PLACES_KEY, JSON.stringify(next));
  } catch {
    return { ok: false, reason: 'No se pudo guardar en este dispositivo.' };
  }
  return { ok: true };
}

export function removePlace(ubigeo: string): void {
  const next = get(savedPlaces).filter((place) => place.ubigeo !== ubigeo);
  savedPlaces.set(next);
  if (browser) {
    try {
      localStorage.setItem(PLACES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
}

export function nearestLocation(locations: Location[], lat: number, lon: number): Location {
  let best = locations[0] ?? DEFAULT_LOCATION;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const location of locations) {
    const distance = haversineKm(lat, lon, location.lat, location.lon);
    if (distance < bestDistance) {
      best = location;
      bestDistance = distance;
    }
  }
  return best;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function searchLocations(
  locations: Location[],
  query: string,
  filters: { departamento?: string; provincia?: string } = {}
): Location[] {
  const normalized = normalizeText(query);
  return locations
    .filter((location) => {
      if (filters.departamento && location.departamento !== filters.departamento) return false;
      if (filters.provincia && location.provincia !== filters.provincia) return false;
      if (!normalized) return true;
      return normalizeText(`${location.distrito} ${location.provincia} ${location.departamento}`).includes(
        normalized
      );
    })
    .slice(0, 60);
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'es'));
}
