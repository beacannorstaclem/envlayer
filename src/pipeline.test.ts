import { describe, it, expect } from 'vitest';
import { createPipeline, extendPipeline, composePipelines, syncStep, conditionalStep } from './pipeline';

const double = syncStep((env) =>
  Object.fromEntries(Object.entries(env).map(([k, v]) => [k, v + v]))
);

const upper = syncStep((env) =>
  Object.fromEntries(Object.entries(env).map(([k, v]) => [k, v.toUpperCase()]))
);

describe('createPipeline', () => {
  it('runs steps in order', async () => {
    const p = createPipeline(double, upper);
    const result = await p.run({ FOO: 'ab' });
    expect(result.FOO).toBe('ABAB');
  });

  it('returns copy of env when no steps', async () => {
    const p = createPipeline();
    const env = { A: '1' };
    const result = await p.run(env);
    expect(result).toEqual(env);
    expect(result).not.toBe(env);
  });
});

describe('extendPipeline', () => {
  it('appends steps without mutating original', async () => {
    const base = createPipeline(double);
    const extended = extendPipeline(base, upper);
    expect(base.steps).toHaveLength(1);
    expect(extended.steps).toHaveLength(2);
    const result = await extended.run({ X: 'hi' });
    expect(result.X).toBe('HIHI');
  });
});

describe('composePipelines', () => {
  it('merges two pipelines', async () => {
    const a = createPipeline(double);
    const b = createPipeline(upper);
    const c = composePipelines(a, b);
    expect(c.steps).toHaveLength(2);
    const result = await c.run({ K: 'z' });
    expect(result.K).toBe('ZZ');
  });
});

describe('conditionalStep', () => {
  it('runs step when predicate is true', async () => {
    const step = conditionalStep(() => true, upper);
    const result = await step({ V: 'hello' });
    expect((result as Record<string, string>).V).toBe('HELLO');
  });

  it('skips step when predicate is false', async () => {
    const step = conditionalStep(() => false, upper);
    const result = await step({ V: 'hello' });
    expect((result as Record<string, string>).V).toBe('hello');
  });
});
