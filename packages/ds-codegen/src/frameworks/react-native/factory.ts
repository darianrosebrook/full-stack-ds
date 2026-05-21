/**
 * React Native FrameworkEmitter — scaffold only.
 *
 * Targets React Native: each component emits a `.tsx` file exporting a
 * functional component that composes `<View>` / `<Pressable>` / `<TextInput>`
 * etc. instead of DOM elements, and a sibling `${Name}.styles.ts` containing
 * the `StyleSheet.create({ ... })` block derived from the contract's
 * `styles` and `tokens`.
 *
 * The hook file (`use${Name}.ts`) is identical in shape to the React
 * emitter's output for behavior primitives that don't touch the DOM
 * (e.g. `useControllableState`), and divergent for those that do
 * (focus, scroll lock, portal, dismissal).
 *
 * NOT YET REGISTERED: `"react-native"` is not a member of `TargetId`. The
 * factory casts its `id` so the object satisfies `FrameworkEmitter` in
 * isolation; wiring into the CLI requires widening `TargetId` and
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
import { generateReactNativeComponentSource } from "./component-source.js";
import { generateReactNativeHookSource } from "./hook-source.js";
import { generateReactNativeBarrel } from "./barrel.js";
import { generateReactNativeTest } from "./tests.js";
import {
  generateReactNativeSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateReactNativeSurfaceTest } from "./surface-tests.js";

export function createReactNativeEmitter(): FrameworkEmitter {
  return {
    id: "react-native" as TargetId,

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateReactNativeSurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/${ir.name}.tsx`,
            contents: surfaceFiles.componentFile,
            preservable: true,
          },
          {
            relativePath: `${ir.name}/${ir.name}.styles.ts`,
            contents: surfaceFiles.stylesFile,
            preservable: true,
          },
        ];
      }
      const { componentFile, stylesFile } =
        generateReactNativeComponentSource(ir);
      return [
        {
          relativePath: `${ir.name}/${ir.name}.tsx`,
          contents: componentFile,
          preservable: true,
        },
        {
          relativePath: `${ir.name}/${ir.name}.styles.ts`,
          contents: stylesFile,
          preservable: true,
        },
      ];
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        return [
          {
            relativePath: `${ir.name}/__tests__/${ir.name}.test.tsx`,
            contents: generateReactNativeSurfaceTest(ir),
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.tsx`,
          contents: generateReactNativeTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateReactNativeSurfaceFiles(ir);
        if (!surfaceFiles.hookFile) return [];
        return [
          {
            relativePath: `${ir.name}/use${ir.name}.ts`,
            contents: surfaceFiles.hookFile,
            preservable: true,
          },
        ];
      }
      const source = generateReactNativeHookSource(ir);
      if (!source) return [];
      return [
        {
          relativePath: `${ir.name}/use${ir.name}.ts`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateReactNativeBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(_componentsRoot: string): string[] {
      // TODO: walk `${componentsRoot}/<Name>/<Name>.tsx` once the
      // workspace package exists.
      return [];
    },
  };
}
