/**
 * SwiftUI FrameworkEmitter — scaffold only.
 *
 * Targets SwiftUI: each component emits a `View` struct (+ optional
 * `ObservableObject` behavior class) into a `${Name}.swift` file. Compound
 * parts (e.g. `DialogHeader`) become sibling `View` structs in the same
 * file, paralleling the Vue/Svelte single-file convention.
 *
 * NOT YET REGISTERED: `"swiftui"` is not a member of `TargetId`. The factory
 * casts its `id` so the object satisfies `FrameworkEmitter` in isolation;
 * wiring into the CLI requires widening `TargetId` and `KNOWN_TARGETS` in
 * `../../../emitter.ts` and adding a binding in `../../../registry.ts`.
 */
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
  TargetId,
} from "../../../emitter.js";
import type { ComponentIR } from "../../../ir.js";
import { generateSwiftUIComponentSource } from "./component-source.js";
import { generateSwiftUIHookSource } from "./hook-source.js";
import { generateSwiftUIBarrel } from "./barrel.js";
import { generateSwiftUITest } from "./tests.js";
import {
  generateSwiftUISurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateSwiftUISurfaceTest } from "./surface-tests.js";

export function createSwiftUIEmitter(): FrameworkEmitter {
  return {
    id: "swiftui" as TargetId,

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateSwiftUISurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/${ir.name}.swift`,
            contents: surfaceFiles.componentFile,
            preservable: true,
          },
        ];
      }
      const source = generateSwiftUIComponentSource(ir);
      return [
        {
          relativePath: `${ir.name}/${ir.name}.swift`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        return [
          {
            relativePath: `${ir.name}/Tests/${ir.name}Tests.swift`,
            contents: generateSwiftUISurfaceTest(ir),
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/Tests/${ir.name}Tests.swift`,
          contents: generateSwiftUITest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateSwiftUISurfaceFiles(ir);
        if (!surfaceFiles.behaviorFile) return [];
        return [
          {
            relativePath: `${ir.name}/${ir.name}Behavior.swift`,
            contents: surfaceFiles.behaviorFile,
            preservable: true,
          },
        ];
      }
      const source = generateSwiftUIHookSource(ir);
      if (!source) return [];
      return [
        {
          relativePath: `${ir.name}/${ir.name}Behavior.swift`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateSwiftUIBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(_componentsRoot: string): string[] {
      // TODO: walk `${componentsRoot}/<Name>/<Name>.swift` once the
      // workspace package exists.
      return [];
    },
  };
}
