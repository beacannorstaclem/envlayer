import {
  composeEnvMerge,
  composeEnvOverride,
  composeEnvFallback,
  composeEnvIntersect,
  composeEnv,
} from './envCompose';

const A = { HOST: 'localhost', PORT: '3000', DEBUG: 'false' };
const B = { HOST: 'remotehost', PORT: '8080', TIMEOUT: '30' };
const C = { HOST: 'cdn.host', REGION: 'us-east-1' };

describe('composeEnvMerge', () => {
  it('merges maps left-to-right, last value wins', () => {
    const result = composeEnvMerge([A, B]);
    expect(result.HOST).toBe('remotehost');
    expect(result.PORT).toBe('8080');
    expect(result.DEBUG).toBe('false');
    expect(result.TIMEOUT).toBe('30');
  });

  it('returns empty object for empty input', () => {
    expect(composeEnvMerge([])).toEqual({});
  });
});

describe('composeEnvOverride', () => {
  it('only overrides keys present in base', () => {
    const result = composeEnvOverride(A, B);
    expect(result.HOST).toBe('remotehost');
    expect(result.PORT).toBe('8080');
    expect(result.DEBUG).toBe('false');
    expect(result.TIMEOUT).toBeUndefined();
  });

  it('applies multiple overrides in order', () => {
    const result = composeEnvOverride(A, B, { HOST: 'final.host' });
    expect(result.HOST).toBe('final.host');
  });
});

describe('composeEnvFallback', () => {
  it('uses first map values and fills missing keys from subsequent maps', () => {
    const result = composeEnvFallback(A, B);
    expect(result.HOST).toBe('localhost');
    expect(result.PORT).toBe('3000');
    expect(result.TIMEOUT).toBe('30');
  });

  it('works with three maps', () => {
    const result = composeEnvFallback(A, B, C);
    expect(result.HOST).toBe('localhost');
    expect(result.REGION).toBe('us-east-1');
  });
});

describe('composeEnvIntersect', () => {
  it('keeps only keys present in all maps', () => {
    const result = composeEnvIntersect(A, B);
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['HOST', 'PORT']));
    expect(result.DEBUG).toBeUndefined();
    expect(result.TIMEOUT).toBeUndefined();
  });

  it('last map value wins for common keys', () => {
    const result = composeEnvIntersect(A, B);
    expect(result.HOST).toBe('remotehost');
  });

  it('returns empty object for empty input', () => {
    expect(composeEnvIntersect()).toEqual({});
  });
});

describe('composeEnv', () => {
  it('defaults to merge strategy', () => {
    const result = composeEnv([A, B]);
    expect(result.HOST).toBe('remotehost');
    expect(result.TIMEOUT).toBe('30');
  });

  it('applies prefix to all keys', () => {
    const result = composeEnv([A], { prefix: 'APP_' });
    expect(result['APP_HOST']).toBe('localhost');
    expect(result['HOST']).toBeUndefined();
  });

  it('respects override strategy', () => {
    const result = composeEnv([A, B], { strategy: 'override' });
    expect(result.TIMEOUT).toBeUndefined();
  });

  it('respects fallback strategy', () => {
    const result = composeEnv([A, B], { strategy: 'fallback' });
    expect(result.HOST).toBe('localhost');
    expect(result.TIMEOUT).toBe('30');
  });

  it('respects intersect strategy', () => {
    const result = composeEnv([A, B], { strategy: 'intersect' });
    expect(result.DEBUG).toBeUndefined();
    expect(result.HOST).toBe('remotehost');
  });
});
