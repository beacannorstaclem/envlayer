/**
 * typecastMiddleware.ts — Middleware that applies typecast schema to env on each request.
 */

import { typecastPartial, TypecastSchema } from './typecast';

export interface TypecastMiddlewareOptions {
  schema: TypecastSchema;
  /** If true, throw on missing keys; otherwise silently skip them. */
  strict?: boolean;
}

export type EnvMiddleware = (
  env: Record<string, string>,
  next: (env: Record<string, string>) => Record<string, unknown>
) => Record<string, unknown>;

export function createTypecastMiddleware(
  options: TypecastMiddlewareOptions
): EnvMiddleware {
  const { schema, strict = false } = options;

  return function typecastMiddleware(
    env: Record<string, string>,
    next: (env: Record<string, string>) => Record<string, unknown>
  ): Record<string, unknown> {
    if (strict) {
      for (const key of Object.keys(schema)) {
        if (!(key in env)) {
          throw new ReferenceError(
            `[typecastMiddleware] Missing required env key: "${key}"`
          );
        }
      }
    }

    const casted = typecastPartial(env, schema);
    const downstream = next(env);

    return { ...downstream, ...casted };
  };
}

export function applyTypecastMiddleware(
  env: Record<string, string>,
  schema: TypecastSchema,
  strict = false
): Record<string, unknown> {
  const middleware = createTypecastMiddleware({ schema, strict });
  return middleware(env, (e) => ({ ...e }));
}
