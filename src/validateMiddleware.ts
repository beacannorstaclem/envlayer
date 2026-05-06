/**
 * validateMiddleware.ts — Integrates env validation into the layer resolution pipeline.
 */

import { validateEnv, assertEnv, ValidationSchema, ValidationResult } from "./validate";

export interface ValidatedEnv<T extends Record<string, string | undefined> = Record<string, string | undefined>> {
  env: T;
  validation: ValidationResult;
}

/**
 * Wraps a resolved env record with validation results without throwing.
 */
export function withValidation<T extends Record<string, string | undefined>>(
  env: T,
  schema: ValidationSchema
): ValidatedEnv<T> {
  const validation = validateEnv(env, schema);
  return { env, validation };
}

/**
 * Wraps a resolved env record and throws if validation fails.
 */
export function withStrictValidation<T extends Record<string, string | undefined>>(
  env: T,
  schema: ValidationSchema
): T {
  assertEnv(env, schema);
  return env;
}

/**
 * Filters an env record to only keys defined in the schema.
 */
export function pickSchemaKeys(
  env: Record<string, string | undefined>,
  schema: ValidationSchema
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  for (const key of Object.keys(schema)) {
    if (key in env) result[key] = env[key];
  }
  return result;
}

/**
 * Returns only the keys that failed validation.
 */
export function getInvalidKeys(
  env: Record<string, string | undefined>,
  schema: ValidationSchema
): string[] {
  const result = validateEnv(env, schema);
  return result.errors.map((e) => e.key);
}
