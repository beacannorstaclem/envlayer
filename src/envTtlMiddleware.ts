/**
 * envTtlMiddleware.ts — Middleware that overlays active TTL entries onto the
 * request environment before passing to the next handler.
 */

import { activeTtlSnapshot, purgeExpired } from "./envTtl";

export interface TtlEnvRequest {
  env: Record<string, string>;
  [key: string]: unknown;
}

export type TtlMiddlewareNext<T extends TtlEnvRequest> = (
  req: T
) => Promise<void> | void;

export interface TtlMiddlewareOptions {
  /** If true, expired keys are purged before the overlay is applied. Default: true */
  autoPurge?: boolean;
  /** If true, TTL values take precedence over existing env keys. Default: false */
  overwrite?: boolean;
}

/**
 * Creates a middleware that merges active TTL entries into `req.env`.
 */
export function createTtlMiddleware<T extends TtlEnvRequest>(
  options: TtlMiddlewareOptions = {}
) {
  const { autoPurge = true, overwrite = false } = options;

  return async function ttlMiddleware(
    req: T,
    next: TtlMiddlewareNext<T>
  ): Promise<void> {
    if (autoPurge) purgeExpired();

    const active = activeTtlSnapshot();

    if (overwrite) {
      req.env = { ...req.env, ...active };
    } else {
      req.env = { ...active, ...req.env };
    }

    await next(req);
  };
}
