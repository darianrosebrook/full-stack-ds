/**
 * Tests for the git-range scope projection
 * (CODEGEN-RAIL-CHANGED-ARTIFACT-SCOPE-01).
 *
 * Uses an injected gitExec stub instead of shelling out to a
 * real git repo. The projection algorithm is pure given the
 * git output, so the stub is sufficient to pin the doctrine.
 */
import { describe, expect, it } from "vitest";
import { projectGitRange } from "./git-range-scope.js";
import {
  EMISSION_MANIFEST_SCHEMA_VERSION,
  type EmissionManifest,
  type FrameworkId,
  type FrameworkValidationResult,
  type PlanCommandRun,
} from "./types.js";

const STUB_DIGEST = "0".repeat(64);

function makeRun(check: string): PlanCommandRun {
  return { check, command: check, durationMs: 1, status: "pass", diagnostics: [] };
}

function manifestWith(paths: { framework: FrameworkId; component: string; paths: string[] }[]): EmissionManifest {
  return {
    schemaVersion: EMISSION_MANIFEST_SCHEMA_VERSION,
    generatedAt: "2026-05-21T00:00:00.000Z",
    groups: paths.map((p) => ({
      framework: p.framework,
      component: p.component,
      files: p.paths.map((path) => ({ path, sha256: STUB_DIGEST })),
    })),
  };
}

function emptyResults(): Record<FrameworkId, FrameworkValidationResult> {
  const base = (framework: FrameworkId): FrameworkValidationResult => ({
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
  });
  return {
    react: base("react"),
    vue: base("vue"),
    svelte: base("svelte"),
    lit: base("lit"),
    angular: base("angular"),
  };
}

function withArtifacts(
  results: Record<FrameworkId, FrameworkValidationResult>,
  framework: FrameworkId,
  artifacts: FrameworkValidationResult["artifacts"],
): Record<FrameworkId, FrameworkValidationResult> {
  return { ...results, [framework]: { ...results[framework], artifacts } };
}

function stubGit(stdout: string) {
  return () => stdout;
}

