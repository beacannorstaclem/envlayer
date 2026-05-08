/**
 * envAlias.ts
 * Defines aliasing utilities for environment variables:
 * map one or more legacy/alternate keys to canonical keys.
 */

export type AliasMap = Record<string, string>;

/**
 * Resolve aliases in an env record.
 * For each alias -> canonical pair, if the alias key exists and the
 * canonical key does NOT, copy the value over.
 */
export function resolveAliases(
  env: Record<string, string>,
  aliases: AliasMap
): Record<string, string> {
  const result = { ...env };
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (alias in result && !(canonical in result)) {
      result[canonical] = result[alias];
    }
  }
  return result;
}

/**
 * Strip alias keys from an env record, keeping only canonical keys.
 */
export function stripAliases(
  env: Record<string, string>,
  aliases: AliasMap
): Record<string, string> {
  const aliasKeys = new Set(Object.keys(aliases));
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => !aliasKeys.has(k))
  );
}

/**
 * List all alias keys that are present in the env record.
 */
export function listActiveAliases(
  env: Record<string, string>,
  aliases: AliasMap
): string[] {
  return Object.keys(aliases).filter((alias) => alias in env);
}

/**
 * Invert an alias map: canonical -> alias[]
 */
export function invertAliasMap(
  aliases: AliasMap
): Record<string, string[]> {
  const inverted: Record<string, string[]> = {};
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (!inverted[canonical]) inverted[canonical] = [];
    inverted[canonical].push(alias);
  }
  return inverted;
}

/**
 * Warn about deprecated alias keys present in env (returns list of warnings).
 */
export function deprecationWarnings(
  env: Record<string, string>,
  aliases: AliasMap
): string[] {
  return listActiveAliases(env, aliases).map(
    (alias) =>
      `[envlayer] Deprecated key "${alias}" used; prefer "${aliases[alias]}".`
  );
}
