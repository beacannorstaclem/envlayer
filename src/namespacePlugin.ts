/**
 * namespacePlugin.ts
 * High-level plugin that wires namespace utilities into an envlayer pipeline.
 */

import { extractNamespace, addNamespace, listNamespaces, EnvRecord } from './namespace';

export interface NamespacePlugin {
  /** Resolved env scoped to this namespace (prefix stripped) */
  env: EnvRecord;
  /** Re-attach prefix to a key set */
  reattach: (env: EnvRecord) => EnvRecord;
  /** All namespace prefixes found in the source */
  siblings: string[];
}

/**
 * Create a namespace plugin bound to a specific prefix.
 *
 * @param source - The full env record (e.g. process.env cast to EnvRecord)
 * @param prefix - The namespace prefix, e.g. "APP_"
 */
export function createNamespacePlugin(
  source: EnvRecord,
  prefix: string
): NamespacePlugin {
  const env = extractNamespace(source, prefix);
  const siblings = listNamespaces(source);

  return {
    env,
    reattach: (partial: EnvRecord) => addNamespace(partial, prefix),
    siblings,
  };
}

/**
 * Split a full env record into a map of namespace => stripped EnvRecord.
 * Only namespaces with at least one key are included.
 */
export function splitByNamespace(
  source: EnvRecord
): Map<string, EnvRecord> {
  const prefixes = listNamespaces(source);
  const map = new Map<string, EnvRecord>();
  for (const prefix of prefixes) {
    const extracted = extractNamespace(source, prefix);
    if (Object.keys(extracted).length > 0) {
      map.set(prefix, extracted);
    }
  }
  return map;
}

/**
 * Flatten a namespace map back into a single env record.
 */
export function flattenNamespaceMap(
  map: Map<string, EnvRecord>
): EnvRecord {
  const result: EnvRecord = {};
  for (const [prefix, env] of map.entries()) {
    Object.assign(result, addNamespace(env, prefix));
  }
  return result;
}
