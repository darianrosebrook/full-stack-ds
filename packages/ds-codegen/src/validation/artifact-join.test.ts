/**
 * Tests for the manifest × command join used by validate-cli to
 * attribute generated artifacts to admission checks.
 *
 * These tests pin the doctrine: the join must never invent
 * "per-file proven" labels, must propagate knownRuleNarrowings
 * from plan to per-artifact entry, must emit empty admission
 * arrays (not lies) for groups no command covers, and must
 * tolerate the legacy single-command (no-scope) plan shape.
 *
 * Manifest fixtures use a placeholder sha256 (`STUB_DIGEST`)
 * because the join is path-driven; digest verification is the
 * required-mode verifier's concern, tested separately.
 */
import { describe, expect, it } from "vitest";
import {
  attributeFrameworkArtifacts,
  joinManifestAgainstResults,
} from "./artifact-join.js";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type EmissionManifest,
  type EmittedArtifactGroup,
  type EmitterSourceSet,
  type EnvironmentProvenance,
  type FrameworkId,
  type FrameworkValidationPlan,
  type FrameworkValidationResult,
  type PlanCommandRun,
} from "./types.js";

const STUB_DIGEST = "0".repeat(64);

const EMPTY_EMITTER_SOURCE_SETS: Record<FrameworkId, EmitterSourceSet> = {
  react: { framework: "react", sources: [] },
  vue: { framework: "vue", sources: [] },
  svelte: { framework: "svelte", sources: [] },
  lit: { framework: "lit", sources: [] },
  angular: { framework: "angular", sources: [] },
  "react-native": { framework: "react-native", sources: [] },
};

const STUB_ENVIRONMENT: EnvironmentProvenance = {
  nodeMajor: 22,
  codegenPackageVersion: "1.0.0",
  lockfile: { path: "pnpm-lock.yaml", sha256: STUB_DIGEST },
};

function makeRun(
  check: string,
  command: string,
  status: "pass" | "fail" = "pass",
): PlanCommandRun {
  return { check, command, durationMs: 1, status, diagnostics: [] };
}

function mkGroup(
  framework: FrameworkId,
  component: string,
  paths: string[],
): EmittedArtifactGroup {
  return {
    framework,
    component,
    contract: {
      path: `packages/ds-contracts/${component}.contract.json`,
      sha256: STUB_DIGEST,
    },
    files: paths.map((p) => ({ path: p, sha256: STUB_DIGEST })),
  };
}

function mkManifest(groups: EmittedArtifactGroup[]): EmissionManifest {
  return {
    schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
    generatedAt: "2026-05-20T00:00:00.000Z",
    environment: STUB_ENVIRONMENT,
    emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
    groups,
  };
}

describe("attributeFrameworkArtifacts", () => {
  it("emits one ArtifactAdmissionEntry per in-scope command per group", () => {
    const manifest = mkManifest([
      mkGroup("lit", "Input", [
        "packages/ds-lit/src/components/Input/Input.ts",
        "packages/ds-lit/src/components/Input/Input.css",
      ]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("lit", "Switch", ["packages/ds-lit/src/components/Switch/Switch.ts"]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("angular", "Button", [
        // Tests-only group: the template check should NOT cover it.
        "packages/ds-angular/src/components/Button/__tests__/Button.test.ts",
      ]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("lit", "Switch", ["packages/ds-lit/src/components/Switch/Switch.ts"]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("react", "Switch", ["packages/ds-react/src/components/Switch/Switch.tsx"]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("vue", "Switch", ["packages/ds-vue/src/components/Switch/Switch.vue"]),
    ]);
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
    const manifest = mkManifest([
      mkGroup("react", "Switch", ["packages/ds-react/src/components/Switch/Switch.tsx"]),
    ]);
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
      "react-native": { framework: "react-native", command: ["x"], checks: { typecheck: "direct" } },
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
      "react-native": { framework: "react-native", commandRuns: [], ...baseResult },
    };
    const out = joinManifestAgainstResults(manifest, plans, results);
    expect(out.has("react")).toBe(true);
    expect(out.has("vue")).toBe(false);
    expect(out.has("svelte")).toBe(false);
    expect(out.get("react")).toHaveLength(1);
  });
});
