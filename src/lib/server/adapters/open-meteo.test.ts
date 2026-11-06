import { describe, expect, it } from 'vitest';
import { airCategory } from './open-meteo';

describe('airCategory', () => {
  it.each([
    [0, 'Buena', 0],
    [20, 'Buena', 0],
    [21, 'Regular', 1],
    [40, 'Regular', 1],
    [41, 'Moderada', 2],
    [60, 'Moderada', 2],
    [61, 'Mala', 3],
    [80, 'Mala', 3],
    [81, 'Muy mala', 4]
  ])('classifies AQI %s as %s', (aqi, category, level) => {
    expect(airCategory(aqi)).toEqual({ category, level });
  });

  it('handles missing AQI data', () => {
    expect(airCategory(null)).toEqual({ category: 'Sin dato', level: 0 });
  });
});
