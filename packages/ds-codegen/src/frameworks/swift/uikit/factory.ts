/**
 * UIKit FrameworkEmitter — scaffold only.
 *
 * Targets UIKit: each component emits a `UIView` (or `UIControl`)
 * subclass into a `${Name}.swift` file. Behavior is class-based, closer
 * to Lit's `ReactiveController` model than to React/Vue composition.
 *
 * NOT YET REGISTERED: `"uikit"` is not a member of `TargetId`. The factory
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
import { generateUIKitComponentSource } from "./component-source.js";
import { generateUIKitHookSource } from "./hook-source.js";
import { generateUIKitBarrel } from "./barrel.js";
import { generateUIKitTest } from "./tests.js";
import {
  generateUIKitSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateUIKitSurfaceTest } from "./surface-tests.js";

export function createUIKitEmitter(): FrameworkEmitter {
  return {
    id: "uikit" as TargetId,

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateUIKitSurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/${ir.name}.swift`,
            contents: surfaceFiles.componentFile,
            preservable: true,
          },
        ];
      }
      const source = generateUIKitComponentSource(ir);
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
            contents: generateUIKitSurfaceTest(ir),
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/Tests/${ir.name}Tests.swift`,
          contents: generateUIKitTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateUIKitSurfaceFiles(ir);
        if (!surfaceFiles.behaviorFile) return [];
        return [
          {
            relativePath: `${ir.name}/${ir.name}Behavior.swift`,
            contents: surfaceFiles.behaviorFile,
            preservable: true,
          },
        ];
      }
      const source = generateUIKitHookSource(ir);
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
      return generateUIKitBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(_componentsRoot: string): string[] {
      // TODO: walk `${componentsRoot}/<Name>/<Name>.swift` once the
      // workspace package exists.
      return [];
    },
  };
}
