import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  cacheSet,
  cacheGet,
  cacheHas,
  cacheDelete,
  cacheClear,
  buildCacheKey,
} from './cache';

beforeEach(() => {
  cacheClear();
});

describe('cacheSet / cacheGet', () => {
  it('stores and retrieves a value', () => {
    cacheSet('key1', { PORT: '3000' });
    expect(cacheGet('key1')).toEqual({ PORT: '3000' });
  });

  it('returns undefined for unknown keys', () => {
    expect(cacheGet('missing')).toBeUndefined();
  });

  it('returns undefined after TTL expires', () => {
    vi.useFakeTimers();
    cacheSet('key2', 'value', { ttl: 1000 });
    vi.advanceTimersByTime(1001);
    expect(cacheGet('key2')).toBeUndefined();
    vi.useRealTimers();
  });

  it('returns value before TTL expires', () => {
    vi.useFakeTimers();
    cacheSet('key3', 'alive', { ttl: 5000 });
    vi.advanceTimersByTime(4999);
    expect(cacheGet('key3')).toBe('alive');
    vi.useRealTimers();
  });
});

describe('cacheHas', () => {
  it('returns true for a live entry', () => {
    cacheSet('exists', 42);
    expect(cacheHas('exists')).toBe(true);
  });

  it('returns false for a missing entry', () => {
    expect(cacheHas('nope')).toBe(false);
  });

  it('returns false for an expired entry', () => {
    vi.useFakeTimers();
    cacheSet('exp', 'x', { ttl: 500 });
    vi.advanceTimersByTime(600);
    expect(cacheHas('exp')).toBe(false);
    vi.useRealTimers();
  });
});

describe('cacheDelete', () => {
  it('removes an entry', () => {
    cacheSet('del', 'bye');
    cacheDelete('del');
    expect(cacheGet('del')).toBeUndefined();
  });
});

describe('buildCacheKey', () => {
  it('returns string input unchanged', () => {
    expect(buildCacheKey('my-key')).toBe('my-key');
  });

  it('produces consistent key regardless of property order', () => {
    const a = buildCacheKey({ B: '2', A: '1' });
    const b = buildCacheKey({ A: '1', B: '2' });
    expect(a).toBe(b);
  });

  it('produces different keys for different objects', () => {
    const a = buildCacheKey({ X: '1' });
    const b = buildCacheKey({ X: '2' });
    expect(a).not.toBe(b);
  });
});
