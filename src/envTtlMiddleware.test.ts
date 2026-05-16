import { createTtlMiddleware, TtlEnvRequest } from "./envTtlMiddleware";
import { setWithTtl, clearTtl } from "./envTtl";

function makeReq(env: Record<string, string> = {}): TtlEnvRequest {
  return { env: { ...env } };
}

beforeEach(() => clearTtl());

describe("createTtlMiddleware", () => {
  it("overlays active TTL entries onto req.env", async () => {
    setWithTtl("TTL_KEY", "ttl_val", 5000);
    const mw = createTtlMiddleware();
    const req = makeReq({ EXISTING: "existing" });
    await mw(req, async (r) => {
      expect(r.env["TTL_KEY"]).toBe("ttl_val");
      expect(r.env["EXISTING"]).toBe("existing");
    });
  });

  it("does not overwrite existing keys by default", async () => {
    setWithTtl("KEY", "ttl", 5000);
    const mw = createTtlMiddleware();
    const req = makeReq({ KEY: "original" });
    await mw(req, async (r) => {
      expect(r.env["KEY"]).toBe("original");
    });
  });

  it("overwrites existing keys when overwrite=true", async () => {
    setWithTtl("KEY", "ttl", 5000);
    const mw = createTtlMiddleware({ overwrite: true });
    const req = makeReq({ KEY: "original" });
    await mw(req, async (r) => {
      expect(r.env["KEY"]).toBe("ttl");
    });
  });

  it("excludes expired keys", async () => {
    setWithTtl("EXP", "gone", 10);
    await new Promise((r) => setTimeout(r, 30));
    const mw = createTtlMiddleware();
    const req = makeReq({});
    await mw(req, async (r) => {
      expect(r.env["EXP"]).toBeUndefined();
    });
  });

  it("calls next with updated req", async () => {
    const mw = createTtlMiddleware();
    const req = makeReq({});
    let called = false;
    await mw(req, async () => {
      called = true;
    });
    expect(called).toBe(true);
  });
});
