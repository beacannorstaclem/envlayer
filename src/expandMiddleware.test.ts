import { createExpandMiddleware, expandEnv } from "./expandMiddleware";

const identity = (env: Record<string, string>) => env;

describe("createExpandMiddleware", () => {
  it("expands references before passing to next", () => {
    const mw = createExpandMiddleware({ fallback: false });
    const env = { BASE: "/srv", DATA: "${BASE}/data" };
    const result = mw(env, identity);
    expect(result.DATA).toBe("/srv/data");
  });

  it("does not mutate original env by default", () => {
    const mw = createExpandMiddleware({ fallback: false });
    const env = { A: "$B", B: "hello" };
    mw(env, identity);
    expect(env.A).toBe("$B"); // original untouched
  });

  it("mutates env when mutate=true", () => {
    const mw = createExpandMiddleware({ fallback: false, mutate: true });
    const env = { A: "$B", B: "hello" };
    mw(env, identity);
    expect(env.A).toBe("hello");
  });

  it("calls next with expanded env", () => {
    const mw = createExpandMiddleware({ fallback: false });
    const seen: Record<string, string>[] = [];
    const capture = (e: Record<string, string>) => { seen.push(e); return e; };
    mw({ X: "$Y", Y: "val" }, capture);
    expect(seen[0].X).toBe("val");
  });

  it("resolves chained refs with maxPasses", () => {
    const mw = createExpandMiddleware({ fallback: false, maxPasses: 3 });
    const env = { A: "$B", B: "$C", C: "deep" };
    const result = mw(env, identity);
    expect(result.A).toBe("deep");
  });

  it("falls back to process.env when fallback=true", () => {
    process.env._MW_TEST = "fromprocess";
    const mw = createExpandMiddleware({ fallback: true });
    const result = mw({ VAL: "$_MW_TEST" }, identity);
    expect(result.VAL).toBe("fromprocess");
    delete process.env._MW_TEST;
  });
});

describe("expandEnv", () => {
  it("is a convenience wrapper that returns expanded map", () => {
    const result = expandEnv({ HOST: "localhost", URL: "http://$HOST:3000" }, { fallback: false });
    expect(result.URL).toBe("http://localhost:3000");
  });

  it("uses process.env fallback by default", () => {
    process.env._EE_TEST = "yes";
    const result = expandEnv({ FLAG: "$_EE_TEST" });
    expect(result.FLAG).toBe("yes");
    delete process.env._EE_TEST;
  });
});
