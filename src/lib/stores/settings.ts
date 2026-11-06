import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';
import type { ProfileKey, Settings } from '$lib/types';

export const SETTINGS_KEY = 'rupaq.settings.v1';

export const defaultSettings: Settings = {
  fontScale: 1,
  simple: false,
  contrast: false,
  readAloud: false,
  profile: [],
  onboarded: false,
  dismissedSetup: false
};

export const settings = writable<Settings>(defaultSettings);
export const settingsHydrated = writable(false);

export const FONT_STEPS = [
  { value: 1, label: 'Normal', sample: 'Aa' },
  { value: 1.15, label: 'Grande', sample: 'Aa' },
  { value: 1.3, label: 'Más grande', sample: 'Aa' },
  { value: 1.5, label: 'Máximo', sample: 'Aa' }
];

export const PROFILE_OPTIONS: Array<{
  key: ProfileKey;
  label: string;
  detail: string;
}> = [
  { key: 'nino', label: 'Niño o niña', detail: 'Cuidas a alguien menor de 5 años' },
  { key: 'embarazo', label: 'Embarazo', detail: 'Estás gestando o acabas de dar a luz' },
  { key: 'adulto_mayor', label: 'Adulto mayor', detail: 'Tú o alguien de tu casa tiene 60 años o más' },
  {
    key: 'trabajo_exterior',
    label: 'Trabajo al aire libre',
    detail: 'Obra, chacra, reparto, mercado o calle'
  },
  {
    key: 'enfermedad_cronica',
    label: 'Enfermedad crónica',
    detail: 'Corazón, riñón, diabetes, presión alta o respiración'
  }
];

export function loadSettings(): void {
  if (!browser) return;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      const merged: Settings = {
        ...defaultSettings,
        ...parsed,
        fontScale: FONT_STEPS.some((step) => step.value === parsed.fontScale)
          ? (parsed.fontScale as number)
          : 1,
        profile: Array.isArray(parsed.profile)
          ? parsed.profile.filter((key): key is ProfileKey =>
              PROFILE_OPTIONS.some((option) => option.key === key)
            )
          : []
      };
      settings.set(merged);
      applySettings(merged);
    }
  } catch {
    // se mantienen los valores por defecto
  } finally {
    settingsHydrated.set(true);
  }
}

export function updateSettings(patch: Partial<Settings>): void {
  const next = { ...get(settings), ...patch };
  settings.set(next);
  applySettings(next);
  if (browser) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // modo privado o cuota llena
    }
  }
}

export function toggleProfile(profile: ProfileKey): void {
  const current = get(settings);
  const exists = current.profile.includes(profile);
  updateSettings({
    profile: exists ? current.profile.filter((item) => item !== profile) : [...current.profile, profile]
  });
}

export function applySettings(value: Settings): void {
  if (!browser) return;
  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(value.fontScale));
  root.classList.toggle('simple-mode', value.simple);
  root.classList.toggle('high-contrast', value.contrast);
}

export function isSetupPending(value: Settings): boolean {
  return !value.onboarded && !value.dismissedSetup;
}
