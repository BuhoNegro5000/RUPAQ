import type { AirInfo, ClimateZone, DailyPoint, HourPoint, Location, RiskLevel } from '$lib/types';
import { calculateHeatIndexC } from '$lib/utils/heat-index';
import { baseThresholds, keyFromLevel, levelFromFeels } from '$lib/utils/risk';

const TIMEZONE = 'America/Lima';

type OpenMeteoForecast = {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    uv_index?: number | null;
    weather_code?: number | null;
    wind_speed_10m?: number | null;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    uv_index?: (number | null)[];
    precipitation_probability?: (number | null)[];
    weather_code?: (number | null)[];
    wind_speed_10m?: (number | null)[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    uv_index_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    sunrise?: (string | null)[];
    sunset?: (string | null)[];
  };
};

type OpenMeteoAir = {
  hourly: {
    time: string[];
    pm2_5: (number | null)[];
    european_aqi: (number | null)[];
  };
};

export type AdapterResult = {
  source: string;
  timezone: string;
  current: {
    time: string;
    tempC: number;
    feelsC: number;
    humidity: number;
    uv: number | null;
    weatherCode: number | null;
    wind: number | null;
  };
  hourly: HourPoint[];
  daily: DailyPoint[];
  airByHour: Map<string, AirInfo>;
  todayPeak: { level: RiskLevel; hour: number; feelsC: number };
};

export function airCategory(aqi: number | null): { category: string; level: 0 | 1 | 2 | 3 | 4 } {
  if (aqi == null || Number.isNaN(aqi)) return { category: 'Sin dato', level: 0 };
  if (aqi <= 20) return { category: 'Buena', level: 0 };
  if (aqi <= 40) return { category: 'Regular', level: 1 };
  if (aqi <= 60) return { category: 'Moderada', level: 2 };
  if (aqi <= 80) return { category: 'Mala', level: 3 };
  return { category: 'Muy mala', level: 4 };
}

function nearestAir(air: OpenMeteoAir | null, time: string): AirInfo {
  if (!air?.hourly?.time?.length) return { aqi: null, pm25: null, ...airCategory(null) };
  const exact = air.hourly.time.indexOf(time);
  let index = exact;
  if (index < 0) {
    const target = new Date(`${time.slice(0, 13)}:00:00`).getTime();
    let best = Number.POSITIVE_INFINITY;
    air.hourly.time.forEach((t, i) => {
      const distance = Math.abs(new Date(`${t.slice(0, 13)}:00:00`).getTime() - target);
      if (distance < best) {
        best = distance;
        index = i;
      }
    });
  }
  const aqi = air.hourly.european_aqi?.[index] ?? null;
  const pm25 = air.hourly.pm2_5?.[index] ?? null;
  return { aqi, pm25, ...airCategory(aqi) };
}

function requestUrl(location: Location): string {
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    hourly:
      'temperature_2m,relative_humidity_2m,uv_index,precipitation_probability,weather_code,wind_speed_10m',
    daily:
      'temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,sunrise,sunset',
    current: 'temperature_2m,relative_humidity_2m,uv_index,weather_code,wind_speed_10m',
    timezone: TIMEZONE,
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh'
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
}

