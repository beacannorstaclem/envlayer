/**
 * freeze.ts
 * Utilities for producing immutable snapshots of environment variable maps.
 * A frozen env cannot be mutated; attempts throw a TypeError.
 */

export type FrozenEnv = Readonly<Record<string, string>>;

/**
 * Deeply freezes a plain env record and returns it typed as FrozenEnv.
 */
export function freezeEnv(env: Record<string, string>): FrozenEnv {
  return Object.freeze({ ...env });
}

/**
 * Returns true if the given object is a frozen env record.
 */
export function isFrozen(env: Record<string, string>): boolean {
  return Object.isFrozen(env);
}

/**
 * Attempts to set a key on a frozen env. Always throws TypeError.
 * Useful for testing / guard clauses.
 */
export function assertMutable(env: Record<string, string>, key: string): void {
  if (Object.isFrozen(env)) {
    throw new TypeError(
      `Cannot set key "${key}" on a frozen environment record.`
    );
  }
}

/**
 * Creates a mutable copy of a frozen (or any) env record.
 */
export function thawEnv(env: FrozenEnv): Record<string, string> {
  return { ...env };
}

/**
 * Merges additional keys into a frozen env by thawing, merging, and re-freezing.
 */
export function extendFrozen(
  env: FrozenEnv,
  additions: Record<string, string>
): FrozenEnv {
  return freezeEnv({ ...env, ...additions });
}
