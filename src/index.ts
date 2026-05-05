/**
 * envlayer — Lightweight library for layered environment variable resolution
 * with schema validation.
 *
 * Public API surface for the resolver module.
 */
export type { EnvSource, ResolverOptions } from './resolver';
export { resolveKey, resolveAll } from './resolver';
