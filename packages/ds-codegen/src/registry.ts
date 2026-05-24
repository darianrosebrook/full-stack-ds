/**
 * Framework emitter registry.
 *
 * Targets are configured here so the CLI can ask "which packages do you
 * generate into for `react`/`vue`/...". Each target binds a
 * `FrameworkEmitter` to an output package root.
 *
 * To register a new target:
 *   1. Implement a `createXxxEmitter` factory in `frameworks/xxx`.
 *   2. Add its workspace root and emitter to `createDefaultRegistry`.
 *   3. Done — the CLI flag `--target=xxx` becomes available automatically.
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

export interface TargetBinding {
  id: TargetId;
  emitter: FrameworkEmitter;
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
}

/**
 * Build the default registry. Targets without a corresponding workspace
 * package (e.g. before `packages/ds-vue` exists) are simply omitted; the CLI
 * surfaces "unknown target" if a missing one is requested.
 */
export function createDefaultRegistry(opts: RegistryOptions): TargetRegistry {
  const bindings = new Map<TargetId, TargetBinding>();

  // React target
  const reactRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-react",
    "src",
    "components",
  );
  bindings.set("react", {
    id: "react",
    emitter: createReactEmitter({
      stackImportRelative: readReactStackImportFromPrimitiveContract(
        opts.contractsRoot,
      ),
    }),
    componentsRoot: reactRoot,
    barrelFile: "index.ts",
  });

  // Vue target — registered only when the package exists on disk.
  const vueRoot = path.join(
    opts.workspaceRoot,
    "packages",
    "ds-vue",
    "src",
    "components",
  );
  if (workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-vue"))) {
    bindings.set("vue", {
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
  if (workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-angular"))) {
    bindings.set("angular", {
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
  if (workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-lit"))) {
    bindings.set("lit", {
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
  if (workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-svelte"))) {
    bindings.set("svelte", {
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
  if (workspaceExists(path.join(opts.workspaceRoot, "packages", "ds-figma-plugin"))) {
    bindings.set("figma", {
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
  };
}

function workspaceExists(packageRoot: string): boolean {
  return fs.existsSync(path.join(packageRoot, "package.json"));
}
