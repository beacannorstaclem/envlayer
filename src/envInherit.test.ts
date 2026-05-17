import {
  inheritEnv,
  overriddenKeys,
  childOnlyKeys,
  inheritedKeys,
  stripInherited,
} from "./envInherit";

const parent = { APP: "myapp", LOG_LEVEL: "info", DB_HOST: "localhost" };
const child = { LOG_LEVEL: "debug", PORT: "3000", DB_HOST: "localhost" };

describe("inheritEnv", () => {
  it("merges parent and child, child wins", () => {
    const result = inheritEnv(parent, child);
    expect(result.APP).toBe("myapp");
    expect(result.LOG_LEVEL).toBe("debug");
    expect(result.PORT).toBe("3000");
  });

  it("respects locked keys from parent", () => {
    const result = inheritEnv(parent, { LOG_LEVEL: "debug" }, { locked: ["LOG_LEVEL"] });
    expect(result.LOG_LEVEL).toBe("info");
  });

  it("excludes specified keys from parent", () => {
    const result = inheritEnv(parent, child, { exclude: ["DB_HOST"] });
    expect(result.DB_HOST).toBe("localhost"); // child provides it
  });

  it("excluded parent key absent when child also lacks it", () => {
    const result = inheritEnv(parent, {}, { exclude: ["APP"] });
    expect(result.APP).toBeUndefined();
  });

  it("returns empty object for empty inputs", () => {
    expect(inheritEnv({}, {})).toEqual({});
  });
});

describe("overriddenKeys", () => {
  it("returns keys child overrides with different value", () => {
    const keys = overriddenKeys(parent, child);
    expect(keys).toContain("LOG_LEVEL");
    expect(keys).not.toContain("DB_HOST"); // same value
    expect(keys).not.toContain("PORT");    // not in parent
  });
});

describe("childOnlyKeys", () => {
  it("returns keys only in child", () => {
    const keys = childOnlyKeys(parent, child);
    expect(keys).toEqual(["PORT"]);
  });

  it("returns empty array when child has no unique keys", () => {
    expect(childOnlyKeys(parent, { APP: "x" })).toEqual([]);
  });
});

describe("inheritedKeys", () => {
  it("returns keys not overridden by child", () => {
    const keys = inheritedKeys(parent, child);
    expect(keys).toContain("APP");
    expect(keys).toContain("DB_HOST"); // same value
    expect(keys).not.toContain("LOG_LEVEL");
  });
});

describe("stripInherited", () => {
  it("removes keys identical to parent", () => {
    const stripped = stripInherited(parent, child);
    expect(stripped.LOG_LEVEL).toBe("debug");
    expect(stripped.PORT).toBe("3000");
    expect(stripped.DB_HOST).toBeUndefined();
  });

  it("returns full child when parent is empty", () => {
    expect(stripInherited({}, child)).toEqual(child);
  });
});
