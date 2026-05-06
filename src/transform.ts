/**
 * transform.ts
 * Provides value transformation utilities for environment variable post-processing.
 */

export type TransformFn<T = unknown> = (value: unknown) => T;

export interface TransformMap {
  [key: string]: TransformFn;
}

/**
 * Applies a single transform function to a value.
 * Returns the original value if the transform throws.
 */
export function applyTransform<T>(value: unknown, fn: TransformFn<T>): T {
  try {
    return fn(value);
  } catch {
    throw new Error(`Transform failed for value "${value}": ${String(fn)}`);
  }
}

/**
 * Applies a map of transform functions to a record of values.
 * Keys not present in transformMap are passed through unchanged.
 */
export function applyTransforms(
  values: Record<string, unknown>,
  transformMap: TransformMap
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...values };
  for (const [key, fn] of Object.entries(transformMap)) {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      result[key] = applyTransform(values[key], fn);
    }
  }
  return result;
}

/**
 * Built-in transform helpers.
 */
export const transforms = {
  toInt: (value: unknown): number => {
    const n = parseInt(String(value), 10);
    if (isNaN(n)) throw new Error(`Cannot convert "${value}" to integer`);
    return n;
  },

  toFloat: (value: unknown): number => {
    const n = parseFloat(String(value));
    if (isNaN(n)) throw new Error(`Cannot convert "${value}" to float`);
    return n;
  },

  toBool: (value: unknown): boolean => {
    const s = String(value).toLowerCase().trim();
    if (s === 'true' || s === '1' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
    throw new Error(`Cannot convert "${value}" to boolean`);
  },

  toList: (separator = ','): TransformFn<string[]> =>
    (value: unknown): string[] =>
      String(value)
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean),

  toUpperCase: (value: unknown): string => String(value).toUpperCase(),

  toLowerCase: (value: unknown): string => String(value).toLowerCase(),
};
