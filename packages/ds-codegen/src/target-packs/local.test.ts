import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { TargetRegistryConfigTargetV1 } from "./config.js";
import {
  LOCAL_TARGET_PACK_EXECUTION_REASON,
  LOCAL_TARGET_PACK_EXECUTION_STATUS,
  loadLocalTargetPackManifestV1,
} from "./local.js";
import {
  TARGET_PACK_MANIFEST_SCHEMA_VERSION,
  type TargetPackManifestV1,
} from "./manifest.js";

function makeWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "fsds-local-pack-"));
}

function solidManifest(overrides: Partial<TargetPackManifestV1> = {}): TargetPackManifestV1 {
  return {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "solid",
      family: "web-dom",
      label: "Solid",
      maturity: "experimental",
    },
    compatibility: {
      codegenProtocol: "target-pack-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "dist/emitter.js",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "test-source", "barrel"],
    },
    capabilities: {
      components: true,
      tests: true,
      behavior: false,
      compoundParts: false,
      surface: true,
      tokens: "css-custom-properties",
      customRegions: false,
    },
    permissions: {
      filesystem: "package-output-only",
      network: false,
      postinstall: false,
    },
    ...overrides,
  };
}

function localTarget(
  source: TargetRegistryConfigTargetV1["source"] = {
    kind: "local",
    packageRoot: "packages/ds-solid",
    manifest: "fsds.target-pack.json",
  },
): TargetRegistryConfigTargetV1 {
  return {
    id: "solid",
    source,
  };
}

function writeLocalPack(
  workspace: string,
  manifest: TargetPackManifestV1 = solidManifest(),
): { packageRoot: string; manifestContents: string } {
  const packageRoot = path.join(workspace, "packages", "ds-solid");
  fs.mkdirSync(path.join(packageRoot, "dist"), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, "dist", "emitter.js"), "export {};\n");
  const manifestContents = `${JSON.stringify(manifest, null, 2)}\n`;
  fs.writeFileSync(path.join(packageRoot, "fsds.target-pack.json"), manifestContents);
  return { packageRoot, manifestContents };
}

function sha256(contents: string): string {
  return createHash("sha256").update(contents).digest("hex");
}

describe("loadLocalTargetPackManifestV1", () => {
  it("loads, validates, fingerprints, and keeps a local target pack metadata-only", () => {
    const workspace = makeWorkspace();
    const { packageRoot, manifestContents } = writeLocalPack(workspace);

    const loaded = loadLocalTargetPackManifestV1(workspace, localTarget());

    expect(loaded.id).toBe("solid");
    expect(loaded.packageRoot).toBe(packageRoot);
    expect(loaded.packageRootRelative).toBe("packages/ds-solid");
    expect(loaded.manifestRelative).toBe("fsds.target-pack.json");
    expect(loaded.manifestSha256).toBe(sha256(manifestContents));
    expect(loaded.entrypointRelative).toBe("dist/emitter.js");
    expect(loaded.targetPack.target.id).toBe("solid");
    expect(loaded.execution).toEqual({
      status: LOCAL_TARGET_PACK_EXECUTION_STATUS,
      reason: LOCAL_TARGET_PACK_EXECUTION_REASON,
    });
  });

  it("rejects missing local package roots", () => {
    const workspace = makeWorkspace();
    expect(() => loadLocalTargetPackManifestV1(workspace, localTarget())).toThrow(
      /local packageRoot does not exist/,
    );
  });

  it("rejects local manifest path escapes during resolution", () => {
    const workspace = makeWorkspace();
    writeLocalPack(workspace);

    expect(() =>
      loadLocalTargetPackManifestV1(
        workspace,
        localTarget({
          kind: "local",
          packageRoot: "packages/ds-solid",
          manifest: "../outside.json",
        }),
      ),
    ).toThrow(/source\.manifest must not escape/);
  });

  it("rejects manifest ids that do not match the registry target id", () => {
    const workspace = makeWorkspace();
    writeLocalPack(
      workspace,
      solidManifest({
        target: {
          id: "not-solid",
          family: "web-dom",
          label: "Not Solid",
          maturity: "experimental",
        },
      }),
    );

    expect(() => loadLocalTargetPackManifestV1(workspace, localTarget())).toThrow(
      /local manifest id mismatch/,
    );
  });

  it("rejects missing local emitter entrypoints without importing anything", () => {
    const workspace = makeWorkspace();
    const packageRoot = path.join(workspace, "packages", "ds-solid");
    fs.mkdirSync(packageRoot, { recursive: true });
    fs.writeFileSync(
      path.join(packageRoot, "fsds.target-pack.json"),
      `${JSON.stringify(solidManifest(), null, 2)}\n`,
    );

    expect(() => loadLocalTargetPackManifestV1(workspace, localTarget())).toThrow(
      /local emitter entrypoint does not exist/,
    );
  });

  it("rejects unsafe manifest permissions through the shared manifest validator", () => {
    const workspace = makeWorkspace();
    writeLocalPack(
      workspace,
      solidManifest({
        permissions: {
          filesystem: "package-output-only",
          network: true,
          postinstall: false,
        },
      }),
    );

    expect(() => loadLocalTargetPackManifestV1(workspace, localTarget())).toThrow(
      /no network and no postinstall/,
    );
  });
});
