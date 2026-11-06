export type ClimateZone = 'costa_norte' | 'costa_central' | 'sierra' | 'amazonia';
export type RiskKey = 'safe' | 'attention' | 'precaution' | 'danger' | 'extreme';
export type RiskLevel = 0 | 1 | 2 | 3 | 4;
export type TimePhase = 'dawn' | 'day' | 'afternoon' | 'night';
export type ProfileKey = 'nino' | 'embarazo' | 'adulto_mayor' | 'trabajo_exterior' | 'enfermedad_cronica';

export interface Location {
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  lat: number;
  lon: number;
  altitud: number;
  zona: ClimateZone;
}

export interface Thresholds {
  attention: number;
  precaution: number;
  danger: number;
  extreme: number;
}

export interface HourPoint {
  time: string; // ISO local sin offset, p. ej. 2026-11-05T14:00
  hour: number;
  tempC: number;
  feelsC: number;
  humidity: number;
  uv: number | null;
  precipitation: number | null;
  risk: RiskLevel;
  riskKey: RiskKey;
}

export interface DailyPoint {
  date: string;
  tempMin: number;
  tempMax: number;
  feelsMax: number;
  feelsMin: number;
  humidity: number;
  uvMax: number | null;
  precipitation: number | null;
  risk: RiskLevel;
  riskKey: RiskKey;
  sunrise: string | null;
  sunset: string | null;
  peakHour: number;
  nightMin: number;
}

export interface AirInfo {
  aqi: number | null;
  pm25: number | null;
  category: string;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface SenamhiAlert {
  id: string;
  nivel: string;
  titulo: string;
  resumen: string;
  inicio?: string;
  fin?: string;
  url?: string;
  fuente: string;
}

export interface ForecastResponse {
  ok: true;
  location: Location;
  generatedAt: string;
  timezone: string;
  now: {
    time: string;
    hour: number;
    tempC: number;
    feelsC: number;
    humidity: number;
    uv: number | null;
    weatherCode: number | null;
    wind: number | null;
    risk: RiskLevel;
    riskKey: RiskKey;
    air: AirInfo;
  };
  hourly: HourPoint[];
  daily: DailyPoint[];
  risk: {
    level: RiskLevel;
    key: RiskKey;
    label: string;
    peakLevel: RiskLevel;
    peakHour: number;
    peakFeels: number;
  };
  thresholds: Thresholds;
  source: {
    weather: string;
    air: string;
    attribution: string;
    attributionUrl: string;
  };
  alerts: SenamhiAlert[];
  freshness: {
    updatedAt: string;
    ageMinutes: number;
    stale: boolean;
    status: 'fresh' | 'stale' | 'offline';
  };
}

export interface ApiError {
  ok: false;
  error: string;
  message: string;
}

  export type ThemePreference = 'auto' | 'light' | 'dark';

  export type Settings = {
  fontScale: number;
  theme: ThemePreference;
  simple: boolean;
  contrast: boolean;
  readAloud: boolean;
  profile: ProfileKey[];
  onboarded: boolean;
  dismissedSetup: boolean;
};

export type SavedPlace = Location;
