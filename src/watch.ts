import * as fs from 'fs';
import { loadLayers } from './loader';
import { mergeLayers } from './merge';
import { interpolateAll } from './interpolate';
import { validateSchema } from './schema';

export type WatchCallback = (env: Record<string, string>, error?: Error) => void;

export interface WatchOptions {
  files: string[];
  schema?: Record<string, unknown>;
  debounceMs?: number;
}

export interface WatchHandle {
  stop: () => void;
}

export function watchEnvFiles(
  options: WatchOptions,
  callback: WatchCallback
): WatchHandle {
  const { files, schema, debounceMs = 300 } = options;
  const watchers: fs.FSWatcher[] = [];
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const reload = () => {
    try {
      const layers = loadLayers(files);
      const merged = mergeLayers(layers);
      const interpolated = interpolateAll(merged);
      if (schema) {
        validateSchema(interpolated, schema);
      }
      callback(interpolated);
    } catch (err) {
      callback({}, err instanceof Error ? err : new Error(String(err)));
    }
  };

  const scheduleReload = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(reload, debounceMs);
  };

  for (const file of files) {
    if (fs.existsSync(file)) {
      const watcher = fs.watch(file, scheduleReload);
      watchers.push(watcher);
    }
  }

  // Initial load
  reload();

  return {
    stop: () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      for (const w of watchers) w.close();
    },
  };
}
