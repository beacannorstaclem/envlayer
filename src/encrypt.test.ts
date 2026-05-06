import { describe, it, expect } from 'vitest';
import {
  encryptValue,
  decryptValue,
  encryptEnv,
  decryptEnv,
} from './encrypt';

const PASS = 'super-secret-passphrase';

describe('encryptValue / decryptValue', () => {
  it('round-trips a simple string', () => {
    const original = 'hello-world';
    const enc = encryptValue(original, PASS);
    expect(enc).not.toBe(original);
    expect(decryptValue(enc, PASS)).toBe(original);
  });

  it('produces different ciphertexts for the same input (random IV)', () => {
    const a = encryptValue('same', PASS);
    const b = encryptValue('same', PASS);
    expect(a).not.toBe(b);
  });

  it('round-trips a value with special characters', () => {
    const original = 'p@$$w0rd!#%&*()=';
    expect(decryptValue(encryptValue(original, PASS), PASS)).toBe(original);
  });

  it('throws on invalid encrypted format', () => {
    expect(() => decryptValue('notvalid', PASS)).toThrow(
      'Invalid encrypted value format'
    );
  });

  it('throws when passphrase is wrong', () => {
    const enc = encryptValue('secret', PASS);
    expect(() => decryptValue(enc, 'wrong-passphrase')).toThrow();
  });
});

describe('encryptEnv / decryptEnv', () => {
  const env = { DB_PASS: 'hunter2', API_KEY: 'abc123', PORT: '3000' };

  it('encrypts all values by default', () => {
    const encrypted = encryptEnv(env, PASS);
    expect(encrypted.DB_PASS).not.toBe(env.DB_PASS);
    expect(encrypted.API_KEY).not.toBe(env.API_KEY);
    expect(encrypted.PORT).not.toBe(env.PORT);
  });

  it('encrypts only specified keys', () => {
    const encrypted = encryptEnv(env, PASS, ['DB_PASS']);
    expect(encrypted.DB_PASS).not.toBe(env.DB_PASS);
    expect(encrypted.API_KEY).toBe(env.API_KEY);
    expect(encrypted.PORT).toBe(env.PORT);
  });

  it('full round-trip for all keys', () => {
    const encrypted = encryptEnv(env, PASS);
    const decrypted = decryptEnv(encrypted, PASS);
    expect(decrypted).toEqual(env);
  });

  it('full round-trip for selected keys', () => {
    const keys = ['DB_PASS', 'API_KEY'];
    const encrypted = encryptEnv(env, PASS, keys);
    const decrypted = decryptEnv(encrypted, PASS, keys);
    expect(decrypted).toEqual(env);
  });

  it('does not mutate the original env object', () => {
    const original = { ...env };
    encryptEnv(env, PASS);
    expect(env).toEqual(original);
  });
});
