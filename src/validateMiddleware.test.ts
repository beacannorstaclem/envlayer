import { describe, it, expect } from "vitest";
import {
  withValidation,
  withStrictValidation,
  pickSchemaKeys,
  getInvalidKeys,
} from "./validateMiddleware";
import { ValidationSchema } from "./validate";

const schema: ValidationSchema = {
  HOST: { required: true },
  PORT: { required: true, pattern: /^\d+$/ },
  MODE: { oneOf: ["fast", "slow"] },
};

describe("withValidation", () => {
  it("returns env and valid=true for a correct record", () => {
    const env = { HOST: "localhost", PORT: "4000" };
    const result = withValidation(env, schema);
    expect(result.env).toBe(env);
    expect(result.validation.valid).toBe(true);
  });

  it("returns valid=false with errors for bad record", () => {
    const result = withValidation({ PORT: "abc" }, schema);
    expect(result.validation.valid).toBe(false);
    expect(result.validation.errors.some((e) => e.key === "HOST")).toBe(true);
    expect(result.validation.errors.some((e) => e.key === "PORT")).toBe(true);
  });

  it("preserves original env reference", () => {
    const env = { HOST: "example.com", PORT: "80" };
    const { env: out } = withValidation(env, schema);
    expect(out).toStrictEqual(env);
  });
});

describe("withStrictValidation", () => {
  it("returns env unchanged when valid", () => {
    const env = { HOST: "localhost", PORT: "3000" };
    expect(withStrictValidation(env, schema)).toStrictEqual(env);
  });

  it("throws when invalid", () => {
    expect(() => withStrictValidation({}, schema)).toThrow();
  });
});

describe("pickSchemaKeys", () => {
  it("returns only keys defined in schema", () => {
    const env = { HOST: "h", PORT: "1", EXTRA: "x", DEBUG: "true" };
    const picked = pickSchemaKeys(env, schema);
    expect(Object.keys(picked)).toEqual(expect.arrayContaining(["HOST", "PORT"]));
    expect(picked).not.toHaveProperty("EXTRA");
    expect(picked).not.toHaveProperty("DEBUG");
  });

  it("omits schema keys not present in env", () => {
    const picked = pickSchemaKeys({ HOST: "h" }, schema);
    expect(picked).not.toHaveProperty("PORT");
    expect(picked).not.toHaveProperty("MODE");
  });
});

describe("getInvalidKeys", () => {
  it("returns empty array for valid env", () => {
    expect(getInvalidKeys({ HOST: "h", PORT: "9" }, schema)).toEqual([]);
  });

  it("returns keys that failed validation", () => {
    const keys = getInvalidKeys({ PORT: "notanumber" }, schema);
    expect(keys).toContain("HOST");
    expect(keys).toContain("PORT");
  });

  it("reports oneOf violation key", () => {
    const keys = getInvalidKeys({ HOST: "h", PORT: "1", MODE: "turbo" }, schema);
    expect(keys).toContain("MODE");
  });
});
