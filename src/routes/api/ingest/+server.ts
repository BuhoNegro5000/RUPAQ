import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getForecastForLocation } from '$lib/server/forecast';
import { featuredUbigeos, getLocation, listUbigeos } from '$lib/server/locations';

/**
 * Ingesta programada. Se llama desde GitHub Actions cada 2 horas o desde
 * un Vercel Cron. Sin INGEST_SECRET configurado responde 503.
 */
const GET: RequestHandler = async ({ url, request }) => {
  return ingest(url, request);
};
const POST: RequestHandler = async ({ url, request }) => {
  return ingest(url, request);
};

async function ingest(url: URL, request: Request) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return json(
      {
        ok: false,
        error: 'ingest_disabled',
        message: 'Configura INGEST_SECRET para habilitar la ingesta programada.'
      },
      { status: 503 }
    );
  }

  const authorization = request.headers.get('authorization') ?? '';
  if (authorization !== `Bearer ${secret}`) {
    return json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const scope = url.searchParams.get('scope') ?? 'featured';
  let codes: string[];
  if (scope === 'all') {
    codes = listUbigeos();
  } else if (scope === 'featured') {
    codes = featuredUbigeos();
  } else {
    codes = url.searchParams
      .get('ubigeos')
      ?.split(',')
      .map((code) => code.trim())
      .filter((code) => /^\d{6}$/.test(code)) ?? [];
  }

  // Límite de seguridad para no disparar cientos de llamadas por accidente.
  codes = codes.slice(0, 60);

  const results: Array<{ ubigeo: string; ok: boolean; cache?: string; error?: string }> = [];
  for (const ubigeo of codes) {
    const location = getLocation(ubigeo);
    if (!location) {
      results.push({ ubigeo, ok: false, error: 'not_found' });
      continue;
    }
    try {
      const { cacheStatus } = await getForecastForLocation(location, { force: true });
      results.push({ ubigeo, ok: true, cache: cacheStatus });
    } catch (error) {
      results.push({ ubigeo, ok: false, error: String(error) });
    }
  }

  return json({
    ok: true,
    scope,
    total: results.length,
    succeeded: results.filter((result) => result.ok).length,
    results
  });
}

export { GET, POST };
