/**
 * envGroupMiddleware.ts
 * Express-style middleware that attaches grouped env variables
 * to a request object for scoped downstream access.
 */

import { groupByPrefix, getGroup, listGroups, EnvRecord, GroupMap } from "./envGroup";

export interface GroupedEnvRequest {
  env: EnvRecord;
  envGroups: GroupMap;
  getEnvGroup: (prefix: string) => EnvRecord;
  envGroupList: string[];
}

export type NextFn = (err?: unknown) => void;
export type GroupMiddlewareFn<T extends GroupedEnvRequest> = (
  req: T,
  next: NextFn
) => void;

/**
 * Creates middleware that populates req.envGroups, req.getEnvGroup,
 * and req.envGroupList from req.env using the given separator.
 */
export function createEnvGroupMiddleware<T extends GroupedEnvRequest>(
  separator = "_"
): GroupMiddlewareFn<T> {
  return (req: T, next: NextFn): void => {
    try {
      const env: EnvRecord = req.env ?? {};
      req.envGroups = groupByPrefix(env, separator);
      req.envGroupList = listGroups(env, separator);
      req.getEnvGroup = (prefix: string) => getGroup(env, prefix, separator);
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Creates middleware that filters req.env to only include
 * variables belonging to the specified prefix group.
 */
export function createGroupScopeMiddleware<T extends GroupedEnvRequest>(
  prefix: string,
  separator = "_"
): GroupMiddlewareFn<T> {
  return (req: T, next: NextFn): void => {
    try {
      req.env = getGroup(req.env ?? {}, prefix, separator);
      req.envGroups = groupByPrefix(req.env, separator);
      req.envGroupList = listGroups(req.env, separator);
      req.getEnvGroup = (p: string) => getGroup(req.env, p, separator);
      next();
    } catch (err) {
      next(err);
    }
  };
}
