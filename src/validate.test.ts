import { describe, it, expect } from "vitest";
import { validateEnv, assertEnv, ValidationSchema } from "./validate";

const schema: ValidationSchema = {
  PORT: { required: true, pattern: /^\d+$/ },
  NODE_ENV: { required: true, oneOf: ["development", "production", "test"] },
  API_KEY: { required: false, validator: (v) => v.length >= 8 || "API_KEY must be at least 8 chars" },
  LOG_LEVEL: { oneOf: ["debug", "info", "warn", "error"] },
};

describe("validateEnv", () => {
  it("returns valid for a correct env", () => {
    const result = validateEnv(
      { PORT: "3000", NODE_ENV: "production", API_KEY: "supersecret" },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("reports missing required keys", () => {
    const result = validateEnv({}, schema);
    const keys = result.errors.map((e) => e.key);
    expect(keys).toContain("PORT");
    expect(keys).toContain("NODE_ENV");
  });

  it("reports pattern mismatch", () => {
    const result = validateEnv({ PORT: "abc", NODE_ENV: "test" }, schema);
    expect(result.errors.some((e) => e.key === "PORT")).toBe(true);
  });

  it("reports oneOf violation", () => {
    const result = validateEnv({ PORT: "3000", NODE_ENV: "staging" }, schema);
    expect(result.errors.some((e) => e.key === "NODE_ENV")).toBe(true);
  });

  it("reports custom validator failure", () => {
    const result = validateEnv({ PORT: "3000", NODE_ENV: "test", API_KEY: "short" }, schema);
    expect(result.errors.some((e) => e.key === "API_KEY")).toBe(true);
    expect(result.errors.find((e) => e.key === "API_KEY")?.message).toContain("8 chars");
  });

  it("skips optional missing keys", () => {
    const result = validateEnv({ PORT: "8080", NODE_ENV: "development" }, schema);
    expect(result.valid).toBe(true);
  });

  it("validates LOG_LEVEL oneOf when present", () => {
    const result = validateEnv(
      { PORT: "3000", NODE_ENV: "test", LOG_LEVEL: "verbose" },
      schema
    );
    expect(result.errors.some((e) => e.key === "LOG_LEVEL")).toBe(true);
  });

  it("accepts valid LOG_LEVEL when present", () => {
    const result = validateEnv(
      { PORT: "3000", NODE_ENV: "test", LOG_LEVEL: "debug" },
      schema
    );
    expect(result.errors.some((e) => e.key === "LOG_LEVEL")).toBe(false);
    expect(result.valid).toBe(true);
  });

  it("accumulates multiple errors at once", () => {
    const result = validateEnv({ PORT: "abc", NODE_ENV: "staging", API_KEY: "x" }, schema);
    const keys = result.errors.map((e) => e.key);
    expect(keys).toContain("PORT");
    expect(keys).toContain("NODE_ENV");
    expect(keys).toContain("API_KEY");
    expect(result.valid).toBe(false);
  });
});

describe("assertEnv", () => {
  it("does not throw for valid env", () => {
    expect(() =>
      assertEnv({ PORT: "3000", NODE_ENV: "test" }, schema)
    ).not.toThrow();
  });

  it("throws with all error messages on invalid env", () => {
    expect(() => assertEnv({}, schema)).toThrowError(/Environment validation failed/);
    expect(() => assertEnv({}, schema)).toThrowError(/PORT/);
  });
});
