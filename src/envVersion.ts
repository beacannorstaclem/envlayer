/**
 * envVersion.ts
 * Track versioned snapshots of environment variable sets,
 * allowing rollback to previous states.
 */

export interface EnvVersion {
  version: number;
  timestamp: number;
  label?: string;
  env: Record<string, string>;
}

const versionHistory: EnvVersion[] = [];
let currentVersion = 0;

/** Save a new version of the environment. */
export function saveVersion(
  env: Record<string, string>,
  label?: string
): EnvVersion {
  const entry: EnvVersion = {
    version: ++currentVersion,
    timestamp: Date.now(),
    label,
    env: { ...env },
  };
  versionHistory.push(entry);
  return entry;
}

/** Get a version by version number. */
export function getVersion(version: number): EnvVersion | undefined {
  return versionHistory.find((v) => v.version === version);
}

/** Get the latest saved version. */
export function getLatestVersion(): EnvVersion | undefined {
  return versionHistory[versionHistory.length - 1];
}

/** List all saved versions (metadata only, no env payload). */
export function listVersions(): Omit<EnvVersion, "env">[] {
  return versionHistory.map(({ version, timestamp, label }) => ({
    version,
    timestamp,
    label,
  }));
}

/** Roll back to a specific version, returning that env snapshot. */
export function rollbackTo(version: number): Record<string, string> {
  const entry = getVersion(version);
  if (!entry) {
    throw new Error(`envVersion: version ${version} not found`);
  }
  return { ...entry.env };
}

/** Clear all version history and reset counter. */
export function clearVersionHistory(): void {
  versionHistory.length = 0;
  currentVersion = 0;
}

/** Diff two versions, returning added/removed/changed keys. */
export function diffVersions(
  fromVersion: number,
  toVersion: number
): { added: string[]; removed: string[]; changed: string[] } {
  const from = getVersion(fromVersion);
  const to = getVersion(toVersion);
  if (!from) throw new Error(`envVersion: version ${fromVersion} not found`);
  if (!to) throw new Error(`envVersion: version ${toVersion} not found`);

  const allKeys = new Set([...Object.keys(from.env), ...Object.keys(to.env)]);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  for (const key of allKeys) {
    const inFrom = key in from.env;
    const inTo = key in to.env;
    if (!inFrom) added.push(key);
    else if (!inTo) removed.push(key);
    else if (from.env[key] !== to.env[key]) changed.push(key);
  }

  return { added, removed, changed };
}
