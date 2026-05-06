import { describe, it, expect } from "vitest";
import {
  shouldRedact,
  redactValue,
  redactEnv,
  redactKeys,
} from "./redact";

describe("shouldRedact", () => {
  it("returns true for keys matching default patterns", () => {
    expect(shouldRedact("DB_PASSWORD")).toBe(true);
    expect(shouldRedact("API_KEY")).toBe(true);
    expect(shouldRedact("AUTH_TOKEN")).toBe(true);
    expect(shouldRedact("PRIVATE_KEY")).toBe(true);
  });

  it("returns false for non-sensitive keys", () => {
    expect(shouldRedact("PORT")).toBe(false);
    expect(shouldRedact("NODE_ENV")).toBe(false);
    expect(shouldRedact("APP_NAME")).toBe(false);
  });

  it("returns true for explicitly listed keys", () => {
    expect(shouldRedact("MY_CUSTOM_KEY", ["MY_CUSTOM_KEY"])).toBe(true);
  });

  it("is case-insensitive for explicit keys", () => {
    expect(shouldRedact("my_custom_key", ["MY_CUSTOM_KEY"])).toBe(true);
  });
});

describe("redactValue", () => {
  it("replaces sensitive value with placeholder", () => {
    expect(redactValue("DB_PASSWORD", "supersecret")).toBe("[REDACTED]");
  });

  it("uses custom placeholder", () => {
    expect(redactValue("API_KEY", "abc123", { placeholder: "***" })).toBe("***");
  });

  it("leaves non-sensitive values untouched", () => {
    expect(redactValue("PORT", "3000")).toBe("3000");
  });
});

describe("redactEnv", () => {
  const env = {
    PORT: "3000",
    DB_PASSWORD: "secret",
    API_KEY: "key123",
    NODE_ENV: "production",
  };

  it("redacts sensitive keys and leaves others", () => {
    const result = redactEnv(env);
    expect(result.PORT).toBe("3000");
    expect(result.NODE_ENV).toBe("production");
    expect(result.DB_PASSWORD).toBe("[REDACTED]");
    expect(result.API_KEY).toBe("[REDACTED]");
  });

  it("supports custom placeholder", () => {
    const result = redactEnv(env, { placeholder: "<hidden>" });
    expect(result.DB_PASSWORD).toBe("<hidden>");
  });
});

describe("redactKeys", () => {
  it("redacts only explicitly listed keys", () => {
    const env = { FOO: "bar", BAZ: "qux", DB_PASSWORD: "secret" };
    const result = redactKeys(env, ["FOO"]);
    expect(result.FOO).toBe("[REDACTED]");
    expect(result.BAZ).toBe("qux");
    // DB_PASSWORD not in explicit keys list and patterns disabled
    expect(result.DB_PASSWORD).toBe("secret");
  });
});
