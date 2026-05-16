/**
 * envEventMiddleware.ts — Middleware that emits EnvEvents on env mutations.
 */

import { emitEnvEvent, EnvEventType } from './envEvent';

export interface EnvEventRequest {
  env: Record<string, string>;
  operation: EnvEventType;
  key?: string;
  value?: string;
  previous?: Record<string, string>;
  meta?: Record<string, unknown>;
}

export type EnvEventMiddlewareFn = (
  req: EnvEventRequest,
  next: (req: EnvEventRequest) => EnvEventRequest
) => EnvEventRequest;

export function createEnvEventMiddleware(): EnvEventMiddlewareFn {
  return (req, next) => {
    const oldValue = req.key ? (req.previous ?? req.env)[req.key] : undefined;
    const result = next(req);
    const newValue = req.key ? result.env[req.key] : undefined;

    emitEnvEvent({
      type: req.operation,
      key: req.key,
      oldValue,
      newValue,
      timestamp: Date.now(),
      meta: req.meta,
    });

    return result;
  };
}

export function applyEnvEventMiddleware(
  req: EnvEventRequest,
  middleware: EnvEventMiddlewareFn
): EnvEventRequest {
  return middleware(req, (r) => r);
}
