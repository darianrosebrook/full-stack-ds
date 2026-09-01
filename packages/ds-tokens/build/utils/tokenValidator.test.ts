import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  WCAG_LEVELS,
  extractColorPairsFromTokens,
  generateAccessibilityReport,
  runAccessibilityValidation,
  validateColorPair,
  validateDesignTokens,
  type TokenValidationReport,
} from "./tokenValidator.js";

const tempDirs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function writeTokensFixture(content: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "token-validator-"));
  tempDirs.push(dir);
  const file = path.join(dir, "tokens.json");
  fs.writeFileSync(file, JSON.stringify(content));
  return file;
}

/** All-valid fixture: every pair beats AA_NORMAL with known ratios. */
function allValidTokens() {
  return {
    semantic: {
      color: {
        foreground: {
          primary: "#595959", // 7.0 on white (AAA)
          secondary: "#767676", // ~4.54 on white (AA)
          accent: "#595959",
          onAccent: "#ffffff", // ~6.39 on accent blue (AA)
        },
        background: {
          primary: "#ffffff",
          secondary: "#ffffff",
          elevated: "#ffffff",
          accent: "#0b57d0",
        },
        status: {
          success: "#595959",
          warning: "#595959",
          danger: "#595959",
          info: "#595959",
        },
        border: { subtle: "#767676", primary: "#595959" },
      },
    },
  };
}

describe("WCAG_LEVELS", () => {
  it("pins the WCAG 2.1 ratio constants", () => {
    expect(WCAG_LEVELS.AA_NORMAL).toBe(4.5);
    expect(WCAG_LEVELS.AA_LARGE).toBe(3.0);
    expect(WCAG_LEVELS.AAA_NORMAL).toBe(7.0);
    expect(WCAG_LEVELS.AAA_LARGE).toBe(4.5);
  });
});

describe("validateColorPair", () => {
  it("passes black on white at AA_NORMAL", () => {
    const result = validateColorPair({
      foreground: "#000000",
      background: "#ffffff",
      context: "Primary button text",
      requiredLevel: "AA_NORMAL",
    });
    expect(result.isValid).toBe(true);
    expect(result.contrastRatio).toBeCloseTo(21, 5);
    expect(result.requiredRatio).toBe(4.5);
    expect(result.suggestion).toBeUndefined();
  });

  it("fails a low-contrast pair with a suggestion", () => {
    const result = validateColorPair({
      foreground: "#777777",
      background: "#ffffff",
      context: "Muted text",
      requiredLevel: "AA_NORMAL",
    });
    expect(result.isValid).toBe(false);
    expect(result.contrastRatio).toBeCloseTo(4.48, 2);
    expect(result.suggestion).toContain("Contrast ratio 4.48 is below required 4.5");
  });

  it("reports invalid hex as a failed pair with a format hint", () => {
    const result = validateColorPair({
      foreground: "not-a-color",
      background: "#ffffff",
      context: "Broken token",
      requiredLevel: "AA_NORMAL",
    });
    expect(result.isValid).toBe(false);
    expect(result.contrastRatio).toBe(0);
    expect(result.suggestion).toContain("Invalid color format");
  });
});