describe("projectGitRange", () => {
  it("returns empty matched when the range has no changed paths", () => {
    const manifest = manifestWith([
      {
        framework: "react",
        component: "Button",
        paths: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(""),
    });
    expect(out.mode).toEqual({
      kind: "git_range",
      rangeNotation: "origin/main...HEAD",
    });
    expect(out.matchedGroups).toEqual([]);
    expect(out.changedGeneratedPaths).toEqual([]);
    expect(out.unmatchedGeneratedPaths).toEqual([]);
    expect(out.nonGeneratedChangedPaths).toEqual([]);
  });

  it("matches a changed path against the manifest group and includes admission entries", () => {
    const manifest = manifestWith([
      {
        framework: "react",
        component: "Button",
        paths: [
          "packages/ds-react/src/components/Button/Button.tsx",
          "packages/ds-react/src/components/Button/Button.css",
        ],
      },
    ]);
    const results = withArtifacts(emptyResults(), "react", [
      {
        component: "Button",
        paths: [
          "packages/ds-react/src/components/Button/Button.tsx",
          "packages/ds-react/src/components/Button/Button.css",
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
    ]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results,
      gitExec: stubGit(
        "packages/ds-react/src/components/Button/Button.tsx\n",
      ),
    });
    expect(out.matchedGroups).toHaveLength(1);
    expect(out.matchedGroups[0]!.component).toBe("Button");
    expect(out.matchedGroups[0]!.framework).toBe("react");
    expect(out.matchedGroups[0]!.admission).toHaveLength(1);
    expect(out.matchedGroups[0]!.admission[0]!.coverage).toBe(
      "covered_by_package_check",
    );
    expect(out.unmatchedGeneratedPaths).toEqual([]);
  });

  it("surfaces changed generated paths that no manifest group claims", () => {
    const manifest = manifestWith([
      {
        framework: "react",
        component: "Button",
        paths: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(
        "packages/ds-react/src/components/Ghost/Ghost.tsx\n",
      ),
    });
    expect(out.matchedGroups).toEqual([]);
    expect(out.unmatchedGeneratedPaths).toEqual([
      "packages/ds-react/src/components/Ghost/Ghost.tsx",
    ]);
  });

  it("classifies non-generated changed paths as context", () => {
    const manifest = manifestWith([]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(
        "packages/ds-contracts/Button.contract.json\n" +
          "packages/ds-codegen/src/emitter.ts\n",
      ),
    });
    expect(out.changedGeneratedPaths).toEqual([]);
    expect(out.nonGeneratedChangedPaths).toEqual([
      "packages/ds-contracts/Button.contract.json",
      "packages/ds-codegen/src/emitter.ts",
    ]);
  });

  it("excludes tmp/, dist/, and the emission manifest from non-generated context", () => {
    const manifest = manifestWith([]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(
        "tmp/generated-admission-report.md\n" +
          "packages/ds-codegen/dist/cli.js\n" +
          "packages/ds-codegen/.emission-manifest.json\n" +
          "packages/ds-contracts/Button.contract.json\n",
      ),
    });
    // Only the contract survives; the rest are excluded.
    expect(out.nonGeneratedChangedPaths).toEqual([
      "packages/ds-contracts/Button.contract.json",
    ]);
  });

  it("handles a mixed range with matched, unmatched, and non-generated paths simultaneously", () => {
    const manifest = manifestWith([
      {
        framework: "react",
        component: "Button",
        paths: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ]);
    const results = withArtifacts(emptyResults(), "react", [
      {
        component: "Button",
        paths: ["packages/ds-react/src/components/Button/Button.tsx"],
        admission: [
          {
            check: "typecheck",
            command: "tsc",
            status: "pass",
            coverage: "covered_by_package_check",
          },
        ],
      },
    ]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results,
      gitExec: stubGit(
        "packages/ds-react/src/components/Button/Button.tsx\n" +
          "packages/ds-react/src/components/Untracked/Untracked.tsx\n" +
          "packages/ds-contracts/Button.contract.json\n",
      ),
    });
    expect(out.matchedGroups).toHaveLength(1);
    expect(out.unmatchedGeneratedPaths).toEqual([
      "packages/ds-react/src/components/Untracked/Untracked.tsx",
    ]);
    expect(out.nonGeneratedChangedPaths).toEqual([
      "packages/ds-contracts/Button.contract.json",
    ]);
  });

  it("returns empty arrays on a git exec failure (does not throw)", () => {
    const manifest = manifestWith([]);
    const out = projectGitRange({
      rangeNotation: "origin/main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: () => {
        throw new Error("git: unknown revision");
      },
    });
    expect(out.matchedGroups).toEqual([]);
    expect(out.changedGeneratedPaths).toEqual([]);
    expect(out.unmatchedGeneratedPaths).toEqual([]);
    expect(out.nonGeneratedChangedPaths).toEqual([]);
    expect(out.mode).toEqual({
      kind: "git_range",
      rangeNotation: "origin/main...HEAD",
    });
  });

  it("preserves the operator's exact range notation in mode.rangeNotation", () => {
    // Both `..` and `...` forms are passed verbatim — the
    // projection does not normalize.
    const manifest = manifestWith([]);
    const asym = projectGitRange({
      rangeNotation: "main..HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(""),
    });
    expect(asym.mode).toEqual({ kind: "git_range", rangeNotation: "main..HEAD" });
    const sym = projectGitRange({
      rangeNotation: "main...HEAD",
      workspaceRoot: "/tmp/fake",
      manifest,
      results: emptyResults(),
      gitExec: stubGit(""),
    });
    expect(sym.mode).toEqual({ kind: "git_range", rangeNotation: "main...HEAD" });
  });
});
