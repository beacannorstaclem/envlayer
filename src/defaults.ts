/**
 * defaults.ts
 * Provides utilities for defining, merging, and applying default values
 * to environment variable maps.
 */

export type DefaultsMap = Record<string, string>;

/**
 * Define a set of default values.
 * Returns the provided map as-is (typed helper).
 */
export function defineDefaults(defaults: DefaultsMap): DefaultsMap {
  return { ...defaults };
}

/**
 * Apply defaults to an env map: only fills in keys that are missing or empty.
 */
export function applyDefaults(
  env: Record<string, string>,
  defaults: DefaultsMap
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  for (const [key, value] of Object.entries(defaults)) {
    if (result[key] === undefined || result[key] === "") {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Merge multiple DefaultsMaps left-to-right; later maps take precedence.
 */
export function mergeDefaults(...maps: DefaultsMap[]): DefaultsMap {
  return Object.assign({}, ...maps);
}

/**
 * Return only the keys from env that have values coming from defaults
 * (i.e., were not present in the original env).
 */
export function resolvedDefaultKeys(
  env: Record<string, string>,
  defaults: DefaultsMap
): string[] {
  return Object.keys(defaults).filter(
    (key) => env[key] === undefined || env[key] === ""
  );
}

/**
 * Check whether all required keys are present and non-empty in the given env map.
 * Throws an error listing any missing keys if validation fails.
 */
export function assertRequiredKeys(
  env: Record<string, string>,
  requiredKeys: string[]
): void {
  const missing = requiredKeys.filter(
    (key) => env[key] === undefined || env[key] === ""
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
  }
}
