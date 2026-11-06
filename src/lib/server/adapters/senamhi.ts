import fallback from '$lib/content/senamhi-alerts.json';
import type { Location, SenamhiAlert } from '$lib/types';

/**
 * Adaptador de avisos oficiales.
 *
 * No se hace scraping del portal de SENAMHI: sus productos tienen condiciones
 * de uso y el HTML cambia sin aviso. El adaptador acepta un feed JSON
 * normalizado que el equipo puede mantener a partir de un convenio o de la
 * publicación oficial. Sin feed configurado, la app declara que no hay avisos
 * cargados; nunca inventa una alerta.
 *
 * Contrato esperado:
 * {
 *   "alertas": [{
 *     "id": "aviso-123",
 *     "nivel": "Naranja",
 *     "titulo": "Aviso meteorológico por temperaturas altas",
 *     "resumen": "…",
 *     "inicio": "2026-11-05T00:00",
 *     "fin": "2026-11-07T00:00",
 *     "url": "https://www.senamhi.gob.pe/…",
 *     "departamentos": ["PIURA"],
 *     "fuente": "SENAMHI"
 *   }]
 * }
 */

type Feed = {
  alertas?: Array<
    SenamhiAlert & {
      departamentos?: string[];
    }
  >;
};

export async function getSenamhiAlerts(location: Location): Promise<SenamhiAlert[]> {
  const configured = process.env.SENAMHI_ALERTS_URL;
  const local = (fallback.alertas ?? []) as Array<SenamhiAlert & { departamentos?: string[] }>;

  if (!configured) return filterForLocation(local, location);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(configured, {
      signal: controller.signal,
      headers: { accept: 'application/json' }
    });
    clearTimeout(timer);
    if (!response.ok) return filterForLocation(local, location);
    const feed = (await response.json()) as Feed;
    return filterForLocation(feed.alertas ?? [], location);
  } catch {
    return filterForLocation(local, location);
  }
}

function filterForLocation(
  alerts: Array<SenamhiAlert & { departamentos?: string[] }>,
  location: Location
): SenamhiAlert[] {
  return alerts
    .filter((alert) => {
      if (!alert.departamentos?.length) return true;
      return alert.departamentos.some(
        (department) => department.toUpperCase() === location.departamento.toUpperCase()
      );
    })
    .map(({ departamentos: _departments, ...alert }) => alert);
}
