/**
 * envAliasMiddleware.ts
 * Express-style middleware that resolves environment variable aliases
 * on an incoming request object carrying an `env` payload.
 */

import { resolveAliases, stripAliases, deprecationWarnings, AliasMap } from "./envAlias";

export interface AliasEnvRequest {
  env: Record<string, string>;
  [key: string]: unknown;
}

export interface AliasMiddlewareOptions {
  /** Remove alias keys after resolving them to canonical keys. */
  strip?: boolean;
  /** Emit deprecation warnings to console.warn. */
  warn?: boolean;
}

export function createAliasMiddleware(
  aliases: AliasMap,
  options: AliasMiddlewareOptions = {}
) {
  const { strip = false, warn = false } = options;

  return function aliasMiddleware(
    req: AliasEnvRequest,
    _res: unknown,
    next: (err?: unknown) => void
  ): void {
    try {
      if (warn) {
        const warnings = deprecationWarnings(req.env, aliases);
        warnings.forEach((w) => console.warn(w));
      }

      let resolved = resolveAliases(req.env, aliases);

      if (strip) {
        resolved = stripAliases(resolved, aliases);
      }

      req.env = resolved;
      next();
    } catch (err) {
      next(err);
    }
  };
}
