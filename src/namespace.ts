/**
 * namespace.ts
 * Utilities for namespacing environment variables by prefix.
 */

export type EnvRecord = Record<string, string>;

/**
 * Extract keys that start with the given prefix, stripping the prefix.
 */
export function extractNamespace(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  const upper = prefix.toUpperCase();
  for (const [key, value] of Object.entries(env)) {
    if (key.toUpperCase().startsWith(upper)) {
      const stripped = key.slice(prefix.length);
      result[stripped] = value;
    }
  }
  return result;
}

/**
 * Add a prefix to all keys in the given env record.
 */
export function addNamespace(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  for (const [key, value] of Object.entries(env)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

/**
 * Remove all keys that start with the given prefix from the env record.
 */
export function removeNamespace(env: EnvRecord, prefix: string): EnvRecord {
  const result: EnvRecord = {};
  const upper = prefix.toUpperCase();
  for (const [key, value] of Object.entries(env)) {
    if (!key.toUpperCase().startsWith(upper)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * List all unique namespace prefixes present in the env record,
 * using `_` as the delimiter.
 */
export function listNamespaces(env: EnvRecord): string[] {
  const prefixes = new Set<string>();
  for (const key of Object.keys(env)) {
    const idx = key.indexOf('_');
    if (idx > 0) {
      prefixes.add(key.slice(0, idx + 1));
    }
  }
  return Array.from(prefixes).sort();
}

/**
 * Merge a namespaced env record into a base env, with optional override control.
 */
export function mergeNamespace(
  base: EnvRecord,
  namespaced: EnvRecord,
  prefix: string,
  override = true
): EnvRecord {
  const prefixed = addNamespace(namespaced, prefix);
  const result = { ...base };
  for (const [key, value] of Object.entries(prefixed)) {
    if (override || !(key in result)) {
      result[key] = value;
    }
  }
  return result;
}
