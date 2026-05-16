/**
 * envRename — rename, map, and swap environment variable keys.
 */

export type RenameMap = Record<string, string>;

/**
 * Rename keys in an env map according to a rename map.
 * Keys not present in the rename map are left unchanged.
 */
export function renameKeys(
  env: Record<string, string>,
  renameMap: RenameMap
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = renameMap[key] ?? key;
    result[newKey] = value;
  }
  return result;
}

/**
 * Rename keys and drop the originals, keeping only renamed entries.
 */
export function renameOnly(
  env: Record<string, string>,
  renameMap: RenameMap
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (Object.prototype.hasOwnProperty.call(env, oldKey)) {
      result[newKey] = env[oldKey];
    }
  }
  return result;
}

/**
 * Swap two keys in an env map (exchange their values).
 */
export function swapKeys(
  env: Record<string, string>,
  keyA: string,
  keyB: string
): Record<string, string> {
  const result = { ...env };
  const valA = result[keyA];
  const valB = result[keyB];
  if (valA !== undefined) result[keyB] = valA;
  else delete result[keyB];
  if (valB !== undefined) result[keyA] = valB;
  else delete result[keyA];
  return result;
}

/**
 * Invert a rename map (new -> old).
 */
export function invertRenameMap(renameMap: RenameMap): RenameMap {
  const inverted: RenameMap = {};
  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    inverted[newKey] = oldKey;
  }
  return inverted;
}

/**
 * List keys that would be renamed by the given rename map.
 */
export function listRenamedKeys(
  env: Record<string, string>,
  renameMap: RenameMap
): string[] {
  return Object.keys(renameMap).filter((k) =>
    Object.prototype.hasOwnProperty.call(env, k)
  );
}
