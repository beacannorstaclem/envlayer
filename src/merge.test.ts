import { describe, it, expect } from 'vitest';
import { mergeLayers, mergeTwo, pickKeys, omitKeys } from './merge';

describe('mergeLayers', () => {
  it('returns empty object for empty array', () => {
    expect(mergeLayers([])).toEqual({});
  });

  it('returns single layer unchanged', () => {
    const layer = { FOO: 'bar', BAZ: 'qux' };
    expect(mergeLayers([layer])).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('later layers override earlier layers', () => {
    const base = { FOO: 'base', SHARED: 'from-base' };
    const override = { FOO: 'override', EXTRA: 'extra' };
    expect(mergeLayers([base, override])).toEqual({
      FOO: 'override',
      SHARED: 'from-base',
      EXTRA: 'extra',
    });
  });

  it('undefined values in later layers do not override defined values', () => {
    const base = { FOO: 'base' };
    const override: Record<string, string | undefined> = { FOO: undefined };
    expect(mergeLayers([base, override])).toEqual({ FOO: 'base' });
  });

  it('merges three layers in order', () => {
    const l1 = { A: '1', B: '1' };
    const l2 = { B: '2', C: '2' };
    const l3 = { C: '3', D: '3' };
    expect(mergeLayers([l1, l2, l3])).toEqual({ A: '1', B: '2', C: '3', D: '3' });
  });
});

describe('mergeTwo', () => {
  it('merges base and override correctly', () => {
    const base = { X: 'base', Y: 'base' };
    const override = { Y: 'override', Z: 'new' };
    expect(mergeTwo(base, override)).toEqual({
      X: 'base',
      Y: 'override',
      Z: 'new',
    });
  });
});

describe('pickKeys', () => {
  it('returns only specified keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    expect(pickKeys(env, ['A', 'C'])).toEqual({ A: '1', C: '3' });
  });

  it('ignores keys not present in env', () => {
    const env = { A: '1' };
    expect(pickKeys(env, ['A', 'MISSING'])).toEqual({ A: '1' });
  });
});

describe('omitKeys', () => {
  it('removes specified keys', () => {
    const env = { A: '1', B: '2', C: '3' };
    expect(omitKeys(env, ['B'])).toEqual({ A: '1', C: '3' });
  });

  it('does not mutate the original object', () => {
    const env = { A: '1', B: '2' };
    omitKeys(env, ['A']);
    expect(env).toEqual({ A: '1', B: '2' });
  });

  it('handles omitting non-existent keys gracefully', () => {
    const env = { A: '1' };
    expect(omitKeys(env, ['MISSING'])).toEqual({ A: '1' });
  });
});
