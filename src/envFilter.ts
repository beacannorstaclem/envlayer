/**
 * envFilter.ts
 * Utilities for filtering environment variable maps by various criteria.
 */

export type FilterPredicate = (key: string, value: string) => boolean;

/** Filter env map by a predicate function */
export function filterEnv(
  env: Record<string, string>,
  predicate: FilterPredicate
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(([k, v]) => predicate(k, v))
  );
}

/** Filter env map to only keys matching a regex pattern */
export function filterByPattern(
  env: Record<string, string>,
  pattern: RegExp
): Record<string, string> {
  return filterEnv(env, (key) => pattern.test(key));
}

/** Filter env map to only keys in the provided allowlist */
export function filterByAllowlist(
  env: Record<string, string>,
  allowlist: string[]
): Record<string, string> {
  const set = new Set(allowlist);
  return filterEnv(env, (key) => set.has(key));
}

/** Filter env map to exclude keys in the provided denylist */
export function filterByDenylist(
  env: Record<string, string>,
  denylist: string[]
): Record<string, string> {
  const set = new Set(denylist);
  return filterEnv(env, (key) => !set.has(key));
}

/** Filter env map to only entries whose values match a given predicate */
export function filterByValue(
  env: Record<string, string>,
  predicate: (value: string) => boolean
): Record<string, string> {
  return filterEnv(env, (_key, value) => predicate(value));
}

/** Filter env map to only non-empty string values */
export function filterNonEmpty(
  env: Record<string, string>
): Record<string, string> {
  return filterByValue(env, (v) => v.trim().length > 0);
}

/** Compose multiple filter predicates with AND logic */
export function composeFilters(
  ...predicates: FilterPredicate[]
): FilterPredicate {
  return (key, value) => predicates.every((p) => p(key, value));
}
