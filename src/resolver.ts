export type EnvSource = Record<string, string | undefined>;

export interface ResolverOptions {
  /**
   * Ordered list of environment sources (highest priority first).
   * Defaults to [process.env].
   */
  sources?: EnvSource[];
  /**
   * Optional prefix to strip from keys when reading sources.
   */
  prefix?: string;
}

/**
 * Resolves an environment variable key across layered sources.
 * Returns the first defined value found, or undefined if absent in all layers.
 */
export function resolveKey(
  key: string,
  sources: EnvSource[],
  prefix?: string
): string | undefined {
  const lookupKey = prefix ? `${prefix}${key}` : key;
  for (const source of sources) {
    const value = source[lookupKey];
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

/**
 * Builds a flat record by resolving each key across all provided sources.
 */
export function resolveAll(
  keys: string[],
  options: ResolverOptions = {}
): Record<string, string | undefined> {
  const sources = options.sources ?? [process.env as EnvSource];
  const result: Record<string, string | undefined> = {};
  for (const key of keys) {
    result[key] = resolveKey(key, sources, options.prefix);
  }
  return result;
}
