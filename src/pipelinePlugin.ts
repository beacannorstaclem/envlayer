/**
 * pipelinePlugin.ts — Pre-built pipeline plugins for common env transformations.
 */

import { PipelineStep, EnvRecord } from './pipeline';
import { interpolateAll } from './interpolate';
import { expandAll } from './expand';
import { maskEnv } from './mask';
import { redactEnv } from './redact';

/** Interpolate ${VAR} references within values. */
export function interpolatePlugin(): PipelineStep {
  return (env) => interpolateAll(env);
}

/** Expand shell-style variable references. */
export function expandPlugin(): PipelineStep {
  return (env) => expandAll(env);
}

/** Mask sensitive values for logging/display. */
export function maskPlugin(sensitiveKeys?: string[]): PipelineStep {
  return (env) =>
    sensitiveKeys ? maskEnv(env, sensitiveKeys) : maskEnv(env);
}

/** Redact sensitive keys entirely from the env record. */
export function redactPlugin(keys: string[]): PipelineStep {
  return (env) => redactEnv(env, keys);
}

/** Trim whitespace from all values. */
export function trimValuesPlugin(): PipelineStep {
  return (env) =>
    Object.fromEntries(Object.entries(env).map(([k, v]) => [k, v.trim()]));
}

/** Prefix all keys with a given string. */
export function prefixKeysPlugin(prefix: string): PipelineStep {
  return (env) =>
    Object.fromEntries(Object.entries(env).map(([k, v]) => [`${prefix}${k}`, v]));
}

/** Remove keys whose values are empty strings. */
export function dropEmptyPlugin(): PipelineStep {
  return (env: EnvRecord) =>
    Object.fromEntries(Object.entries(env).filter(([, v]) => v !== ''));
}
