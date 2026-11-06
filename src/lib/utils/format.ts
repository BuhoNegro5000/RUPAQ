export const PERU_TZ = 'America/Lima';

export function peruParts(date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateKey: string;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PERU_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  const year = Number(get('year'));
  const month = Number(get('month'));
  const day = Number(get('day'));
  const hour = Number(get('hour')) % 24;
  const minute = Number(get('minute'));
  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

export function timeLabel(hour: number, minute = 0): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  const display = h % 12 === 0 ? 12 : h % 12;
  return minute ? `${display}:${String(minute).padStart(2, '0')} ${suffix}` : `${display} ${suffix}`;
}

export function timeWithMinutes(hour: number, minute: number): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? 'a. m.' : 'p. m.';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('es-PE', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatDateParts(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
}

export function weekdayLong(dateKey: string): string {
  const { year, month, day } = formatDateParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('es-PE', { weekday: 'long', timeZone: 'UTC' }).format(date);
}

export function weekdayShort(dateKey: string): string {
  const { year, month, day } = formatDateParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('es-PE', { weekday: 'short', timeZone: 'UTC' })
    .format(date)
    .replace('.', '');
}

export function monthShort(dateKey: string): string {
  const { year, month, day } = formatDateParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('es-PE', { month: 'short', timeZone: 'UTC' })
    .format(date)
    .replace('.', '');
}

export function dayLabel(dateKey: string, todayKey: string): string {
  const today = formatDateParts(todayKey);
  const target = formatDateParts(dateKey);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const targetUtc = Date.UTC(target.year, target.month - 1, target.day);
  const diff = Math.round((targetUtc - todayUtc) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return weekdayLong(dateKey);
}

export function shortDate(dateKey: string): string {
  return `${formatDateParts(dateKey).day} ${monthShort(dateKey)}`;
}

export function longDate(dateKey: string): string {
  const { year, month, day } = formatDateParts(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC'
  }).format(date);
}

export function uvCategory(uv: number | null | undefined): string {
  if (uv == null) return 'Sin dato';
  if (uv < 3) return 'Bajo';
  if (uv < 6) return 'Moderado';
  if (uv < 8) return 'Alto';
  if (uv < 11) return 'Muy alto';
  return 'Extremo';
}

export function relativeFreshness(updatedAt: string, now = new Date()): string {
  const diff = Math.max(0, Math.round((now.getTime() - new Date(updatedAt).getTime()) / 60_000));
  if (diff < 1) return 'Actualizado ahora';
  if (diff === 1) return 'Actualizado hace 1 min';
  if (diff < 60) return `Actualizado hace ${diff} min`;
  const hours = Math.round(diff / 60);
  if (hours === 1) return 'Actualizado hace 1 h';
  if (hours < 24) return `Actualizado hace ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Actualizado hace 1 día' : `Actualizado hace ${days} días`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function nowHourFromForecast(now: { hour: number }, currentDate = new Date()): number {
  const parts = peruParts(currentDate);
  return parts.hour;
}

export function makeId(prefix = 'rupaq'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
