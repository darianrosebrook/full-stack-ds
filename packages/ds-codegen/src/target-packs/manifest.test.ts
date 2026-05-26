import { describe, expect, it } from "vitest";
import { BUILTIN_TARGET_PACKS } from "./builtin.js";
import {
  TARGET_PACK_MANIFEST_SCHEMA_VERSION,
  assertTargetPackManifestV1,
  validateTargetPackManifestV1,
  type TargetPackManifestV1,
} from "./manifest.js";

function validManifest(overrides: Partial<TargetPackManifestV1> = {}): TargetPackManifestV1 {
  return {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "solid",
      family: "web-dom",
      label: "Solid",
      maturity: "experimental",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "dist/emitter.js",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "test-source"],
    },
    capabilities: {
      components: true,
      tests: true,
      behavior: true,
      compoundParts: true,
      surface: true,
      tokens: "css-custom-properties",
      customRegions: true,
    },
    permissions: {
      filesystem: "package-output-only",
      network: false,
      postinstall: false,
    },
    ...overrides,
  };
}

describe("TargetPackManifestV1", () => {
  it("accepts the built-in target-pack manifests", () => {
    for (const manifest of Object.values(BUILTIN_TARGET_PACKS)) {
      expect(() => assertTargetPackManifestV1(manifest)).not.toThrow();
    }
  });

  it("accepts a valid external-shaped target manifest", () => {
    const result = validateTargetPackManifestV1(validManifest());
    expect(result).toEqual({ ok: true, errors: [] });
  });

  it("rejects path escapes in entrypoints and outputs", () => {
    expect(() =>
      assertTargetPackManifestV1(
        validManifest({
          entrypoints: { emitter: "../escape.js" },
        }),
      ),
    ).toThrow(/must not escape/);

    expect(() =>
      assertTargetPackManifestV1(
        validManifest({
          outputs: {
            componentsRoot: "../outside",
            barrelFile: "index.ts",
            fileKinds: ["component-source"],
          },
        }),
      ),
    ).toThrow(/must not escape/);
  });

  it("rejects unsafe execution permissions", () => {
    expect(() =>
      assertTargetPackManifestV1(
        validManifest({
          permissions: {
            filesystem: "package-output-only",
            network: true,
            postinstall: false,
          },
        }),
      ),
    ).toThrow(/no network and no postinstall/);
  });

  it("keeps target-family as the closed vocabulary, not framework ids", () => {
    expect(() =>
      assertTargetPackManifestV1(
        validManifest({
          target: {
            id: "new-renderer",
            family: "web-native" as never,
            label: "New Renderer",
            maturity: "experimental",
          },
        }),
      ),
    ).toThrow(/target.family/);
  });
});
