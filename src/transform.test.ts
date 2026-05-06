import { describe, it, expect } from 'vitest';
import {
  applyTransform,
  applyTransforms,
  transforms,
} from './transform';

describe('applyTransform', () => {
  it('applies a transform function to a value', () => {
    expect(applyTransform('42', transforms.toInt)).toBe(42);
  });

  it('throws a descriptive error when transform fails', () => {
    expect(() => applyTransform('abc', transforms.toInt)).toThrow('Transform failed');
  });
});

describe('applyTransforms', () => {
  it('applies transforms to matching keys', () => {
    const result = applyTransforms(
      { PORT: '3000', DEBUG: 'true', NAME: 'app' },
      { PORT: transforms.toInt, DEBUG: transforms.toBool }
    );
    expect(result).toEqual({ PORT: 3000, DEBUG: true, NAME: 'app' });
  });

  it('leaves keys not in transformMap unchanged', () => {
    const result = applyTransforms({ FOO: 'bar' }, {});
    expect(result).toEqual({ FOO: 'bar' });
  });

  it('ignores transform keys not present in values', () => {
    const result = applyTransforms(
      { A: '1' },
      { B: transforms.toInt }
    );
    expect(result).toEqual({ A: '1' });
  });
});

describe('transforms.toInt', () => {
  it('converts string to integer', () => {
    expect(transforms.toInt('10')).toBe(10);
  });
  it('throws on non-numeric string', () => {
    expect(() => transforms.toInt('nope')).toThrow();
  });
});

describe('transforms.toFloat', () => {
  it('converts string to float', () => {
    expect(transforms.toFloat('3.14')).toBeCloseTo(3.14);
  });
});

describe('transforms.toBool', () => {
  it.each([['true', true], ['1', true], ['yes', true], ['false', false], ['0', false], ['no', false]])(
    'converts "%s" to %s',
    (input, expected) => {
      expect(transforms.toBool(input)).toBe(expected);
    }
  );
  it('throws on unknown value', () => {
    expect(() => transforms.toBool('maybe')).toThrow();
  });
});

describe('transforms.toList', () => {
  it('splits a comma-separated string', () => {
    expect(transforms.toList()('a,b,c')).toEqual(['a', 'b', 'c']);
  });
  it('uses a custom separator', () => {
    expect(transforms.toList('|')('x|y|z')).toEqual(['x', 'y', 'z']);
  });
  it('trims whitespace and filters empty entries', () => {
    expect(transforms.toList()('a, b , , c')).toEqual(['a', 'b', 'c']);
  });
});

describe('transforms.toUpperCase / toLowerCase', () => {
  it('converts to upper case', () => {
    expect(transforms.toUpperCase('hello')).toBe('HELLO');
  });
  it('converts to lower case', () => {
    expect(transforms.toLowerCase('WORLD')).toBe('world');
  });
});
