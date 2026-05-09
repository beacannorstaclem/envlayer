import { tagKey, clearTags } from "./envTag";
import {
  createTagMiddleware,
  createTagAnnotatorMiddleware,
  TaggedEnvRequest,
} from "./envTagMiddleware";

function makeReq(overrides: Partial<TaggedEnvRequest> = {}): TaggedEnvRequest {
  return {
    env: { DB_URL: "postgres://", PORT: "3000", API_KEY: "abc" },
    ...overrides,
  };
}

const identity = (req: TaggedEnvRequest) => req;

beforeEach(() => clearTags());

describe("createTagMiddleware", () => {
  it("attaches tag snapshot to request", () => {
    tagKey("DB_URL", "sensitive");
    const mw = createTagMiddleware();
    const result = mw(makeReq(), identity);
    expect(result.tags).toBeDefined();
    expect(result.tags!["DB_URL"]).toContain("sensitive");
  });

  it("passes env unchanged when no filterTag", () => {
    const mw = createTagMiddleware();
    const req = makeReq();
    const result = mw(req, identity);
    expect(result.env).toEqual(req.env);
  });

  it("filters env when filterTag is set", () => {
    tagKey("DB_URL", "db");
    const mw = createTagMiddleware();
    const req = makeReq({ filterTag: "db" });
    const result = mw(req, identity);
    expect(result.env).toEqual({ DB_URL: "postgres://" });
  });

  it("results in empty env when no keys match filterTag", () => {
    const mw = createTagMiddleware();
    const req = makeReq({ filterTag: "nonexistent" });
    const result = mw(req, identity);
    expect(result.env).toEqual({});
  });
});

describe("createTagAnnotatorMiddleware", () => {
  it("annotates keys that have tags", () => {
    tagKey("API_KEY", "sensitive");
    const mw = createTagAnnotatorMiddleware();
    const result = mw(makeReq(), identity);
    expect(result.tags!["API_KEY"]).toEqual(["sensitive"]);
  });

  it("does not include untagged keys in tags map", () => {
    tagKey("API_KEY", "sensitive");
    const mw = createTagAnnotatorMiddleware();
    const result = mw(makeReq(), identity);
    expect(result.tags).not.toHaveProperty("PORT");
  });

  it("does not modify env", () => {
    const mw = createTagAnnotatorMiddleware();
    const req = makeReq();
    const result = mw(req, identity);
    expect(result.env).toEqual(req.env);
  });
});
