/**
 * mask.ts — Utilities for masking sensitive environment variable values
 * before logging, serializing, or exposing to untrusted contexts.
 */

export type MaskOptions = {
  /** Keys whose values should be fully masked. Default: common secret patterns. */
  sensitiveKeys?: RegExp | string[];
  /** Character used for masking. Default: '*' */
  maskChar?: string;
  /** Number of visible trailing characters. Default: 0 */
  visibleSuffix?: number;
};

const DEFAULT_SENSITIVE: RegExp = /password|secret|token|key|auth|credential|private/i;

function isSensitive(key: string, sensitiveKeys: RegExp | string[]): boolean {
  if (Array.isArray(sensitiveKeys)) {
    return sensitiveKeys.map((k) => k.toLowerCase()).includes(key.toLowerCase());
  }
  return sensitiveKeys.test(key);
}

export function maskValue(
  value: string,
  maskChar = '*',
  visibleSuffix = 0
): string {
  if (value.length === 0) return value;
  if (visibleSuffix <= 0 || visibleSuffix >= value.length) {
    return maskChar.repeat(value.length);
  }
  const suffix = value.slice(-visibleSuffix);
  return maskChar.repeat(value.length - visibleSuffix) + suffix;
}

export function maskEnv(
  env: Record<string, string>,
  options: MaskOptions = {}
): Record<string, string> {
  const {
    sensitiveKeys = DEFAULT_SENSITIVE,
    maskChar = '*',
    visibleSuffix = 0,
  } = options;

  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      isSensitive(key, sensitiveKeys)
        ? maskValue(value, maskChar, visibleSuffix)
        : value,
    ])
  );
}

export function maskKeys(
  env: Record<string, string>,
  keys: string[],
  options: Pick<MaskOptions, 'maskChar' | 'visibleSuffix'> = {}
): Record<string, string> {
  return maskEnv(env, { ...options, sensitiveKeys: keys });
}
