import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFiles } from './watch';

function writeTmp(name: string, content: string): string {
  const file = path.join(os.tmpdir(), name);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('watchEnvFiles', () => {
  it('calls callback with initial env on start', (done) => {
    const file = writeTmp('watch-init.env', 'APP=hello\nPORT=3000\n');
    const handle = watchEnvFiles({ files: [file] }, (env, err) => {
      expect(err).toBeUndefined();
      expect(env['APP']).toBe('hello');
      expect(env['PORT']).toBe('3000');
      handle.stop();
      done();
    });
  });

  it('re-invokes callback when file changes', async () => {
    const file = writeTmp('watch-change.env', 'VAL=first\n');
    const calls: Record<string, string>[] = [];

    const handle = watchEnvFiles(
      { files: [file], debounceMs: 50 },
      (env) => { calls.push({ ...env }); }
    );

    await sleep(100);
    fs.writeFileSync(file, 'VAL=second\n', 'utf8');
    await sleep(200);

    handle.stop();
    expect(calls.length).toBeGreaterThanOrEqual(2);
    expect(calls[calls.length - 1]['VAL']).toBe('second');
  });

  it('passes error to callback when file is invalid', (done) => {
    const file = writeTmp('watch-schema.env', 'PORT=notanumber\n');
    const schema = { PORT: { type: 'number', required: true } };
    const handle = watchEnvFiles({ files: [file], schema }, (env, err) => {
      expect(err).toBeInstanceOf(Error);
      handle.stop();
      done();
    });
  });

  it('stop() prevents further callbacks after file change', async () => {
    const file = writeTmp('watch-stop.env', 'X=1\n');
    let callCount = 0;
    const handle = watchEnvFiles(
      { files: [file], debounceMs: 50 },
      () => { callCount++; }
    );
    await sleep(80);
    handle.stop();
    fs.writeFileSync(file, 'X=2\n', 'utf8');
    await sleep(200);
    expect(callCount).toBe(1);
  });
});
