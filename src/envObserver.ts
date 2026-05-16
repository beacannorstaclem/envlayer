/**
 * envObserver.ts
 * Subscribe to environment variable changes with callback notifications.
 */

export type EnvChangeEvent = {
  key: string;
  previousValue: string | undefined;
  nextValue: string | undefined;
  timestamp: number;
};

export type EnvObserverCallback = (event: EnvChangeEvent) => void;

type ObserverEntry = {
  id: string;
  keys: string[] | null; // null = watch all
  callback: EnvObserverCallback;
};

const observers: ObserverEntry[] = [];
let idCounter = 0;

export function subscribe(
  callback: EnvObserverCallback,
  keys?: string[]
): string {
  const id = `obs_${++idCounter}`;
  observers.push({ id, keys: keys ?? null, callback });
  return id;
}

export function unsubscribe(id: string): boolean {
  const idx = observers.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  observers.splice(idx, 1);
  return true;
}

export function notifyObservers(
  key: string,
  previousValue: string | undefined,
  nextValue: string | undefined
): void {
  if (previousValue === nextValue) return;
  const event: EnvChangeEvent = {
    key,
    previousValue,
    nextValue,
    timestamp: Date.now(),
  };
  for (const entry of observers) {
    if (entry.keys === null || entry.keys.includes(key)) {
      try {
        entry.callback(event);
      } catch {
        // swallow individual callback errors
      }
    }
  }
}

export function notifyAll(
  previous: Record<string, string>,
  next: Record<string, string>
): void {
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(next)]);
  for (const key of allKeys) {
    notifyObservers(key, previous[key], next[key]);
  }
}

export function clearObservers(): void {
  observers.length = 0;
}

export function listObserverIds(): string[] {
  return observers.map((o) => o.id);
}
