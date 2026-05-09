import {
  tagKey,
  untagKey,
  getTagsForKey,
  getKeysByTag,
  filterByTag,
  listAllTags,
  clearTags,
  snapshotTags,
} from "./envTag";

beforeEach(() => clearTags());

describe("tagKey / getTagsForKey", () => {
  it("assigns tags to a key", () => {
    tagKey("DB_URL", "sensitive", "required");
    expect(getTagsForKey("DB_URL")).toEqual(["sensitive", "required"]);
  });

  it("does not duplicate tags", () => {
    tagKey("DB_URL", "sensitive");
    tagKey("DB_URL", "sensitive");
    expect(getTagsForKey("DB_URL")).toHaveLength(1);
  });

  it("returns empty array for untagged key", () => {
    expect(getTagsForKey("UNKNOWN")).toEqual([]);
  });
});

describe("untagKey", () => {
  it("removes a specific tag", () => {
    tagKey("API_KEY", "sensitive", "optional");
    untagKey("API_KEY", "optional");
    expect(getTagsForKey("API_KEY")).toEqual(["sensitive"]);
  });

  it("removes key entry when all tags removed", () => {
    tagKey("X", "t1");
    untagKey("X", "t1");
    expect(getTagsForKey("X")).toEqual([]);
    expect(snapshotTags()).not.toHaveProperty("X");
  });
});

describe("getKeysByTag", () => {
  it("returns keys matching a tag", () => {
    tagKey("A", "group1");
    tagKey("B", "group1");
    tagKey("C", "group2");
    expect(getKeysByTag("group1").sort()).toEqual(["A", "B"]);
  });
});

describe("filterByTag", () => {
  it("filters env record by tag", () => {
    tagKey("DB_URL", "db");
    tagKey("DB_PASS", "db");
    const env = { DB_URL: "postgres://", DB_PASS: "secret", PORT: "3000" };
    expect(filterByTag(env, "db")).toEqual({
      DB_URL: "postgres://",
      DB_PASS: "secret",
    });
  });
});

describe("listAllTags", () => {
  it("lists all unique tags sorted", () => {
    tagKey("A", "zebra", "apple");
    tagKey("B", "mango");
    expect(listAllTags()).toEqual(["apple", "mango", "zebra"]);
  });
});

describe("snapshotTags", () => {
  it("returns a deep copy", () => {
    tagKey("K", "t");
    const snap = snapshotTags();
    snap["K"].push("extra");
    expect(getTagsForKey("K")).toEqual(["t"]);
  });
});
