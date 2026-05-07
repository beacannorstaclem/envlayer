import { describe, it, expect } from 'vitest';
import {
  extractNamespace,
  addNamespace,
  removeNamespace,
  listNamespaces,
  mergeNamespace,
} from './namespace';

const env = {
  APP_HOST: 'localhost',
  APP_PORT: '3000',
  DB_HOST: 'db.local',
  DB_PORT: '5432',
  SECRET: 'abc',
};

describe('extractNamespace', () => {
  it('extracts and strips matching prefix', () => {
    expect(extractNamespace(env, 'APP_')).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('returns empty object when no match', () => {
    expect(extractNamespace(env, 'MISSING_')).toEqual({});
  });

  it('is case-insensitive for prefix matching', () => {
    expect(extractNamespace(env, 'app_')).toEqual({ HOST: 'localhost', PORT: '3000' });
  });
});

describe('addNamespace', () => {
  it('adds prefix to all keys', () => {
    expect(addNamespace({ HOST: 'localhost' }, 'APP_')).toEqual({ APP_HOST: 'localhost' });
  });

  it('returns empty object for empty input', () => {
    expect(addNamespace({}, 'APP_')).toEqual({});
  });
});

describe('removeNamespace', () => {
  it('removes keys with the given prefix', () => {
    const result = removeNamespace(env, 'APP_');
    expect(result).not.toHaveProperty('APP_HOST');
    expect(result).toHaveProperty('DB_HOST');
    expect(result).toHaveProperty('SECRET');
  });
});

describe('listNamespaces', () => {
  it('lists unique prefixes up to first underscore', () => {
    const ns = listNamespaces(env);
    expect(ns).toContain('APP_');
    expect(ns).toContain('DB_');
    expect(ns).not.toContain('SECRET');
  });

  it('returns sorted list', () => {
    const ns = listNamespaces(env);
    expect(ns).toEqual([...ns].sort());
  });
});

describe('mergeNamespace', () => {
  it('merges namespaced keys into base with prefix', () => {
    const result = mergeNamespace({ EXISTING: 'yes' }, { HOST: 'new' }, 'APP_');
    expect(result).toEqual({ EXISTING: 'yes', APP_HOST: 'new' });
  });

  it('overrides by default', () => {
    const result = mergeNamespace({ APP_HOST: 'old' }, { HOST: 'new' }, 'APP_');
    expect(result.APP_HOST).toBe('new');
  });

  it('does not override when override=false', () => {
    const result = mergeNamespace({ APP_HOST: 'old' }, { HOST: 'new' }, 'APP_', false);
    expect(result.APP_HOST).toBe('old');
  });
});
