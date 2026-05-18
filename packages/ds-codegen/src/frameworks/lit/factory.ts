/**
 * Lit FrameworkEmitter.
 *
 * Emits LitElement-based web components from `ComponentIR`. Each component
 * produces a `.ts` class file and a `.css` file — the same two-file shape
 * as the Vue emitter, with `.ts` replacing `.vue`.
 *
 * Behavior controllers are emitted to `${Name}/${Name}Behavior.ts` instead
 * of the React/Vue `use${Name}.ts` convention because Lit uses classes
 * (ReactiveControllers), not composition functions.
 */
import fs from "node:fs";
import path from "node:path";
import { emitCss } from "../../css.js";
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import { generateLitComponentSource } from "./component-source.js";
import { generateLitHookSource } from "./hook-source.js";
import { generateLitBarrel } from "./barrel.js";
import { generateLitTest } from "./tests.js";

export function createLitEmitter(): FrameworkEmitter {
  return {
    id: "lit",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      // F-2A: Lit does not yet handle presence-surface contracts. Skip
      // emission so the on-disk Lit Tooltip remains untouched until F-2C.
      if (ir.surface) return [];
      const source = generateLitComponentSource(ir);
      const css = emitCss(ir);
      return [
        {
          relativePath: `${ir.name}/${ir.name}.ts`,
          contents: source,
          preservable: true,
        },
        {
          relativePath: `${ir.name}/${ir.name}.css`,
          contents: css,
          preservable: true,
        },
      ];
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (ir.surface) return [];
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
          contents: generateLitTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (ir.surface) return [];
      const source = generateLitHookSource(ir);
      if (!source) return [];
      return [
        {
          relativePath: `${ir.name}/${ir.name}Behavior.ts`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateLitBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs.readdirSync(componentsRoot).filter((d) => {
        const file = path.join(componentsRoot, d, `${d}.ts`);
        return fs.existsSync(file);
      });
    },
  };
}
