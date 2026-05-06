import { loadLayers } from './loader';
import { mergeLayers } from './merge';
import { interpolateAll } from './interpolate';
import { validateSchema } from './schema';
import { applyTransforms } from './transform';
import type { TransformMap } from './transform';

export interface SnapshotOptions {
  files: string[];
  schema?: Record<string, unknown>;
  transforms?: TransformMap;
  overrides?: Record<string, string>;
}

export interface EnvSnapshot {
  raw: Record<string, string>;
  resolved: Record<string, string>;
  timestamp: number;
}

export function takeSnapshot(options: SnapshotOptions): EnvSnapshot {
  const { files, schema, transforms, overrides = {} } = options;

  const layers = loadLayers(files);
  if (Object.keys(overrides).length > 0) {
    layers.push(overrides);
  }

  const merged = mergeLayers(layers);
  const interpolated = interpolateAll(merged);

  if (schema) {
    validateSchema(interpolated, schema);
  }

  const resolved = transforms
    ? applyTransforms(interpolated, transforms)
    : { ...interpolated };

  return {
    raw: { ...merged },
    resolved,
    timestamp: Date.now(),
  };
}

export function diffSnapshots(
  a: EnvSnapshot,
  b: EnvSnapshot
): Record<string, { before: string | undefined; after: string | undefined }> {
  const keys = new Set([...Object.keys(a.resolved), ...Object.keys(b.resolved)]);
  const diff: Record<string, { before: string | undefined; after: string | undefined }> = {};
  for (const key of keys) {
    if (a.resolved[key] !== b.resolved[key]) {
      diff[key] = { before: a.resolved[key], after: b.resolved[key] };
    }
  }
  return diff;
}
