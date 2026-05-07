import {
  defineProfile,
  getProfile,
  listProfiles,
  activateProfile,
  getActiveProfileName,
  resolveProfile,
  getActiveProfileEnv,
  removeProfile,
  clearProfiles,
} from "./profile";

beforeEach(() => {
  clearProfiles();
});

test("defineProfile and getProfile", () => {
  defineProfile({ name: "dev", env: { NODE_ENV: "development" } });
  const p = getProfile("dev");
  expect(p).toBeDefined();
  expect(p?.env.NODE_ENV).toBe("development");
});

test("listProfiles returns all registered names", () => {
  defineProfile({ name: "dev", env: {} });
  defineProfile({ name: "prod", env: {} });
  expect(listProfiles()).toEqual(expect.arrayContaining(["dev", "prod"]));
  expect(listProfiles()).toHaveLength(2);
});

test("activateProfile sets active profile", () => {
  defineProfile({ name: "staging", env: { NODE_ENV: "staging" } });
  activateProfile("staging");
  expect(getActiveProfileName()).toBe("staging");
});

test("activateProfile throws for unknown profile", () => {
  expect(() => activateProfile("ghost")).toThrow('Profile "ghost" is not registered.');
});

test("resolveProfile returns env for simple profile", () => {
  defineProfile({ name: "base", env: { APP: "myapp", LOG: "info" } });
  expect(resolveProfile("base")).toEqual({ APP: "myapp", LOG: "info" });
});

test("resolveProfile merges parent via extends", () => {
  defineProfile({ name: "base", env: { APP: "myapp", LOG: "info" } });
  defineProfile({ name: "prod", env: { LOG: "error", DEBUG: "false" }, extends: "base" });
  const resolved = resolveProfile("prod");
  expect(resolved.APP).toBe("myapp");
  expect(resolved.LOG).toBe("error"); // child overrides
  expect(resolved.DEBUG).toBe("false");
});

test("resolveProfile throws for unknown profile", () => {
  expect(() => resolveProfile("nope")).toThrow('Profile "nope" is not registered.');
});

test("getActiveProfileEnv returns resolved env", () => {
  defineProfile({ name: "dev", env: { NODE_ENV: "development" } });
  activateProfile("dev");
  expect(getActiveProfileEnv()).toEqual({ NODE_ENV: "development" });
});

test("getActiveProfileEnv throws when no profile active", () => {
  expect(() => getActiveProfileEnv()).toThrow("No active profile set.");
});

test("removeProfile deletes profile and clears active if needed", () => {
  defineProfile({ name: "dev", env: {} });
  activateProfile("dev");
  removeProfile("dev");
  expect(getProfile("dev")).toBeUndefined();
  expect(getActiveProfileName()).toBeNull();
});
