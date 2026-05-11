/**
 * envScope.ts
 * Scoped environment variable views — create isolated subsets of an env map
 * with optional read/write restrictions.
 */

export interface EnvScope {
  env: Record<string, string>;
  readonly: boolean;
  keys: Set<string>;
}

/** Create a scoped view over a subset of keys from an env map */
export function createScope(
  env: Record<string, string>,
  keys: string[],
  readonly = false
): EnvScope {
  const scopedEnv: Record<string, string> = {};
  for (const key of keys) {
    if (key in env) scopedEnv[key] = env[key];
  }
  return { env: scopedEnv, readonly, keys: new Set(keys) };
}

/** Read a value from a scope */
export function scopeGet(scope: EnvScope, key: string): string | undefined {
  return scope.env[key];
}

/** Write a value into a scope (throws if readonly) */
export function scopeSet(scope: EnvScope, key: string, value: string): void {
  if (scope.readonly) throw new Error(`Scope is readonly — cannot set "${key}"`);
  if (!scope.keys.has(key)) throw new Error(`Key "${key}" is not in scope`);
  scope.env[key] = value;
}

/** Delete a key from a scope (throws if readonly) */
export function scopeDelete(scope: EnvScope, key: string): void {
  if (scope.readonly) throw new Error(`Scope is readonly — cannot delete "${key}"`);
  delete scope.env[key];
  scope.keys.delete(key);
}

/** Merge a scope's env back into a base env map */
export function mergeScope(
  base: Record<string, string>,
  scope: EnvScope
): Record<string, string> {
  return { ...base, ...scope.env };
}

/** List keys present in the scope */
export function listScopeKeys(scope: EnvScope): string[] {
  return Array.from(scope.keys);
}

/** Check whether a key is part of a scope */
export function inScope(scope: EnvScope, key: string): boolean {
  return scope.keys.has(key);
}

/** Clone a scope (optionally change readonly flag) */
export function cloneScope(scope: EnvScope, readonly?: boolean): EnvScope {
  return {
    env: { ...scope.env },
    readonly: readonly !== undefined ? readonly : scope.readonly,
    keys: new Set(scope.keys),
  };
}
