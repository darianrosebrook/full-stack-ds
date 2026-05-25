import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createDefaultRegistry } from "./registry.js";
import {
  TARGET_REGISTRY_CONFIG_FILENAME,
  TARGET_REGISTRY_CONFIG_SCHEMA_VERSION,
  type TargetRegistryConfigV1,
} from "./target-packs/config.js";
import {
  TARGET_PACK_MANIFEST_SCHEMA_VERSION,
  type TargetPackManifestV1,
} from "./target-packs/manifest.js";

function makeWorkspace(): string {
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-registry-"));
  fs.mkdirSync(path.join(workspace, "packages", "ds-contracts"), { recursive: true });
  return workspace;
}

function writeConfig(workspace: string, config: TargetRegistryConfigV1): void {
  fs.writeFileSync(
    path.join(workspace, TARGET_REGISTRY_CONFIG_FILENAME),
    `${JSON.stringify(config, null, 2)}\n`,
  );
}

function registryConfig(targets: TargetRegistryConfigV1["targets"]): TargetRegistryConfigV1 {
  return {
    schemaVersion: TARGET_REGISTRY_CONFIG_SCHEMA_VERSION,
    targets,
  };
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

function writeLocalPack(workspace: string, manifest: TargetPackManifestV1 = solidManifest()): void {
  const packageRoot = path.join(workspace, "packages", "ds-solid");
  fs.mkdirSync(path.join(packageRoot, "dist"), { recursive: true });
  fs.writeFileSync(path.join(packageRoot, "dist", "emitter.js"), "export {};\n");
  fs.writeFileSync(
    path.join(packageRoot, "fsds.target-pack.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

describe("createDefaultRegistry local target-pack declarations", () => {
  it("loads local target packs as declared metadata without making them executable", () => {
    const workspace = makeWorkspace();
    writeLocalPack(workspace);
    writeConfig(
      workspace,
      registryConfig([
        {
          id: "solid",
          source: {
            kind: "local",
            packageRoot: "packages/ds-solid",
            manifest: "fsds.target-pack.json",
          },
        },
      ]),
    );

    const registry = createDefaultRegistry({
      workspaceRoot: workspace,
      contractsRoot: path.join(workspace, "packages", "ds-contracts"),
    });

    expect(registry.available()).toEqual([]);
    expect(registry.declared()).toEqual(["solid"]);
    expect(registry.has("solid")).toBe(false);
    expect(registry.describe("solid").target.id).toBe("solid");
    expect(registry.describeDeclaration("solid")).toMatchObject({
      id: "solid",
      sourceKind: "local",
      executable: false,
      local: {
        packageRootRelative: "packages/ds-solid",
        manifestRelative: "fsds.target-pack.json",
        entrypointRelative: "dist/emitter.js",
        execution: {
          status: "metadata-only",
          reason: "local_emitter_execution_not_implemented",
        },
      },
    });
    expect(() => registry.get("solid")).toThrow(/not executable/);
  });

  it("fails registry construction when a local declaration cannot be loaded", () => {
    const workspace = makeWorkspace();
    writeConfig(
      workspace,
      registryConfig([
        {
          id: "solid",
          source: {
            kind: "local",
            packageRoot: "packages/ds-solid",
            manifest: "fsds.target-pack.json",
          },
        },
      ]),
    );

    expect(() =>
      createDefaultRegistry({
        workspaceRoot: workspace,
        contractsRoot: path.join(workspace, "packages", "ds-contracts"),
      }),
    ).toThrow(/local packageRoot does not exist/);
  });
});
