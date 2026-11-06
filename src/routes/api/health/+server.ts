import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json({
    ok: true,
    service: 'rupaq',
    version: '1.0.0',
    time: new Date().toISOString(),
    endpoints: {
      forecast: '/api/forecast?ubigeo=150101',
      ingest: '/api/ingest (requiere INGEST_SECRET)'
    }
  });
};
