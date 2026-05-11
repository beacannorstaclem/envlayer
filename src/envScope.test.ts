import { describe, it, expect } from "vitest";
import {
  createScope,
  scopeGet,
  scopeSet,
  scopeDelete,
  mergeScope,
  listScopeKeys,
  inScope,
  cloneScope,
} from "./envScope";

const base = { APP_HOST: "localhost", APP_PORT: "3000", DB_URL: "postgres://localhost/dev", SECRET: "s3cr3t" };

describe("createScope", () => {
  it("creates a scoped view with only the specified keys", () => {
    const scope = createScope(base, ["APP_HOST", "APP_PORT"]);
    expect(scope.env).toEqual({ APP_HOST: "localhost", APP_PORT: "3000" });
  });

  it("ignores keys not present in the base env", () => {
    const scope = createScope(base, ["APP_HOST", "MISSING_KEY"]);
    expect(Object.keys(scope.env)).toEqual(["APP_HOST"]);
  });

  it("defaults to non-readonly", () => {
    const scope = createScope(base, ["APP_HOST"]);
    expect(scope.readonly).toBe(false);
  });

  it("respects the readonly flag", () => {
    const scope = createScope(base, ["APP_HOST"], true);
    expect(scope.readonly).toBe(true);
  });
});

describe("scopeGet", () => {
  it("returns the value for a key in scope", () => {
    const scope = createScope(base, ["APP_HOST"]);
    expect(scopeGet(scope, "APP_HOST")).toBe("localhost");
  });

  it("returns undefined for a key not in scope", () => {
    const scope = createScope(base, ["APP_HOST"]);
    expect(scopeGet(scope, "DB_URL")).toBeUndefined();
  });
});

describe("scopeSet", () => {
  it("sets a value for an in-scope key", () => {
    const scope = createScope(base, ["APP_PORT"]);
    scopeSet(scope, "APP_PORT", "8080");
    expect(scope.env["APP_PORT"]).toBe("8080");
  });

  it("throws when setting on a readonly scope", () => {
    const scope = createScope(base, ["APP_PORT"], true);
    expect(() => scopeSet(scope, "APP_PORT", "8080")).toThrow(/readonly/);
  });

  it("throws when key is not in scope", () => {
    const scope = createScope(base, ["APP_HOST"]);
    expect(() => scopeSet(scope, "DB_URL", "x")).toThrow(/not in scope/);
  });
});

describe("scopeDelete", () => {
  it("removes a key from the scope", () => {
    const scope = createScope(base, ["APP_HOST", "APP_PORT"]);
    scopeDelete(scope, "APP_PORT");
    expect(inScope(scope, "APP_PORT")).toBe(false);
  });

  it("throws when deleting from a readonly scope", () => {
    const scope = createScope(base, ["APP_HOST"], true);
    expect(() => scopeDelete(scope, "APP_HOST")).toThrow(/readonly/);
  });
});

describe("mergeScope", () => {
  it("merges scope env back into base", () => {
    const scope = createScope(base, ["APP_PORT"]);
    scopeSet(scope, "APP_PORT", "9090");
    const merged = mergeScope(base, scope);
    expect(merged["APP_PORT"]).toBe("9090");
    expect(merged["DB_URL"]).toBe("postgres://localhost/dev");
  });
});

describe("listScopeKeys", () => {
  it("returns all keys in the scope", () => {
    const scope = createScope(base, ["APP_HOST", "APP_PORT"]);
    expect(listScopeKeys(scope).sort()).toEqual(["APP_HOST", "APP_PORT"]);
  });
});

describe("cloneScope", () => {
  it("clones the scope with the same readonly flag", () => {
    const scope = createScope(base, ["APP_HOST"], true);
    const clone = cloneScope(scope);
    expect(clone.readonly).toBe(true);
    expect(clone.env).toEqual(scope.env);
  });

  it("allows overriding the readonly flag", () => {
    const scope = createScope(base, ["APP_HOST"], true);
    const clone = cloneScope(scope, false);
    expect(clone.readonly).toBe(false);
  });

  it("produces an independent copy", () => {
    const scope = createScope(base, ["APP_HOST"]);
    const clone = cloneScope(scope);
    scopeSet(clone, "APP_HOST", "changed");
    expect(scope.env["APP_HOST"]).toBe("localhost");
  });
});
