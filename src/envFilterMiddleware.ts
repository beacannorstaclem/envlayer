/**
 * envFilterMiddleware.ts
 * Middleware for applying env filtering in a pipeline context.
 */

import {
  filterByPattern,
  filterByAllowlist,
  filterByDenylist,
  filterNonEmpty,
  composeFilters,
  FilterPredicate,
} from "./envFilter";

export interface FilterEnvRequest {
  env: Record<string, string>;
  [key: string]: unknown;
}

export type FilterMiddleware<T extends FilterEnvRequest> = (
  req: T,
  next: (req: T) => T
) => T;

/** Middleware that filters env by a regex pattern */
export function createPatternFilterMiddleware<T extends FilterEnvRequest>(
  pattern: RegExp
): FilterMiddleware<T> {
  return (req, next) =>
    next({ ...req, env: filterByPattern(req.env, pattern) });
}

/** Middleware that filters env to an allowlist of keys */
export function createAllowlistMiddleware<T extends FilterEnvRequest>(
  allowlist: string[]
): FilterMiddleware<T> {
  return (req, next) =>
    next({ ...req, env: filterByAllowlist(req.env, allowlist) });
}

/** Middleware that filters env by a denylist of keys */
export function createDenylistMiddleware<T extends FilterEnvRequest>(
  denylist: string[]
): FilterMiddleware<T> {
  return (req, next) =>
    next({ ...req, env: filterByDenylist(req.env, denylist) });
}

/** Middleware that strips empty values from env */
export function createNonEmptyFilterMiddleware<
  T extends FilterEnvRequest
>(): FilterMiddleware<T> {
  return (req, next) => next({ ...req, env: filterNonEmpty(req.env) });
}

/** Middleware that applies a custom composed predicate */
export function createPredicateFilterMiddleware<T extends FilterEnvRequest>(
  ...predicates: FilterPredicate[]
): FilterMiddleware<T> {
  const combined = composeFilters(...predicates);
  return (req, next) => {
    const filtered = Object.fromEntries(
      Object.entries(req.env).filter(([k, v]) => combined(k, v))
    );
    return next({ ...req, env: filtered });
  };
}
