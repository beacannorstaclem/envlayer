/**
 * defaultsMiddleware.ts
 * Express-style middleware that applies environment defaults
 * to req.env (or a custom target) before passing to the next handler.
 */

import { DefaultsMap, applyDefaults, resolvedDefaultKeys } from "./defaults";

export interface EnvRequest {
  env: Record<string, string>;
  resolvedDefaults?: string[];
  [key: string]: unknown;
}

export interface EnvResponse {
  [key: string]: unknown;
}

export type NextFn = (err?: Error) => void;
export type EnvMiddleware = (
  req: EnvRequest,
  res: EnvResponse,
  next: NextFn
) => void;

/**
 * Creates middleware that applies the given defaults to req.env.
 * Attaches the list of resolved default keys to req.resolvedDefaults.
 */
export function createDefaultsMiddleware(defaults: DefaultsMap): EnvMiddleware {
  return function defaultsMiddleware(
    req: EnvRequest,
    _res: EnvResponse,
    next: NextFn
  ): void {
    try {
      req.resolvedDefaults = resolvedDefaultKeys(req.env, defaults);
      req.env = applyDefaults(req.env, defaults);
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error(String(err)));
    }
  };
}

/**
 * Compose multiple EnvMiddleware functions into a single middleware.
 */
export function composeMiddleware(
  ...middlewares: EnvMiddleware[]
): EnvMiddleware {
  return function composed(
    req: EnvRequest,
    res: EnvResponse,
    next: NextFn
  ): void {
    let index = -1;
    function dispatch(i: number, err?: Error): void {
      if (err) return next(err);
      if (i <= index) return next(new Error("next() called multiple times"));
      index = i;
      const fn = middlewares[i];
      if (!fn) return next();
      fn(req, res, (e) => dispatch(i + 1, e));
    }
    dispatch(0);
  };
}
