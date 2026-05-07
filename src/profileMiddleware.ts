/**
 * profileMiddleware.ts — Express-style middleware for injecting
 * the active (or request-specified) environment profile into req.env.
 */

import { resolveProfile, getActiveProfileName } from "./profile";

export interface ProfileRequest {
  env?: Record<string, string>;
  profileName?: string;
  [key: string]: unknown;
}

export type NextFn = (err?: unknown) => void;
export type ProfileMiddlewareFn = (
  req: ProfileRequest,
  res: unknown,
  next: NextFn
) => void;

export interface ProfileMiddlewareOptions {
  /** Header name to read profile from (default: "x-env-profile") */
  headerName?: string;
  /** Fallback profile name if no header and no active profile */
  fallback?: string;
  /** If true, merge profile env into existing req.env instead of replacing */
  merge?: boolean;
}

/**
 * Creates middleware that resolves the named profile and attaches
 * its env to `req.env`. Profile name is read from:
 *  1. req.profileName (set upstream)
 *  2. The configured header on req (cast via unknown)
 *  3. The globally active profile
 *  4. The fallback option
 */
export function createProfileMiddleware(
  options: ProfileMiddlewareOptions = {}
): ProfileMiddlewareFn {
  const { headerName = "x-env-profile", fallback, merge = false } = options;

  return function profileMiddleware(
    req: ProfileRequest,
    _res: unknown,
    next: NextFn
  ): void {
    try {
      const headers = (req as Record<string, unknown>).headers as
        | Record<string, string>
        | undefined;
      const profileName =
        req.profileName ??
        headers?.[headerName] ??
        getActiveProfileName() ??
        fallback;

      if (!profileName) {
        return next();
      }

      const profileEnv = resolveProfile(profileName);
      req.env = merge ? { ...req.env, ...profileEnv } : profileEnv;
      req.profileName = profileName;
      next();
    } catch (err) {
      next(err);
    }
  };
}
