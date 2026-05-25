import type { TargetId } from "../emitter.js";
import type { TargetPackManifestV1 } from "./manifest.js";
import { TARGET_PACK_MANIFEST_SCHEMA_VERSION } from "./manifest.js";

const WEB_DOM_CAPABILITIES = {
  components: true,
  tests: true,
  behavior: true,
  compoundParts: true,
  surface: true,
  tokens: "css-custom-properties",
  customRegions: true,
} as const;

const SAFE_BUILTIN_PERMISSIONS = {
  filesystem: "package-output-only",
  network: false,
  postinstall: false,
} as const;

export const BUILTIN_TARGET_PACKS: Readonly<Record<TargetId, TargetPackManifestV1>> = {
  react: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "react",
      family: "web-dom",
      label: "React",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/react/factory.ts",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "behavior-source", "test-source", "style-source", "barrel"],
    },
    capabilities: WEB_DOM_CAPABILITIES,
    permissions: SAFE_BUILTIN_PERMISSIONS,
  },
  vue: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "vue",
      family: "web-dom",
      label: "Vue",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/vue/factory.ts",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "behavior-source", "test-source", "style-source", "barrel"],
    },
    capabilities: WEB_DOM_CAPABILITIES,
    permissions: SAFE_BUILTIN_PERMISSIONS,
  },
  lit: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "lit",
      family: "web-dom",
      label: "Lit",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/lit/factory.ts",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "behavior-source", "test-source", "style-source", "barrel"],
    },
    capabilities: WEB_DOM_CAPABILITIES,
    permissions: SAFE_BUILTIN_PERMISSIONS,
  },
  svelte: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "svelte",
      family: "web-dom",
      label: "Svelte",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/svelte/factory.ts",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "behavior-source", "test-source", "style-source", "barrel"],
    },
    capabilities: WEB_DOM_CAPABILITIES,
    permissions: SAFE_BUILTIN_PERMISSIONS,
  },
  angular: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "angular",
      family: "web-dom",
      label: "Angular",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "web-dom@current-inline",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/angular/factory.ts",
    },
    outputs: {
      componentsRoot: "src/components",
      barrelFile: "index.ts",
      fileKinds: ["component-source", "behavior-source", "test-source", "style-source", "barrel"],
    },
    capabilities: WEB_DOM_CAPABILITIES,
    permissions: SAFE_BUILTIN_PERMISSIONS,
  },
  figma: {
    schemaVersion: TARGET_PACK_MANIFEST_SCHEMA_VERSION,
    target: {
      id: "figma",
      family: "design-tool",
      label: "Figma",
      maturity: "builtin",
    },
    compatibility: {
      codegenProtocol: "builtin-framework-emitter-v1",
      componentIR: "ComponentIR@v1",
      targetFamilyIR: "design-tool@descriptor-v1",
    },
    entrypoints: {
      emitter: "packages/ds-codegen/src/frameworks/figma/factory.ts",
    },
    outputs: {
      componentsRoot: "src/generated/components",
      barrelFile: "index.ts",
      fileKinds: ["descriptor", "documentation", "barrel"],
    },
    capabilities: {
      components: true,
      tests: false,
      behavior: false,
      compoundParts: true,
      surface: true,
      tokens: "descriptor-only",
      customRegions: false,
    },
    permissions: SAFE_BUILTIN_PERMISSIONS,
    admission: {
      commands: [
        {
          check: "typecheck",
          command: ["pnpm", "--filter", "@full-stack-ds/figma-plugin", "run", "typecheck"],
          scope: {
            packageRoot: "packages/ds-figma-plugin/",
            extensions: [".ts", ".json"],
            coverage: "covered_by_package_check",
          },
        },
      ],
      knownGaps: [
        "Admits descriptor registry/package integration only; does not prove live Figma canvas mutation, library publication, or MCP tool availability.",
      ],
    },
  },
};

export function getBuiltinTargetPackManifest(id: TargetId): TargetPackManifestV1 {
  return BUILTIN_TARGET_PACKS[id];
}
