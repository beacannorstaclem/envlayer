import { describe, it, expect } from 'vitest';
import { resolveKey, resolveAll } from './resolver';

describe('resolveKey', () => {
  it('returns the value from the first source that defines the key', () => {
    const sources = [
      { PORT: '3000' },
      { PORT: '8080', HOST: 'localhost' },
    ];
    expect(resolveKey('PORT', sources)).toBe('3000');
  });

  it('falls through to later sources when key is absent in earlier ones', () => {
    const sources = [
      { PORT: '3000' },
      { HOST: 'localhost' },
    ];
    expect(resolveKey('HOST', sources)).toBe('localhost');
  });

  it('returns undefined when key is absent in all sources', () => {
    const sources = [{ PORT: '3000' }];
    expect(resolveKey('MISSING', sources)).toBeUndefined();
  });

  it('strips prefix before looking up the key', () => {
    const sources = [{ APP_PORT: '4000' }];
    expect(resolveKey('PORT', sources, 'APP_')).toBe('4000');
  });

  it('returns undefined when prefixed key is not found', () => {
    const sources = [{ PORT: '4000' }];
    expect(resolveKey('PORT', sources, 'APP_')).toBeUndefined();
  });
});

describe('resolveAll', () => {
  it('resolves multiple keys across layered sources', () => {
    const sources = [
      { PORT: '3000' },
      { HOST: 'localhost', PORT: '8080' },
    ];
    const result = resolveAll(['PORT', 'HOST', 'MISSING'], { sources });
    expect(result).toEqual({ PORT: '3000', HOST: 'localhost', MISSING: undefined });
  });

  it('uses process.env as the default source', () => {
    process.env['__TEST_KEY__'] = 'hello';
    const result = resolveAll(['__TEST_KEY__']);
    expect(result['__TEST_KEY__']).toBe('hello');
    delete process.env['__TEST_KEY__'];
  });

  it('applies prefix to all keys', () => {
    const sources = [{ NS_FOO: 'bar', NS_BAZ: 'qux' }];
    const result = resolveAll(['FOO', 'BAZ'], { sources, prefix: 'NS_' });
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
