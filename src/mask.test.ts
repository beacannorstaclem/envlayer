import { describe, it, expect } from 'vitest';
import { maskValue, maskEnv, maskKeys } from './mask';

describe('maskValue', () => {
  it('masks the entire value by default', () => {
    expect(maskValue('supersecret')).toBe('***********');
  });

  it('uses custom mask character', () => {
    expect(maskValue('abc', '#')).toBe('###');
  });

  it('leaves visible suffix characters exposed', () => {
    expect(maskValue('supersecret', '*', 4)).toBe('*******cret');
  });

  it('masks entire value when visibleSuffix >= length', () => {
    expect(maskValue('abc', '*', 5)).toBe('***');
  });

  it('returns empty string unchanged', () => {
    expect(maskValue('')).toBe('');
  });
});

describe('maskEnv', () => {
  const env = {
    DB_HOST: 'localhost',
    DB_PASSWORD: 'hunter2',
    API_TOKEN: 'tok_abc123',
    APP_NAME: 'myapp',
    SECRET_KEY: 'xyzzy',
  };

  it('masks keys matching default sensitive pattern', () => {
    const result = maskEnv(env);
    expect(result.DB_HOST).toBe('localhost');
    expect(result.APP_NAME).toBe('myapp');
    expect(result.DB_PASSWORD).toBe('*******');
    expect(result.API_TOKEN).toBe('**********');
    expect(result.SECRET_KEY).toBe('*****');
  });

  it('masks keys matching custom regex', () => {
    const result = maskEnv(env, { sensitiveKeys: /host/i });
    expect(result.DB_HOST).toBe('*********');
    expect(result.DB_PASSWORD).toBe('hunter2');
  });

  it('masks keys from explicit string array', () => {
    const result = maskEnv(env, { sensitiveKeys: ['APP_NAME', 'DB_HOST'] });
    expect(result.APP_NAME).toBe('*****');
    expect(result.DB_HOST).toBe('*********');
    expect(result.DB_PASSWORD).toBe('hunter2');
  });

  it('respects visibleSuffix option', () => {
    const result = maskEnv(env, { visibleSuffix: 3 });
    expect(result.DB_PASSWORD).toBe('****er2');
    expect(result.API_TOKEN).toBe('*******123');
  });
});

describe('maskKeys', () => {
  it('masks only specified keys', () => {
    const env = { FOO: 'bar', BAZ: 'qux', HELLO: 'world' };
    const result = maskKeys(env, ['FOO', 'HELLO']);
    expect(result.FOO).toBe('***');
    expect(result.HELLO).toBe('*****');
    expect(result.BAZ).toBe('qux');
  });

  it('is case-insensitive for key matching', () => {
    const env = { MY_SECRET: 'value' };
    const result = maskKeys(env, ['my_secret']);
    expect(result.MY_SECRET).toBe('*****');
  });
});
