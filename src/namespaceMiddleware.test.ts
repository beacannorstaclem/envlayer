import { describe, it, expect } from 'vitest';
import {
  createNamespaceMiddleware,
  createRenamespacingMiddleware,
  EnvRequest,
} from './namespaceMiddleware';

function makeReq(env: Record<string, string>): EnvRequest {
  return { env };
}

describe('createNamespaceMiddleware', () => {
  const env = {
    APP_HOST: 'localhost',
    APP_PORT: '3000',
    DB_HOST: 'db.local',
    GLOBAL_KEY: 'global',
  };

  it('extracts keys with the given prefix and strips it', () => {
    const mw = createNamespaceMiddleware({ prefix: 'APP_' });
    const req = makeReq(env);
    mw(req, () => {});
    expect(req.resolved).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('returns empty object if no keys match the prefix', () => {
    const mw = createNamespaceMiddleware({ prefix: 'MISSING_' });
    const req = makeReq(env);
    mw(req, () => {});
    expect(req.resolved).toEqual({});
  });

  it('includes global keys when includeGlobal is true', () => {
    const mw = createNamespaceMiddleware({ prefix: 'APP_', includeGlobal: true });
    const req = makeReq(env);
    mw(req, () => {});
    expect(req.resolved).toMatchObject({
      HOST: 'localhost',
      PORT: '3000',
      DB_HOST: 'db.local',
      GLOBAL_KEY: 'global',
    });
  });

  it('calls next', () => {
    const mw = createNamespaceMiddleware({ prefix: 'APP_' });
    const req = makeReq(env);
    let called = false;
    mw(req, () => { called = true; });
    expect(called).toBe(true);
  });
});

describe('createRenamespacingMiddleware', () => {
  it('adds prefix to all resolved keys', () => {
    const mw = createRenamespacingMiddleware('APP_');
    const req: EnvRequest = { env: {}, resolved: { HOST: 'localhost', PORT: '3000' } };
    mw(req, () => {});
    expect(req.resolved).toEqual({ APP_HOST: 'localhost', APP_PORT: '3000' });
  });

  it('does nothing if resolved is not set', () => {
    const mw = createRenamespacingMiddleware('APP_');
    const req: EnvRequest = { env: {} };
    mw(req, () => {});
    expect(req.resolved).toBeUndefined();
  });
});
