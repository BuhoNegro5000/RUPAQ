/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE = `rupaq-static-${version}`;
const PAGE_CACHE = `rupaq-pages-${version}`;
const API_CACHE = `rupaq-api-${version}`;

const PRECACHE = [...new Set([...build, ...files])];
const PRECACHE_PAGES = [
  '/',
  '/dias',
  '/sintomas',
  '/mas',
  '/emergencia',
  '/offline',
  '/ubicacion',
  '/mas/ola-de-calor',
  '/mas/plan',
  '/mas/perfil',
  '/mas/accesibilidad',
  '/mas/lugares',
  '/mas/alertas',
  '/mas/acerca',
  '/mas/fuentes',
  '/mas/privacidad',
  '/mas/hidratacion',
  '/sintomas/golpe-de-calor',
  '/sintomas/sincope-por-calor',
  '/sintomas/agotamiento-por-calor',
  '/sintomas/calambres-por-calor',
  '/sintomas/erupcion-por-calor',
  '/sintomas/ola-de-calor-y-embarazo'
];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)),
      caches.open(PAGE_CACHE).then(async (cache) => {
        await Promise.allSettled(
          PRECACHE_PAGES.map(async (path) => {
            try {
              const response = await fetch(path, { headers: { accept: 'text/html' } });
              if (response.ok) await cache.put(path, response);
            } catch {
              // Una ruta puede fallar sin impedir la instalación.
            }
          })
        );
      })
    ]).then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => ![STATIC_CACHE, PAGE_CACHE, API_CACHE].includes(key)
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== sw.location.origin) return;

  if (url.pathname.startsWith('/api/forecast')) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (PRECACHE.includes(url.pathname) || /\.(?:js|css|woff2|png|svg|webmanifest|json)$/.test(url.pathname)) {
    event.respondWith(cacheFirstStatic(request));
  }
});

async function networkFirstApi(request: Request): Promise<Response> {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'offline',
        message: 'Sin conexión. Se usará la última predicción guardada por la app.'
      }),
      { status: 503, headers: { 'content-type': 'application/json' } }
    );
  }
}

async function networkFirstPage(request: Request): Promise<Response> {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const home = await cache.match('/');
    if (home) return home;
    const offline = await cache.match('/offline');
    if (offline) return offline;
    return new Response(
      '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rupaq sin conexión</title><body style="font-family:system-ui;background:#F7EFE3;color:#2B1608;padding:32px"><h1>Sin conexión</h1><p>Abre Rupaq con internet una vez para guardar el pronóstico y las guías.</p><p><strong>SAMU: 106</strong> · Bomberos: 116</p></body></html>',
      { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }
}

async function cacheFirstStatic(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Recurso no disponible sin conexión.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' }
    });
  }
}
