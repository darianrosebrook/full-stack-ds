/**
 * Framework emitter registry.
 *
 * Targets are configured here so the CLI can ask "which packages do you
 * generate into for `react`/`vue`/...". Each target binds a
 * `FrameworkEmitter` to an output package root.
 *
 * This registry is now manifest-backed for built-in targets. The manifest
 * does not change emission behavior yet; it records the governed target-pack
 * contract that a future external package loader will consume. Framework
 * emitters remain in-process and built-in for this slice.
 */
import fs from "node:fs";
import path from "node:path";
import type { FrameworkEmitter, TargetId } from "./emitter.js";
import { createAngularEmitter } from "./frameworks/angular/factory.js";
import { createFigmaEmitter } from "./frameworks/figma/factory.js";
import { createLitEmitter } from "./frameworks/lit/factory.js";
import { createReactEmitter } from "./frameworks/react/factory.js";
import { createSvelteEmitter } from "./frameworks/svelte/factory.js";
import { createVueEmitter } from "./frameworks/vue/factory.js";
import { readReactStackImportFromPrimitiveContract } from "./primitive-contract.js";
import { getBuiltinTargetPackManifest } from "./target-packs/builtin.js";
import {
  configuredBuiltinTargets,
  loadTargetRegistryConfigV1,
} from "./target-packs/config.js";
import {
  assertTargetPackManifestV1,
  type TargetPackManifestV1,
} from "./target-packs/manifest.js";

export interface TargetBinding {
  id: TargetId;
  emitter: FrameworkEmitter;
  /** Governed target-pack manifest that describes this target's contract. */
  targetPack: TargetPackManifestV1;
  /** Absolute path to the components root for this target. */
  componentsRoot: string;
  /** File name for the components barrel within the components root. */
  barrelFile: string;
}

export interface RegistryOptions {
  /** Absolute path to the workspace root (where `packages/` lives). */
  workspaceRoot: string;
  /** Absolute path to the contracts directory. */
  contractsRoot: string;
}

export interface TargetRegistry {
  available(): TargetId[];
  get(id: TargetId): TargetBinding;
  has(id: TargetId): boolean;
  describe(id: TargetId): TargetPackManifestV1;
}

/**
 * Build the default registry. Targets without a corresponding workspace
 * package (e.g. before `packages/ds-vue` exists) are simply omitted; the CLI
 * surfaces "unknown target" if a missing one is requested.
 */
export function createDefaultRegistry(opts: RegistryOptions): TargetRegistry {
  const loadedConfig = loadTargetRegistryConfigV1(opts.workspaceRoot);
  const configuredTargets = new Set(configuredBuiltinTargets(loadedConfig.config));
  const bindings = new Map<TargetId, TargetBinding>();

  // React target
  const reactRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-react",
    "src",
    "components",
  );
  if (configuredTargets.has("react")) {
    registerBuiltinTarget(bindings, {
      id: "react",
      emitter: createReactEmitter({
        stackImportRelative: readReactStackImportFromPrimitiveContract(
          opts.contractsRoot,
        ),
      }),
      componentsRoot: reactRoot,
      barrelFile: "index.ts",
    });
  }

  // Vue target — registered only when the package exists on disk.
  const vueRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-vue",
    "src",
    "components",
  );
  if (
    configuredTargets.has("vue") &&
    workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-vue"))
  ) {
    registerBuiltinTarget(bindings, {
      id: "vue",
      emitter: createVueEmitter(),
      componentsRoot: vueRoot,
      barrelFile: "index.ts",
    });
  }

  // Angular target
  const angularRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-angular",
    "src",
    "components",
  );
  if (
    configuredTargets.has("angular") &&
    workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-angular"))
  ) {
    registerBuiltinTarget(bindings, {
      id: "angular",
      emitter: createAngularEmitter(),
      componentsRoot: angularRoot,
      barrelFile: "index.ts",
    });
  }

  // Lit target
  const litRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-lit",
    "src",
    "components",
  );
  if (
    configuredTargets.has("lit") &&
    workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-lit"))
  ) {
    registerBuiltinTarget(bindings, {
      id: "lit",
      emitter: createLitEmitter(),
      componentsRoot: litRoot,
      barrelFile: "index.ts",
    });
  }

  // Svelte target
  const svelteRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-svelte",
    "src",
    "components",
  );
  if (
    configuredTargets.has("svelte") &&
    workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-svelte"))
  ) {
    registerBuiltinTarget(bindings, {
      id: "svelte",
      emitter: createSvelteEmitter(),
      componentsRoot: svelteRoot,
      barrelFile: "index.ts",
    });
  }

  // Figma target — descriptor output consumed by the desktop plugin package.
  const figmaRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-figma-plugin",
    "src",
    "generated",
    "components",
  );
  if (
    configuredTargets.has("figma") &&
    workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-figma-plugin"))
  ) {
    registerBuiltinTarget(bindings, {
      id: "figma",
      emitter: createFigmaEmitter(),
      componentsRoot: figmaRoot,
      barrelFile: "index.ts",
    });
  }

  return {
    available() {
      return [...bindings.keys()];
    },
    get(id) {
      const b = bindings.get(id);
      if (!b) throw new Error(`Target "${id}" is not registered.`);
      return b;
    },
    has(id) {
      return bindings.has(id);
    },
    describe(id) {
      const b = bindings.get(id);
      if (!b) throw new Error(`Target "${id}" is not registered.`);
      return b.targetPack;
    },
  };
}

function registerBuiltinTarget(
  bindings: Map<TargetId, TargetBinding>,
  binding: Omit<TargetBinding, "targetPack">,
): void {
  const targetPack = getBuiltinTargetPackManifest(binding.id);
  assertTargetPackManifestV1(targetPack);
  if (targetPack.target.id !== binding.id) {
    throw new Error(
      `Target-pack manifest id ${targetPack.target.id} does not match registry id ${binding.id}.`,
    );
  }
  bindings.set(binding.id, { ...binding, targetPack });
}

function workspaceExists(packageRoot: string): boolean {
  return fs.existsSync(path.join(packageRoot, "package.json"));
}
