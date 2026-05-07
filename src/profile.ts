/**
 * profile.ts — Named environment profile management.
 * Allows defining, switching, and merging named profiles (e.g. "development", "staging", "production").
 */

export interface EnvProfile {
  name: string;
  env: Record<string, string>;
  extends?: string;
}

const profileRegistry: Map<string, EnvProfile> = new Map();
let activeProfileName: string | null = null;

/** Register a named profile. */
export function defineProfile(profile: EnvProfile): void {
  profileRegistry.set(profile.name, profile);
}

/** Retrieve a registered profile by name. */
export function getProfile(name: string): EnvProfile | undefined {
  return profileRegistry.get(name);
}

/** List all registered profile names. */
export function listProfiles(): string[] {
  return Array.from(profileRegistry.keys());
}

/** Set the active profile by name. Throws if not found. */
export function activateProfile(name: string): void {
  if (!profileRegistry.has(name)) {
    throw new Error(`Profile "${name}" is not registered.`);
  }
  activeProfileName = name;
}

/** Get the currently active profile name. */
export function getActiveProfileName(): string | null {
  return activeProfileName;
}

/**
 * Resolve a profile's env, merging parent profiles via `extends` chain.
 * Child values override parent values.
 */
export function resolveProfile(name: string): Record<string, string> {
  const profile = profileRegistry.get(name);
  if (!profile) throw new Error(`Profile "${name}" is not registered.`);

  const base: Record<string, string> = profile.extends
    ? resolveProfile(profile.extends)
    : {};

  return { ...base, ...profile.env };
}

/** Get the resolved env for the currently active profile. */
export function getActiveProfileEnv(): Record<string, string> {
  if (!activeProfileName) throw new Error("No active profile set.");
  return resolveProfile(activeProfileName);
}

/** Remove a profile from the registry. */
export function removeProfile(name: string): boolean {
  if (activeProfileName === name) activeProfileName = null;
  return profileRegistry.delete(name);
}

/** Clear all profiles and reset active profile. */
export function clearProfiles(): void {
  profileRegistry.clear();
  activeProfileName = null;
}
