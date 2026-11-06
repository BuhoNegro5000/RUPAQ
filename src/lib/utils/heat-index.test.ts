import { describe, expect, it } from 'vitest';
import {
  calculateHeatIndexC,
  estimateWbgtC,
  rothfuszF,
  steadmanSimpleF
} from './heat-index';

describe('índice de calor', () => {
  it('aplica Rothfusz a temperatura alta y humedad media', () => {
    // 32 °C y 70 % de humedad relativa: valores de referencia NWS.
    const hi = calculateHeatIndexC(32, 70);
    expect(hi).toBeGreaterThan(40);
    expect(hi).toBeLessThan(47);
  });

  it('aumenta con la humedad a igual temperatura', () => {
    const seco = calculateHeatIndexC(35, 30);
    const humedo = calculateHeatIndexC(35, 80);
    expect(humedo).toBeGreaterThan(seco);
  });

  it('usa Steadman simple bajo 26.7 °C', () => {
    const hi = calculateHeatIndexC(24, 60);
    const directo = ((steadmanSimpleF(75.2, 60) - 32) * 5) / 9;
    expect(hi).toBeCloseTo(directo, 4);
  });

  it('aplica el ajuste seco de Rothfusz', () => {
    const base = rothfuszF(100, 12);
    const adjusted = rothfuszF(100, 10);
    expect(adjusted).toBeLessThan(base);
  });

  it('produce un WBGT dentro de un rango físico razonable', () => {
    const wbgt = estimateWbgtC(34, 65, 700, 1.5);
    expect(wbgt).toBeGreaterThan(27);
    expect(wbgt).toBeLessThan(38);
  });
});
