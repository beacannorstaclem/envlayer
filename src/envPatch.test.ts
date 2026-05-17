import {
  applyPatchEntry,
  applyPatch,
  computePatch,
  invertPatch,
  PatchEntry,
} from './envPatch';
import {
  createPatchMiddleware,
  createComputePatchMiddleware,
  composePatchMiddlewares,
  PatchEnvRequest,
} from './envPatchMiddleware';

const base = { FOO: 'foo', BAR: 'bar', BAZ: 'baz' };

describe('applyPatchEntry', () => {
  it('sets a key', () => {
    const r = applyPatchEntry(base, { op: 'set', key: 'FOO', value: 'new' });
    expect(r.FOO).toBe('new');
  });

  it('deletes a key', () => {
    const r = applyPatchEntry(base, { op: 'delete', key: 'BAR' });
    expect('BAR' in r).toBe(false);
  });

  it('renames a key', () => {
    const r = applyPatchEntry(base, { op: 'rename', key: 'BAZ', newKey: 'QUX' });
    expect(r.QUX).toBe('baz');
    expect('BAZ' in r).toBe(false);
  });

  it('does not mutate original', () => {
    applyPatchEntry(base, { op: 'set', key: 'FOO', value: 'x' });
    expect(base.FOO).toBe('foo');
  });
});

describe('applyPatch', () => {
  it('applies multiple entries in order', () => {
    const patch: PatchEntry[] = [
      { op: 'set', key: 'FOO', value: 'updated' },
      { op: 'delete', key: 'BAR' },
    ];
    const r = applyPatch(base, patch);
    expect(r.FOO).toBe('updated');
    expect('BAR' in r).toBe(false);
    expect(r.BAZ).toBe('baz');
  });
});

describe('computePatch', () => {
  it('detects set and delete ops', () => {
    const to = { FOO: 'changed', BAZ: 'baz', NEW: 'val' };
    const patch = computePatch(base, to);
    const ops = Object.fromEntries(patch.map((e) => [e.key, e]));
    expect(ops['FOO'].op).toBe('set');
    expect(ops['BAR'].op).toBe('delete');
    expect(ops['NEW'].op).toBe('set');
  });

  it('returns empty patch for identical envs', () => {
    expect(computePatch(base, { ...base })).toHaveLength(0);
  });
});

describe('invertPatch', () => {
  it('inverts set to restore original value', () => {
    const patch: PatchEntry[] = [{ op: 'set', key: 'FOO', value: 'new' }];
    const inv = invertPatch(base, patch);
    expect(inv[0]).toEqual({ op: 'set', key: 'FOO', value: 'foo' });
  });

  it('inverts delete to restore original value', () => {
    const patch: PatchEntry[] = [{ op: 'delete', key: 'BAR' }];
    const inv = invertPatch(base, patch);
    expect(inv[0]).toEqual({ op: 'set', key: 'BAR', value: 'bar' });
  });
});

describe('createPatchMiddleware', () => {
  it('applies patch and logs it', () => {
    const mw = createPatchMiddleware([{ op: 'set', key: 'FOO', value: 'mw' }]);
    const req: PatchEnvRequest = { env: { ...base } };
    const result = mw(req, (r) => r);
    expect(result.env.FOO).toBe('mw');
    expect(result.patchLog).toHaveLength(1);
  });
});

describe('createComputePatchMiddleware', () => {
  it('transitions env to target and records patch', () => {
    const target = { FOO: 'foo', BAR: 'changed' };
    const mw = createComputePatchMiddleware(target);
    const req: PatchEnvRequest = { env: { ...base } };
    const result = mw(req, (r) => r);
    expect(result.env).toEqual(target);
    expect(result.patch?.some((e) => e.key === 'BAR')).toBe(true);
  });
});

describe('composePatchMiddlewares', () => {
  it('applies middlewares in sequence', () => {
    const mw1 = createPatchMiddleware([{ op: 'set', key: 'A', value: '1' }]);
    const mw2 = createPatchMiddleware([{ op: 'set', key: 'B', value: '2' }]);
    const composed = composePatchMiddlewares([mw1, mw2]);
    const result = composed({ env: {} }, (r) => r);
    expect(result.env.A).toBe('1');
    expect(result.env.B).toBe('2');
    expect(result.patchLog).toHaveLength(2);
  });
});
