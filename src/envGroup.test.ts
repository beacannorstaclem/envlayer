import {
  groupByPrefix,
  ungroupByPrefix,
  getGroup,
  listGroups,
  mergeGroup,
} from "./envGroup";
import { createEnvGroupMiddleware, createGroupScopeMiddleware, GroupedEnvRequest } from "./envGroupMiddleware";

const sample = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  APP_NAME: "envlayer",
  APP_ENV: "test",
  SECRET: "abc123",
};

describe("groupByPrefix", () => {
  it("groups keys by prefix", () => {
    const groups = groupByPrefix(sample);
    expect(groups["DB"]).toEqual({ HOST: "localhost", PORT: "5432" });
    expect(groups["APP"]).toEqual({ NAME: "envlayer", ENV: "test" });
  });

  it("places unprefixed keys under __default", () => {
    const groups = groupByPrefix(sample);
    expect(groups["__default"]).toEqual({ SECRET: "abc123" });
  });
});

describe("ungroupByPrefix", () => {
  it("reconstructs flat env from groups", () => {
    const groups = groupByPrefix(sample);
    const flat = ungroupByPrefix(groups);
    expect(flat).toEqual(sample);
  });
});

describe("getGroup", () => {
  it("returns scoped vars for a prefix", () => {
    expect(getGroup(sample, "DB")).toEqual({ HOST: "localhost", PORT: "5432" });
  });

  it("returns empty object for unknown prefix", () => {
    expect(getGroup(sample, "UNKNOWN")).toEqual({});
  });
});

describe("listGroups", () => {
  it("lists all group prefixes", () => {
    const groups = listGroups(sample);
    expect(groups).toContain("DB");
    expect(groups).toContain("APP");
    expect(groups).toContain("__default");
  });
});

describe("mergeGroup", () => {
  it("merges scoped vars back into full env", () => {
    const updated = mergeGroup(sample, "DB", { HOST: "remotehost", SSL: "true" });
    expect(updated["DB_HOST"]).toBe("remotehost");
    expect(updated["DB_SSL"]).toBe("true");
    expect(updated["DB_PORT"]).toBe("5432");
  });
});

describe("createEnvGroupMiddleware", () => {
  it("attaches envGroups and helpers to req", () => {
    const middleware = createEnvGroupMiddleware();
    const req = { env: sample } as GroupedEnvRequest;
    let called = false;
    middleware(req, (err) => {
      expect(err).toBeUndefined();
      called = true;
    });
    expect(called).toBe(true);
    expect(req.envGroups["DB"]).toEqual({ HOST: "localhost", PORT: "5432" });
    expect(req.envGroupList).toContain("APP");
    expect(req.getEnvGroup("APP")).toEqual({ NAME: "envlayer", ENV: "test" });
  });
});

describe("createGroupScopeMiddleware", () => {
  it("scopes req.env to a single prefix group", () => {
    const middleware = createGroupScopeMiddleware("APP");
    const req = { env: { ...sample } } as GroupedEnvRequest;
    middleware(req, (err) => {
      expect(err).toBeUndefined();
    });
    expect(req.env).toEqual({ NAME: "envlayer", ENV: "test" });
  });
});
