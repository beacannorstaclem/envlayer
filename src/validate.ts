/**
 * validate.ts — Runtime validation of resolved env records against a set of rules.
 */

export type ValidatorFn = (value: string) => boolean | string;

export interface FieldRule {
  required?: boolean;
  validator?: ValidatorFn;
  pattern?: RegExp;
  oneOf?: string[];
}

export type ValidationSchema = Record<string, FieldRule>;

export interface ValidationError {
  key: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateEnv(
  env: Record<string, string | undefined>,
  schema: ValidationSchema
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [key, rule] of Object.entries(schema)) {
    const value = env[key];

    if (rule.required && (value === undefined || value === "")) {
      errors.push({ key, message: `"${key}" is required but missing or empty` });
      continue;
    }

    if (value === undefined || value === "") continue;

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({ key, message: `"${key}" does not match pattern ${rule.pattern}` });
    }

    if (rule.oneOf && !rule.oneOf.includes(value)) {
      errors.push({ key, message: `"${key}" must be one of [${rule.oneOf.join(", ")}], got "${value}"` });
    }

    if (rule.validator) {
      const result = rule.validator(value);
      if (result !== true) {
        const msg = typeof result === "string" ? result : `"${key}" failed custom validation`;
        errors.push({ key, message: msg });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertEnv(
  env: Record<string, string | undefined>,
  schema: ValidationSchema
): void {
  const result = validateEnv(env, schema);
  if (!result.valid) {
    const messages = result.errors.map((e) => `  - ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${messages}`);
  }
}
