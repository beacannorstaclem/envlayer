/**
 * envEventPlugin.ts — Pipeline plugin that wires event emission into env pipelines.
 */

import { emitEnvEvent, EnvEventType } from './envEvent';

export interface EnvEventPluginOptions {
  operation?: EnvEventType;
  meta?: Record<string, unknown>;
}

export function createEnvEventPlugin(
  options: EnvEventPluginOptions = {}
) {
  const { operation = 'merge', meta } = options;

  return function envEventPlugin(
    env: Record<string, string>,
    previous?: Record<string, string>
  ): Record<string, string> {
    const prev = previous ?? {};
    const changedKeys = Object.keys({ ...prev, ...env }).filter(
      (k) => prev[k] !== env[k]
    );

    for (const key of changedKeys) {
      emitEnvEvent({
        type: operation,
        key,
        oldValue: prev[key],
        newValue: env[key],
        timestamp: Date.now(),
        meta,
      });
    }

    return env;
  };
}

export function emitBulkEvent(
  env: Record<string, string>,
  operation: EnvEventType,
  meta?: Record<string, unknown>
): void {
  emitEnvEvent({
    type: operation,
    timestamp: Date.now(),
    meta: { ...meta, keyCount: Object.keys(env).length },
  });
}
