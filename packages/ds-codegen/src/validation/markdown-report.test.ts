/**
 * Tests for the markdown projection of RailReport
 * (CODEGEN-RAIL-ARTIFACT-EVIDENCE-REPORT-01).
 *
 * Pins the load-bearing content: the "JSON is canonical" header,
 * the per-component table shape, and the verbatim preservation
 * of known gaps and required-mode diagnostic codes.
 */
import { describe, expect, it } from "vitest";
import { renderMarkdownReport } from "./markdown-report.js";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type EmitterSourceSet,
  type FrameworkId,
  type RailReport,
} from "./types.js";

const EMPTY_EMITTER_SOURCE_SETS: Record<FrameworkId, EmitterSourceSet> = {
  react: { framework: "react", sources: [] },
  vue: { framework: "vue", sources: [] },
  svelte: { framework: "svelte", sources: [] },
  lit: { framework: "lit", sources: [] },
  angular: { framework: "angular", sources: [] },
};

function baseReport(): RailReport {
  return {
    timestamp: "2026-05-21T00:00:00.000Z",
    scope: "workspace",
    artifactSelection: "by_manifest",
    artifactManifest: {
      schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
      generatedAt: "2026-05-21T00:00:00.000Z",
      emitterSourceSets: EMPTY_EMITTER_SOURCE_SETS,
      groups: [
        {
          framework: "react",
          component: "Button",
          contract: {
            path: "packages/ds-contracts/Button.contract.json",
            sha256: "1".repeat(64),
          },
          files: [
            {
              path: "packages/ds-react/src/components/Button/Button.tsx",
              sha256: "0".repeat(64),
            },
          ],
        },
      ],
    },
    requireArtifactManifest: true,
    requiredModeDiagnostics: [],
    componentsIndex: {
      Button: {
        react: {
          status: "pass",
          coverages: ["covered_by_package_check"],
          knownRuleNarrowings: [],
          pathCount: 1,
        },
      },
    },
    frameworks: {
      react: {
        framework: "react",
        scope: "workspace",
        artifactSelection: "by_manifest",
        artifactManifest: { groupCount: 1 },
        artifacts: [],
        command: "x",
        commandRuns: [],
        checks: { typecheck: "pass" },
        durationMs: 1,
        diagnostics: [],
        knownGaps: [],
        status: "pass",
      },
      vue: {
        framework: "vue",
        scope: "workspace",
        artifactSelection: "by_manifest",
        artifactManifest: { groupCount: 0 },
        command: "x",
        commandRuns: [],
        checks: { typecheck: "pass" },
        durationMs: 1,
        diagnostics: [],
        knownGaps: [],
        status: "pass",
      },
      svelte: {
        framework: "svelte",
        scope: "workspace",
        artifactSelection: "by_manifest",
        artifactManifest: { groupCount: 0 },
        command: "x",
        commandRuns: [],
        checks: { typecheck: "pass" },
        durationMs: 1,
        diagnostics: [],
        knownGaps: [],
        status: "pass",
      },
      lit: {
        framework: "lit",
        scope: "workspace",
        artifactSelection: "by_manifest",
        artifactManifest: { groupCount: 0 },
        command: "x",
        commandRuns: [],
        checks: { typecheck: "pass" },
        durationMs: 1,
        diagnostics: [],
        knownGaps: [],
        status: "pass",
      },
      angular: {
        framework: "angular",
        scope: "workspace",
        artifactSelection: "by_manifest",
        artifactManifest: { groupCount: 0 },
        command: "x",
        commandRuns: [],
        checks: { typecheck: "pass" },
        durationMs: 1,
        diagnostics: [],
        knownGaps: [],
        status: "pass",
      },
    },
    knownGaps: [],
    overall: "pass",
  };
}

