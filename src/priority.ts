/**
 * priority.ts
 * Defines named priority presets for common layer ordering strategies
 * and a builder for constructing ordered layer stacks.
 */

import type { EnvLayer } from './merge';

export type LayerName = 'defaults' | 'file' | 'env' | 'runtime';

export interface NamedLayer {
  name: LayerName | string;
  priority: number;
  data: EnvLayer;
}

/**
 * Standard priority values for well-known layer types.
 * Higher number = higher priority (applied later in merge).
 */
export const PRIORITY: Record<LayerName, number> = {
  defaults: 0,
  file: 10,
  env: 20,
  runtime: 30,
};

/**
 * Build a sorted array of EnvLayer values from a set of named layers.
 * Layers are sorted ascending by priority so that higher-priority layers
 * are merged last (and thus win).
 */
export function buildLayerStack(namedLayers: NamedLayer[]): EnvLayer[] {
  return [...namedLayers]
    .sort((a, b) => a.priority - b.priority)
    .map((l) => l.data);
}

/**
 * Convenience helper: create a NamedLayer using a preset priority name.
 */
export function createLayer(
  name: LayerName | string,
  data: EnvLayer,
  priorityOverride?: number
): NamedLayer {
  const priority =
    priorityOverride ?? (PRIORITY[name as LayerName] ?? 5);
  return { name, data, priority };
}
