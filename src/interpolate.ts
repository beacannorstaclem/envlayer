/**
 * Interpolates environment variable references within string values.
 * Supports ${VAR_NAME} and $VAR_NAME syntax.
 */

export type EnvMap = Record<string, string>;

const BRACE_PATTERN = /\$\{([^}]+)\}/g;
const BARE_PATTERN = /\$([A-Z_][A-Z0-9_]*)/g;

/**
 * Resolves a single variable reference from the provided env map.
 */
function resolveRef(name: string, env: EnvMap, visited: Set<string>): string {
  if (visited.has(name)) {
    throw new Error(`Circular reference detected for variable: ${name}`);
  }
  const value = env[name];
  if (value === undefined) {
    return "";
  }
  visited.add(name);
  const resolved = interpolate(value, env, visited);
  visited.delete(name);
  return resolved;
}

/**
 * Interpolates all variable references within a string value.
 */
export function interpolate(
  value: string,
  env: EnvMap,
  visited: Set<string> = new Set()
): string {
  let result = value;

  result = result.replace(BRACE_PATTERN, (_, name: string) =>
    resolveRef(name.trim(), env, new Set(visited))
  );

  result = result.replace(BARE_PATTERN, (_, name: string) =>
    resolveRef(name, env, new Set(visited))
  );

  return result;
}

/**
 * Applies interpolation to all values in an env map.
 */
export function interpolateAll(env: EnvMap): EnvMap {
  const result: EnvMap = {};
  for (const key of Object.keys(env)) {
    result[key] = interpolate(env[key], env);
  }
  return result;
}
