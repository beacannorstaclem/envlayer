import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { takeSnapshot, diffSnapshots } from './snapshot';

function writeTmp(name: string, content: string): string {
  const file = path.join(os.tmpdir(), name);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

describe('takeSnapshot', () => {
  it('returns raw and resolved env with timestamp', () => {
    const file = writeTmp('snap-basic.env', 'HOST=localhost\nPORT=8080\n');
    const snap = takeSnapshot({ files: [file] });
    expect(snap.raw['HOST']).toBe('localhost');
    expect(snap.resolved['PORT']).toBe('8080');
    expect(snap.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('applies overrides on top of file values', () => {
    const file = writeTmp('snap-override.env', 'ENV=dev\n');
    const snap = takeSnapshot({ files: [file], overrides: { ENV: 'prod' } });
    expect(snap.resolved['ENV']).toBe('prod');
  });

  it('interpolates references in values', () => {
    const file = writeTmp('snap-interp.env', 'BASE=http://localhost\nURL=${BASE}/api\n');
    const snap = takeSnapshot({ files: [file] });
    expect(snap.resolved['URL']).toBe('http://localhost/api');
  });

  it('throws when schema validation fails', () => {
    const file = writeTmp('snap-schema.env', 'PORT=abc\n');
    expect(() =>
      takeSnapshot({ files: [file], schema: { PORT: { type: 'number', required: true } } })
    ).toThrow();
  });

  it('applies transforms to resolved values', () => {
    const file = writeTmp('snap-transform.env', 'NAME=world\n');
    const snap = takeSnapshot({
      files: [file],
      transforms: { NAME: (v) => `hello_${v}` },
    });
    expect(snap.resolved['NAME']).toBe('hello_world');
  });

  it('timestamp is a recent unix millisecond value', () => {
    const before = Date.now();
    const file = writeTmp('snap-timestamp.env', 'KEY=value\n');
    const snap = takeSnapshot({ files: [file] });
    const after = Date.now();
    expect(snap.timestamp).toBeGreaterThanOrEqual(before);
    expect(snap.timestamp).toBeLessThanOrEqual(after);
  });
});

describe('diffSnapshots', () => {
  it('detects changed keys between two snapshots', () => {
    const fileA = writeTmp('diff-a.env', 'A=1\nB=2\n');
    const fileB = writeTmp('diff-b.env', 'A=1\nB=3\n');
    const snapA = takeSnapshot({ files: [fileA] });
    const snapB = takeSnapshot({ files: [fileB] });
    const diff = diffSnapshots(snapA, snapB);
    expect(diff['B']).toEqual({ before: '2', after: '3' });
    expect(diff['A']).toBeUndefined();
  });

  it('reports added keys', () => {
    const fileA = writeTmp('diff-add-a.env', 'X=1\n');
    const fileB = writeTmp('diff-add-b.env', 'X=1\nY=2\n');
    const diff = diffSnapshots(takeSnapshot({ files: [fileA] }), takeSnapshot({ files: [fileB] }));
    expect(diff['Y']).toEqual({ before: undefined, after: '2' });
  });

  it('reports removed keys', () => {
    const fileA = writeTmp('diff-rm-a.env', 'X=1\nZ=3\n');
    const fileB = writeTmp('diff-rm-b.env', 'X=1\n');
    const diff = diffSnapshots(takeSnapshot({ files: [fileA] }), takeSnapshot({ files: [fileB] }));
    expect(diff['Z']).toEqual({ before: '3', after: undefined });
  });

  it('returns empty object when snapshots are identical', () => {
    const file = writeTmp('diff-same.env', 'K=v\n');
    const snap = takeSnapshot({ files: [file] });
    expect(diffSnapshots(snap, snap)).toEqual({});
  });
});
