import { describe, expect, it } from "vitest";
import {
  WCAG_LEVELS,
  contrastRatioHex,
  extractCanonicalPairs,
  formatContrastReport,
  validateContrastPair,
  validateTokenContrast,
  type ContrastValidationReport,
} from "./w3c-contrast-validator.js";

describe("WCAG_LEVELS", () => {
  it("pins the WCAG 2.1 ratio constants", () => {
    expect(WCAG_LEVELS.AA_NORMAL).toBe(4.5);
    expect(WCAG_LEVELS.AA_LARGE).toBe(3.0);
    expect(WCAG_LEVELS.AAA_NORMAL).toBe(7.0);
    expect(WCAG_LEVELS.AAA_LARGE).toBe(4.5);
  });
});

describe("contrastRatioHex", () => {
  it("computes the canonical extremes", () => {
    expect(contrastRatioHex("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatioHex("#ffffff", "#ffffff")).toBeCloseTo(1, 10);
  });

  it("returns null for invalid hex", () => {
    expect(contrastRatioHex("#zzz", "#ffffff")).toBeNull();
    expect(contrastRatioHex("#000000", "red")).toBeNull();
  });
});

describe("validateContrastPair", () => {
  it("passes black on white at the default AA_NORMAL level", () => {
    const result = validateContrastPair("#000000", "#ffffff");
    expect(result).not.toBeNull();
    expect(result!.isValid).toBe(true);
    expect(result!.requiredRatio).toBe(4.5);
    expect(result!.suggestion).toBeUndefined();
  });

  it("fails below-threshold pairs with a suggestion", () => {
    const result = validateContrastPair("#777777", "#ffffff");
    expect(result!.isValid).toBe(false);
    expect(result!.suggestion).toContain(
      "Contrast ratio 4.48 is below required 4.5",
    );
  });

  it("honors a minContrast override", () => {
    // 4.54 passes AA_NORMAL but fails an explicit 5.0 minimum.
    const result = validateContrastPair("#767676", "#ffffff", {
      minContrast: 5.0,
    });
    expect(result!.isValid).toBe(false);
    expect(result!.requiredRatio).toBe(5.0);
  });

  it("attaches context from the provided pair list", () => {
    const result = validateContrastPair("#000000", "#ffffff", {
      colorPairs: [
        { foreground: "#000000", background: "#ffffff", context: "Hero text" },
      ],
    });
    expect(result!.context).toBe("Hero text");
  });

  it("returns null for an invalid color", () => {
    expect(validateContrastPair("nope", "#ffffff")).toBeNull();
  });
});

function resolvedTree() {
  return {
    semantic: {
      color: {
        foreground: {
          primary: { $value: { light: "#000000", dark: "#ffffff" } },
          secondary: { $value: "#595959" },
          accent: { $value: "#0b57d0" },
          onAccent: { $value: "#ffffff" },
        },
        background: {
          primary: { $value: "#ffffff" },
          secondary: { $value: { light: "#f1f3f4", dark: "#1e1f20" } },
          elevated: { $value: "#ffffff" },
          accent: { $value: "#0b57d0" },
        },
        status: {
          success: { $value: "#1e8e3e" },
          warning: { $value: "#f9ab00" },
          danger: { $value: "#d93025" },
          info: { $value: "#1a73e8" },
        },
        border: {
          subtle: { $value: { light: "#dadce0", dark: "#3c4043" } },
          primary: { $value: "#bdc1c6" },
        },
      },
    },
  };
}

describe("extractCanonicalPairs", () => {
  it("resolves the canonical text pair with the theme suffix", () => {
    const pairs = extractCanonicalPairs(resolvedTree(), "light");

    expect(pairs).toContainEqual({
      foreground: "#000000",
      background: "#ffffff",
      context: "Primary text on primary background (light)",
      level: "AA_NORMAL",
    });
  });

  it("switches theme-keyed leaves to the dark variant", () => {
    const pairs = extractCanonicalPairs(resolvedTree(), "dark");

    const primary = pairs.find((p) =>
      p.context.includes("Primary text on primary background"),
    );
    expect(primary?.foreground).toBe("#ffffff");
    expect(primary?.context).toContain("(dark)");
  });

  it("resolves only hex values and skips unresolvable leaves", () => {
    const pairs = extractCanonicalPairs(resolvedTree(), "light");

    expect(pairs.length).toBeGreaterThan(0);
    for (const pair of pairs) {
      expect(pair.foreground).toMatch(/^#[0-9a-f]{6}$/);
      expect(pair.background).toMatch(/^#[0-9a-f]{6}$/);
      expect(WCAG_LEVELS[pair.level]).toBeTypeOf("number");
    }
  });

  it("returns an empty list for an empty tree", () => {
    expect(extractCanonicalPairs({})).toEqual([]);
  });
});

describe("validateTokenContrast", () => {
  it("validates provided pairs and counts failures", () => {
    const report = validateTokenContrast(null, {
      colorPairs: [
        { foreground: "#000000", background: "#ffffff", context: "ok" },
        { foreground: "#777777", background: "#ffffff", context: "bad" },
      ],
    });

    expect(report.totalPairs).toBe(2);
    expect(report.validPairs).toBe(1);
    expect(report.invalidPairs).toBe(1);
  });

  it("falls back to the legacy extractor for semantic color trees", () => {
    const report = validateTokenContrast({
      semantic: {
        color: {
          foreground: { primary: "#000000" },
          background: { primary: "#ffffff" },
        },
      },
    });

    expect(report.totalPairs).toBe(1);
    expect(report.validPairs).toBe(1);
    expect(report.results[0]?.context).toBe(
      "Primary text on primary background",
    );
  });

  it("reports zero pairs for null tokens", () => {
    const report = validateTokenContrast(null);
    expect(report.totalPairs).toBe(0);
    expect(report.invalidPairs).toBe(0);
  });
});

describe("formatContrastReport", () => {
  const failing: ContrastValidationReport = {
    totalPairs: 2,
    validPairs: 1,
    invalidPairs: 1,
    results: [
      {
        isValid: true,
        contrastRatio: 21,
        requiredRatio: 4.5,
        foreground: "#000000",
        background: "#ffffff",
        level: "AA_NORMAL",
        context: "ok",
      },
      {
        isValid: false,
        contrastRatio: 4.48,
        requiredRatio: 4.5,
        foreground: "#777777",
        background: "#ffffff",
        level: "AA_NORMAL",
        context: "bad",
        suggestion: "Contrast ratio 4.48 is below required 4.5.",
      },
    ],
  };

  it("renders the summary and failing-pair details", () => {
    const text = formatContrastReport(failing);

    expect(text).toContain("Contrast Validation Report");
    expect(text).toContain("Total pairs: 2");
    expect(text).toContain("Passing: 1");
    expect(text).toContain("Failing: 1");
    expect(text).toContain("1. bad");
    expect(text).toContain("Foreground: #777777");
    expect(text).toContain("Contrast: 4.48 (required: 4.5)");
    expect(text).toContain("💡 Contrast ratio 4.48 is below required 4.5.");
  });

  it("omits the failing section when all pairs pass", () => {
    const passing: ContrastValidationReport = {
      totalPairs: 1,
      validPairs: 1,
      invalidPairs: 0,
      results: [failing.results[0]!],
    };
    expect(formatContrastReport(passing)).not.toContain("Failing pairs");
  });
});
