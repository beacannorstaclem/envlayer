import { describe, it, expect } from 'vitest';
import { PRIORITY, buildLayerStack, createLayer } from './priority';

describe('PRIORITY constants', () => {
  it('defines expected priority levels', () => {
    expect(PRIORITY.defaults).toBe(0);
    expect(PRIORITY.file).toBe(10);
    expect(PRIORITY.env).toBe(20);
    expect(PRIORITY.runtime).toBe(30);
  });

  it('runtime has highest priority', () => {
    const values = Object.values(PRIORITY);
    expect(Math.max(...values)).toBe(PRIORITY.runtime);
  });
});

describe('buildLayerStack', () => {
  it('returns layers sorted by priority ascending', () => {
    const layers = [
      { name: 'env', priority: 20, data: { A: 'env' } },
      { name: 'defaults', priority: 0, data: { A: 'default' } },
      { name: 'runtime', priority: 30, data: { A: 'runtime' } },
    ];
    const stack = buildLayerStack(layers);
    expect(stack).toEqual([
      { A: 'default' },
      { A: 'env' },
      { A: 'runtime' },
    ]);
  });

  it('does not mutate the input array', () => {
    const layers = [
      { name: 'env', priority: 20, data: { X: '1' } },
      { name: 'defaults', priority: 0, data: { X: '0' } },
    ];
    const original = [...layers];
    buildLayerStack(layers);
    expect(layers[0].name).toBe(original[0].name);
  });

  it('returns empty array for empty input', () => {
    expect(buildLayerStack([])).toEqual([]);
  });
});

describe('createLayer', () => {
  it('uses preset priority for known layer names', () => {
    const layer = createLayer('file', { DB_URL: 'postgres://localhost' });
    expect(layer.priority).toBe(10);
    expect(layer.name).toBe('file');
    expect(layer.data).toEqual({ DB_URL: 'postgres://localhost' });
  });

  it('uses override priority when provided', () => {
    const layer = createLayer('env', { PORT: '3000' }, 99);
    expect(layer.priority).toBe(99);
  });

  it('assigns default priority of 5 for unknown layer names', () => {
    const layer = createLayer('custom', { FOO: 'bar' });
    expect(layer.priority).toBe(5);
  });
});
