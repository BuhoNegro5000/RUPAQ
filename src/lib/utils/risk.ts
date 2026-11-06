import thresholdsFile from '$lib/content/thresholds.json';
import type { ClimateZone, ProfileKey, RiskKey, RiskLevel, Thresholds, TimePhase } from '$lib/types';

export const RISK_ORDER: RiskKey[] = ['safe', 'attention', 'precaution', 'danger', 'extreme'];

export const RISK_META: Record<
  RiskKey,
  { level: RiskLevel; label: string; short: string; description: string }
> = {
  safe: {
    level: 0,
    label: 'Seguro',
    short: 'Calor tranquilo',
    description: 'El calor no representa un riesgo importante en este momento.'
  },
  attention: {
    level: 1,
    label: 'Atención',
    short: 'Calor a cuidar',
    description: 'Toma agua y evita el sol fuerte, sobre todo al mediodía.'
  },
  precaution: {
    level: 2,
    label: 'Precaución',
    short: 'Calor fuerte',
    description: 'Baja el ritmo entre las 11 y las 4. Hidrátate seguido.'
  },
  danger: {
    level: 3,
    label: 'Peligro',
    short: 'Calor peligroso',
    description: 'Evita salir entre las 11 y las 4. Cuida de las personas vulnerables.'
  },
  extreme: {
    level: 4,
    label: 'Extremo',
    short: 'Calor extremo',
    description: 'Quédate en un lugar fresco. El calor puede enfermarte rápido.'
  }
};

export function keyFromLevel(level: number): RiskKey {
  return RISK_ORDER[Math.max(0, Math.min(4, Math.round(level)))] ?? 'safe';
}

export function levelFromFeels(feelsC: number, thresholds: Thresholds): RiskLevel {
  if (feelsC >= thresholds.extreme) return 4;
  if (feelsC >= thresholds.danger) return 3;
  if (feelsC >= thresholds.precaution) return 2;
  if (feelsC >= thresholds.attention) return 1;
  return 0;
}

export function baseThresholds(zone: ClimateZone): Thresholds {
  return (thresholdsFile.zonas[zone] ?? thresholdsFile.zonas.costa_central) as Thresholds;
}

export function adjustedThresholds(zone: ClimateZone, profiles: ProfileKey[] = []): Thresholds {
  const base = baseThresholds(zone);
  const rawAdjustment = profiles.reduce((total, profile) => {
    const adjust = thresholdsFile.ajuste_perfil[profile] ?? 0;
    return total + Math.min(0, adjust);
  }, 0);
  const adjustment = Math.max(rawAdjustment, thresholdsFile.ajuste_maximo);
  return {
    attention: Math.round((base.attention + adjustment) * 10) / 10,
    precaution: Math.round((base.precaution + adjustment) * 10) / 10,
    danger: Math.round((base.danger + adjustment) * 10) / 10,
    extreme: Math.round((base.extreme + adjustment) * 10) / 10
  };
}

export function levelToKey(level: RiskLevel): RiskKey {
  return RISK_ORDER[level];
}

export function phaseFromHour(hour: number): TimePhase {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 12) return 'day';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'night';
}

export function hourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

export function shortHour(hour: number): string {
  return `${((hour % 24) + 24) % 24}\u00A0h`;
}
