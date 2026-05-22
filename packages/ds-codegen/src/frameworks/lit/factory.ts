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
import { emitCss, emitTokensCss } from "../../css.js";
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
import {
  generateLitSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateLitSurfaceTest } from "./surface-tests.js";

export function createLitEmitter(): FrameworkEmitter {
  return {
    id: "lit",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      // F-2C-3: Presence-surface family — emits a single component
      // file containing three LitElement classes (root, Trigger,
      // Content) plus customElements.define calls.
      // Lit-specific note: the `static styles = css`…`` template literal
      // in component-source does NOT resolve @import, so the .css file
      // is currently emit-only (consumers must adopt it via a CSSStyleSheet
      // construction step we haven't built). The .tokens.css ships alongside
      // for consistency with React/Vue/Svelte/Angular; both become consumable
      // when the Lit import-resolution open question is resolved (plan-doc
      // 6b "Open question — Lit's @import resolution").
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateLitSurfaceFiles(ir);
        const css = emitCss(ir);
        const tokensCss = emitTokensCss(ir);
        return [
          { relativePath: `${ir.name}/${ir.name}.ts`, contents: surfaceFiles.componentFile, preservable: true },
          { relativePath: `${ir.name}/${ir.name}.css`, contents: css, preservable: true },
          { relativePath: `${ir.name}/${ir.name}.tokens.css`, contents: tokensCss, preservable: true },
        ];
      }
      const source = generateLitComponentSource(ir);
      const css = emitCss(ir);
      const tokensCss = emitTokensCss(ir);
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
        {
          relativePath: `${ir.name}/${ir.name}.tokens.css`,
          contents: tokensCss,
          preservable: true,
        },
      ];
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        return [
          {
            relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
            contents: generateLitSurfaceTest(ir),
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
          contents: generateLitTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateLitSurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/${ir.name}Behavior.ts`,
            contents: surfaceFiles.behaviorFile,
            preservable: true,
          },
        ];
      }
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
