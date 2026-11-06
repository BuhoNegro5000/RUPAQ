/**
 * Índice de calor.
 *
 * Referencias:
 * - Rothfusz, L. P. (1990). The Heat Index Equation. NWS Technical Attachment SR 90-23.
 * - Steadman, R. G. (1979). The assessment of sultriness.
 * - NWS / WPC: https://www.wpc.ncep.noaa.gov/html/heatindex_equation.shtml
 *
 * La humedad se usa hora por hora. No se promedian humedades.
 */

const toF = (c: number) => (c * 9) / 5 + 32;
const toC = (f: number) => ((f - 32) * 5) / 9;

export function rothfuszF(tempF: number, rh: number): number {
  let hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    hi -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
  }

  if (rh > 85 && tempF >= 80 && tempF <= 87) {
    hi += ((rh - 85) / 10) * ((87 - tempF) / 5);
  }

  return hi;
}

/** Fórmula simple de Steadman, usada cuando el aire está por debajo de 26.7 °C. */
export function steadmanSimpleF(tempF: number, rh: number): number {
  return 0.5 * (tempF + 61 + (tempF - 68) * 1.2 + rh * 0.094);
}

export function calculateHeatIndexC(tempC: number, rh: number): number {
  const clampedRh = Math.min(100, Math.max(0, rh));
  const tempF = toF(tempC);

  if (tempC < 26.7) {
    return toC(steadmanSimpleF(tempF, clampedRh));
  }

  return toC(rothfuszF(tempF, clampedRh));
}

/**
 * Estimación preliminar de WBGT para la futura capa de trabajadores.
 * No se usa todavía en la interfaz pública: requiere radiación y viento
 * calibrados con estaciones locales. Se deja documentada para fase 2.
 */
export function estimateWbgtC(
  tempC: number,
  rh: number,
  solarRadiationWm2 = 0,
  windMs = 1
): number {
  const clampedRh = Math.min(100, Math.max(1, rh));
  // Stull (2011) para bulbo húmedo natural.
  const tw =
    tempC * Math.atan(0.151977 * Math.sqrt(clampedRh + 8.313659)) +
    Math.atan(tempC + clampedRh) -
    Math.atan(clampedRh - 1.676331) +
    0.00391838 * Math.pow(clampedRh, 1.5) * Math.atan(0.023101 * clampedRh) -
    4.686035;
  // Aproximación del globo: la radiación sube la temperatura radiante y el viento la baja.
  const tg = tempC + Math.max(0, solarRadiationWm2) * 0.012 - Math.max(0, windMs) * 0.35;
  return 0.7 * tw + 0.2 * tg + 0.1 * tempC;
}
