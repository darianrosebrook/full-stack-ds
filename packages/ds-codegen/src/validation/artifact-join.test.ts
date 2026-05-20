/**
 * Tests for the manifest × command join used by validate-cli to
 * attribute generated artifacts to admission checks.
 *
 * These tests pin the doctrine: the join must never invent
 * "per-file proven" labels, must propagate knownRuleNarrowings
 * from plan to per-artifact entry, must emit empty admission
 * arrays (not lies) for groups no command covers, and must
 * tolerate the legacy single-command (no-scope) plan shape.
 */
import { describe, expect, it } from "vitest";
import {
  attributeFrameworkArtifacts,
  joinManifestAgainstResults,
} from "./artifact-join.js";
import type {
  EmissionManifest,
  FrameworkId,
  FrameworkValidationPlan,
  FrameworkValidationResult,
  PlanCommandRun,
} from "./types.js";

function makeRun(
  check: string,
  command: string,
  status: "pass" | "fail" = "pass",
): PlanCommandRun {
  return { check, command, durationMs: 1, status, diagnostics: [] };
}

describe("attributeFrameworkArtifacts", () => {
  it("emits one ArtifactAdmissionEntry per in-scope command per group", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "lit",
          component: "Input",
          paths: [
            "packages/ds-lit/src/components/Input/Input.ts",
            "packages/ds-lit/src/components/Input/Input.css",
          ],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "lit",
      commands: [
        {
          check: "typecheck",
          command: ["pnpm", "--filter", "@full-stack-ds/lit", "run", "typecheck"],
          scope: {
            packageRoot: "packages/ds-lit/",
            extensions: [".ts"],
            coverage: "covered_by_package_check",
          },
        },
        {
          check: "templateTypecheck",
          command: ["pnpm", "--filter", "@full-stack-ds/lit", "run", "typecheck:templates"],
          scope: {
            packageRoot: "packages/ds-lit/src/components/",
            extensions: [".ts"],
            coverage: "covered_by_direct_template_check",
          },
          knownRuleNarrowings: ["no-incompatible-type-binding"],
        },
      ],
      checks: { typecheck: "direct", templateTypecheck: "direct" },
    };
    const runs = [
      makeRun("typecheck", "pnpm --filter @full-stack-ds/lit run typecheck"),
      makeRun("templateTypecheck", "pnpm --filter @full-stack-ds/lit run typecheck:templates"),
    ];
    const result = attributeFrameworkArtifacts("lit", manifest, plan, runs);
    expect(result).toHaveLength(1);
    expect(result[0]!.admission).toHaveLength(2);
    expect(result[0]!.admission[0]).toMatchObject({
      check: "typecheck",
      status: "pass",
      coverage: "covered_by_package_check",
    });
    expect(result[0]!.admission[1]).toMatchObject({
      check: "templateTypecheck",
      coverage: "covered_by_direct_template_check",
      knownRuleNarrowings: ["no-incompatible-type-binding"],
    });
  });

  it("propagates rule narrowings only for commands that declare them", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "lit",
          component: "Switch",
          paths: ["packages/ds-lit/src/components/Switch/Switch.ts"],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "lit",
      commands: [
        {
          check: "typecheck",
          command: ["x"],
          scope: {
            packageRoot: "packages/ds-lit/",
            extensions: [".ts"],
            coverage: "covered_by_package_check",
          },
          // Deliberately no knownRuleNarrowings on the tsc command.
        },
        {
          check: "templateTypecheck",
          command: ["y"],
          scope: {
            packageRoot: "packages/ds-lit/",
            extensions: [".ts"],
            coverage: "covered_by_direct_template_check",
          },
          knownRuleNarrowings: ["no-incompatible-type-binding"],
        },
      ],
      checks: { typecheck: "direct", templateTypecheck: "direct" },
    };
    const runs = [makeRun("typecheck", "x"), makeRun("templateTypecheck", "y")];
    const [group] = attributeFrameworkArtifacts("lit", manifest, plan, runs);
    expect(group!.admission[0]).not.toHaveProperty("knownRuleNarrowings");
    expect(group!.admission[1]!.knownRuleNarrowings).toEqual([
      "no-incompatible-type-binding",
    ]);
  });

  it("respects excludePathSubstrings (test files dropped from ngc-style scope)", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "angular",
          component: "Button",
          paths: [
            // Tests-only group: the template check should NOT cover it.
            "packages/ds-angular/src/components/Button/__tests__/Button.test.ts",
          ],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "angular",
      commands: [
        {
          check: "templateTypecheck",
          command: ["ngc"],
          scope: {
            packageRoot: "packages/ds-angular/",
            extensions: [".ts"],
            excludePathSubstrings: ["/__tests__/", ".test.ts"],
            coverage: "covered_by_direct_template_check",
          },
        },
      ],
      checks: { templateTypecheck: "direct" },
    };
    const runs = [makeRun("templateTypecheck", "ngc")];
    const [group] = attributeFrameworkArtifacts(
      "angular",
      manifest,
      plan,
      runs,
    );
    // Tests-only group is `not_selected` for ngc — no admission
    // entry is emitted, surfaced as an empty admission array.
    expect(group!.admission).toHaveLength(0);
  });

  it("relays the run's fail status into the entry (does NOT silently downgrade)", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "lit",
          component: "Switch",
          paths: ["packages/ds-lit/src/components/Switch/Switch.ts"],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "lit",
      commands: [
        {
          check: "typecheck",
          command: ["x"],
          scope: {
            packageRoot: "packages/ds-lit/",
            extensions: [".ts"],
            coverage: "covered_by_package_check",
          },
        },
      ],
      checks: { typecheck: "direct" },
    };
    const runs = [makeRun("typecheck", "x", "fail")];
    const [group] = attributeFrameworkArtifacts("lit", manifest, plan, runs);
    expect(group!.admission[0]!.status).toBe("fail");
  });

  it("contributes nothing for plans that use the legacy single-command shape with no scope", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "react",
          component: "Switch",
          paths: ["packages/ds-react/src/components/Switch/Switch.tsx"],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "react",
      // Legacy `command` shape — no scope declaration anywhere.
      command: ["pnpm", "run", "typecheck"],
      checks: { typecheck: "direct" },
    };
    const runs = [makeRun("typecheck", "pnpm run typecheck")];
    const [group] = attributeFrameworkArtifacts("react", manifest, plan, runs);
    expect(group!.admission).toHaveLength(0);
  });

  it("returns empty array when manifest has no groups for the framework", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "vue",
          component: "Switch",
          paths: ["packages/ds-vue/src/components/Switch/Switch.vue"],
        },
      ],
    };
    const plan: FrameworkValidationPlan = {
      framework: "react",
      command: ["pnpm", "run", "typecheck"],
      checks: { typecheck: "direct" },
    };
    expect(
      attributeFrameworkArtifacts("react", manifest, plan, []),
    ).toEqual([]);
  });
});

