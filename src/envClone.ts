/**
 * envClone.ts
 * Utilities for deep-cloning, forking, and merging environment maps.
 */

export type EnvMap = Record<string, string>;

export interface CloneOptions {
  /** Keys to exclude from the clone */
  omit?: string[];
  /** Keys to include exclusively */
  pick?: string[];
  /** Additional overrides applied after cloning */
  overrides?: EnvMap;
}

/**
 * Creates a deep clone of an environment map with optional filtering and overrides.
 */
export function cloneEnv(source: EnvMap, options: CloneOptions = {}): EnvMap {
  const { omit = [], pick, overrides = {} } = options;

  let keys = Object.keys(source);

  if (pick && pick.length > 0) {
    keys = keys.filter((k) => pick.includes(k));
  }

  if (omit.length > 0) {
    keys = keys.filter((k) => !omit.includes(k));
  }

  const cloned: EnvMap = {};
  for (const key of keys) {
    cloned[key] = source[key];
  }

  return { ...cloned, ...overrides };
}

/**
 * Forks an environment map into two independent copies.
 * Returns [forkA, forkB] — mutations to one do not affect the other.
 */
export function forkEnv(source: EnvMap): [EnvMap, EnvMap] {
  return [cloneEnv(source), cloneEnv(source)];
}

/**
 * Merges a patched fork back into the original, applying only changed keys.
 * Keys present in `original` but absent in `fork` are preserved.
 */
export function mergeFork(original: EnvMap, fork: EnvMap): EnvMap {
  const result: EnvMap = { ...original };
  for (const [key, value] of Object.entries(fork)) {
    result[key] = value;
  }
  return result;
}

/**
 * Returns the keys that differ between two environment maps.
 */
export function changedKeys(a: EnvMap, b: EnvMap): string[] {
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return Array.from(allKeys).filter((k) => a[k] !== b[k]);
}

/**
 * Creates a shallow snapshot string useful for equality checks.
 */
export function envFingerprint(env: EnvMap): string {
  return Object.keys(env)
    .sort()
    .map((k) => `${k}=${env[k]}`)
    .join('\n');
}
