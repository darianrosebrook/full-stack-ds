import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  detectOrphans,
  executeOrphanRemoval,
  type HandEditPolicy,
} from "./orphans.js";
import type { EmissionManifest } from "../validation/types.js";

/**
 * Build a fake workspace on a tmp dir, populated to match the
 * manifest passed in. Returns the root path so tests can pass it
 * into detect/execute and assert on resulting on-disk state.
 *
 * `liveContracts` lists the contract paths that should actually
 * exist on disk. Anything in the manifest but NOT in this list is
 * the orphan case under test.
 */
function buildFakeWorkspace(
  manifest: EmissionManifest,
  options: {
    liveContracts: string[];
    /** Files that should be created with the @generated marker. */
    generatedFiles?: string[];
    /** Files that should be created without the marker. */
    handEditedFiles?: string[];
    /** Files referenced in the manifest that should NOT exist on disk. */
    missingFiles?: string[];
  },
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-prune-"));

  for (const rel of options.liveContracts) {
    const abs = path.join(root, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, "{}\n");
  }

  const generated = new Set(options.generatedFiles ?? []);
  const hand = new Set(options.handEditedFiles ?? []);
  const missing = new Set(options.missingFiles ?? []);

  for (const group of manifest.groups) {
    for (const file of group.files) {
      if (missing.has(file.path)) continue;
      const abs = path.join(root, file.path);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      if (generated.has(file.path)) {
        fs.writeFileSync(
          abs,
          "// @generated:start imports\nimport x from 'y';\n// @generated:end\n",
        );
      } else if (hand.has(file.path)) {
        fs.writeFileSync(abs, "// hand-authored, no marker\nexport const x = 1;\n");
      } else {
        // Default: treat as generated for tests that don't care.
        fs.writeFileSync(
          abs,
          "// @generated:start imports\nimport x from 'y';\n// @generated:end\n",
        );
      }
    }
  }

  return root;
}

function manifest(
  groups: { framework: "react" | "vue"; component: string; contractPath: string; files: string[] }[],
): EmissionManifest {
  return {
    schemaVersion: 5,
    generatedAt: "2026-05-21T05:10:26.572Z",
    environment: {
      nodeMajor: 22,
      codegenPackageVersion: "1.0.0",
      lockfile: { path: "pnpm-lock.yaml", sha256: "0".repeat(64) },
    },
    emitterSourceSets: {},
    groups: groups.map((g) => ({
      framework: g.framework,
      component: g.component,
      contract: { path: g.contractPath, sha256: "0".repeat(64) },
      files: g.files.map((p) => ({ path: p, sha256: "0".repeat(64) })),
    })),
  } as unknown as EmissionManifest;
}

const PIN = new Date("2026-05-21T11:23:45.678Z");

