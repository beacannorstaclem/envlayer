import { describe, it, expect } from 'vitest';
import {
  renameKeys,
  renameOnly,
  swapKeys,
  invertRenameMap,
  listRenamedKeys,
} from './envRename';

const baseEnv = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

describe('renameKeys', () => {
  it('renames keys present in the rename map', () => {
    const result = renameKeys(baseEnv, { FOO: 'NEW_FOO' });
    expect(result.NEW_FOO).toBe('foo');
    expect(result.FOO).toBeUndefined();
  });

  it('leaves unmentioned keys unchanged', () => {
    const result = renameKeys(baseEnv, { FOO: 'NEW_FOO' });
    expect(result.BAR).toBe('bar');
    expect(result.BAZ).toBe('baz');
  });

  it('handles an empty rename map', () => {
    const result = renameKeys(baseEnv, {});
    expect(result).toEqual(baseEnv);
  });

  it('handles multiple renames', () => {
    const result = renameKeys(baseEnv, { FOO: 'A', BAR: 'B' });
    expect(result).toEqual({ A: 'foo', B: 'bar', BAZ: 'baz' });
  });
});

describe('renameOnly', () => {
  it('returns only the renamed entries', () => {
    const result = renameOnly(baseEnv, { FOO: 'NEW_FOO', BAR: 'NEW_BAR' });
    expect(result).toEqual({ NEW_FOO: 'foo', NEW_BAR: 'bar' });
  });

  it('skips keys not present in env', () => {
    const result = renameOnly(baseEnv, { MISSING: 'NEW_MISSING' });
    expect(result).toEqual({});
  });
});

describe('swapKeys', () => {
  it('swaps values of two existing keys', () => {
    const result = swapKeys(baseEnv, 'FOO', 'BAR');
    expect(result.FOO).toBe('bar');
    expect(result.BAR).toBe('foo');
  });

  it('moves value when only one key exists', () => {
    const result = swapKeys({ FOO: 'foo' }, 'FOO', 'BAR');
    expect(result.BAR).toBe('foo');
    expect(result.FOO).toBeUndefined();
  });

  it('does not mutate the original env', () => {
    const env = { FOO: 'foo', BAR: 'bar' };
    swapKeys(env, 'FOO', 'BAR');
    expect(env.FOO).toBe('foo');
  });
});

describe('invertRenameMap', () => {
  it('inverts the rename map', () => {
    const inverted = invertRenameMap({ FOO: 'NEW_FOO', BAR: 'NEW_BAR' });
    expect(inverted).toEqual({ NEW_FOO: 'FOO', NEW_BAR: 'BAR' });
  });

  it('returns empty object for empty map', () => {
    expect(invertRenameMap({})).toEqual({});
  });
});

describe('listRenamedKeys', () => {
  it('lists keys that exist in env and rename map', () => {
    const keys = listRenamedKeys(baseEnv, { FOO: 'NEW_FOO', MISSING: 'X' });
    expect(keys).toEqual(['FOO']);
  });

  it('returns empty array when no matches', () => {
    expect(listRenamedKeys(baseEnv, { NOPE: 'X' })).toEqual([]);
  });
});
