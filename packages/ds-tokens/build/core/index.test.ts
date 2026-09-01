import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deepMerge,
  extractTokenPaths,
  formatCSSBlock,
  generateBanner,
  logSummary,
  readTokenFile,
  tokenPathToCSSVar,
  writeOutputFile,
} from "./index.js";

const tempDirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function tempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tokens-core-"));
  tempDirs.push(dir);
  return dir;
}

describe("tokenPathToCSSVar", () => {
  it("prefixes semantic namespaces", () => {
    expect(tokenPathToCSSVar("semantic.color.foreground.primary")).toBe(
      "--fsds-semantic-color-foreground-primary",
    );
  });

  it("prefixes core namespaces for recognized core patterns", () => {
    expect(tokenPathToCSSVar("color.palette.cobalt.500")).toBe(
      "--fsds-core-color-palette-cobalt-500",
    );
    expect(tokenPathToCSSVar("spacing.size.sm")).toBe(
      "--fsds-core-spacing-size-sm",
    );
    expect(tokenPathToCSSVar("elevation.level.1")).toBe(
      "--fsds-core-elevation-level-1",
    );
    expect(tokenPathToCSSVar("shape.radius.md")).toBe(
      "--fsds-core-shape-radius-md",
    );
    expect(tokenPathToCSSVar("motion.duration.fast")).toBe(
      "--fsds-core-motion-duration-fast",
    );
  });

  it("keeps already-prefixed paths in their namespace", () => {
    expect(tokenPathToCSSVar("core.color.palette.cobalt.500")).toBe(
      "--fsds-core-color-palette-cobalt-500",
    );
    expect(tokenPathToCSSVar("semantic.color.text.primary")).toBe(
      "--fsds-semantic-color-text-primary",
    );
  });

  it("emits unknown namespaces without a namespace prefix", () => {
    expect(tokenPathToCSSVar("brand.accent")).toBe("--fsds-brand-accent");
    expect(tokenPathToCSSVar("custom.app.token")).toBe(
      "--fsds-custom-app-token",
    );
  });
});

describe("extractTokenPaths", () => {
  it("collects leaf token paths and skips $ metadata", () => {
    const tree = {
      $schema: "https://example.com/schema",
      color: {
        primary: { $value: "#000000" },
        scale: {
          blue: { $value: "#0000ff" },
          gray: { 500: { $value: "#808080" } },
        },
      },
    };

    expect(extractTokenPaths(tree)).toEqual([
      "color.primary",
      "color.scale.blue",
      "color.scale.gray.500",
    ]);
  });

  it("returns an empty list for a token-less tree", () => {
    expect(extractTokenPaths({ a: { b: { c: {} } } })).toEqual([]);
  });
});

describe("deepMerge", () => {
  it("merges nested objects recursively", () => {
    const target = { a: { x: 1, y: 2 }, b: "keep" };
    const source = { a: { y: 20, z: 3 }, c: true };

    expect(deepMerge(target, source)).toEqual({
      a: { x: 1, y: 20, z: 3 },
      b: "keep",
      c: true,
    });
  });

  it("replaces scalars and arrays instead of merging them", () => {
    const target = { list: [1, 2], scalar: 1 };
    const source = { list: [3], scalar: 2 };
    expect(deepMerge(target, source)).toEqual({ list: [3], scalar: 2 });
  });

  it("returns the target when the source is nullish", () => {
    const target = { a: 1 };
    expect(deepMerge(target, undefined as never)).toBe(target);
  });

  it("overwrites a target scalar with a source object", () => {
    expect(deepMerge({ a: 1 }, { a: { b: 2 } })).toEqual({ a: { b: 2 } });
  });
});

describe("formatCSSBlock", () => {
  it("renders indented declarations", () => {
    expect(
      formatCSSBlock(":root", { "--a": "1px", "--b": "2px" }),
    ).toBe(":root {\n  --a: 1px;\n  --b: 2px;\n}");
  });

  it("renders an empty block with no properties", () => {
    expect(formatCSSBlock(".x", {})).toBe(".x {\n\n}");
  });
});

describe("generateBanner", () => {
  it("includes the source path when provided", () => {
    expect(generateBanner("/some/abs/path/tokens.json")).toContain(
      "AUTO-GENERATED: Do not edit directly.",
    );
    expect(generateBanner()).not.toContain("Source:");
  });
});

describe("readTokenFile", () => {
  it("returns null and warns for a missing file", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(readTokenFile("/nonexistent/tokens.json")).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
  });

  it("loads a valid JSON file", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const dir = tempDir();
    const file = path.join(dir, "tokens.json");
    fs.writeFileSync(file, JSON.stringify({ color: { primary: { $value: "#000" } } }));

    expect(readTokenFile(file)).toEqual({
      color: { primary: { $value: "#000" } },
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Loaded:"));
  });

  it("reports a JSON parse error and returns null", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = tempDir();
    const file = path.join(dir, "bad.json");
    fs.writeFileSync(file, "{ not json");

    expect(readTokenFile(file)).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("JSON parse error"),
    );
  });
});

describe("writeOutputFile", () => {
  it("creates missing directories and writes the content", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const dir = tempDir();
    const file = path.join(dir, "nested", "deep", "out.css");

    writeOutputFile(file, ":root {}", "CSS variables");

    expect(fs.readFileSync(file, "utf8")).toBe(":root {}");
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Generated:"));
  });

  it("rethrows write failures after logging", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = tempDir();
    const file = path.join(dir, "blocked");
    fs.writeFileSync(file, "occupied");

    expect(() => writeOutputFile(path.join(file, "child.css"), "x")).toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("logSummary", () => {
  it("logs only the provided stat lines", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logSummary({ totalTokens: 10, generatedFiles: 2 });
    const text = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(text).toContain("Total tokens: 10");
    expect(text).toContain("Generated files: 2");
    expect(text).not.toContain("Referenced tokens");

    logSummary({ errors: 3 });
    const second = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(second).toContain("Errors: 3");
  });

  it("omits the errors line for zero errors", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    logSummary({ errors: 0 });
    const text = logSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(text).not.toContain("Errors:");
  });
});
