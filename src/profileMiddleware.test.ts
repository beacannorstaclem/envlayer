import { createProfileMiddleware, ProfileRequest } from "./profileMiddleware";
import { defineProfile, activateProfile, clearProfiles } from "./profile";

beforeEach(() => {
  clearProfiles();
});

function makeReq(overrides: Partial<ProfileRequest> = {}): ProfileRequest {
  return { env: {}, ...overrides };
}

test("injects active profile env into req.env", (done) => {
  defineProfile({ name: "dev", env: { NODE_ENV: "development", PORT: "3000" } });
  activateProfile("dev");
  const mw = createProfileMiddleware();
  const req = makeReq();
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env).toEqual({ NODE_ENV: "development", PORT: "3000" });
    expect(req.profileName).toBe("dev");
    done();
  });
});

test("reads profile from request header", (done) => {
  defineProfile({ name: "staging", env: { NODE_ENV: "staging" } });
  const mw = createProfileMiddleware({ headerName: "x-env-profile" });
  const req = { ...makeReq(), headers: { "x-env-profile": "staging" } };
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env?.NODE_ENV).toBe("staging");
    done();
  });
});

test("uses req.profileName over header", (done) => {
  defineProfile({ name: "prod", env: { NODE_ENV: "production" } });
  defineProfile({ name: "dev", env: { NODE_ENV: "development" } });
  const mw = createProfileMiddleware();
  const req = { ...makeReq(), profileName: "prod", headers: { "x-env-profile": "dev" } };
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env?.NODE_ENV).toBe("production");
    done();
  });
});

test("uses fallback when no profile found", (done) => {
  defineProfile({ name: "default", env: { NODE_ENV: "test" } });
  const mw = createProfileMiddleware({ fallback: "default" });
  const req = makeReq();
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env?.NODE_ENV).toBe("test");
    done();
  });
});

test("calls next without error when no profile and no fallback", (done) => {
  const mw = createProfileMiddleware();
  const req = makeReq();
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env).toEqual({});
    done();
  });
});

test("merge option merges profile env into existing req.env", (done) => {
  defineProfile({ name: "dev", env: { PORT: "4000", DEBUG: "true" } });
  activateProfile("dev");
  const mw = createProfileMiddleware({ merge: true });
  const req = makeReq({ env: { EXISTING: "yes", PORT: "3000" } });
  mw(req, {}, (err) => {
    expect(err).toBeUndefined();
    expect(req.env?.EXISTING).toBe("yes");
    expect(req.env?.PORT).toBe("4000"); // profile overrides
    expect(req.env?.DEBUG).toBe("true");
    done();
  });
});

test("passes error to next when profile resolution fails", (done) => {
  const mw = createProfileMiddleware({ fallback: "nonexistent" });
  const req = makeReq();
  mw(req, {}, (err) => {
    expect(err).toBeDefined();
    done();
  });
});
