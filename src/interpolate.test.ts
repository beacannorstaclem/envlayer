import { describe, it, expect } from "vitest";
import { interpolate, interpolateAll } from "./interpolate";

describe("interpolate", () => {
  it("returns plain strings unchanged", () => {
    expect(interpolate("hello world", {})).toBe("hello world");
  });

  it("resolves ${VAR} syntax", () => {
    const env = { HOST: "localhost", PORT: "5432" };
    expect(interpolate("${HOST}:${PORT}", env)).toBe("localhost:5432");
  });

  it("resolves $VAR bare syntax", () => {
    const env = { NAME: "envlayer" };
    expect(interpolate("Hello $NAME!", env)).toBe("Hello envlayer!");
  });

  it("returns empty string for undefined references", () => {
    expect(interpolate("${MISSING}", {})).toBe("");
  });

  it("resolves nested references", () => {
    const env = { BASE: "http://localhost", URL: "${BASE}/api" };
    expect(interpolate("${URL}/users", env)).toBe("http://localhost/api/users");
  });

  it("throws on circular references", () => {
    const env = { A: "${B}", B: "${A}" };
    expect(() => interpolate("${A}", env)).toThrow(
      "Circular reference detected for variable: A"
    );
  });

  it("handles mixed brace and bare syntax", () => {
    const env = { PROTO: "https", HOST: "example.com" };
    expect(interpolate("${PROTO}://$HOST", env)).toBe(
      "https://example.com"
    );
  });
});

describe("interpolateAll", () => {
  it("interpolates all values in the map", () => {
    const env = {
      HOST: "localhost",
      PORT: "3000",
      BASE_URL: "http://${HOST}:${PORT}",
      API_URL: "${BASE_URL}/api",
    };
    const result = interpolateAll(env);
    expect(result.BASE_URL).toBe("http://localhost:3000");
    expect(result.API_URL).toBe("http://localhost:3000/api");
  });

  it("does not mutate the original env map", () => {
    const env = { A: "${B}", B: "world" };
    const result = interpolateAll(env);
    expect(env.A).toBe("${B}");
    expect(result.A).toBe("world");
  });

  it("returns empty map for empty input", () => {
    expect(interpolateAll({})).toEqual({});
  });
});
