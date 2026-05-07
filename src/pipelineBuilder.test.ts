import { describe, it, expect, vi } from 'vitest';
import { buildPipeline } from './pipelineBuilder';

describe('PipelineBuilder', () => {
  it('map transforms env', async () => {
    const pipeline = buildPipeline()
      .map((env) => ({ ...env, EXTRA: 'yes' }))
      .build();
    const result = await pipeline.run({ A: '1' });
    expect(result.EXTRA).toBe('yes');
    expect(result.A).toBe('1');
  });

  it('filterKeys keeps only matching keys', async () => {
    const pipeline = buildPipeline().filterKeys(/^APP_/).build();
    const result = await pipeline.run({ APP_HOST: 'localhost', DB_URL: 'postgres' });
    expect(result).toEqual({ APP_HOST: 'localhost' });
  });

  it('uppercaseKeys uppercases all keys', async () => {
    const pipeline = buildPipeline().uppercaseKeys().build();
    const result = await pipeline.run({ foo: 'bar', baz: 'qux' });
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('withDefaults does not override existing keys', async () => {
    const pipeline = buildPipeline().withDefaults({ HOST: 'default', PORT: '3000' }).build();
    const result = await pipeline.run({ HOST: 'custom' });
    expect(result.HOST).toBe('custom');
    expect(result.PORT).toBe('3000');
  });

  it('when runs step conditionally', async () => {
    const step = vi.fn(async (env: Record<string, string>) => ({ ...env, ADDED: 'yes' }));
    const pipeline = buildPipeline()
      .when((env) => env.RUN === 'true', step)
      .build();

    const r1 = await pipeline.run({ RUN: 'true' });
    expect(r1.ADDED).toBe('yes');
    expect(step).toHaveBeenCalledOnce();

    const r2 = await pipeline.run({ RUN: 'false' });
    expect(r2.ADDED).toBeUndefined();
    expect(step).toHaveBeenCalledOnce(); // still once
  });

  it('chains multiple steps', async () => {
    const pipeline = buildPipeline()
      .withDefaults({ LEVEL: 'info' })
      .map((env) => ({ ...env, LEVEL: env.LEVEL.toUpperCase() }))
      .build();
    const result = await pipeline.run({});
    expect(result.LEVEL).toBe('INFO');
  });
});
