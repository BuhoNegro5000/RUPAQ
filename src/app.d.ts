/// <reference types="@sveltejs/kit" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Platform {
    env?: {
      FORECAST_KV?: KVNamespaceLike;
      INGEST_SECRET?: string;
      SENAMHI_ALERTS_URL?: string;
    };
    context?: {
      waitUntil(promise: Promise<unknown>): void;
    };
    caches?: CacheStorage;
  }
}

interface KVNamespaceLike {
  get(key: string, type?: 'text' | 'json'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}
