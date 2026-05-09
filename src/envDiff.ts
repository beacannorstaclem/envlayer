/**
 * envDiff.ts
 * Utilities for comparing two environment maps and producing structured diffs.
 */

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  kind: DiffKind;
  oldValue?: string;
  newValue?: string;
}

export type EnvMap = Record<string, string>;

/**
 * Compare two env maps and return a list of diff entries.
 */
export function diffEnvMaps(before: EnvMap, after: EnvMap): DiffEntry[] {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const entries: DiffEntry[] = [];

  for (const key of allKeys) {
    const inBefore = Object.prototype.hasOwnProperty.call(before, key);
    const inAfter = Object.prototype.hasOwnProperty.call(after, key);

    if (inBefore && !inAfter) {
      entries.push({ key, kind: 'removed', oldValue: before[key] });
    } else if (!inBefore && inAfter) {
      entries.push({ key, kind: 'added', newValue: after[key] });
    } else if (before[key] !== after[key]) {
      entries.push({ key, kind: 'changed', oldValue: before[key], newValue: after[key] });
    } else {
      entries.push({ key, kind: 'unchanged', oldValue: before[key], newValue: after[key] });
    }
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Filter diff entries by one or more kinds.
 */
export function filterDiff(diff: DiffEntry[], ...kinds: DiffKind[]): DiffEntry[] {
  const set = new Set(kinds);
  return diff.filter((e) => set.has(e.kind));
}

/**
 * Returns true if there are any non-unchanged entries.
 */
export function hasDifferences(diff: DiffEntry[]): boolean {
  return diff.some((e) => e.kind !== 'unchanged');
}

/**
 * Summarise a diff as counts per kind.
 */
export function summariseDiff(diff: DiffEntry[]): Record<DiffKind, number> {
  const summary: Record<DiffKind, number> = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const entry of diff) {
    summary[entry.kind]++;
  }
  return summary;
}

/**
 * Apply a diff to a base env map, producing the "after" state.
 */
export function applyDiff(base: EnvMap, diff: DiffEntry[]): EnvMap {
  const result: EnvMap = { ...base };
  for (const entry of diff) {
    if (entry.kind === 'added' || entry.kind === 'changed') {
      result[entry.key] = entry.newValue as string;
    } else if (entry.kind === 'removed') {
      delete result[entry.key];
    }
  }
  return result;
}
