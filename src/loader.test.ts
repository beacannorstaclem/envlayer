import { parseEnvFile, loadLayers } from "./loader";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("parseEnvFile", () => {
  it("parses simple key=value pairs", () => {
    const result = parseEnvFile("FOO=bar\nBAZ=qux");
    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  it("ignores blank lines and comments", () => {
    const result = parseEnvFile("# comment\n\nFOO=bar");
    expect(result).toEqual({ FOO: "bar" });
  });

  it("strips double-quoted values", () => {
    const result = parseEnvFile('KEY="hello world"');
    expect(result).toEqual({ KEY: "hello world" });
  });

  it("strips single-quoted values", () => {
    const result = parseEnvFile("KEY='hello world'");
    expect(result).toEqual({ KEY: "hello world" });
  });

  it("strips inline comments from unquoted values", () => {
    const result = parseEnvFile("KEY=value # this is a comment");
    expect(result).toEqual({ KEY: "value" });
  });

  it("handles values with equals signs", () => {
    const result = parseEnvFile("KEY=a=b=c");
    expect(result).toEqual({ KEY: "a=b=c" });
  });

  it("ignores lines without an equals sign", () => {
    const result = parseEnvFile("INVALID_LINE\nFOO=bar");
    expect(result).toEqual({ FOO: "bar" });
  });
});

describe("loadLayers", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "envlayer-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("returns empty array when no files and process.env disabled", () => {
    const layers = loadLayers({ files: [], includeProcessEnv: false });
    expect(layers).toEqual([]);
  });

  it("loads a single .env file as a layer", () => {
    const envFile = path.join(tmpDir, ".env");
    fs.writeFileSync(envFile, "APP_NAME=envlayer\nPORT=3000");
    const layers = loadLayers({ files: [envFile], includeProcessEnv: false });
    expect(layers).toHaveLength(1);
    expect(layers[0]).toEqual({ APP_NAME: "envlayer", PORT: "3000" });
  });

  it("skips files that do not exist", () => {
    const layers = loadLayers({ files: ["/nonexistent/.env"], includeProcessEnv: false });
    expect(layers).toEqual([]);
  });

  it("includes process.env as the last layer when enabled", () => {
    const layers = loadLayers({ files: [], includeProcessEnv: true });
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject(Object.fromEntries(
      Object.entries(process.env).filter(([, v]) => v !== undefined) as [string, string][]
    ));
  });

  it("stacks multiple file layers in order", () => {
    const file1 = path.join(tmpDir, ".env.base");
    const file2 = path.join(tmpDir, ".env.local");
    fs.writeFileSync(file1, "A=1\nB=2");
    fs.writeFileSync(file2, "B=overridden\nC=3");
    const layers = loadLayers({ files: [file1, file2], includeProcessEnv: false });
    expect(layers).toHaveLength(2);
    expect(layers[0]).toEqual({ A: "1", B: "2" });
    expect(layers[1]).toEqual({ B: "overridden", C: "3" });
  });
});
