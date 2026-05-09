import {
  diffEnvMaps,
  filterDiff,
  hasDifferences,
  summariseDiff,
  applyDiff,
  DiffEntry,
} from './envDiff';

const before = { FOO: 'foo', BAR: 'bar', KEEP: 'same' };
const after  = { FOO: 'foo2', BAZ: 'baz', KEEP: 'same' };

describe('diffEnvMaps', () => {
  it('detects added keys', () => {
    const diff = diffEnvMaps(before, after);
    const added = diff.filter((e) => e.kind === 'added');
    expect(added).toHaveLength(1);
    expect(added[0].key).toBe('BAZ');
    expect(added[0].newValue).toBe('baz');
    expect(added[0].oldValue).toBeUndefined();
  });

  it('detects removed keys', () => {
    const diff = diffEnvMaps(before, after);
    const removed = diff.filter((e) => e.kind === 'removed');
    expect(removed).toHaveLength(1);
    expect(removed[0].key).toBe('BAR');
    expect(removed[0].oldValue).toBe('bar');
  });

  it('detects changed keys', () => {
    const diff = diffEnvMaps(before, after);
    const changed = diff.filter((e) => e.kind === 'changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].key).toBe('FOO');
    expect(changed[0].oldValue).toBe('foo');
    expect(changed[0].newValue).toBe('foo2');
  });

  it('detects unchanged keys', () => {
    const diff = diffEnvMaps(before, after);
    const unchanged = diff.filter((e) => e.kind === 'unchanged');
    expect(unchanged).toHaveLength(1);
    expect(unchanged[0].key).toBe('KEEP');
  });

  it('returns sorted entries', () => {
    const diff = diffEnvMaps(before, after);
    const keys = diff.map((e) => e.key);
    expect(keys).toEqual([...keys].sort());
  });

  it('handles empty maps', () => {
    expect(diffEnvMaps({}, {})).toEqual([]);
  });
});

describe('filterDiff', () => {
  it('filters by a single kind', () => {
    const diff = diffEnvMaps(before, after);
    const added = filterDiff(diff, 'added');
    expect(added.every((e) => e.kind === 'added')).toBe(true);
  });

  it('filters by multiple kinds', () => {
    const diff = diffEnvMaps(before, after);
    const result = filterDiff(diff, 'added', 'removed');
    expect(result.every((e) => e.kind === 'added' || e.kind === 'removed')).toBe(true);
    expect(result).toHaveLength(2);
  });
});

describe('hasDifferences', () => {
  it('returns true when there are differences', () => {
    expect(hasDifferences(diffEnvMaps(before, after))).toBe(true);
  });

  it('returns false for identical maps', () => {
    expect(hasDifferences(diffEnvMaps(before, before))).toBe(false);
  });
});

describe('summariseDiff', () => {
  it('returns correct counts', () => {
    const summary = summariseDiff(diffEnvMaps(before, after));
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(1);
    expect(summary.changed).toBe(1);
    expect(summary.unchanged).toBe(1);
  });
});

describe('applyDiff', () => {
  it('produces the after map when applied to before', () => {
    const diff = diffEnvMaps(before, after);
    const result = applyDiff(before, diff);
    expect(result).toEqual(after);
  });

  it('does not mutate the base map', () => {
    const base = { A: '1' };
    const diff = diffEnvMaps(base, { A: '2' });
    applyDiff(base, diff);
    expect(base.A).toBe('1');
  });
});
