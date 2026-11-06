import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getForecastForLocation } from '$lib/server/forecast';
import { getLocation } from '$lib/server/locations';

export const GET: RequestHandler = async ({ url, platform, setHeaders }) => {
  const ubigeo = url.searchParams.get('ubigeo') ?? '150101';
  if (!/^\d{6}$/.test(ubigeo)) {
    throw error(400, 'El ubigeo debe tener 6 dígitos.');
  }

  const location = getLocation(ubigeo);
  if (!location) {
    throw error(404, 'No encontramos ese distrito en el ubigeo del INEI.');
  }

  try {
    const { forecast, cacheStatus } = await getForecastForLocation(location, platform);
    setHeaders({
      'cache-control': 'public, max-age=300, stale-while-revalidate=1800, stale-if-error=86400',
      'x-rupaq-cache': cacheStatus,
      'x-rupaq-district': `${location.distrito}, ${location.provincia}`
    });
    return json(forecast);
  } catch (cause) {
    console.error('No se pudo obtener el pronóstico', cause);
    return json(
      {
        ok: false,
        error: 'forecast_unavailable',
        message:
          'No pudimos actualizar el pronóstico. Revisa tu conexión; si ya usaste Rupaq antes, verás la última predicción guardada.'
      },
      { status: 503, headers: { 'cache-control': 'no-store' } }
    );
  }
};
