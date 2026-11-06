const memory = new Map<string, { value: unknown; expiresAt: number }>();

export async function readCache(key: string): Promise<unknown | null> {
  const hit = memory.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;
  if (hit) memory.delete(key);
  return null;
}

export async function writeCache(key: string, value: unknown, ttlSeconds = 21_600): Promise<void> {
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function clearMemoryCache(): void {
  memory.clear();
}
