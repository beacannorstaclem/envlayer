import {
  resolveAliases,
  stripAliases,
  listActiveAliases,
  invertAliasMap,
  deprecationWarnings,
  AliasMap,
} from "./envAlias";
import { createAliasMiddleware, AliasEnvRequest } from "./envAliasMiddleware";

const aliases: AliasMap = {
  OLD_DB_URL: "DATABASE_URL",
  LEGACY_PORT: "PORT",
};

describe("resolveAliases", () => {
  it("copies alias value to canonical key when canonical is absent", () => {
    const env = { OLD_DB_URL: "postgres://localhost/db" };
    const result = resolveAliases(env, aliases);
    expect(result["DATABASE_URL"]).toBe("postgres://localhost/db");
    expect(result["OLD_DB_URL"]).toBe("postgres://localhost/db");
  });

  it("does not overwrite existing canonical key", () => {
    const env = { OLD_DB_URL: "old", DATABASE_URL: "new" };
    const result = resolveAliases(env, aliases);
    expect(result["DATABASE_URL"]).toBe("new");
  });

  it("leaves unrelated keys untouched", () => {
    const env = { APP_NAME: "myapp" };
    const result = resolveAliases(env, aliases);
    expect(result["APP_NAME"]).toBe("myapp");
  });
});

describe("stripAliases", () => {
  it("removes alias keys from env", () => {
    const env = { OLD_DB_URL: "x", DATABASE_URL: "y", PORT: "3000" };
    const result = stripAliases(env, aliases);
    expect("OLD_DB_URL" in result).toBe(false);
    expect(result["DATABASE_URL"]).toBe("y");
  });
});

describe("listActiveAliases", () => {
  it("returns alias keys present in env", () => {
    const env = { OLD_DB_URL: "x", APP: "1" };
    expect(listActiveAliases(env, aliases)).toEqual(["OLD_DB_URL"]);
  });

  it("returns empty array when no aliases present", () => {
    expect(listActiveAliases({}, aliases)).toEqual([]);
  });
});

describe("invertAliasMap", () => {
  it("inverts alias map correctly", () => {
    const inv = invertAliasMap(aliases);
    expect(inv["DATABASE_URL"]).toContain("OLD_DB_URL");
    expect(inv["PORT"]).toContain("LEGACY_PORT");
  });
});

describe("deprecationWarnings", () => {
  it("returns warning strings for active aliases", () => {
    const env = { OLD_DB_URL: "x" };
    const warnings = deprecationWarnings(env, aliases);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/OLD_DB_URL/);
    expect(warnings[0]).toMatch(/DATABASE_URL/);
  });
});

describe("createAliasMiddleware", () => {
  it("resolves aliases on req.env", () => {
    const mw = createAliasMiddleware(aliases);
    const req: AliasEnvRequest = { env: { OLD_DB_URL: "postgres://x" } };
    mw(req, {}, (err) => expect(err).toBeUndefined());
    expect(req.env["DATABASE_URL"]).toBe("postgres://x");
  });

  it("strips aliases when strip option is true", () => {
    const mw = createAliasMiddleware(aliases, { strip: true });
    const req: AliasEnvRequest = { env: { OLD_DB_URL: "x" } };
    mw(req, {}, () => {});
    expect("OLD_DB_URL" in req.env).toBe(false);
    expect(req.env["DATABASE_URL"]).toBe("x");
  });

  it("calls next with error on failure", () => {
    const mw = createAliasMiddleware(null as unknown as AliasMap);
    const req: AliasEnvRequest = { env: {} };
    let caught: unknown;
    mw(req, {}, (err) => { caught = err; });
    expect(caught).toBeDefined();
  });
});