describe("detectOrphans", () => {
  let root: string;
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("returns no orphans when every contract still exists", () => {
    const m = manifest([
      {
        framework: "react",
        component: "Button",
        contractPath: "packages/ds-contracts/components/Button/Button.contract.json",
        files: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ]);
    root = buildFakeWorkspace(m, {
      liveContracts: ["packages/ds-contracts/components/Button/Button.contract.json"],
    });

    expect(detectOrphans(m, root)).toEqual([]);
  });

  it("flags a group as orphan when its contract is missing", () => {
    const m = manifest([
      {
        framework: "react",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: [
          "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx",
          "packages/ds-react/src/components/AspectRatio/AspectRatio.css",
        ],
      },
    ]);
    root = buildFakeWorkspace(m, { liveContracts: [] });

    const orphans = detectOrphans(m, root);
    expect(orphans).toHaveLength(1);
    expect(orphans[0].component).toBe("AspectRatio");
    expect(orphans[0].framework).toBe("react");
    expect(orphans[0].files.map((f) => f.path).sort()).toEqual([
      "packages/ds-react/src/components/AspectRatio/AspectRatio.css",
      "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx",
    ]);
  });

  it("classifies each file by its generated/hand-edited/missing kind", () => {
    const m = manifest([
      {
        framework: "react",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: [
          "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx", // generated
          "packages/ds-react/src/components/AspectRatio/AspectRatio.css", // hand
          "packages/ds-react/src/components/AspectRatio/Removed.tsx", // missing
        ],
      },
    ]);
    root = buildFakeWorkspace(m, {
      liveContracts: [],
      generatedFiles: ["packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"],
      handEditedFiles: ["packages/ds-react/src/components/AspectRatio/AspectRatio.css"],
      missingFiles: ["packages/ds-react/src/components/AspectRatio/Removed.tsx"],
    });

    const orphans = detectOrphans(m, root);
    const byPath = Object.fromEntries(orphans[0].files.map((f) => [f.path, f.kind]));
    expect(byPath["packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"]).toBe("generated");
    expect(byPath["packages/ds-react/src/components/AspectRatio/AspectRatio.css"]).toBe("hand_edited");
    expect(byPath["packages/ds-react/src/components/AspectRatio/Removed.tsx"]).toBe("missing");
  });

  it("returns one orphan group per (framework, component) pair", () => {
    const m = manifest([
      {
        framework: "react",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: ["packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"],
      },
      {
        framework: "vue",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: ["packages/ds-vue/src/components/AspectRatio/AspectRatio.vue"],
      },
    ]);
    root = buildFakeWorkspace(m, { liveContracts: [] });

    const orphans = detectOrphans(m, root);
    expect(orphans.map((g) => `${g.framework}/${g.component}`).sort()).toEqual([
      "react/AspectRatio",
      "vue/AspectRatio",
    ]);
  });
});

describe("executeOrphanRemoval", () => {
  let root: string;
  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  function commonManifest() {
    return manifest([
      {
        framework: "react",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: [
          "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx", // generated
          "packages/ds-react/src/components/AspectRatio/AspectRatio.css", // hand
        ],
      },
    ]);
  }

  function setup(policy: HandEditPolicy) {
    const m = commonManifest();
    root = buildFakeWorkspace(m, {
      liveContracts: [],
      generatedFiles: ["packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"],
      handEditedFiles: ["packages/ds-react/src/components/AspectRatio/AspectRatio.css"],
    });
    const orphans = detectOrphans(m, root);
    return { orphans, report: executeOrphanRemoval(orphans, policy, root, PIN) };
  }

  it("policy=skip: deletes generated, leaves hand-edited in place", () => {
    const { report } = setup("skip");

    expect(report.deleted.map((f) => f.path)).toEqual([
      "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx",
    ]);
    expect(report.skipped.map((f) => f.path)).toEqual([
      "packages/ds-react/src/components/AspectRatio/AspectRatio.css",
    ]);
    expect(report.quarantined).toEqual([]);

    // The .tsx is gone, the .css remains.
    expect(
      fs.existsSync(
        path.join(root, "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"),
      ),
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(root, "packages/ds-react/src/components/AspectRatio/AspectRatio.css"),
      ),
    ).toBe(true);
  });

  it("policy=skip: does NOT remove the component dir when hand-edited files remain", () => {
    const { report } = setup("skip");
    expect(report.removedDirs).toEqual([]);
    expect(
      fs.existsSync(path.join(root, "packages/ds-react/src/components/AspectRatio")),
    ).toBe(true);
  });

  it("policy=force: deletes both generated and hand-edited files", () => {
    const { report } = setup("force");

    expect(report.deleted.map((f) => f.path).sort()).toEqual([
      "packages/ds-react/src/components/AspectRatio/AspectRatio.css",
      "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx",
    ]);
    expect(report.skipped).toEqual([]);
    expect(report.quarantined).toEqual([]);

    // The whole component dir is gone.
    expect(
      fs.existsSync(path.join(root, "packages/ds-react/src/components/AspectRatio")),
    ).toBe(false);
    expect(report.removedDirs.some((d) => d.endsWith("AspectRatio"))).toBe(true);
  });

  it("policy=quarantine: moves hand-edited files into the timestamped sidecar", () => {
    const { report } = setup("quarantine");

    expect(report.deleted.map((f) => f.path)).toEqual([
      "packages/ds-react/src/components/AspectRatio/AspectRatio.tsx",
    ]);
    expect(report.quarantined).toHaveLength(1);
    expect(report.quarantined[0].from.path).toBe(
      "packages/ds-react/src/components/AspectRatio/AspectRatio.css",
    );
    expect(report.quarantined[0].to).toContain(
      path.join(".orphan-quarantine", "2026-05-21T11-23-45-678Z", "react", "AspectRatio"),
    );
    expect(report.quarantineRoot).toBeDefined();
    expect(report.quarantineRoot).toContain("2026-05-21T11-23-45-678Z");

    // Hand-edited file moved (not still in place); .tsx deleted.
    expect(
      fs.existsSync(
        path.join(root, "packages/ds-react/src/components/AspectRatio/AspectRatio.css"),
      ),
    ).toBe(false);
    expect(fs.existsSync(report.quarantined[0].to)).toBe(true);
  });

  it("policy=quarantine: removes the now-empty component dir after the move", () => {
    const { report } = setup("quarantine");
    expect(
      fs.existsSync(path.join(root, "packages/ds-react/src/components/AspectRatio")),
    ).toBe(false);
    expect(report.removedDirs.some((d) => d.endsWith("AspectRatio"))).toBe(true);
  });

  it("collapses framework component-root only when it becomes empty", () => {
    const m = manifest([
      {
        framework: "react",
        component: "AspectRatio",
        contractPath: "packages/ds-contracts/components/AspectRatio/AspectRatio.contract.json",
        files: ["packages/ds-react/src/components/AspectRatio/AspectRatio.tsx"],
      },
    ]);
    root = buildFakeWorkspace(m, { liveContracts: [] });
    // Also drop a sibling Button dir that is NOT in the orphan set.
    fs.mkdirSync(path.join(root, "packages/ds-react/src/components/Button"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(root, "packages/ds-react/src/components/Button/Button.tsx"),
      "// @generated:start\nx\n// @generated:end\n",
    );

    const orphans = detectOrphans(m, root);
    executeOrphanRemoval(orphans, "skip", root, PIN);

    // AspectRatio dir was removed. The framework components root is
    // kept because Button still lives there.
    expect(
      fs.existsSync(path.join(root, "packages/ds-react/src/components/AspectRatio")),
    ).toBe(false);
    expect(fs.existsSync(path.join(root, "packages/ds-react/src/components/Button"))).toBe(
      true,
    );
  });

  it("returns an empty report when there are no orphans", () => {
    const m = manifest([
      {
        framework: "react",
        component: "Button",
        contractPath: "packages/ds-contracts/components/Button/Button.contract.json",
        files: ["packages/ds-react/src/components/Button/Button.tsx"],
      },
    ]);
    root = buildFakeWorkspace(m, {
      liveContracts: ["packages/ds-contracts/components/Button/Button.contract.json"],
    });

    const orphans = detectOrphans(m, root);
    const report = executeOrphanRemoval(orphans, "skip", root, PIN);
    expect(report).toEqual({
      deleted: [],
      quarantined: [],
      skipped: [],
      removedDirs: [],
    });
  });
});
