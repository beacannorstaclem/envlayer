/**
 * envCompose.ts
 * Compose multiple env maps together with a named composition strategy.
 */

export type ComposeStrategy = 'merge' | 'override' | 'fallback' | 'intersect';

export interface ComposeOptions {
  strategy?: ComposeStrategy;
  prefix?: string;
}

/**
 * Merge all maps left-to-right; later values win.
 */
export function composeEnvMerge(
  maps: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, ...maps);
}

/**
 * Override: only keys present in the first map are kept; later maps override values.
 */
export function composeEnvOverride(
  base: Record<string, string>,
  ...overrides: Record<string, string>[]
): Record<string, string> {
  const result: Record<string, string> = { ...base };
  for (const override of overrides) {
    for (const key of Object.keys(override)) {
      if (key in result) {
        result[key] = override[key];
      }
    }
  }
  return result;
}

/**
 * Fallback: use first map's values; fill missing keys from subsequent maps.
 */
export function composeEnvFallback(
  ...maps: Record<string, string>[]
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      if (!(key in result)) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Intersect: only keys present in ALL maps are kept; last map's value wins.
 */
export function composeEnvIntersect(
  ...maps: Record<string, string>[]
): Record<string, string> {
  if (maps.length === 0) return {};
  const allKeys = maps.map((m) => new Set(Object.keys(m)));
  const commonKeys = [...allKeys[0]].filter((k) =>
    allKeys.every((s) => s.has(k))
  );
  const merged = Object.assign({}, ...maps);
  return Object.fromEntries(commonKeys.map((k) => [k, merged[k]]));
}

/**
 * Compose env maps using the specified strategy.
 */
export function composeEnv(
  maps: Record<string, string>[],
  options: ComposeOptions = {}
): Record<string, string> {
  const { strategy = 'merge', prefix } = options;
  let result: Record<string, string>;

  switch (strategy) {
    case 'override':
      result = composeEnvOverride(maps[0] ?? {}, ...maps.slice(1));
      break;
    case 'fallback':
      result = composeEnvFallback(...maps);
      break;
    case 'intersect':
      result = composeEnvIntersect(...maps);
      break;
    case 'merge':
    default:
      result = composeEnvMerge(maps);
      break;
  }

  if (prefix) {
    return Object.fromEntries(
      Object.entries(result).map(([k, v]) => [`${prefix}${k}`, v])
    );
  }

  return result;
}
