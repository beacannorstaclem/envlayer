/**
 * envTtl.ts — Time-to-live (TTL) support for environment variable entries.
 * Allows keys to be marked with an expiry time; expired keys are treated as absent.
 */

export interface TtlEntry {
  value: string;
  expiresAt: number; // Unix ms
}

const ttlStore = new Map<string, TtlEntry>();

/** Register a key with a TTL (milliseconds from now). */
export function setWithTtl(key: string, value: string, ttlMs: number): void {
  ttlStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Retrieve a value only if it has not expired. Returns undefined if missing or expired. */
export function getWithTtl(key: string): string | undefined {
  const entry = ttlStore.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    ttlStore.delete(key);
    return undefined;
  }
  return entry.value;
}

/** Check whether a key exists and has not expired. */
export function hasActiveTtl(key: string): boolean {
  return getWithTtl(key) !== undefined;
}

/** Remove a specific key from the TTL store. */
export function deleteTtl(key: string): boolean {
  return ttlStore.delete(key);
}

/** Purge all expired entries and return their keys. */
export function purgeExpired(): string[] {
  const now = Date.now();
  const expired: string[] = [];
  for (const [key, entry] of ttlStore) {
    if (now > entry.expiresAt) {
      ttlStore.delete(key);
      expired.push(key);
    }
  }
  return expired;
}

/** Clear the entire TTL store. */
export function clearTtl(): void {
  ttlStore.clear();
}

/** Return a snapshot of all active (non-expired) TTL entries as a plain env map. */
export function activeTtlSnapshot(): Record<string, string> {
  const now = Date.now();
  const result: Record<string, string> = {};
  for (const [key, entry] of ttlStore) {
    if (now <= entry.expiresAt) {
      result[key] = entry.value;
    }
  }
  return result;
}
