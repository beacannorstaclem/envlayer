/**
 * envLock.ts
 * Provides key-level locking for environment maps, preventing mutation of locked keys.
 */

export type EnvMap = Record<string, string>;

const lockedKeys = new Set<string>();

/**
 * Lock one or more keys so they cannot be overwritten or deleted.
 */
export function lockKeys(keys: string[]): void {
  for (const key of keys) {
    lockedKeys.add(key);
  }
}

/**
 * Unlock one or more keys, allowing mutation again.
 */
export function unlockKeys(keys: string[]): void {
  for (const key of keys) {
    lockedKeys.delete(key);
  }
}

/**
 * Returns true if the given key is currently locked.
 */
export function isLocked(key: string): boolean {
  return lockedKeys.has(key);
}

/**
 * Returns the set of all currently locked keys.
 */
export function getLockedKeys(): string[] {
  return Array.from(lockedKeys);
}

/**
 * Clears all locks.
 */
export function clearLocks(): void {
  lockedKeys.clear();
}

/**
 * Applies a patch (partial env map) to a base env map, skipping locked keys.
 * Returns a new env map; does not mutate the original.
 */
export function applyWithLocks(base: EnvMap, patch: EnvMap): EnvMap {
  const result: EnvMap = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (lockedKeys.has(key)) {
      continue;
    }
    result[key] = value;
  }
  return result;
}

/**
 * Deletes keys from an env map, skipping any that are locked.
 * Returns a new env map.
 */
export function deleteWithLocks(base: EnvMap, keys: string[]): EnvMap {
  const result: EnvMap = { ...base };
  for (const key of keys) {
    if (lockedKeys.has(key)) {
      continue;
    }
    delete result[key];
  }
  return result;
}

/**
 * Asserts that a key is not locked. Throws if it is.
 */
export function assertUnlocked(key: string): void {
  if (lockedKeys.has(key)) {
    throw new Error(`envLock: key "${key}" is locked and cannot be mutated.`);
  }
}
