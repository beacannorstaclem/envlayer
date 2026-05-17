/**
 * envInherit.ts
 * Provides utilities for inheriting and overriding env maps in a parent-child relationship.
 */

export type EnvMap = Record<string, string>;

export interface InheritOptions {
  /** Keys that children cannot override */
  locked?: string[];
  /** Keys that are NOT inherited (child-only) */
  exclude?: string[];
}

/**
 * Creates a child env by inheriting from a parent, with optional overrides.
 * Locked keys from the parent cannot be overridden by the child.
 */
export function inheritEnv(
  parent: EnvMap,
  child: EnvMap,
  options: InheritOptions = {}
): EnvMap {
  const { locked = [], exclude = [] } = options;

  const base: EnvMap = {};
  for (const [key, value] of Object.entries(parent)) {
    if (!exclude.includes(key)) {
      base[key] = value;
    }
  }

  for (const [key, value] of Object.entries(child)) {
    if (locked.includes(key)) continue;
    base[key] = value;
  }

  return base;
}

/**
 * Returns keys that the child overrides from the parent.
 */
export function overriddenKeys(parent: EnvMap, child: EnvMap): string[] {
  return Object.keys(child).filter(
    (key) => key in parent && parent[key] !== child[key]
  );
}

/**
 * Returns keys that are exclusively defined in the child (not in parent).
 */
export function childOnlyKeys(parent: EnvMap, child: EnvMap): string[] {
  return Object.keys(child).filter((key) => !(key in parent));
}

/**
 * Returns keys inherited from parent that the child did not override.
 */
export function inheritedKeys(parent: EnvMap, child: EnvMap): string[] {
  return Object.keys(parent).filter(
    (key) => !(key in child) || parent[key] === child[key]
  );
}

/**
 * Strips inherited keys from child, leaving only child-specific entries.
 */
export function stripInherited(parent: EnvMap, child: EnvMap): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(child)) {
    if (!(key in parent) || parent[key] !== value) {
      result[key] = value;
    }
  }
  return result;
}
