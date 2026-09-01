import { describe, expect, it } from "vitest";
import {
  isColorValue,
  isDimensionValue,
  isTokenReference,
  validateDesignTokens,
  formatValidationResult,
  validateContrastPair,
  validateTokenContrast,
  contrastRatioHex,
  WCAG_LEVELS,
} from "./w3c-index.js";

describe("w3c-index barrel", () => {
  it("re-exports the DTCG runtime type guards", () => {
    expect(isTokenReference("{color.primary}")).toBe(true);
    expect(isTokenReference("#ff0000")).toBe(false);

    expect(isColorValue({ colorSpace: "srgb", components: [1, 0, 0] })).toBe(
      true,
    );
    expect(isColorValue({ value: 1, unit: "px" })).toBe(false);

    expect(isDimensionValue({ value: 16, unit: "px" })).toBe(true);
    expect(isDimensionValue("16px")).toBe(false);
  });

  it("re-exports the validator and contrast APIs unchanged", () => {
    expect(typeof validateDesignTokens).toBe("function");
    expect(typeof formatValidationResult).toBe("function");
    expect(typeof validateContrastPair).toBe("function");
    expect(typeof validateTokenContrast).toBe("function");
    expect(typeof contrastRatioHex).toBe("function");
    expect(WCAG_LEVELS.AA_NORMAL).toBe(4.5);
  });
});
