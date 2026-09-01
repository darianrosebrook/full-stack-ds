import { describe, expect, it } from "vitest";
import {
  findDeprecatedTokens,
  formatDeprecationWarning,
  isTokenDeprecated,
  validateDeprecations,
  type DeprecationInfo,
} from "./index.js";

function deprecatedToken(overrides: Partial<DeprecationInfo> = {}) {
  const designExt: Record<string, unknown> = { deprecated: true };
  if (overrides.deprecatedDate) designExt.deprecatedDate = overrides.deprecatedDate;
  if (overrides.removalDate) designExt.removalDate = overrides.removalDate;
  if (overrides.replacement) designExt.replacement = overrides.replacement;
  if (overrides.reason) designExt.reason = overrides.reason;
  return {
    $type: "color",
    $value: "#ff0000",
    $extensions: { design: designExt },
  };
}

const tree = {
  color: {
    legacy: deprecatedToken({
      deprecatedDate: "2025-01-01",
      removalDate: "2026-01-01",
      replacement: "core.color.palette.red.500",
      reason: "renamed",
    }),
    current: { $type: "color", $value: "#00ff00" },
  },
};

describe("findDeprecatedTokens", () => {
  it("collects only tokens carrying the design.deprecated extension", () => {
    const found = findDeprecatedTokens(tree);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      tokenPath: "color.legacy",
      deprecated: true,
      replacement: "core.color.palette.red.500",
      reason: "renamed",
    });
  });

  it("skips $-prefixed metadata keys", () => {
    const found = findDeprecatedTokens({ $schema: "x", color: tree.color });
    expect(found).toHaveLength(1);
  });
});

describe("isTokenDeprecated", () => {
  it("reports the deprecation info for a deprecated path", () => {
    expect(isTokenDeprecated(tree, "color.legacy")).toMatchObject({
      tokenPath: "color.legacy",
      deprecated: true,
    });
  });

  it("returns null for a live path and a missing path", () => {
    expect(isTokenDeprecated(tree, "color.current")).toBeNull();
    expect(isTokenDeprecated(tree, "color.missing")).toBeNull();
  });
});

describe("formatDeprecationWarning", () => {
  it("renders all populated fields", () => {
    const text = formatDeprecationWarning("color.legacy", {
      tokenPath: "color.legacy",
      deprecated: true,
      deprecatedDate: "2025-01-01",
      removalDate: "2030-01-01",
      replacement: "core.color.palette.red.500",
      reason: "renamed",
    });
    expect(text).toContain("Deprecated token: color.legacy");
    expect(text).toContain("Replacement: core.color.palette.red.500");
    expect(text).toContain("Deprecated: 2025-01-01");
    expect(text).toContain("Removal planned: 2030-01-01");
    expect(text).toContain("Reason: renamed");
  });

  it("flags a passed removal date", () => {
    const text = formatDeprecationWarning("color.legacy", {
      tokenPath: "color.legacy",
      deprecated: true,
      removalDate: "2020-01-01",
    });
    expect(text).toContain("⛔ REMOVAL DATE PASSED: 2020-01-01");
  });
});

describe("validateDeprecations", () => {
  it("errors on passed removal dates and warns on future ones", () => {
    const deprecations: DeprecationInfo[] = [
      {
        tokenPath: "a",
        deprecated: true,
        removalDate: "2020-01-01",
      },
      {
        tokenPath: "b",
        deprecated: true,
        removalDate: "2099-01-01",
      },
      { tokenPath: "c", deprecated: false },
    ];

    const { warnings, errors } = validateDeprecations(deprecations);
    expect(errors).toContain(
      "Token a has passed its removal date (2020-01-01)",
    );
    // The 30-day proximity warning does not fire for a 2099 date; the
    // missing-replacement warning does.
    expect(warnings).toContain(
      "Deprecated token b has no replacement specified",
    );
    expect(warnings.some((w) => w.includes("will be removed in"))).toBe(false);
    expect(warnings.some((w) => w.includes("Token c"))).toBe(false);
    expect(errors.some((e) => e.includes("Token b"))).toBe(false);
  });
});
