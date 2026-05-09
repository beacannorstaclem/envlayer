/**
 * envTag: Tag environment variables with metadata labels for categorization and filtering.
 */

export type TagMap = Record<string, string[]>;

const tagStore: TagMap = {};

/** Assign one or more tags to a key */
export function tagKey(key: string, ...tags: string[]): void {
  if (!tagStore[key]) tagStore[key] = [];
  for (const tag of tags) {
    if (!tagStore[key].includes(tag)) {
      tagStore[key].push(tag);
    }
  }
}

/** Remove one or more tags from a key */
export function untagKey(key: string, ...tags: string[]): void {
  if (!tagStore[key]) return;
  tagStore[key] = tagStore[key].filter((t) => !tags.includes(t));
  if (tagStore[key].length === 0) delete tagStore[key];
}

/** Get all tags for a given key */
export function getTagsForKey(key: string): string[] {
  return tagStore[key] ? [...tagStore[key]] : [];
}

/** Get all keys that have a specific tag */
export function getKeysByTag(tag: string): string[] {
  return Object.entries(tagStore)
    .filter(([, tags]) => tags.includes(tag))
    .map(([key]) => key);
}

/** Filter an env record to only keys that have a given tag */
export function filterByTag(
  env: Record<string, string>,
  tag: string
): Record<string, string> {
  const keys = new Set(getKeysByTag(tag));
  return Object.fromEntries(
    Object.entries(env).filter(([k]) => keys.has(k))
  );
}

/** List all known tags across all keys */
export function listAllTags(): string[] {
  const all = new Set<string>();
  for (const tags of Object.values(tagStore)) {
    for (const t of tags) all.add(t);
  }
  return [...all].sort();
}

/** Clear all tag assignments (useful for testing) */
export function clearTags(): void {
  for (const key of Object.keys(tagStore)) {
    delete tagStore[key];
  }
}

/** Snapshot the current tag store */
export function snapshotTags(): TagMap {
  return Object.fromEntries(
    Object.entries(tagStore).map(([k, v]) => [k, [...v]])
  );
}
