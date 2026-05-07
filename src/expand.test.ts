import { expandValue, expandAll, expandAllDeep } from "./expand";

describe("expandValue", () => {
  it("replaces $VAR syntax", () => {
    expect(expandValue("hello $NAME", { NAME: "world" })).toBe("hello world");
  });

  it("replaces ${VAR} syntax", () => {
    expect(expandValue("v${MAJOR}.${MINOR}", { MAJOR: "2", MINOR: "0" })).toBe("v2.0");
  });

  it("leaves unresolved refs intact when no fallback match", () => {
    const result = expandValue("$MISSING", {}, false);
    expect(result).toBe("$MISSING");
  });

  it("falls back to process.env when fallback=true", () => {
    process.env._TEST_EXPAND = "injected";
    expect(expandValue("$_TEST_EXPAND", {})).toBe("injected");
    delete process.env._TEST_EXPAND;
  });

  it("does not fall back when fallback=false", () => {
    process.env._TEST_EXPAND2 = "injected";
    const result = expandValue("$_TEST_EXPAND2", {}, false);
    expect(result).toBe("$_TEST_EXPAND2");
    delete process.env._TEST_EXPAND2;
  });

  it("handles mixed resolved and unresolved", () => {
    const result = expandValue("$A-$B", { A: "foo" }, false);
    expect(result).toBe("foo-$B");
  });
});

describe("expandAll", () => {
  it("expands all values in the map", () => {
    const env = { GREETING: "hello", MSG: "$GREETING world" };
    const result = expandAll(env, false);
    expect(result.MSG).toBe("hello world");
    expect(result.GREETING).toBe("hello");
  });

  it("returns a new object and does not mutate input", () => {
    const env = { A: "$B", B: "val" };
    const result = expandAll(env, false);
    expect(env.A).toBe("$B");
    expect(result.A).toBe("val");
  });
});

describe("expandAllDeep", () => {
  it("resolves chained references", () => {
    const env = { A: "$B", B: "$C", C: "final" };
    const result = expandAllDeep(env, false);
    expect(result.A).toBe("final");
    expect(result.B).toBe("final");
  });

  it("stops after maxPasses and leaves circular refs as-is", () => {
    const env = { X: "$Y", Y: "$X" };
    const result = expandAllDeep(env, false, 3);
    // circular — should not throw and values stay unresolved
    expect(result.X).toBe("$Y");
  });

  it("single-level references resolve in one pass", () => {
    const env = { BASE: "/app", LOGS: "${BASE}/logs" };
    const result = expandAllDeep(env, false);
    expect(result.LOGS).toBe("/app/logs");
  });
});
