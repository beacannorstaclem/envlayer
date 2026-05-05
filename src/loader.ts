import * as fs from "fs";
import * as path from "path";

export type EnvLayer = Record<string, string>;

export interface LoaderOptions {
  /** Paths to .env files, resolved in order (later files take lower priority by default) */
  files?: string[];
  /** Whether to include process.env as the highest-priority layer */
  includeProcessEnv?: boolean;
  /** Working directory for resolving relative file paths */
  cwd?: string;
}

/**
 * Parses a .env file content string into a key-value record.
 * Supports comments (#), quoted values, and ignores blank lines.
 */
export function parseEnvFile(content: string): EnvLayer {
  const result: EnvLayer = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    // Strip inline comments outside quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      const commentIdx = value.indexOf(" #");
      if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
    }
    if (key) result[key] = value;
  }
  return result;
}

/**
 * Loads environment layers from the provided options.
 * Returns an array of layers ordered from lowest to highest priority:
 * [file[0], file[1], ..., process.env (if enabled)]
 */
export function loadLayers(options: LoaderOptions = {}): EnvLayer[] {
  const { files = [], includeProcessEnv = true, cwd = process.cwd() } = options;
  const layers: EnvLayer[] = [];

  for (const filePath of files) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(cwd, filePath);
    if (!fs.existsSync(resolved)) continue;
    try {
      const content = fs.readFileSync(resolved, "utf-8");
      layers.push(parseEnvFile(content));
    } catch {
      // Skip unreadable files silently
    }
  }

  if (includeProcessEnv) {
    const processLayer: EnvLayer = {};
    for (const [k, v] of Object.entries(process.env)) {
      if (v !== undefined) processLayer[k] = v;
    }
    layers.push(processLayer);
  }

  return layers;
}