describe("joinManifestAgainstResults", () => {
  it("attributes only frameworks that have manifest entries (no empty stubs)", () => {
    const manifest: EmissionManifest = {
      generatedAt: "2026-05-20T00:00:00.000Z",
      groups: [
        {
          framework: "react",
          component: "Switch",
          paths: ["packages/ds-react/src/components/Switch/Switch.tsx"],
        },
      ],
    };
    const plans: Record<FrameworkId, FrameworkValidationPlan> = {
      react: {
        framework: "react",
        commands: [
          {
            check: "typecheck",
            command: ["x"],
            scope: {
              packageRoot: "packages/ds-react/",
              extensions: [".ts", ".tsx"],
              coverage: "covered_by_package_check",
            },
          },
        ],
        checks: { typecheck: "direct" },
      },
      vue: { framework: "vue", command: ["x"], checks: { typecheck: "direct" } },
      svelte: { framework: "svelte", command: ["x"], checks: { typecheck: "direct" } },
      lit: { framework: "lit", command: ["x"], checks: { typecheck: "direct" } },
      angular: { framework: "angular", command: ["x"], checks: { typecheck: "direct" } },
    };
    const baseResult: Omit<FrameworkValidationResult, "framework" | "commandRuns"> = {
      scope: "workspace",
      artifactSelection: "none",
      artifactManifest: null,
      command: "x",
      checks: { typecheck: "pass" },
      durationMs: 1,
      diagnostics: [],
      knownGaps: [],
      status: "pass",
    };
    const results: Record<FrameworkId, FrameworkValidationResult> = {
      react: { framework: "react", commandRuns: [makeRun("typecheck", "x")], ...baseResult },
      vue: { framework: "vue", commandRuns: [], ...baseResult },
      svelte: { framework: "svelte", commandRuns: [], ...baseResult },
      lit: { framework: "lit", commandRuns: [], ...baseResult },
      angular: { framework: "angular", commandRuns: [], ...baseResult },
    };
    const out = joinManifestAgainstResults(manifest, plans, results);
    expect(out.has("react")).toBe(true);
    expect(out.has("vue")).toBe(false);
    expect(out.has("svelte")).toBe(false);
    expect(out.get("react")).toHaveLength(1);
  });
});
