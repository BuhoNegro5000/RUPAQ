import actionsFile from '$lib/content/actions.json';
import type { DailyPoint, ForecastResponse, ProfileKey, RiskKey, TimePhase } from '$lib/types';
import { adjustedThresholds, keyFromLevel, levelFromFeels, phaseFromHour } from './risk';

type ActionLevel = Exclude<RiskKey, 'safe' | 'attention'>;

export function pickProfile(profiles: ProfileKey[]): ProfileKey | null {
  if (!profiles.length) return null;
  for (const profile of actionsFile.prioridad_perfil) {
    if (profiles.includes(profile as ProfileKey)) return profile as ProfileKey;
  }
  return profiles[0] ?? null;
}

export function getActionPhrase(
  data: ForecastResponse,
  profiles: ProfileKey[],
  nowHour: number
): { phrase: string; level: RiskKey; phase: TimePhase; personalized: boolean } {
  const thresholds = adjustedThresholds(data.location.zona, profiles);
  const nowLevel = levelFromFeels(data.now.feelsC, thresholds);
  const today = data.daily[0];
  const peakLevel = today ? levelFromFeels(today.feelsMax, thresholds) : nowLevel;
  const phase = phaseFromHour(nowHour);
  const actionLevel = phase !== 'night' && peakLevel > nowLevel ? peakLevel : nowLevel;
  const levelKey = keyFromLevel(actionLevel);
  const profile = pickProfile(profiles);

  if (profile && actionLevel >= 2) {
    const override = actionsFile.perfil[profile]?.[levelKey as ActionLevel];
    if (override) {
      return { phrase: override, level: levelKey, phase, personalized: true };
    }
  }

  const base = actionsFile.base[levelKey]?.[phase] ?? actionsFile.base.attention.day;
  return { phrase: base, level: levelKey, phase, personalized: false };
}

export function actionLevelFor(
  data: ForecastResponse,
  profiles: ProfileKey[],
  nowHour: number
): RiskKey {
  return getActionPhrase(data, profiles, nowHour).level;
}

export function getDayPhrase(
  data: ForecastResponse,
  day: DailyPoint,
  profiles: ProfileKey[]
): { phrase: string; level: RiskKey; personalized: boolean } {
  const thresholds = adjustedThresholds(data.location.zona, profiles);
  const level = levelFromFeels(day.feelsMax, thresholds);
  const levelKey = keyFromLevel(level);
  const profile = pickProfile(profiles);

  if (profile && level >= 2) {
    const override = actionsFile.perfil[profile]?.[levelKey as ActionLevel];
    if (override) return { phrase: override, level: levelKey, personalized: true };
  }

  return {
    phrase: actionsFile.base[levelKey]?.day ?? actionsFile.base.attention.day,
    level: levelKey,
    personalized: false
  };
}