describe("renderMarkdownReport", () => {
  it("includes the verbatim 'JSON is canonical' header line", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).toContain(
      "> Derived from RailReport at 2026-05-21T00:00:00.000Z; manifest schemaVersion v4. The JSON is canonical.",
    );
  });

  it("includes the overall status, scope, artifactSelection, and required-mode flag", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).toContain("- Overall: **PASS**");
    expect(md).toContain("- Scope: workspace");
    expect(md).toContain("- Artifact selection: by_manifest");
    expect(md).toContain("- Required-mode invocation: yes");
  });

  it("renders the per-framework emitter provenance section with source counts", () => {
    const r = baseReport();
    r.artifactManifest!.emitterSourceSets = {
      react: {
        framework: "react",
        sources: [
          { path: "packages/ds-codegen/src/cli.ts", sha256: "0".repeat(64) },
          { path: "packages/ds-codegen/src/ir.ts", sha256: "0".repeat(64) },
        ],
      },
      vue: { framework: "vue", sources: [] },
      svelte: { framework: "svelte", sources: [] },
      lit: { framework: "lit", sources: [] },
      angular: { framework: "angular", sources: [] },
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("## Per-framework emitter provenance");
    expect(md).toContain("RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_");
    expect(md).toContain("| react | 2 |");
    expect(md).toContain("| vue | 0 |");
  });

  it("renders the per-framework summary table with all five frameworks", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).toContain("## Per-framework summary");
    for (const fw of ["react", "vue", "svelte", "lit", "angular"]) {
      expect(md).toContain(`| ${fw} |`);
    }
  });

  it("renders the per-component table when componentsIndex is present", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).toContain("## Per-component admission index");
    // Header row includes Component + all five frameworks.
    expect(md).toMatch(
      /\| Component \| react \| vue \| svelte \| lit \| angular \|/,
    );
    // Button row: pass [pkg] under react, em-dash elsewhere.
    expect(md).toContain("| Button | pass [pkg] | — | — | — | — |");
  });

  it("omits the per-component table when componentsIndex is absent (legacy mode)", () => {
    const r = baseReport();
    delete r.componentsIndex;
    const md = renderMarkdownReport(r);
    expect(md).not.toContain("## Per-component admission index");
  });

  it("renders required-mode diagnostics with stable code as heading", () => {
    const r = baseReport();
    r.requiredModeDiagnostics = [
      {
        code: "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH",
        message: "1 file(s) have on-disk content that does not match the manifest's recorded digest.",
        paths: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ];
    r.overall = "fail";
    const md = renderMarkdownReport(r);
    expect(md).toContain("## Required-mode diagnostics");
    expect(md).toContain("### `RAIL_REQUIRE_MANIFEST_HASH_MISMATCH`");
    expect(md).toContain(
      "- `packages/ds-react/src/components/Button/Button.tsx`",
    );
  });

  it("omits the required-mode diagnostics section when none present", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).not.toContain("## Required-mode diagnostics");
  });

  it("renders known gaps verbatim (no paraphrasing)", () => {
    const r = baseReport();
    const gap =
      "Declared analyzer-policy boundary (NOT a generated-output defect): example.";
    r.knownGaps = [gap];
    const md = renderMarkdownReport(r);
    expect(md).toContain("## Known gaps");
    expect(md).toContain(`- ${gap}`);
  });

  it("includes coverage abbreviations and narrowings in cell text", () => {
    const r = baseReport();
    r.componentsIndex = {
      Input: {
        lit: {
          status: "pass",
          coverages: [
            "covered_by_package_check",
            "covered_by_direct_template_check",
          ],
          knownRuleNarrowings: ["no-incompatible-type-binding"],
          pathCount: 2,
        },
      },
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain(
      "pass [pkg+tpl] (narrowings: no-incompatible-type-binding)",
    );
  });

  it("uses em-dash for components absent from a framework column", () => {
    const r = baseReport();
    r.componentsIndex = {
      OnlyOnReact: {
        react: {
          status: "pass",
          coverages: ["covered_by_package_check"],
          knownRuleNarrowings: [],
          pathCount: 1,
        },
      },
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("| OnlyOnReact | pass [pkg] | — | — | — | — |");
  });
});

