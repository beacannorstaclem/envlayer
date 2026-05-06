import {
  defineDefaults,
  applyDefaults,
  mergeDefaults,
  resolvedDefaultKeys,
} from "./defaults";

describe("defineDefaults", () => {
  it("returns a copy of the provided map", () => {
    const d = defineDefaults({ PORT: "3000", HOST: "localhost" });
    expect(d).toEqual({ PORT: "3000", HOST: "localhost" });
  });

  it("does not mutate the original", () => {
    const original = { PORT: "3000" };
    const d = defineDefaults(original);
    d.PORT = "9999";
    expect(original.PORT).toBe("3000");
  });
});

describe("applyDefaults", () => {
  it("fills in missing keys", () => {
    const env = { HOST: "myhost" };
    const defaults = { HOST: "localhost", PORT: "3000" };
    const result = applyDefaults(env, defaults);
    expect(result.HOST).toBe("myhost");
    expect(result.PORT).toBe("3000");
  });

  it("fills in empty string values", () => {
    const env = { PORT: "" };
    const defaults = { PORT: "8080" };
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe("8080");
  });

  it("does not overwrite existing non-empty values", () => {
    const env = { PORT: "4000" };
    const defaults = { PORT: "3000" };
    const result = applyDefaults(env, defaults);
    expect(result.PORT).toBe("4000");
  });

  it("does not mutate the original env", () => {
    const env = { HOST: "a" };
    applyDefaults(env, { PORT: "3000" });
    expect((env as any).PORT).toBeUndefined();
  });
});

describe("mergeDefaults", () => {
  it("merges multiple maps with later taking precedence", () => {
    const base = { PORT: "3000", HOST: "localhost" };
    const override = { PORT: "4000", DEBUG: "false" };
    const result = mergeDefaults(base, override);
    expect(result).toEqual({ PORT: "4000", HOST: "localhost", DEBUG: "false" });
  });

  it("handles empty maps", () => {
    expect(mergeDefaults({}, { A: "1" })).toEqual({ A: "1" });
  });
});

describe("resolvedDefaultKeys", () => {
  it("returns keys that would be filled by defaults", () => {
    const env = { HOST: "myhost" };
    const defaults = { HOST: "localhost", PORT: "3000", DEBUG: "false" };
    const keys = resolvedDefaultKeys(env, defaults);
    expect(keys).toContain("PORT");
    expect(keys).toContain("DEBUG");
    expect(keys).not.toContain("HOST");
  });

  it("includes keys with empty string values", () => {
    const env = { PORT: "" };
    const defaults = { PORT: "3000" };
    expect(resolvedDefaultKeys(env, defaults)).toContain("PORT");
  });
});
