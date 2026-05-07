/**
 * expandMiddleware.ts — Connect/Express-style middleware that expands
 * environment variable references in a resolved env map before it is
 * used by the application.
 */

import { expandAllDeep, EnvMap } from "./expand";

export interface ExpandOptions {
  /** Fall back to process.env for unresolved references (default: true). */
  fallback?: boolean;
  /** Maximum expansion passes for chained references (default: 5). */
  maxPasses?: number;
  /** If true, mutate the input map in-place instead of returning a copy. */
  mutate?: boolean;
}

/**
 * Returns a middleware function that expands variable references in `env`.
 * The middleware signature mirrors the pattern used by defaultsMiddleware.
 */
export function createExpandMiddleware(
  options: ExpandOptions = {}
) {
  const { fallback = true, maxPasses = 5, mutate = false } = options;

  return function expandMiddleware(
    env: EnvMap,
    next: (env: EnvMap) => EnvMap
  ): EnvMap {
    const expanded = expandAllDeep(env, fallback, maxPasses);
    if (mutate) {
      Object.assign(env, expanded);
      return next(env);
    }
    return next(expanded);
  };
}

/**
 * Convenience: expand an env map directly without composing middleware.
 */
export function expandEnv(
  env: EnvMap,
  options: ExpandOptions = {}
): EnvMap {
  const { fallback = true, maxPasses = 5 } = options;
  return expandAllDeep(env, fallback, maxPasses);
}
