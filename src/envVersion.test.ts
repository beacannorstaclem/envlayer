import {
  saveVersion,
  getVersion,
  getLatestVersion,
  listVersions,
  rollbackTo,
  clearVersionHistory,
  diffVersions,
} from "./envVersion";
import { createEnvVersionMiddleware, VersionedEnvRequest } from "./envVersionMiddleware";

beforeEach(() => {
  clearVersionHistory();
});

describe("saveVersion", () => {
  it("saves a version and increments version number", () => {
    const v1 = saveVersion({ FOO: "bar" }, "initial");
    expect(v1.version).toBe(1);
    expect(v1.label).toBe("initial");
    expect(v1.env).toEqual({ FOO: "bar" });

    const v2 = saveVersion({ FOO: "baz" });
    expect(v2.version).toBe(2);
  });

  it("stores a deep copy of the env", () => {
    const env = { A: "1" };
    const v = saveVersion(env);
    env.A = "mutated";
    expect(v.env.A).toBe("1");
  });
});

describe("getVersion", () => {
  it("retrieves a saved version by number", () => {
    saveVersion({ X: "1" });
    saveVersion({ X: "2" });
    const v = getVersion(1);
    expect(v?.env).toEqual({ X: "1" });
  });

  it("returns undefined for missing version", () => {
    expect(getVersion(99)).toBeUndefined();
  });
});

describe("getLatestVersion", () => {
  it("returns the most recent version", () => {
    saveVersion({ A: "1" });
    saveVersion({ A: "2" });
    expect(getLatestVersion()?.env).toEqual({ A: "2" });
  });

  it("returns undefined when no versions saved", () => {
    expect(getLatestVersion()).toBeUndefined();
  });
});

describe("listVersions", () => {
  it("lists versions without env payload", () => {
    saveVersion({ A: "1" }, "v1");
    saveVersion({ A: "2" }, "v2");
    const list = listVersions();
    expect(list).toHaveLength(2);
    expect(list[0]).not.toHaveProperty("env");
    expect(list[0].label).toBe("v1");
  });
});

describe("rollbackTo", () => {
  it("returns the env from the specified version", () => {
    saveVersion({ KEY: "original" });
    saveVersion({ KEY: "updated" });
    const rolled = rollbackTo(1);
    expect(rolled).toEqual({ KEY: "original" });
  });

  it("throws for unknown version", () => {
    expect(() => rollbackTo(42)).toThrow("version 42 not found");
  });
});

describe("diffVersions", () => {
  it("detects added, removed, and changed keys", () => {
    saveVersion({ A: "1", B: "2" });
    saveVersion({ A: "changed", C: "3" });
    const diff = diffVersions(1, 2);
    expect(diff.added).toContain("C");
    expect(diff.removed).toContain("B");
    expect(diff.changed).toContain("A");
  });
});

describe("createEnvVersionMiddleware", () => {
  function makeReq(env: Record<string, string>): VersionedEnvRequest {
    return { env };
  }

  it("attaches envVersion helpers to the request", () => {
    const mw = createEnvVersionMiddleware(false);
    const req = makeReq({ FOO: "bar" });
    mw(req, {}, () => {});
    expect(req.envVersion).toBeDefined();
    expect(typeof req.envVersion?.save).toBe("function");
  });

  it("auto-saves a version when autoSave is true", () => {
    const mw = createEnvVersionMiddleware(true);
    const req = makeReq({ AUTO: "yes" });
    mw(req, {}, () => {});
    expect(getLatestVersion()?.env).toEqual({ AUTO: "yes" });
  });

  it("rollback updates req.env", () => {
    saveVersion({ K: "v1" });
    const mw = createEnvVersionMiddleware(false);
    const req = makeReq({ K: "v2" });
    mw(req, {}, () => {});
    req.envVersion?.rollback(1);
    expect(req.env).toEqual({ K: "v1" });
  });
});
