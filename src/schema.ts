export type SchemaFieldType = 'string' | 'number' | 'boolean';

export interface SchemaField {
  type: SchemaFieldType;
  required?: boolean;
  default?: string | number | boolean;
}

export type Schema = Record<string, SchemaField>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  values: Record<string, string | number | boolean>;
}

export function coerce(
  value: string,
  type: SchemaFieldType
): string | number | boolean {
  if (type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Cannot coerce "${value}" to number`);
    }
    return num;
  }
  if (type === 'boolean') {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    throw new Error(`Cannot coerce "${value}" to boolean`);
  }
  return value;
}

export function validateSchema(
  schema: Schema,
  resolved: Record<string, string | undefined>
): ValidationResult {
  const errors: string[] = [];
  const values: Record<string, string | number | boolean> = {};

  for (const [key, field] of Object.entries(schema)) {
    const raw = resolved[key];

    if (raw === undefined || raw === '') {
      if (field.default !== undefined) {
        values[key] = field.default;
      } else if (field.required !== false) {
        errors.push(`Missing required env var: ${key}`);
      }
      continue;
    }

    try {
      values[key] = coerce(raw, field.type);
    } catch (err) {
      errors.push(`Invalid value for ${key}: ${(err as Error).message}`);
    }
  }

  return { valid: errors.length === 0, errors, values };
}
