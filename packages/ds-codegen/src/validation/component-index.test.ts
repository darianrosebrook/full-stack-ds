/**
 * Tests for the per-component admission index pivot
 * (CODEGEN-RAIL-ARTIFACT-EVIDENCE-REPORT-01).
 *
 * The index is a pure projection of existing artifact attribution;
 * these tests pin the pivot logic, not new pass/fail behavior.
 */
import { describe, expect, it } from "vitest";
import { buildComponentIndex } from "./component-index.js";
import type {
  FrameworkId,
  FrameworkValidationResult,
  PlanCommandRun,
} from "./types.js";

function makeRun(check: string): PlanCommandRun {
  return { check, command: check, durationMs: 1, status: "pass", diagnostics: [] };
}

function baseResult(
  framework: FrameworkId,
): Omit<FrameworkValidationResult, "artifacts"> {
  return {
    framework,
    scope: "workspace",
    artifactSelection: "by_manifest",
    artifactManifest: { groupCount: 0 },
    command: "x",
    commandRuns: [makeRun("typecheck")],
    checks: { typecheck: "pass" },
    durationMs: 1,
    diagnostics: [],
    knownGaps: [],
    status: "pass",
  };
}

describe("buildComponentIndex", () => {
  it("returns undefined when no framework has artifacts (legacy mode)", () => {
    const results = {
      react: baseResult("react"),
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      lit: baseResult("lit"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    expect(buildComponentIndex(results)).toBeUndefined();
  });

  it("pivots a single (framework, component, admission entry) into one row", () => {
    const results = {
      react: {
        ...baseResult("react"),
        artifacts: [
          {
            component: "Button",
            paths: ["packages/ds-react/src/components/Button/Button.tsx"],
            admission: [
              {
                check: "typecheck",
                command: "x",
                status: "pass" as const,
                coverage: "covered_by_package_check" as const,
              },
            ],
          },
        ],
      },
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      lit: baseResult("lit"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results);
    expect(idx).toBeDefined();
    expect(idx!.Button.react).toEqual({
      status: "pass",
      coverages: ["covered_by_package_check"],
      knownRuleNarrowings: [],
      pathCount: 1,
    });
    expect(idx!.Button.vue).toBeUndefined();
  });

  it("preserves PlanCommand declaration order in coverages[]", () => {
    const results = {
      lit: {
        ...baseResult("lit"),
        artifacts: [
          {
            component: "Input",
            paths: ["packages/ds-lit/src/components/Input/Input.ts"],
            admission: [
              {
                check: "typecheck",
                command: "tsc",
                status: "pass" as const,
                coverage: "covered_by_package_check" as const,
              },
              {
                check: "templateTypecheck",
                command: "lit-analyzer",
                status: "pass" as const,
                coverage: "covered_by_direct_template_check" as const,
                knownRuleNarrowings: ["no-incompatible-type-binding"],
              },
            ],
          },
        ],
      },
      react: baseResult("react"),
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results)!;
    expect(idx.Input.lit!.coverages).toEqual([
      "covered_by_package_check",
      "covered_by_direct_template_check",
    ]);
    expect(idx.Input.lit!.knownRuleNarrowings).toEqual([
      "no-incompatible-type-binding",
    ]);
  });

  it("marks zero-admission groups as not_admitted (honest, not a failure)", () => {
    const results = {
      angular: {
        ...baseResult("angular"),
        artifacts: [
          {
            component: "FixtureOnly",
            paths: [
              "packages/ds-angular/src/components/FixtureOnly/__tests__/F.test.ts",
            ],
            // Empty admission: e.g. the only path is a test file
            // excluded from ngc's scope, and no other command
            // covers it either.
            admission: [],
          },
        ],
      },
      react: baseResult("react"),
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      lit: baseResult("lit"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results)!;
    expect(idx.FixtureOnly.angular).toEqual({
      status: "not_admitted",
      coverages: [],
      knownRuleNarrowings: [],
      pathCount: 1,
    });
  });

  it("propagates a fail status when ANY admission entry failed", () => {
    const results = {
      react: {
        ...baseResult("react"),
        artifacts: [
          {
            component: "Broken",
            paths: ["x.tsx"],
            admission: [
              {
                check: "typecheck",
                command: "tsc",
                status: "fail" as const,
                coverage: "covered_by_package_check" as const,
              },
            ],
          },
        ],
      },
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      lit: baseResult("lit"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results)!;
    expect(idx.Broken.react!.status).toBe("fail");
  });

  it("deduplicates rule narrowings across multiple admission entries", () => {
    const results = {
      lit: {
        ...baseResult("lit"),
        artifacts: [
          {
            component: "Dup",
            paths: ["x.ts", "y.ts"],
            admission: [
              {
                check: "a",
                command: "a",
                status: "pass" as const,
                coverage: "covered_by_direct_template_check" as const,
                knownRuleNarrowings: ["rule-1", "rule-2"],
              },
              {
                check: "b",
                command: "b",
                status: "pass" as const,
                coverage: "covered_by_direct_template_check" as const,
                knownRuleNarrowings: ["rule-1", "rule-3"],
              },
            ],
          },
        ],
      },
      react: baseResult("react"),
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results)!;
    expect([...idx.Dup.lit!.knownRuleNarrowings].sort()).toEqual([
      "rule-1",
      "rule-2",
      "rule-3",
    ]);
  });

  it("groups multiple components under one framework cleanly", () => {
    const results = {
      react: {
        ...baseResult("react"),
        artifacts: [
          {
            component: "A",
            paths: ["a.tsx"],
            admission: [
              {
                check: "typecheck",
                command: "x",
                status: "pass" as const,
                coverage: "covered_by_package_check" as const,
              },
            ],
          },
          {
            component: "B",
            paths: ["b.tsx"],
            admission: [
              {
                check: "typecheck",
                command: "x",
                status: "pass" as const,
                coverage: "covered_by_package_check" as const,
              },
            ],
          },
        ],
      },
      vue: baseResult("vue"),
      svelte: baseResult("svelte"),
      lit: baseResult("lit"),
      angular: baseResult("angular"),
      "react-native": baseResult("react-native"),
    } as Record<FrameworkId, FrameworkValidationResult>;
    const idx = buildComponentIndex(results)!;
    expect(Object.keys(idx).sort()).toEqual(["A", "B"]);
  });
});