describe("extractColorPairsFromTokens", () => {
  it("extracts the twelve canonical semantic pairs", () => {
    const file = writeTokensFixture(allValidTokens());
    const pairs = extractColorPairsFromTokens(file);

    expect(pairs).toHaveLength(12);
    expect(pairs[0]).toMatchObject({
      foreground: "#595959",
      background: "#ffffff",
      context: "Primary text on primary background",
      requiredLevel: "AA_NORMAL",
    });
    const borders = pairs.filter((p) => p.requiredLevel === "AA_LARGE");
    expect(borders).toHaveLength(2);
  });

  it("skips pairs with missing or non-hex colors", () => {
    const tokens = allValidTokens() as Record<string, any>;
    delete tokens.semantic.color.status.info;
    tokens.semantic.color.foreground.secondary = "red";
    const pairs = extractColorPairsFromTokens(writeTokensFixture(tokens));

    expect(pairs).toHaveLength(10);
  });

  it("returns an empty list for a missing file and logs the error", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(extractColorPairsFromTokens("/nonexistent/tokens.json")).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("returns an empty list for malformed JSON", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "token-validator-"));
    tempDirs.push(dir);
    const file = path.join(dir, "bad.json");
    fs.writeFileSync(file, "{ not json");
    expect(extractColorPairsFromTokens(file)).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("validateDesignTokens", () => {
  it("buckets an all-valid fixture into AAA and AA compliance", () => {
    const report = validateDesignTokens(writeTokensFixture(allValidTokens()));

    expect(report.totalPairs).toBe(12);
    expect(report.invalidPairs).toBe(0);
    // #595959 pairs land at exactly 7.0 (AAA); the #767676 pairs and the
    // white-on-accent pair land at AA.
    expect(report.summary.aaaCompliant).toBe(9);
    expect(report.summary.aaCompliant).toBe(3);
    expect(report.summary.failing).toBe(0);
  });

  it("counts a below-AA pair as failing", () => {
    const tokens = allValidTokens() as Record<string, any>;
    tokens.semantic.color.foreground.primary = "#777777";
    const report = validateDesignTokens(writeTokensFixture(tokens));

    expect(report.invalidPairs).toBe(3); // primary fg appears in 3 pairs
    expect(report.summary.failing).toBe(3);
    expect(report.validPairs).toBe(9);
  });
});

describe("generateAccessibilityReport", () => {
  const failingReport: TokenValidationReport = {
    totalPairs: 2,
    validPairs: 1,
    invalidPairs: 1,
    results: [
      {
        isValid: false,
        contrastRatio: 4.48,
        requiredRatio: 4.5,
        level: "AA_NORMAL",
        context: "Muted text",
        foreground: "#777777",
        background: "#ffffff",
        suggestion: "Contrast ratio 4.48 is below required 4.5.",
      },
      {
        isValid: true,
        contrastRatio: 21,
        requiredRatio: 4.5,
        level: "AA_NORMAL",
        context: "Primary text",
        foreground: "#000000",
        background: "#ffffff",
      },
    ],
    summary: { aaCompliant: 0, aaaCompliant: 1, failing: 1 },
  };

  it("renders summary, compliance levels and both pair sections", () => {
    const text = generateAccessibilityReport(failingReport);

    expect(text).toContain("DESIGN TOKEN ACCESSIBILITY REPORT");
    expect(text).toContain("Total color pairs tested: 2");
    expect(text).toContain("Passing: 1 (50.0%)");
    expect(text).toContain("AAA Compliant: 1");
    expect(text).toContain("FAILING PAIRS");
    expect(text).toContain("Muted text");
    expect(text).toContain("💡 Contrast ratio 4.48 is below required 4.5.");
    expect(text).toContain("PASSING PAIRS");
    expect(text).toContain("Primary text - 21.00 (AAA)");
  });

  it("omits the failing section when everything passes", () => {
    const allPass: TokenValidationReport = {
      ...failingReport,
      validPairs: 1,
      invalidPairs: 0,
      results: [failingReport.results[1]!],
      summary: { aaCompliant: 0, aaaCompliant: 1, failing: 0 },
    };
    const text = generateAccessibilityReport(allPass);

    expect(text).not.toContain("FAILING PAIRS");
    expect(text).toContain("PASSING PAIRS");
  });
});

describe("runAccessibilityValidation", () => {
  it("exits 1 when the tokens file is missing", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {
        throw new Error("process.exit");
      }) as never);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      runAccessibilityValidation("/nonexistent/tokens.json"),
    ).rejects.toThrow("process.exit");
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it("writes a report and does not exit when all pairs pass", async () => {
    const file = writeTokensFixture(allValidTokens());
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {
        throw new Error("process.exit");
      }) as never);
    const writeSpy = vi
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runAccessibilityValidation(file);

    expect(writeSpy).toHaveBeenCalledOnce();
    expect(writeSpy.mock.calls[0]![0]).toMatch(/accessibility-report\.txt$/);
    expect(exitSpy).not.toHaveBeenCalled();
    expect(
      logSpy.mock.calls.some((args) =>
        String(args[0]).includes("color pairs pass"),
      ),
    ).toBe(true);
  });

  it("exits 1 when any pair fails", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {
        throw new Error("process.exit");
      }) as never);
    vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    const tokens = allValidTokens() as Record<string, any>;
    tokens.semantic.color.foreground.primary = "#777777";
    const file = writeTokensFixture(tokens);

    await expect(runAccessibilityValidation(file)).rejects.toThrow(
      "process.exit",
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
