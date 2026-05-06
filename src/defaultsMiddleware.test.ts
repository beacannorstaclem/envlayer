import {
  createDefaultsMiddleware,
  composeMiddleware,
  EnvRequest,
  EnvResponse,
} from "./defaultsMiddleware";

const mockRes: EnvResponse = {};

function makeReq(env: Record<string, string> = {}): EnvRequest {
  return { env };
}

describe("createDefaultsMiddleware", () => {
  it("applies missing defaults to req.env", (done) => {
    const mw = createDefaultsMiddleware({ PORT: "3000", HOST: "localhost" });
    const req = makeReq({ HOST: "myhost" });
    mw(req, mockRes, (err) => {
      expect(err).toBeUndefined();
      expect(req.env.PORT).toBe("3000");
      expect(req.env.HOST).toBe("myhost");
      done();
    });
  });

  it("attaches resolvedDefaults list to req", (done) => {
    const mw = createDefaultsMiddleware({ PORT: "3000", DEBUG: "false" });
    const req = makeReq({ PORT: "8080" });
    mw(req, mockRes, (err) => {
      expect(err).toBeUndefined();
      expect(req.resolvedDefaults).toContain("DEBUG");
      expect(req.resolvedDefaults).not.toContain("PORT");
      done();
    });
  });

  it("fills empty string values with defaults", (done) => {
    const mw = createDefaultsMiddleware({ PORT: "3000" });
    const req = makeReq({ PORT: "" });
    mw(req, mockRes, (err) => {
      expect(err).toBeUndefined();
      expect(req.env.PORT).toBe("3000");
      done();
    });
  });

  it("calls next with no error on success", (done) => {
    const mw = createDefaultsMiddleware({});
    const req = makeReq({ A: "1" });
    mw(req, mockRes, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });
});

describe("composeMiddleware", () => {
  it("runs middlewares in order", (done) => {
    const order: number[] = [];
    const mw1 = createDefaultsMiddleware({ A: "1" });
    const mw2 = createDefaultsMiddleware({ B: "2" });
    const tracking = (
      req: EnvRequest,
      _res: EnvResponse,
      next: (e?: Error) => void
    ) => {
      order.push(Object.keys(req.env).length);
      next();
    };
    const composed = composeMiddleware(mw1, mw2, tracking);
    const req = makeReq({});
    composed(req, mockRes, (err) => {
      expect(err).toBeUndefined();
      expect(req.env.A).toBe("1");
      expect(req.env.B).toBe("2");
      expect(order[0]).toBeLessThanOrEqual(order[order.length - 1]);
      done();
    });
  });

  it("stops on error and passes it to next", (done) => {
    const failing = (
      _req: EnvRequest,
      _res: EnvResponse,
      next: (e?: Error) => void
    ) => next(new Error("oops"));
    const shouldNotRun = jest.fn();
    const composed = composeMiddleware(failing, shouldNotRun as any);
    composed(makeReq(), mockRes, (err) => {
      expect(err?.message).toBe("oops");
      expect(shouldNotRun).not.toHaveBeenCalled();
      done();
    });
  });
});
