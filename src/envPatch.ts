/**
 * envPatch.ts — Apply partial patches to environment maps with tracking.
 */

export type PatchOperation = 'set' | 'delete' | 'rename';

export interface PatchEntry {
  op: PatchOperation;
  key: string;
  value?: string;
  newKey?: string;
}

export type EnvMap = Record<string, string>;

/**
 * Apply a single patch entry to an env map (immutably).
 */
export function applyPatchEntry(env: EnvMap, entry: PatchEntry): EnvMap {
  const result = { ...env };
  if (entry.op === 'set' && entry.value !== undefined) {
    result[entry.key] = entry.value;
  } else if (entry.op === 'delete') {
    delete result[entry.key];
  } else if (entry.op === 'rename' && entry.newKey) {
    if (entry.key in result) {
      result[entry.newKey] = result[entry.key];
      delete result[entry.key];
    }
  }
  return result;
}

/**
 * Apply a list of patch entries in order.
 */
export function applyPatch(env: EnvMap, patch: PatchEntry[]): EnvMap {
  return patch.reduce((acc, entry) => applyPatchEntry(acc, entry), env);
}

/**
 * Compute a patch (list of set/delete ops) to transform `from` into `to`.
 */
export function computePatch(from: EnvMap, to: EnvMap): PatchEntry[] {
  const patch: PatchEntry[] = [];
  const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
  for (const key of allKeys) {
    if (!(key in to)) {
      patch.push({ op: 'delete', key });
    } else if (from[key] !== to[key]) {
      patch.push({ op: 'set', key, value: to[key] });
    }
  }
  return patch;
}

/**
 * Invert a patch (best-effort reversal using original env).
 */
export function invertPatch(original: EnvMap, patch: PatchEntry[]): PatchEntry[] {
  return patch.map((entry): PatchEntry => {
    if (entry.op === 'set') {
      if (entry.key in original) {
        return { op: 'set', key: entry.key, value: original[entry.key] };
      }
      return { op: 'delete', key: entry.key };
    }
    if (entry.op === 'delete') {
      const val = original[entry.key];
      return val !== undefined ? { op: 'set', key: entry.key, value: val } : { op: 'delete', key: entry.key };
    }
    if (entry.op === 'rename' && entry.newKey) {
      return { op: 'rename', key: entry.newKey, newKey: entry.key };
    }
    return entry;
  });
}