function airUrl(location: Location): string {
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    hourly: 'pm2_5,european_aqi',
    timezone: TIMEZONE,
    forecast_days: '7'
  });
  return `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8500);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchOpenMeteo(location: Location): Promise<AdapterResult> {
  const [weatherResult, airResult] = await Promise.allSettled([
    fetchJson<OpenMeteoForecast>(requestUrl(location)),
    fetchJson<OpenMeteoAir>(airUrl(location))
  ]);

  if (weatherResult.status === 'rejected') throw weatherResult.reason;
  const weather = weatherResult.value;
  const air = airResult.status === 'fulfilled' ? airResult.value : null;

  const zone: ClimateZone = location.zona;
  const thresholds = baseThresholds(zone);
  const hourly: HourPoint[] = [];

  weather.hourly.time.forEach((time, index) => {
    const tempC = weather.hourly.temperature_2m[index];
    const humidity = weather.hourly.relative_humidity_2m[index];
    if (tempC == null || humidity == null) return;
    const feelsC = calculateHeatIndexC(tempC, humidity);
    const level = levelFromFeels(feelsC, thresholds);
    hourly.push({
      time,
      hour: Number(time.slice(11, 13)),
      tempC: Math.round(tempC * 10) / 10,
      feelsC: Math.round(feelsC * 10) / 10,
      humidity: Math.round(humidity),
      uv: weather.hourly.uv_index?.[index] ?? null,
      precipitation: weather.hourly.precipitation_probability?.[index] ?? null,
      risk: level,
      riskKey: keyFromLevel(level)
    });
  });

  const daily: DailyPoint[] = [];
  weather.daily.time.forEach((date, index) => {
    const points = hourly.filter((point) => point.time.startsWith(date));
    if (!points.length) return;
    const peak = points.reduce((best, point) => (point.feelsC > best.feelsC ? point : best), points[0]);
    const lowest = points.reduce(
      (best, point) => (point.feelsC < best.feelsC ? point : best),
      points[0]
    );
    const peakLevel = Math.max(...points.map((point) => point.risk)) as RiskLevel;
    daily.push({
      date,
      tempMin: Math.round(weather.daily.temperature_2m_min[index] * 10) / 10,
      tempMax: Math.round(weather.daily.temperature_2m_max[index] * 10) / 10,
      feelsMax: peak.feelsC,
      feelsMin: lowest.feelsC,
      humidity: peak.humidity,
      uvMax: weather.daily.uv_index_max?.[index] ?? null,
      precipitation: weather.daily.precipitation_probability_max?.[index] ?? null,
      risk: peakLevel,
      riskKey: keyFromLevel(peakLevel),
      sunrise: weather.daily.sunrise?.[index] ?? null,
      sunset: weather.daily.sunset?.[index] ?? null,
      peakHour: peak.hour,
      nightMin: Math.round(weather.daily.temperature_2m_min[index] * 10) / 10
    });
  });

  const current = weather.current;
  const currentTime = current?.time ?? weather.hourly.time[0];
  const currentHour = Number(currentTime.slice(11, 13));
  const currentTemp = current?.temperature_2m ?? weather.hourly.temperature_2m[currentHour] ?? 0;
  const currentHumidity =
    current?.relative_humidity_2m ?? weather.hourly.relative_humidity_2m[currentHour] ?? 0;
  const currentFeels = Math.round(calculateHeatIndexC(currentTemp, currentHumidity) * 10) / 10;
  const currentDate = currentTime.slice(0, 10);
  const today = daily.find((day) => day.date === currentDate) ?? daily[0];
  const todayPoints = hourly.filter((point) => point.time.startsWith(currentDate));
  const todayPeakPoint = todayPoints.reduce(
    (best, point) => (point.feelsC > best.feelsC ? point : best),
    todayPoints[0]
  );

  const airByHour = new Map<string, AirInfo>();
  weather.hourly.time.forEach((time) => {
    airByHour.set(time, nearestAir(air, time));
  });

  return {
    source: 'Open-Meteo',
    timezone: TIMEZONE,
    current: {
      time: currentTime,
      tempC: Math.round(currentTemp * 10) / 10,
      feelsC: currentFeels,
      humidity: Math.round(currentHumidity),
      uv: current?.uv_index ?? weather.hourly.uv_index?.[currentHour] ?? null,
      weatherCode: current?.weather_code ?? null,
      wind: current?.wind_speed_10m ?? null
    },
    hourly,
    daily,
    airByHour,
    todayPeak: {
      level: (today?.risk ?? 0) as RiskLevel,
      hour: todayPeakPoint?.hour ?? currentHour,
      feelsC: todayPeakPoint?.feelsC ?? currentFeels
    }
  };
}
