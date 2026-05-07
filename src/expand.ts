/**
 * expand.ts — Variable expansion for environment values.
 * Supports $VAR and ${VAR} syntax within values, resolving against
 * a provided env map with optional fallback to process.env.
 */

export type EnvMap = Record<string, string>;

const EXPAND_RE = /\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g;

/**
 * Expand a single value string, replacing $VAR / ${VAR} references.
 * @param value   The raw string that may contain references.
 * @param env     The primary env map to look up variables in.
 * @param fallback Whether to fall back to process.env when not found in env.
 */
export function expandValue(
  value: string,
  env: EnvMap,
  fallback = true
): string {
  return value.replace(EXPAND_RE, (_match, braced: string, bare: string) => {
    const key = braced ?? bare;
    if (key in env) return env[key];
    if (fallback && key in process.env) return process.env[key] as string;
    return _match; // leave unresolved references as-is
  });
}

/**
 * Expand all values in an env map.
 * Each value is expanded against the same map so order-independent
 * references are supported (single pass — circular refs are left as-is).
 */
export function expandAll(
  env: EnvMap,
  fallback = true
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = expandValue(value, env, fallback);
  }
  return result;
}

/**
 * Expand all values using a multi-pass approach (up to maxPasses) so that
 * chained references like A=$B, B=$C, C=hello resolve correctly.
 */
export function expandAllDeep(
  env: EnvMap,
  fallback = true,
  maxPasses = 5
): EnvMap {
  let current = { ...env };
  for (let i = 0; i < maxPasses; i++) {
    const next = expandAll(current, fallback);
    if (JSON.stringify(next) === JSON.stringify(current)) break;
    current = next;
  }
  return current;
}
