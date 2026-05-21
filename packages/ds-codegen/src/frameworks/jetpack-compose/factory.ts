/**
 * Jetpack Compose FrameworkEmitter — scaffold only.
 *
 * Targets Jetpack Compose: each component emits a `.kt` file exporting a
 * top-level `@Composable fun ${Name}(...)`. Compound parts become sibling
 * composables in the same file. Behavior is composed inline via
 * `remember { ... }` + Compose effects (`LaunchedEffect`,
 * `DisposableEffect`), so the "hook" file maps to a separate `${Name}State.kt`
 * exposing a `remember${Name}State()` factory and a `${Name}State` class —
 * the Compose idiom for hoisted state.
 *
 * NOT YET REGISTERED: `"jetpack-compose"` is not a member of `TargetId`.
 * The factory casts its `id` so the object satisfies `FrameworkEmitter`
 * in isolation; wiring into the CLI requires widening `TargetId` and
 * `KNOWN_TARGETS` in `../../emitter.ts` and adding a binding in
 * `../../registry.ts`.
 */
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
  TargetId,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import { generateJetpackComposeComponentSource } from "./component-source.js";
import { generateJetpackComposeHookSource } from "./hook-source.js";
import { generateJetpackComposeBarrel } from "./barrel.js";
import { generateJetpackComposeTest } from "./tests.js";
import {
  generateJetpackComposeSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateJetpackComposeSurfaceTest } from "./surface-tests.js";

export function createJetpackComposeEmitter(): FrameworkEmitter {
  return {
    id: "jetpack-compose" as TargetId,

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
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

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        return [
          {
            relativePath: `${ir.name}/test/${ir.name}Test.kt`,
            contents: generateJetpackComposeSurfaceTest(ir),
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/test/${ir.name}Test.kt`,
          contents: generateJetpackComposeTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateJetpackComposeSurfaceFiles(ir);
        if (!surfaceFiles.stateFile) return [];
        return [
          {
            relativePath: `${ir.name}/${ir.name}State.kt`,
            contents: surfaceFiles.stateFile,
            preservable: true,
          },
        ];
      }
      const source = generateJetpackComposeHookSource(ir);
      if (!source) return [];
      return [
        {
          relativePath: `${ir.name}/${ir.name}State.kt`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateJetpackComposeBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(_componentsRoot: string): string[] {
      // TODO: walk `${componentsRoot}/<Name>/<Name>.kt` once the
      // workspace package exists.
      return [];
    },
  };
}
