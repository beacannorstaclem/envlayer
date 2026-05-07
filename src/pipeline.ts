/**
 * pipeline.ts — Compose ordered middleware-style transforms over an env record.
 */

export type EnvRecord = Record<string, string>;

export type PipelineStep = (env: EnvRecord) => EnvRecord | Promise<EnvRecord>;

export interface Pipeline {
  steps: PipelineStep[];
  run(env: EnvRecord): Promise<EnvRecord>;
}

/**
 * Create a new pipeline with the given steps.
 */
export function createPipeline(...steps: PipelineStep[]): Pipeline {
  return {
    steps,
    async run(env: EnvRecord): Promise<EnvRecord> {
      let current = { ...env };
      for (const step of steps) {
        current = await step(current);
      }
      return current;
    },
  };
}

/**
 * Append one or more steps to an existing pipeline, returning a new pipeline.
 */
export function extendPipeline(pipeline: Pipeline, ...steps: PipelineStep[]): Pipeline {
  return createPipeline(...pipeline.steps, ...steps);
}

/**
 * Compose two pipelines sequentially into one.
 */
export function composePipelines(a: Pipeline, b: Pipeline): Pipeline {
  return createPipeline(...a.steps, ...b.steps);
}

/**
 * Wrap a synchronous transform as a PipelineStep.
 */
export function syncStep(fn: (env: EnvRecord) => EnvRecord): PipelineStep {
  return (env) => fn(env);
}

/**
 * Create a conditional step that only runs when predicate returns true.
 */
export function conditionalStep(
  predicate: (env: EnvRecord) => boolean,
  step: PipelineStep
): PipelineStep {
  return async (env) => (predicate(env) ? step(env) : env);
}
