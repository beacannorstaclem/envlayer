import {
  setWithTtl,
  getWithTtl,
  hasActiveTtl,
  deleteTtl,
  purgeExpired,
  clearTtl,
  activeTtlSnapshot,
} from "./envTtl";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

beforeEach(() => clearTtl());

describe("setWithTtl / getWithTtl", () => {
  it("returns value before expiry", () => {
    setWithTtl("KEY", "value", 5000);
    expect(getWithTtl("KEY")).toBe("value");
  });

  it("returns undefined for unknown key", () => {
    expect(getWithTtl("MISSING")).toBeUndefined();
  });

  it("returns undefined after expiry", async () => {
    setWithTtl("EXP", "gone", 20);
    await sleep(30);
    expect(getWithTtl("EXP")).toBeUndefined();
  });
});

describe("hasActiveTtl", () => {
  it("is true for live key", () => {
    setWithTtl("LIVE", "yes", 5000);
    expect(hasActiveTtl("LIVE")).toBe(true);
  });

  it("is false after expiry", async () => {
    setWithTtl("DEAD", "no", 10);
    await sleep(20);
    expect(hasActiveTtl("DEAD")).toBe(false);
  });
});

describe("deleteTtl", () => {
  it("removes an existing key", () => {
    setWithTtl("DEL", "x", 5000);
    expect(deleteTtl("DEL")).toBe(true);
    expect(getWithTtl("DEL")).toBeUndefined();
  });

  it("returns false for missing key", () => {
    expect(deleteTtl("NOPE")).toBe(false);
  });
});

describe("purgeExpired", () => {
  it("removes expired entries and returns their keys", async () => {
    setWithTtl("A", "1", 10);
    setWithTtl("B", "2", 5000);
    await sleep(20);
    const purged = purgeExpired();
    expect(purged).toContain("A");
    expect(purged).not.toContain("B");
    expect(getWithTtl("B")).toBe("2");
  });
});

describe("activeTtlSnapshot", () => {
  it("returns only live entries", async () => {
    setWithTtl("LIVE", "yes", 5000);
    setWithTtl("DEAD", "no", 10);
    await sleep(20);
    const snap = activeTtlSnapshot();
    expect(snap).toEqual({ LIVE: "yes" });
  });
});
