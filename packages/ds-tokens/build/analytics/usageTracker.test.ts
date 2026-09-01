import { describe, expect, it, vi } from "vitest";
import {
  analyzeTokenUsage,
  generateUsageReport,
  type UsageReport,
} from "./usageTracker.js";

describe("analyzeTokenUsage — real corpus", () => {
  it(
    "analyzes the composed graph against the real codebase",
    async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const report = await analyzeTokenUsage();

      // The composed graph is the real 400+ token corpus.
      expect(report.totalTokens).toBeGreaterThan(400);
      expect(report.usedTokens + report.unusedTokens).toBeLessThanOrEqual(
        report.totalTokens,
      );
      expect(report.deprecatedTokens).toBeGreaterThanOrEqual(0);

      // Every entry carries the token shape and is sorted by usage desc.
      for (const usage of report.usageByToken) {
        expect(usage.tokenPath).toBeTruthy();
        expect(usage.usageCount).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(usage.usedIn)).toBe(true);
      }
      for (let i = 1; i < report.usageByToken.length; i++) {
        expect(report.usageByToken[i - 1]!.usageCount).toBeGreaterThanOrEqual(
          report.usageByToken[i]!.usageCount,
        );
      }

      // At least one real consumer exists — used tokens are non-zero.
      expect(report.usedTokens).toBeGreaterThan(0);
      expect(report.usageByFile.size).toBeGreaterThan(0);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("Analyzing token usage"),
      );
    },
    120_000,
  );
});

function syntheticReport(): UsageReport {
  return {
    totalTokens: 12,
    usedTokens: 3,
    unusedTokens: 8,
    deprecatedTokens: 3,
    usageByToken: [
      {
        tokenPath: "semantic.color.foreground.primary",
        usedIn: ["packages/ds-react/src/components/Button/Button.tsx"],
        usageCount: 5,
        lastUsed: new Date("2026-01-01T00:00:00Z"),
        deprecated: false,
      },
      {
        tokenPath: "semantic.color.background.primary",
        usedIn: ["packages/ds-react/src/components/Button/Button.tsx"],
        usageCount: 2,
        lastUsed: new Date("2026-01-01T00:00:00Z"),
        deprecated: false,
      },
      {
        tokenPath: "core.color.palette.legacy",
        usedIn: [
          "packages/ds-react/src/components/Legacy/Legacy.tsx",
          "packages/ds-vue/src/components/Legacy/Legacy.vue",
          "packages/ds-svelte/src/components/Legacy/Legacy.svelte",
          "packages/ds-angular/src/components/legacy/legacy.component.ts",
        ],
        usageCount: 4,
        lastUsed: new Date("2026-01-01T00:00:00Z"),
        deprecated: true,
      },
      ...Array.from({ length: 9 }, (_, i) => ({
        tokenPath: `core.spacing.unused-${i}`,
        usedIn: [] as string[],
        usageCount: 0,
        lastUsed: null,
        deprecated: i < 2, // two of the nine unused are deprecated
      })),
    ],
    usageByFile: new Map([
      ["packages/ds-react/src/components/Button/Button.tsx", ["a", "b"]],
    ]),
    recommendations: ["Found 8 unused tokens. Consider removing: a, b"],
  };
}

describe("generateUsageReport", () => {
  it("renders summary, recommendations and the top-used section", () => {
    const text = generateUsageReport(syntheticReport());

    expect(text).toContain("# Design Token Usage Report");
    expect(text).toContain("- **Total Tokens:** 12");
    expect(text).toContain("- **Used Tokens:** 3");
    expect(text).toContain("- **Unused Tokens:** 8");
    expect(text).toContain("- **Deprecated Tokens:** 3");
    expect(text).toContain("## Recommendations");
    expect(text).toContain("Found 8 unused tokens");
    expect(text).toContain("## Top 10 Most Used Tokens");
    expect(text).toContain(
      "- **semantic.color.foreground.primary**: 5 usages",
    );
  });

  it("renders the unused-token section with the 20-item cap", () => {
    const text = generateUsageReport(syntheticReport());

    expect(text).toContain("## Unused Tokens");
    expect(text).toContain("Found 8 unused tokens. Consider removing:");
    // unused-0 and unused-1 are deprecated, so the list starts at unused-2.
    expect(text).toContain("- core.spacing.unused-2");
    expect(text).toContain("- core.spacing.unused-8");
  });

  it("renders deprecated-in-use details including file lists and ellipsis", () => {
    const text = generateUsageReport(syntheticReport());

    expect(text).toContain("## Deprecated Tokens Still In Use");
    expect(text).toContain("- **core.color.palette.legacy**: 4 usages");
    expect(text).toContain("- Used in: packages/ds-react/src/components/Legacy/Legacy.tsx");
    expect(text).toContain("... and 1 more files");
  });

  it("omits unused and recommendation sections when empty", () => {
    const report = syntheticReport();
    report.unusedTokens = 0;
    report.recommendations = [];
    report.usageByToken = report.usageByToken.filter(
      (u) => u.usageCount > 0 || u.deprecated,
    );

    const text = generateUsageReport(report);

    expect(text).not.toContain("## Unused Tokens");
    expect(text).not.toContain("## Recommendations");
    expect(text).toContain("## Top 10 Most Used Tokens");
  });
});
