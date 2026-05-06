/**
 * cache.ts — Simple TTL-based cache for resolved environment variable layers.
 * Avoids redundant re-resolution when inputs haven't changed.
 */

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface CacheOptions {
  /** Time-to-live in milliseconds. Default: 30_000 (30 seconds). */
  ttl?: number;
}

const DEFAULT_TTL = 30_000;

const store = new Map<string, CacheEntry<unknown>>();

/**
 * Store a value in the cache under the given key.
 */
export function cacheSet<T>(key: string, value: T, options: CacheOptions = {}): void {
  const ttl = options.ttl ?? DEFAULT_TTL;
  store.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Retrieve a cached value. Returns undefined if missing or expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * Check whether a non-expired entry exists for the given key.
 */
export function cacheHas(key: string): boolean {
  return cacheGet(key) !== undefined;
}

/**
 * Remove a specific key from the cache.
 */
export function cacheDelete(key: string): void {
  store.delete(key);
}

/**
 * Clear all entries from the cache.
 */
export function cacheClear(): void {
  store.clear();
}

/**
 * Return a stable cache key from a plain object or string.
 */
export function buildCacheKey(source: string | Record<string, unknown>): string {
  if (typeof source === 'string') return source;
  return JSON.stringify(Object.keys(source).sort().reduce<Record<string, unknown>>((acc, k) => {
    acc[k] = source[k];
    return acc;
  }, {}));
}
