/**
 * envGroup.ts
 * Group environment variables by prefix or custom classifier,
 * providing scoped access and bulk operations per group.
 */

export type EnvRecord = Record<string, string>;
export type GroupMap = Record<string, EnvRecord>;

/**
 * Groups env variables by prefix (e.g. "DB_HOST" -> group "DB").
 * Strips the prefix from keys within each group.
 */
export function groupByPrefix(
  env: EnvRecord,
  separator = "_"
): GroupMap {
  const groups: GroupMap = {};
  for (const [key, value] of Object.entries(env)) {
    const idx = key.indexOf(separator);
    if (idx === -1) {
      const g = "__default";
      groups[g] = groups[g] ?? {};
      groups[g][key] = value;
    } else {
      const prefix = key.slice(0, idx);
      const rest = key.slice(idx + separator.length);
      groups[prefix] = groups[prefix] ?? {};
      groups[prefix][rest] = value;
    }
  }
  return groups;
}

/**
 * Reconstructs a flat env record from a GroupMap,
 * re-attaching the prefix to each key.
 */
export function ungroupByPrefix(
  groups: GroupMap,
  separator = "_"
): EnvRecord {
  const env: EnvRecord = {};
  for (const [prefix, vars] of Object.entries(groups)) {
    for (const [key, value] of Object.entries(vars)) {
      const fullKey = prefix === "__default" ? key : `${prefix}${separator}${key}`;
      env[fullKey] = value;
    }
  }
  return env;
}

/**
 * Returns only the variables belonging to a specific group/prefix.
 */
export function getGroup(env: EnvRecord, prefix: string, separator = "_"): EnvRecord {
  const groups = groupByPrefix(env, separator);
  return groups[prefix] ?? {};
}

/**
 * Lists all distinct prefixes (group names) found in the env record.
 */
export function listGroups(env: EnvRecord, separator = "_"): string[] {
  return Object.keys(groupByPrefix(env, separator));
}

/**
 * Merges a scoped group back into the full env, overwriting matching keys.
 */
export function mergeGroup(
  env: EnvRecord,
  prefix: string,
  groupVars: EnvRecord,
  separator = "_"
): EnvRecord {
  const updated: EnvRecord = { ...env };
  for (const [key, value] of Object.entries(groupVars)) {
    updated[`${prefix}${separator}${key}`] = value;
  }
  return updated;
}
