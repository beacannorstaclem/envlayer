/**
 * pipelineBuilder.ts — Fluent builder API for constructing env pipelines.
 */

import { EnvRecord, Pipeline, PipelineStep, createPipeline, conditionalStep, syncStep } from './pipeline';

export class PipelineBuilder {
  private _steps: PipelineStep[] = [];

  /** Add an async step. */
  use(step: PipelineStep): this {
    this._steps.push(step);
    return this;
  }

  /** Add a synchronous transform step. */
  map(fn: (env: EnvRecord) => EnvRecord): this {
    this._steps.push(syncStep(fn));
    return this;
  }

  /** Add a step that only runs when the predicate is truthy. */
  when(predicate: (env: EnvRecord) => boolean, step: PipelineStep): this {
    this._steps.push(conditionalStep(predicate, step));
    return this;
  }

  /** Add a step that filters keys matching the given pattern. */
  filterKeys(pattern: RegExp): this {
    return this.map((env) =>
      Object.fromEntries(Object.entries(env).filter(([k]) => pattern.test(k)))
    );
  }

  /** Add a step that uppercases all keys. */
  uppercaseKeys(): this {
    return this.map((env) =>
      Object.fromEntries(Object.entries(env).map(([k, v]) => [k.toUpperCase(), v]))
    );
  }

  /** Add a step that merges in static defaults (non-overriding). */
  withDefaults(defaults: EnvRecord): this {
    return this.map((env) => ({ ...defaults, ...env }));
  }

  /** Build and return the immutable Pipeline. */
  build(): Pipeline {
    return createPipeline(...this._steps);
  }
}

/** Convenience factory. */
export function buildPipeline(): PipelineBuilder {
  return new PipelineBuilder();
}
