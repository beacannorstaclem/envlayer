/**
 * typecast.ts — Cast environment variable strings to typed values.
 */

export type CastTarget = 'string' | 'number' | 'boolean' | 'json' | 'array';

export interface TypecastSchema {
  [key: string]: CastTarget;
}

export type TypecastResult<T extends TypecastSchema> = {
  [K in keyof T]: T[K] extends 'number'
    ? number
    : T[K] extends 'boolean'
    ? boolean
    : T[K] extends 'json'
    ? unknown
    : T[K] extends 'array'
    ? string[]
    : string;
};

export function castValue(value: string, target: CastTarget): unknown {
  switch (target) {
    case 'number': {
      const n = Number(value);
      if (isNaN(n)) throw new TypeError(`Cannot cast "${value}" to number`);
      return n;
    }
    case 'boolean': {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
      throw new TypeError(`Cannot cast "${value}" to boolean`);
    }
    case 'json': {
      try {
        return JSON.parse(value);
      } catch {
        throw new TypeError(`Cannot cast "${value}" to JSON`);
      }
    }
    case 'array':
      return value.split(',').map((s) => s.trim());
    case 'string':
    default:
      return value;
  }
}

export function typecastEnv<T extends TypecastSchema>(
  env: Record<string, string>,
  schema: T
): TypecastResult<T> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(schema)) {
    if (!(key in env)) {
      throw new ReferenceError(`Missing env key: "${key}"`);
    }
    result[key] = castValue(env[key], schema[key]);
  }
  return result as TypecastResult<T>;
}

export function typecastPartial(
  env: Record<string, string>,
  schema: TypecastSchema
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(schema)) {
    if (key in env) {
      result[key] = castValue(env[key], schema[key]);
    }
  }
  return result;
}
