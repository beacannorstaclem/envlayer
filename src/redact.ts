/**
 * redact.ts — Redact sensitive keys from env objects before logging or export.
 */

export type RedactOptions = {
  placeholder?: string;
  keys?: string[];
  patterns?: RegExp[];
};

const DEFAULT_PLACEHOLDER = "[REDACTED]";

const DEFAULT_PATTERNS: RegExp[] = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
];

export function shouldRedact(
  key: string,
  keys: string[] = [],
  patterns: RegExp[] = DEFAULT_PATTERNS
): boolean {
  if (keys.map((k) => k.toLowerCase()).includes(key.toLowerCase())) return true;
  return patterns.some((re) => re.test(key));
}

export function redactValue(
  key: string,
  value: string,
  options: RedactOptions = {}
): string {
  const { placeholder = DEFAULT_PLACEHOLDER, keys = [], patterns } = options;
  return shouldRedact(key, keys, patterns ?? DEFAULT_PATTERNS) ? placeholder : value;
}

export function redactEnv(
  env: Record<string, string>,
  options: RedactOptions = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = redactValue(key, value, options);
  }
  return result;
}

export function redactKeys(
  env: Record<string, string>,
  keys: string[],
  placeholder = DEFAULT_PLACEHOLDER
): Record<string, string> {
  return redactEnv(env, { keys, patterns: [], placeholder });
}
