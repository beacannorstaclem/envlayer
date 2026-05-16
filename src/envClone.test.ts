import { describe, it, expect } from 'vitest';
import {
  cloneEnv,
  forkEnv,
  mergeFork,
  changedKeys,
  envFingerprint,
} from './envClone';

const base = { APP: 'myapp', PORT: '3000', SECRET: 'abc123', DEBUG: 'true' };

describe('cloneEnv', () => {
  it('creates an independent copy', () => {
    const clone = cloneEnv(base);
    expect(clone).toEqual(base);
    expect(clone).not.toBe(base);
  });

  it('respects pick option', () => {
    const clone = cloneEnv(base, { pick: ['APP', 'PORT'] });
    expect(clone).toEqual({ APP: 'myapp', PORT: '3000' });
  });

  it('respects omit option', () => {
    const clone = cloneEnv(base, { omit: ['SECRET'] });
    expect(clone).not.toHaveProperty('SECRET');
    expect(clone).toHaveProperty('APP');
  });

  it('applies overrides after cloning', () => {
    const clone = cloneEnv(base, { overrides: { PORT: '8080', EXTRA: 'yes' } });
    expect(clone.PORT).toBe('8080');
    expect(clone.EXTRA).toBe('yes');
    expect(clone.APP).toBe('myapp');
  });

  it('pick and omit can be combined (pick takes precedence, omit filters result)', () => {
    const clone = cloneEnv(base, { pick: ['APP', 'PORT', 'SECRET'], omit: ['SECRET'] });
    expect(clone).toEqual({ APP: 'myapp', PORT: '3000' });
  });
});

describe('forkEnv', () => {
  it('returns two independent copies', () => {
    const [a, b] = forkEnv(base);
    expect(a).toEqual(base);
    expect(b).toEqual(base);
    expect(a).not.toBe(b);
  });

  it('mutations to one fork do not affect the other', () => {
    const [a, b] = forkEnv(base);
    a.PORT = '9999';
    expect(b.PORT).toBe('3000');
  });
});

describe('mergeFork', () => {
  it('merges changed keys from fork into original', () => {
    const fork = { ...base, PORT: '9000', NEW_KEY: 'hello' };
    const merged = mergeFork(base, fork);
    expect(merged.PORT).toBe('9000');
    expect(merged.NEW_KEY).toBe('hello');
    expect(merged.APP).toBe('myapp');
  });

  it('preserves original keys absent in fork', () => {
    const fork = { APP: 'otherapp' };
    const merged = mergeFork(base, fork);
    expect(merged.PORT).toBe('3000');
    expect(merged.APP).toBe('otherapp');
  });
});

describe('changedKeys', () => {
  it('detects changed values', () => {
    const modified = { ...base, PORT: '4000' };
    expect(changedKeys(base, modified)).toContain('PORT');
  });

  it('detects added keys', () => {
    const extended = { ...base, ADDED: 'new' };
    expect(changedKeys(base, extended)).toContain('ADDED');
  });

  it('detects removed keys', () => {
    const reduced = { APP: 'myapp', PORT: '3000' };
    expect(changedKeys(base, reduced)).toEqual(expect.arrayContaining(['SECRET', 'DEBUG']));
  });

  it('returns empty array for identical maps', () => {
    expect(changedKeys(base, { ...base })).toHaveLength(0);
  });
});

describe('envFingerprint', () => {
  it('produces identical fingerprints for equal maps regardless of insertion order', () => {
    const a = { Z: '1', A: '2' };
    const b = { A: '2', Z: '1' };
    expect(envFingerprint(a)).toBe(envFingerprint(b));
  });

  it('produces different fingerprints for different maps', () => {
    const modified = { ...base, PORT: '9999' };
    expect(envFingerprint(base)).not.toBe(envFingerprint(modified));
  });
});
