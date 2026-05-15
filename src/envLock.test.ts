import {
  lockKeys,
  unlockKeys,
  isLocked,
  getLockedKeys,
  clearLocks,
  applyWithLocks,
  deleteWithLocks,
  assertUnlocked,
} from "./envLock";

beforeEach(() => {
  clearLocks();
});

describe("lockKeys / isLocked", () => {
  it("marks keys as locked", () => {
    lockKeys(["API_KEY", "DB_URL"]);
    expect(isLocked("API_KEY")).toBe(true);
    expect(isLocked("DB_URL")).toBe(true);
    expect(isLocked("OTHER")).toBe(false);
  });
});

describe("unlockKeys", () => {
  it("removes lock from keys", () => {
    lockKeys(["API_KEY"]);
    unlockKeys(["API_KEY"]);
    expect(isLocked("API_KEY")).toBe(false);
  });
});

describe("getLockedKeys", () => {
  it("returns all currently locked keys", () => {
    lockKeys(["A", "B", "C"]);
    const locked = getLockedKeys();
    expect(locked).toEqual(expect.arrayContaining(["A", "B", "C"]));
    expect(locked).toHaveLength(3);
  });
});

describe("clearLocks", () => {
  it("removes all locks", () => {
    lockKeys(["X", "Y"]);
    clearLocks();
    expect(getLockedKeys()).toHaveLength(0);
  });
});

describe("applyWithLocks", () => {
  it("applies patch values for unlocked keys", () => {
    const base = { FOO: "old", BAR: "old" };
    const result = applyWithLocks(base, { FOO: "new", BAR: "new" });
    expect(result).toEqual({ FOO: "new", BAR: "new" });
  });

  it("skips locked keys in patch", () => {
    lockKeys(["FOO"]);
    const base = { FOO: "original", BAR: "old" };
    const result = applyWithLocks(base, { FOO: "new", BAR: "new" });
    expect(result.FOO).toBe("original");
    expect(result.BAR).toBe("new");
  });

  it("does not mutate the base map", () => {
    const base = { FOO: "original" };
    applyWithLocks(base, { FOO: "new" });
    expect(base.FOO).toBe("original");
  });
});

describe("deleteWithLocks", () => {
  it("deletes unlocked keys", () => {
    const base = { A: "1", B: "2" };
    const result = deleteWithLocks(base, ["A"]);
    expect(result).not.toHaveProperty("A");
    expect(result.B).toBe("2");
  });

  it("preserves locked keys when deleting", () => {
    lockKeys(["A"]);
    const base = { A: "1", B: "2" };
    const result = deleteWithLocks(base, ["A", "B"]);
    expect(result.A).toBe("1");
    expect(result).not.toHaveProperty("B");
  });
});

describe("assertUnlocked", () => {
  it("does not throw for unlocked keys", () => {
    expect(() => assertUnlocked("SAFE_KEY")).not.toThrow();
  });

  it("throws for locked keys", () => {
    lockKeys(["SECRET"]);
    expect(() => assertUnlocked("SECRET")).toThrow(
      /key "SECRET" is locked/
    );
  });
});
