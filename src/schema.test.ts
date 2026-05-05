import { coerce, validateSchema, Schema } from './schema';

describe('coerce', () => {
  it('returns string as-is for type string', () => {
    expect(coerce('hello', 'string')).toBe('hello');
  });

  it('coerces valid number strings', () => {
    expect(coerce('42', 'number')).toBe(42);
    expect(coerce('3.14', 'number')).toBe(3.14);
  });

  it('throws on invalid number', () => {
    expect(() => coerce('abc', 'number')).toThrow('Cannot coerce "abc" to number');
  });

  it('coerces boolean true values', () => {
    expect(coerce('true', 'boolean')).toBe(true);
    expect(coerce('1', 'boolean')).toBe(true);
  });

  it('coerces boolean false values', () => {
    expect(coerce('false', 'boolean')).toBe(false);
    expect(coerce('0', 'boolean')).toBe(false);
  });

  it('throws on invalid boolean', () => {
    expect(() => coerce('yes', 'boolean')).toThrow('Cannot coerce "yes" to boolean');
  });
});

describe('validateSchema', () => {
  const schema: Schema = {
    PORT: { type: 'number', required: true },
    DEBUG: { type: 'boolean', default: false },
    APP_NAME: { type: 'string', required: true },
  };

  it('returns valid result when all required vars are present', () => {
    const result = validateSchema(schema, {
      PORT: '3000',
      DEBUG: 'true',
      APP_NAME: 'myapp',
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.values).toEqual({ PORT: 3000, DEBUG: true, APP_NAME: 'myapp' });
  });

  it('uses default when value is missing', () => {
    const result = validateSchema(schema, { PORT: '8080', APP_NAME: 'test' });
    expect(result.valid).toBe(true);
    expect(result.values.DEBUG).toBe(false);
  });

  it('reports error for missing required field', () => {
    const result = validateSchema(schema, { PORT: '8080' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required env var: APP_NAME');
  });

  it('reports error for invalid type coercion', () => {
    const result = validateSchema(schema, { PORT: 'not-a-number', APP_NAME: 'app' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid value for PORT/);
  });
});
