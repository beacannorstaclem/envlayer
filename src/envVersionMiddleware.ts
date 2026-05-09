/**
 * envVersionMiddleware.ts
 * Express-style middleware that attaches env versioning helpers
 * to the request object.
 */

import {
  saveVersion,
  rollbackTo,
  getLatestVersion,
  listVersions,
  EnvVersion,
} from "./envVersion";

export interface VersionedEnvRequest {
  env: Record<string, string>;
  envVersion?: {
    save: (label?: string) => EnvVersion;
    rollback: (version: number) => void;
    latest: () => EnvVersion | undefined;
    list: () => Omit<EnvVersion, "env">[];
  };
  [key: string]: unknown;
}

type NextFn = (err?: unknown) => void;

/**
 * Creates middleware that attaches versioning helpers to req.envVersion.
 * Automatically saves a version of the current req.env on each request.
 */
export function createEnvVersionMiddleware(autoSave = true) {
  return function envVersionMiddleware(
    req: VersionedEnvRequest,
    _res: unknown,
    next: NextFn
  ): void {
    if (!req.env) {
      req.env = {};
    }

    req.envVersion = {
      save: (label?: string) => saveVersion(req.env, label),
      rollback: (version: number) => {
        req.env = rollbackTo(version);
      },
      latest: () => getLatestVersion(),
      list: () => listVersions(),
    };

    if (autoSave) {
      saveVersion(req.env, "auto");
    }

    next();
  };
}