describe("renderMarkdownReport scoped projection section", () => {
  it("omits the section when scopedProjection is absent", () => {
    const md = renderMarkdownReport(baseReport());
    expect(md).not.toContain("## Changed artifact scope");
  });

  it("renders the doctrine sentence as the first prose line of the section", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [],
      nonGeneratedChangedPaths: [],
      unmatchedGeneratedPaths: [],
      changedContractPaths: [],
      matchedGroups: [],
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("## Changed artifact scope");
    expect(md).toContain(
      "Reviewer projection over the full admission report below. The rail still admitted the full workspace.",
    );
  });

  it("renders matched groups as a sorted table with contract + admission cells", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [
        "packages/ds-react/src/components/Button/Button.tsx",
        "packages/ds-lit/src/components/Button/Button.ts",
      ],
      nonGeneratedChangedPaths: [],
      unmatchedGeneratedPaths: [],
      changedContractPaths: [],
      matchedGroups: [
        {
          framework: "lit",
          component: "Button",
          contract: {
            path: "packages/ds-contracts/Button.contract.json",
            sha256: "abcdef0123456789".padEnd(64, "0"),
          },
          files: [
            {
              path: "packages/ds-lit/src/components/Button/Button.ts",
              sha256: "0".repeat(64),
            },
          ],
          admission: [
            {
              check: "typecheck",
              command: "tsc",
              status: "pass",
              coverage: "covered_by_package_check",
            },
            {
              check: "templateTypecheck",
              command: "lit-analyzer",
              status: "pass",
              coverage: "covered_by_direct_template_check",
              knownRuleNarrowings: ["no-incompatible-type-binding"],
            },
          ],
        },
        {
          framework: "react",
          component: "Button",
          contract: {
            path: "packages/ds-contracts/Button.contract.json",
            sha256: "abcdef0123456789".padEnd(64, "0"),
          },
          files: [
            {
              path: "packages/ds-react/src/components/Button/Button.tsx",
              sha256: "0".repeat(64),
            },
          ],
          admission: [
            {
              check: "typecheck",
              command: "tsc",
              status: "pass",
              coverage: "covered_by_package_check",
            },
          ],
        },
      ],
    };
    const md = renderMarkdownReport(r);
    // react comes before lit because of FRAMEWORK_RANK ordering.
    const reactRow =
      "| Button | react | 1 | `packages/ds-contracts/Button.contract.json` | `abcdef012345` | pass [pkg] |";
    const litRow =
      "| Button | lit | 1 | `packages/ds-contracts/Button.contract.json` | `abcdef012345` | pass [pkg+tpl] (narrowings: no-incompatible-type-binding) |";
    const reactIdx = md.indexOf(reactRow);
    const litIdx = md.indexOf(litRow);
    expect(reactIdx).toBeGreaterThan(0);
    expect(litIdx).toBeGreaterThan(reactIdx);
  });

  it("renders unmatched generated paths with the required-mode hand-off note", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [
        "packages/ds-react/src/components/Ghost/Ghost.tsx",
      ],
      nonGeneratedChangedPaths: [],
      unmatchedGeneratedPaths: [
        "packages/ds-react/src/components/Ghost/Ghost.tsx",
      ],
      changedContractPaths: [],
      matchedGroups: [],
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("### Unmatched generated paths");
    expect(md).toContain(
      "required-mode diagnostics are the authoritative failure surface",
    );
    expect(md).toContain(
      "- `packages/ds-react/src/components/Ghost/Ghost.tsx`",
    );
  });

  it("renders non-generated changed paths as context", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [],
      nonGeneratedChangedPaths: [
        "packages/ds-contracts/Button.contract.json",
      ],
      unmatchedGeneratedPaths: [],
      changedContractPaths: [],
      matchedGroups: [],
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("### Non-generated changed paths");
    expect(md).toContain("- `packages/ds-contracts/Button.contract.json`");
  });

  it("renders changed contracts as a separate section with the required-mode hand-off note", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [],
      nonGeneratedChangedPaths: [
        "packages/ds-contracts/Button.contract.json",
      ],
      unmatchedGeneratedPaths: [],
      changedContractPaths: [
        "packages/ds-contracts/Button.contract.json",
      ],
      matchedGroups: [],
    };
    const md = renderMarkdownReport(r);
    expect(md).toContain("### Changed contracts");
    expect(md).toContain("RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH");
    expect(md).toContain("- `packages/ds-contracts/Button.contract.json`");
  });

  it("renders BEFORE the per-component index when both are present", () => {
    const r = baseReport();
    r.scopedProjection = {
      mode: { kind: "git_range", rangeNotation: "origin/main...HEAD" },
      changedGeneratedPaths: [],
      nonGeneratedChangedPaths: [],
      unmatchedGeneratedPaths: [],
      changedContractPaths: [],
      matchedGroups: [],
    };
    const md = renderMarkdownReport(r);
    const scopeIdx = md.indexOf("## Changed artifact scope");
    const componentIdx = md.indexOf("## Per-component admission index");
    expect(scopeIdx).toBeGreaterThan(0);
    expect(componentIdx).toBeGreaterThan(scopeIdx);
  });
});
