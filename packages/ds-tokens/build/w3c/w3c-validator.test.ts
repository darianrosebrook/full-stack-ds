import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatValidationResult,
  getDefaultSchema,
  loadDefaultSchema,
  setDefaultSchema,
  validateDesignTokens,
  validateDesignTokensFromFile,
  type ValidationResult,
} from "./w3c-validator.js";

const tempDirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTokensFile(content: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "w3c-validator-"));
  tempDirs.push(dir);
  const file = path.join(dir, "tokens.json");
  fs.writeFileSync(file, JSON.stringify(content));
  return file;
}

/** Minimal schema: accepts any JSON object. */
const ANY_OBJECT_SCHEMA = { type: "object" } as const;

describe("cold-cache initialization", () => {
  // The no-schema branch requires a cold module-level validator cache and
  // no default schema, so this test must run before any other test in the
  // file sets a schema or compiles a validator.
  it("fails when no schema is available", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = validateDesignTokens({ a: 1 });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: "schema",
        message: "Failed to initialize validator",
      }),
    );
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("setDefaultSchema / getDefaultSchema", () => {
  it("round-trips the schema object", () => {
    setDefaultSchema({ type: "object" });
    expect(getDefaultSchema()).toEqual({ type: "object" });
  });
});

describe("loadDefaultSchema", () => {
  it("returns the schema previously set without importing", async () => {
    setDefaultSchema({ type: "object" });
    expect(await loadDefaultSchema()).toEqual({ type: "object" });
  });
});

describe("validateDesignTokens", () => {
  it("fails when the custom schema cannot compile", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = validateDesignTokens(
      { a: 1 },
      { customSchema: { type: 42 } as unknown as object },
    );

    expect(result.isValid).toBe(false);
    expect(result.errors[0]?.message).toBe("Failed to initialize validator");
    expect(errorSpy).toHaveBeenCalled();
  });

  it("passes an object against the permissive custom schema", () => {
    const result = validateDesignTokens(
      { color: { primary: { $type: "color", $value: "#ffffff" } } },
      { customSchema: ANY_OBJECT_SCHEMA },
    );
    expect(result.isValid).toBe(true);
  });

  it("reports schema violations with the instance path", () => {
    const result = validateDesignTokens(42, {
      customSchema: ANY_OBJECT_SCHEMA,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.type === "schema")).toBe(true);
  });

  it("skips custom validations when disabled", () => {
    const result = validateDesignTokens(
      {
        color: {
          broken: {
            $type: "color",
            $value: { colorSpace: "banana", components: [1, 0, 0] },
          },
        },
      },
      { customSchema: ANY_OBJECT_SCHEMA, customValidations: false },
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("flags an invalid colorSpace and bad component arrays", () => {
    const result = validateDesignTokens(
      {
        color: {
          badSpace: {
            $type: "color",
            $value: { colorSpace: "banana", components: [1, 0, 0] },
          },
          badComponents: {
            $type: "color",
            $value: { colorSpace: "srgb", components: [1] },
          },
        },
      },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes("Invalid colorSpace")),
    ).toBe(true);
    expect(
      result.errors.some((e) => e.message.includes("3-4 numbers")),
    ).toBe(true);
  });

  it("warns about string colors outside CSS/reference syntax", () => {
    const result = validateDesignTokens(
      { color: { odd: { $type: "color", $value: "blanched-almond" } } },
      { customSchema: ANY_OBJECT_SCHEMA },
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "color-format" }),
    );
  });

  it("flags invalid dimension units and non-numeric values", () => {
    const result = validateDesignTokens(
      {
        size: {
          badUnit: { $type: "dimension", $value: { value: 4, unit: "em" } },
          badValue: { $type: "dimension", $value: { value: "4", unit: "px" } },
        },
      },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.isValid).toBe(false);
    expect(
      result.errors.some((e) => e.message.includes('Invalid dimension unit: "em"')),
    ).toBe(true);
    expect(
      result.errors.some((e) => e.message.includes("Dimension value must be a number")),
    ).toBe(true);
  });

  it("warns about unitless dimension strings", () => {
    const result = validateDesignTokens(
      { size: { odd: { $type: "dimension", $value: "large" } } },
      { customSchema: ANY_OBJECT_SCHEMA },
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "dimension-format" }),
    );
  });

  it("warns about nested number values and non-numeric strings", () => {
    const result = validateDesignTokens(
      {
        num: {
          nested: {
            $type: "number",
            $value: { $value: "not-a-number" },
          },
          badString: { $type: "number", $value: "forty-two" },
        },
      },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "nested-value" }),
    );
    expect(
      result.warnings.some((w) => w.type === "number-format"),
    ).toBe(true);
  });

  it("warns about missing $value for unknown token types", () => {
    const result = validateDesignTokens(
      { weird: { custom: { $type: "banana", $value: undefined } } },
      { customSchema: ANY_OBJECT_SCHEMA },
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        type: "missing-value",
        message: 'Token with type "banana" should have a $value property',
      }),
    );
  });

  it("warns about tokens without a $type and root groups", () => {
    const result = validateDesignTokens(
      {
        $type: "group",
        plain: { $value: undefined },
      },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "missing-type" }),
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "naming" }),
    );
  });

  it("detects self-references", () => {
    const result = validateDesignTokens(
      { color: { a: { $type: "color", $value: "{color.a}" } } },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: "circular-reference",
        message: "Token cannot reference itself",
      }),
    );
  });

  it("detects multi-token reference cycles", () => {
    const result = validateDesignTokens(
      {
        color: {
          a: { $type: "color", $value: "{color.b}" },
          b: { $type: "color", $value: "{color.a}" },
        },
      },
      { customSchema: ANY_OBJECT_SCHEMA },
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: "circular-reference",
        message: "Circular reference detected in token chain",
      }),
    );
  });

  it("warns about non-standard types in strict mode", () => {
    setDefaultSchema({ type: "object" }); // no custom-type strings → strict
    const result = validateDesignTokens(
      { x: { opacity: { $type: "opacity", $value: 0.5 } } },
      { customSchema: { type: "object" } },
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "non-standard-type" }),
    );
  });

  it("warns about truly unknown types in permissive mode", () => {
    setDefaultSchema({
      type: "object",
      properties: { opacity: { type: "number" } },
    });
    const result = validateDesignTokens(
      { x: { odd: { $type: "banana", $value: 1 } } },
      { customSchema: { type: "object" } },
    );
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ type: "unknown-type" }),
    );
  });
});

