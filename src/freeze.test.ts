import {
  freezeEnv,
  isFrozen,
  assertMutable,
  thawEnv,
  extendFrozen,
} from "./freeze";

describe("freezeEnv", () => {
  it("returns a frozen object", () => {
    const frozen = freezeEnv({ KEY: "value" });
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("does not mutate the original object", () => {
    const original: Record<string, string> = { KEY: "value" };
    freezeEnv(original);
    expect(Object.isFrozen(original)).toBe(false);
  });

  it("throws when attempting to mutate the frozen result", () => {
    const frozen = freezeEnv({ KEY: "value" }) as Record<string, string>;
    expect(() => {
      "use strict";
      frozen["KEY"] = "new";
    }).toThrow();
  });
});

describe("isFrozen", () => {
  it("returns true for frozen records", () => {
    const frozen = freezeEnv({ A: "1" });
    expect(isFrozen(frozen as Record<string, string>)).toBe(true);
  });

  it("returns false for plain mutable records", () => {
    expect(isFrozen({ A: "1" })).toBe(false);
  });
});

describe("assertMutable", () => {
  it("throws TypeError when env is frozen", () => {
    const frozen = freezeEnv({ X: "1" }) as Record<string, string>;
    expect(() => assertMutable(frozen, "X")).toThrow(TypeError);
    expect(() => assertMutable(frozen, "X")).toThrow(/frozen/);
  });

  it("does not throw for mutable env", () => {
    expect(() => assertMutable({ X: "1" }, "X")).not.toThrow();
  });
});

describe("thawEnv", () => {
  it("returns a mutable copy of a frozen env", () => {
    const frozen = freezeEnv({ B: "2" });
    const mutable = thawEnv(frozen);
    expect(Object.isFrozen(mutable)).toBe(false);
    mutable["B"] = "changed";
    expect(mutable["B"]).toBe("changed");
  });

  it("does not share reference with the frozen source", () => {
    const frozen = freezeEnv({ C: "3" });
    const mutable = thawEnv(frozen);
    expect(mutable).not.toBe(frozen);
  });
});

describe("extendFrozen", () => {
  it("returns a new frozen env with additional keys", () => {
    const base = freezeEnv({ A: "1" });
    const extended = extendFrozen(base, { B: "2" });
    expect(extended["A"]).toBe("1");
    expect(extended["B"]).toBe("2");
    expect(Object.isFrozen(extended)).toBe(true);
  });

  it("later keys override earlier keys", () => {
    const base = freezeEnv({ A: "old" });
    const extended = extendFrozen(base, { A: "new" });
    expect(extended["A"]).toBe("new");
  });
});
