import { describe, expect, it } from 'vitest';
import { adjustedThresholds, levelFromFeels, phaseFromHour } from './risk';

describe('umbrales de riesgo', () => {
  it('clasifica los cinco niveles en costa central', () => {
    const t = adjustedThresholds('costa_central', []);
    expect(levelFromFeels(28.9, t)).toBe(0);
    expect(levelFromFeels(29, t)).toBe(1);
    expect(levelFromFeels(34, t)).toBe(2);
    expect(levelFromFeels(39, t)).toBe(3);
    expect(levelFromFeels(45, t)).toBe(4);
  });

  it('baja el umbral para un niño o una persona mayor', () => {
    const base = adjustedThresholds('amazonia', []);
    const adjusted = adjustedThresholds('amazonia', ['nino', 'adulto_mayor']);
    expect(adjusted.danger).toBe(base.danger - 3);
    expect(levelFromFeels(38, adjusted)).toBe(3);
    expect(levelFromFeels(38, base)).toBe(2);
  });

  it('no aplica más de 3 °C de ajuste', () => {
    const t = adjustedThresholds('costa_norte', [
      'nino',
      'embarazo',
      'adulto_mayor',
      'enfermedad_cronica'
    ]);
    expect(t.attention).toBe(29);
  });

  it('mantiene los umbrales ordenados', () => {
    for (const zone of ['costa_norte', 'costa_central', 'sierra', 'amazonia'] as const) {
      const t = adjustedThresholds(zone, []);
      expect(t.attention).toBeLessThan(t.precaution);
      expect(t.precaution).toBeLessThan(t.danger);
      expect(t.danger).toBeLessThan(t.extreme);
    }
  });

  it('asigna fases del día coherentes', () => {
    expect(phaseFromHour(6)).toBe('dawn');
    expect(phaseFromHour(10)).toBe('day');
    expect(phaseFromHour(14)).toBe('afternoon');
    expect(phaseFromHour(21)).toBe('night');
  });
});
