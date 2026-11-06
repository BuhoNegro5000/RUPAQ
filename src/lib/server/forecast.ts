import type { AirInfo, ForecastResponse, Location, RiskLevel, SenamhiAlert } from '$lib/types';
import { baseThresholds, keyFromLevel, levelFromFeels } from '$lib/utils/risk';
import { readCache, writeCache } from './cache';
import { fetchOpenMeteo, type AdapterResult } from './adapters/open-meteo';
import { getSenamhiAlerts } from './adapters/senamhi';

const CACHE_VERSION = 'v3';
const MAX_AGE_MINUTES = 90;
const CACHE_TTL_SECONDS = 21_600;

type CachedForecast = Omit<AdapterResult, 'airByHour'> & {
  location: Location;
  fetchedAt: string;
  air: Array<[string, AirInfo]>;
};

function cacheKey(ubigeo: string): string {
  return `forecast:${CACHE_VERSION}:${ubigeo}`;
}

function ageMinutes(fetchedAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60_000));
}

function toCached(result: AdapterResult, location: Location): CachedForecast {
  return {
    location,
    fetchedAt: new Date().toISOString(),
    source: result.source,
    timezone: result.timezone,
    current: result.current,
    hourly: result.hourly,
    daily: result.daily,
    todayPeak: result.todayPeak,
    air: [...result.airByHour.entries()]
  };
}

function hydrate(cached: CachedForecast): AdapterResult {
  return {
    source: cached.source,
    timezone: cached.timezone,
    current: cached.current,
    hourly: cached.hourly,
    daily: cached.daily,
    todayPeak: cached.todayPeak,
    airByHour: new Map(cached.air)
  };
}

function currentAir(result: AdapterResult): AirInfo {
  const hourKey = `${result.current.time.slice(0, 13)}:00`;
  return (
    result.airByHour.get(hourKey) ??
    result.airByHour.get(result.current.time) ??
    result.airByHour.values().next().value ?? {
      aqi: null,
      pm25: null,
      category: 'Sin dato',
      level: 0
    }
  );
}

function buildResponse(
  cached: CachedForecast,
  result: AdapterResult,
  alerts: SenamhiAlert[],
  stale: boolean
): ForecastResponse {
  const thresholds = baseThresholds(cached.location.zona);
  const riskLevel = levelFromFeels(result.current.feelsC, thresholds);
  const peakLevel = (result.todayPeak.level ?? 0) as RiskLevel;
  const age = ageMinutes(cached.fetchedAt);

  return {
    ok: true,
    location: cached.location,
    generatedAt: cached.fetchedAt,
    timezone: cached.timezone,
    now: {
      time: result.current.time,
      hour: Number(result.current.time.slice(11, 13)),
      tempC: result.current.tempC,
      feelsC: result.current.feelsC,
      humidity: result.current.humidity,
      uv: result.current.uv,
      weatherCode: result.current.weatherCode,
      wind: result.current.wind,
      risk: riskLevel,
      riskKey: keyFromLevel(riskLevel),
      air: currentAir(result)
    },
    hourly: result.hourly,
    daily: result.daily,
    risk: {
      level: riskLevel,
      key: keyFromLevel(riskLevel),
      label: keyFromLevel(riskLevel),
      peakLevel,
      peakHour: result.todayPeak.hour,
      peakFeels: result.todayPeak.feelsC
    },
    thresholds,
    source: {
      weather: 'Open-Meteo',
      air: 'CAMS / Open-Meteo',
      attribution: 'Datos meteorológicos de Open-Meteo (CC BY 4.0)',
      attributionUrl: 'https://open-meteo.com/en/licence'
    },
    alerts,
    freshness: {
      updatedAt: cached.fetchedAt,
      ageMinutes: age,
      stale: stale || age > MAX_AGE_MINUTES,
      status: stale || age > MAX_AGE_MINUTES ? 'stale' : 'fresh'
    }
  };
}

export async function getForecastForLocation(
  location: Location,
  options: { force?: boolean } = {}
): Promise<{ forecast: ForecastResponse; cacheStatus: 'hit' | 'miss' | 'stale' }> {
  const key = cacheKey(location.ubigeo);
  const cachedRaw = (await readCache(key)) as CachedForecast | null;
  const cachedAge = cachedRaw ? ageMinutes(cachedRaw.fetchedAt) : Number.POSITIVE_INFINITY;

  if (cachedRaw && cachedAge <= MAX_AGE_MINUTES && !options.force) {
    const result = hydrate(cachedRaw);
    const alerts = await getSenamhiAlerts(location);
    return {
      forecast: buildResponse(cachedRaw, result, alerts, false),
      cacheStatus: 'hit'
    };
  }

  try {
    const fresh = await fetchOpenMeteo(location);
    const nextCache = toCached(fresh, location);
    await writeCache(key, nextCache, CACHE_TTL_SECONDS);
    const alerts = await getSenamhiAlerts(location);
    return {
      forecast: buildResponse(nextCache, fresh, alerts, false),
      cacheStatus: 'miss'
    };
  } catch (error) {
    if (cachedRaw) {
      const result = hydrate(cachedRaw);
      const alerts = await getSenamhiAlerts(location);
      const response = buildResponse(cachedRaw, result, alerts, true);
      response.freshness.status = 'stale';
      return { forecast: response, cacheStatus: 'stale' };
    }
    throw error;
  }
}
