/**
 * merge.ts
 * Utilities for merging multiple environment layers into a single flat record.
 * Later layers take precedence over earlier ones.
 */

export type EnvLayer = Record<string, string | undefined>;

/**
 * Merge an ordered array of environment layers.
 * Entries from layers with higher indexes override those with lower indexes.
 * Undefined values in later layers do NOT override defined values.
 */
export function mergeLayers(layers: EnvLayer[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Merge two layers, with `override` taking precedence over `base`.
 */
export function mergeTwo(
  base: EnvLayer,
  override: EnvLayer
): Record<string, string> {
  return mergeLayers([base, override]);
}

/**
 * Pick only the specified keys from a merged environment record.
 */
export function pickKeys(
  env: Record<string, string>,
  keys: string[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (key in env) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Omit the specified keys from a merged environment record.
 */
export function omitKeys(
  env: Record<string, string>,
  keys: string[]
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
