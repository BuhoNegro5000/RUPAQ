const memory = new Map<string, { value: unknown; expiresAt: number }>();

type PlatformLike = App.Platform | undefined;

async function cacheRequest(key: string): Promise<Request> {
  return new Request(`https://rupaq.local/__cache/${encodeURIComponent(key)}`);
}

export async function readCache(platform: PlatformLike, key: string): Promise<unknown | null> {
  const kv = platform?.env?.FORECAST_KV;
  if (kv) {
    try {
      return await kv.get(key, 'json');
    } catch {
      // sigue con los otros niveles
    }
  }

  if (typeof caches !== 'undefined' && 'default' in caches) {
    try {
      const edgeCache = (caches as unknown as { default: Cache }).default;
      const response = await edgeCache.match(await cacheRequest(key));
      if (response) return await response.json();
    } catch {
      // Cache API no disponible
    }
  }

  const hit = memory.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  if (hit) memory.delete(key);
  return null;
}

export async function writeCache(
  platform: PlatformLike,
  key: string,
  value: unknown,
  ttlSeconds = 21_600
): Promise<void> {
  const kv = platform?.env?.FORECAST_KV;
  if (kv) {
    try {
      await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
    } catch {
      // continúa con el respaldo local
    }
  }

  if (typeof caches !== 'undefined' && 'default' in caches) {
    try {
      const edgeCache = (caches as unknown as { default: Cache }).default;
      await edgeCache.put(
        await cacheRequest(key),
        new Response(JSON.stringify(value), {
          headers: {
            'content-type': 'application/json',
            'cache-control': `public, max-age=${ttlSeconds}`
          }
        })
      );
    } catch {
      // Cache API no disponible
    }
  }

  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function clearMemoryCache(): void {
  memory.clear();
}