describe("formatValidationResult", () => {
  it("renders the all-valid short form", () => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      tokens: {},
    };
    expect(formatValidationResult(result)).toBe("✅ Design tokens are valid");
  });

  it("renders warnings even when valid", () => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [
        { type: "missing-type", path: "a", message: "needs a $type" },
      ],
      tokens: {},
    };
    const text = formatValidationResult(result);
    expect(text).toContain("1 warning(s)");
    expect(text).toContain("Warning [missing-type] a: needs a $type");
    expect(text).not.toContain("error(s)");
  });

  it("renders errors for invalid results", () => {
    const result: ValidationResult = {
      isValid: false,
      errors: [
        { type: "schema", path: "root", message: "bad shape" },
        { type: "parse", path: "file", message: "bad json" },
      ],
      warnings: [],
      tokens: null,
    };
    const text = formatValidationResult(result);
    expect(text).toContain("2 error(s)");
    expect(text).toContain("Error [schema] root: bad shape");
    expect(text).toContain("Error [parse] file: bad json");
  });
});

describe("validateDesignTokensFromFile", () => {
  it("validates a readable JSON file", async () => {
    const file = writeTokensFile({
      color: { primary: { $type: "color", $value: "#ffffff" } },
    });
    const result = await validateDesignTokensFromFile(file, {
      customSchema: ANY_OBJECT_SCHEMA,
    });
    expect(result.isValid).toBe(true);
    expect(result.tokens).toEqual({
      color: { primary: { $type: "color", $value: "#ffffff" } },
    });
  });

  it("reports a parse error for a missing file", async () => {
    const result = await validateDesignTokensFromFile(
      "/nonexistent/tokens.json",
      { customSchema: ANY_OBJECT_SCHEMA },
    );
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toMatchObject({
      type: "parse",
      path: "file",
    });
  });

  it("reports a parse error for malformed JSON", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "w3c-validator-"));
    tempDirs.push(dir);
    const file = path.join(dir, "bad.json");
    fs.writeFileSync(file, "{ not json");

    const result = await validateDesignTokensFromFile(file);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]?.type).toBe("parse");
  });
});
