/**
 * namespaceMiddleware.ts
 * Middleware for scoping request env to a namespace prefix.
 */

import { extractNamespace, addNamespace, EnvRecord } from './namespace';

export interface NamespaceMiddlewareOptions {
  prefix: string;
  /** If true, also expose un-prefixed keys in the resolved env */
  includeGlobal?: boolean;
}

export type NextFn = () => void;
export interface EnvRequest {
  env: EnvRecord;
  resolved?: EnvRecord;
  [key: string]: unknown;
}

/**
 * Creates middleware that scopes the request env to a given namespace prefix.
 * The resolved env on the request will only contain the stripped keys.
 */
export function createNamespaceMiddleware(
  options: NamespaceMiddlewareOptions
) {
  const { prefix, includeGlobal = false } = options;

  return function namespaceMiddleware(req: EnvRequest, next: NextFn): void {
    const namespaced = extractNamespace(req.env, prefix);
    if (includeGlobal) {
      const withoutPrefix: EnvRecord = {};
      for (const [key, value] of Object.entries(req.env)) {
        if (!key.toUpperCase().startsWith(prefix.toUpperCase())) {
          withoutPrefix[key] = value;
        }
      }
      req.resolved = { ...withoutPrefix, ...namespaced };
    } else {
      req.resolved = namespaced;
    }
    next();
  };
}

/**
 * Re-namespace: take resolved keys and re-attach a prefix before passing on.
 */
export function createRenamespacingMiddleware(prefix: string) {
  return function renamespacingMiddleware(req: EnvRequest, next: NextFn): void {
    if (req.resolved) {
      req.resolved = addNamespace(req.resolved, prefix);
    }
    next();
  };
}
