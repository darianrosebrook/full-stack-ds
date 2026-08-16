/**
 * Jetpack Compose FrameworkEmitter.
 *
 * Targets Jetpack Compose: each component emits a `.kt` file exporting a
 * top-level `@Composable fun ${Name}(...)`. Compound parts would become
 * sibling composables in the same file; behavior composes inline via
 * `remember { ... }` + Compose effects.
 *
 * Registered as an explicit-only builtin target (`--target=jetpack-compose`)
 * in FEAT-COMPOSE-EMITTER-WIRING-001, the Compose twin of the SwiftUI
 * registration: the emitter implements the native-collapse path only
 * (Switch/ToggleSwitch via `native-toggle-affordance`); multi-part anatomy
 * and anchored surfaces throw explicit not-implemented errors, so
 * corpus-wide generation and default-rail admission stay out of scope until
 * those paths exist.
 *
 * Deliberate emission gaps in this slice (mirroring the SwiftUI wiring):
 *   - Tests return `[]`: the Gradle module has no test source set yet.
 *     Generated tests arrive with a dedicated test target in a later slice.
 *   - No behavior/state files: the controlled/uncontrolled channel pattern
 *     lives inline in the composable (`remember { mutableStateOf(...) }`),
 *     so no `remember${Name}State()` factory is emitted yet.
 *   - discoverComponentIds returns [] until the components root exists on
 *     disk in the consuming checkout (the CLI treats an empty package as
 *     "nothing to preserve"; the barrel still records the emit list).
 */
import fs from "node:fs";
import path from "node:path";
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import { generateJetpackComposeComponentSource } from "./component-source.js";
import { generateJetpackComposeBarrel } from "./barrel.js";
import {
  generateJetpackComposeSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";

export function createJetpackComposeEmitter(): FrameworkEmitter {
  return {
    id: "jetpack-compose",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        // Anchored surfaces are not implemented in this slice — the call
        // throws the scaffold's explicit not-implemented error.
        const surfaceFiles = generateJetpackComposeSurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/${ir.name}.kt`,
            contents: surfaceFiles.componentFile,
            preservable: true,
          },
        ];
      }
      const source = generateJetpackComposeComponentSource(ir);
      return [
        {
          relativePath: `${ir.name}/${ir.name}.kt`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitTests(_ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [];
    },

    emitHook(_ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateJetpackComposeBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs
        .readdirSync(componentsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) =>
          fs.existsSync(path.join(componentsRoot, name, `${name}.kt`)),
        )
        .sort();
    },
  };
}
