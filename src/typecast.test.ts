import { describe, it, expect } from 'vitest';
import {
  castValue,
  typecastEnv,
  typecastPartial,
  TypecastSchema,
} from './typecast';
import { applyTypecastMiddleware } from './typecastMiddleware';

describe('castValue', () => {
  it('casts to number', () => {
    expect(castValue('42', 'number')).toBe(42);
    expect(castValue('3.14', 'number')).toBe(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => castValue('abc', 'number')).toThrow(TypeError);
  });

  it('casts to boolean truthy values', () => {
    expect(castValue('true', 'boolean')).toBe(true);
    expect(castValue('1', 'boolean')).toBe(true);
    expect(castValue('yes', 'boolean')).toBe(true);
  });

  it('casts to boolean falsy values', () => {
    expect(castValue('false', 'boolean')).toBe(false);
    expect(castValue('0', 'boolean')).toBe(false);
    expect(castValue('no', 'boolean')).toBe(false);
  });

  it('throws on invalid boolean', () => {
    expect(() => castValue('maybe', 'boolean')).toThrow(TypeError);
  });

  it('casts to json', () => {
    expect(castValue('{"a":1}', 'json')).toEqual({ a: 1 });
    expect(castValue('[1,2,3]', 'json')).toEqual([1, 2, 3]);
  });

  it('throws on invalid json', () => {
    expect(() => castValue('{bad}', 'json')).toThrow(TypeError);
  });

  it('casts to array', () => {
    expect(castValue('a,b,c', 'array')).toEqual(['a', 'b', 'c']);
    expect(castValue('x , y', 'array')).toEqual(['x', 'y']);
  });

  it('returns string as-is', () => {
    expect(castValue('hello', 'string')).toBe('hello');
  });
});

describe('typecastEnv', () => {
  const schema: TypecastSchema = {
    PORT: 'number',
    DEBUG: 'boolean',
    TAGS: 'array',
    NAME: 'string',
  };

  const env = { PORT: '8080', DEBUG: 'true', TAGS: 'a,b', NAME: 'app' };

  it('casts all keys according to schema', () => {
    const result = typecastEnv(env, schema);
    expect(result.PORT).toBe(8080);
    expect(result.DEBUG).toBe(true);
    expect(result.TAGS).toEqual(['a', 'b']);
    expect(result.NAME).toBe('app');
  });

  it('throws if a key is missing', () => {
    expect(() => typecastEnv({}, schema)).toThrow(ReferenceError);
  });
});

describe('typecastPartial', () => {
  it('skips missing keys', () => {
    const result = typecastPartial({ PORT: '3000' }, { PORT: 'number', DEBUG: 'boolean' });
    expect(result.PORT).toBe(3000);
    expect('DEBUG' in result).toBe(false);
  });
});

describe('applyTypecastMiddleware', () => {
  it('merges casted values into result', () => {
    const env = { PORT: '9000', HOST: 'localhost' };
    const result = applyTypecastMiddleware(env, { PORT: 'number' });
    expect(result.PORT).toBe(9000);
    expect(result.HOST).toBe('localhost');
  });

  it('throws in strict mode when key is missing', () => {
    expect(() =>
      applyTypecastMiddleware({}, { PORT: 'number' }, true)
    ).toThrow(ReferenceError);
  });
});
