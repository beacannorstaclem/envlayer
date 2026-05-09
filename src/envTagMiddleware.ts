/**
 * Middleware that attaches tag metadata to the request context
 * and optionally filters env by a required tag.
 */

import { filterByTag, getTagsForKey, TagMap, snapshotTags } from "./envTag";

export interface TaggedEnvRequest {
  env: Record<string, string>;
  tags?: TagMap;
  filterTag?: string;
  [key: string]: unknown;
}

export type TagMiddlewareFn = (
  req: TaggedEnvRequest,
  next: (req: TaggedEnvRequest) => TaggedEnvRequest
) => TaggedEnvRequest;

/**
 * Creates middleware that:
 * 1. Attaches current tag snapshot to req.tags
 * 2. If req.filterTag is set, filters req.env to matching keys
 */
export function createTagMiddleware(): TagMiddlewareFn {
  return (req, next) => {
    const tags = snapshotTags();
    let env = { ...req.env };

    if (req.filterTag) {
      env = filterByTag(env, req.filterTag);
    }

    return next({ ...req, env, tags });
  };
}

/**
 * Creates middleware that annotates each env key with its tags
 * as a separate metadata map on the request.
 */
export function createTagAnnotatorMiddleware(): TagMiddlewareFn {
  return (req, next) => {
    const keyTagMap: TagMap = {};
    for (const key of Object.keys(req.env)) {
      const t = getTagsForKey(key);
      if (t.length > 0) keyTagMap[key] = t;
    }
    return next({ ...req, tags: keyTagMap });
  };
}
