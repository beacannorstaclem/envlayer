/**
 * envPatchMiddleware.ts — Middleware for applying env patches in a pipeline.
 */

import { applyPatch, computePatch, EnvMap, PatchEntry } from './envPatch';

export interface PatchEnvRequest {
  env: EnvMap;
  patch?: PatchEntry[];
  patchLog?: Array<{ patch: PatchEntry[]; timestamp: number }>;
}

export type PatchMiddleware = (
  req: PatchEnvRequest,
  next: (req: PatchEnvRequest) => PatchEnvRequest
) => PatchEnvRequest;

/**
 * Middleware that applies a static patch to req.env.
 */
export function createPatchMiddleware(patch: PatchEntry[]): PatchMiddleware {
  return (req, next) => {
    const patched = applyPatch(req.env, patch);
    const log = req.patchLog ?? [];
    return next({
      ...req,
      env: patched,
      patch,
      patchLog: [...log, { patch, timestamp: Date.now() }],
    });
  };
}

/**
 * Middleware that computes and records a patch between req.env and a target env.
 */
export function createComputePatchMiddleware(target: EnvMap): PatchMiddleware {
  return (req, next) => {
    const patch = computePatch(req.env, target);
    const log = req.patchLog ?? [];
    return next({
      ...req,
      env: target,
      patch,
      patchLog: [...log, { patch, timestamp: Date.now() }],
    });
  };
}

/**
 * Compose multiple patch middlewares left-to-right.
 */
export function composePatchMiddlewares(
  middlewares: PatchMiddleware[]
): PatchMiddleware {
  return (req, next) => {
    const dispatch = (index: number, current: PatchEnvRequest): PatchEnvRequest => {
      if (index >= middlewares.length) return next(current);
      return middlewares[index](current, (r) => dispatch(index + 1, r));
    };
    return dispatch(0, req);
  };
}
