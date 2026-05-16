import {
  filterEnv,
  filterByPattern,
  filterByAllowlist,
  filterByDenylist,
  filterByValue,
  filterNonEmpty,
  composeFilters,
} from "./envFilter";
import {
  createPatternFilterMiddleware,
  createAllowlistMiddleware,
  createDenylistMiddleware,
  createNonEmptyFilterMiddleware,
  createPredicateFilterMiddleware,
} from "./envFilterMiddleware";

const sample: Record<string, string> = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  APP_NAME: "envlayer",
  APP_ENV: "test",
  SECRET_KEY: "abc123",
  EMPTY_VAR: "",
};

const identity = <T>(x: T) => x;

describe("filterEnv", () => {
  it("filters by predicate", () => {
    const result = filterEnv(sample, (k) => k.startsWith("DB_"));
    expect(Object.keys(result)).toEqual(["DB_HOST", "DB_PORT"]);
  });
});

describe("filterByPattern", () => {
  it("matches regex against keys", () => {
    const result = filterByPattern(sample, /^APP_/);
    expect(result).toMatchObject({ APP_NAME: "envlayer", APP_ENV: "test" });
    expect(result).not.toHaveProperty("DB_HOST");
  });
});

describe("filterByAllowlist", () => {
  it("keeps only allowed keys", () => {
    const result = filterByAllowlist(sample, ["DB_HOST", "SECRET_KEY"]);
    expect(Object.keys(result)).toEqual(["DB_HOST", "SECRET_KEY"]);
  });

  it("returns empty object when allowlist is empty", () => {
    expect(filterByAllowlist(sample, [])).toEqual({});
  });
});

describe("filterByDenylist", () => {
  it("excludes denied keys", () => {
    const result = filterByDenylist(sample, ["SECRET_KEY", "EMPTY_VAR"]);
    expect(result).not.toHaveProperty("SECRET_KEY");
    expect(result).not.toHaveProperty("EMPTY_VAR");
    expect(result).toHaveProperty("DB_HOST");
  });
});

describe("filterByValue", () => {
  it("filters entries by value predicate", () => {
    const result = filterByValue(sample, (v) => v.includes("5432"));
    expect(result).toEqual({ DB_PORT: "5432" });
  });
});

describe("filterNonEmpty", () => {
  it("removes empty string values", () => {
    const result = filterNonEmpty(sample);
    expect(result).not.toHaveProperty("EMPTY_VAR");
    expect(Object.keys(result).length).toBe(5);
  });
});

describe("composeFilters", () => {
  it("applies all predicates with AND logic", () => {
    const pred = composeFilters(
      (k) => k.startsWith("DB_"),
      (_k, v) => v.length > 4
    );
    const result = filterEnv(sample, pred);
    expect(result).toEqual({ DB_HOST: "localhost" });
  });
});

describe("filter middlewares", () => {
  const makeReq = () => ({ env: { ...sample } });

  it("createPatternFilterMiddleware filters by pattern", () => {
    const mw = createPatternFilterMiddleware(/^DB_/);
    const result = mw(makeReq(), identity);
    expect(Object.keys(result.env)).toEqual(["DB_HOST", "DB_PORT"]);
  });

  it("createAllowlistMiddleware keeps allowed keys", () => {
    const mw = createAllowlistMiddleware(["APP_NAME"]);
    const result = mw(makeReq(), identity);
    expect(result.env).toEqual({ APP_NAME: "envlayer" });
  });

  it("createDenylistMiddleware removes denied keys", () => {
    const mw = createDenylistMiddleware(["SECRET_KEY"]);
    const result = mw(makeReq(), identity);
    expect(result.env).not.toHaveProperty("SECRET_KEY");
  });

  it("createNonEmptyFilterMiddleware strips empty values", () => {
    const mw = createNonEmptyFilterMiddleware();
    const result = mw(makeReq(), identity);
    expect(result.env).not.toHaveProperty("EMPTY_VAR");
  });

  it("createPredicateFilterMiddleware applies composed predicates", () => {
    const mw = createPredicateFilterMiddleware(
      (k) => k.startsWith("APP_"),
      (_k, v) => v !== "test"
    );
    const result = mw(makeReq(), identity);
    expect(result.env).toEqual({ APP_NAME: "envlayer" });
  });
});
