/**
 * Svelte 5 FrameworkEmitter.
 *
 * Emits `.svelte` Single File Components using Svelte 5 runes, and
 * `.svelte.ts` behavior files for components with non-trivial behavioral
 * contracts. Mirrors the Vue emitter's module structure exactly.
 *
 * Scope:
 *   - Component SFC + scoped CSS.
 *   - Class recipe driven by `ComponentIR.classRecipe`.
 *   - Variant props with defaults via `$props()` destructuring.
 *   - Behavior hooks via `createX` rune-based primitives.
 *   - No test generation (deferred).
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
import {
  generateSvelteComponentSource,
  generateSvelteCompoundPartSource,
} from "./component-source.js";
import { generateSvelteHookSource } from "./hook-source.js";
import { generateSvelteBarrel } from "./barrel.js";
import { generateSvelteTest } from "./tests.js";

export function createSvelteEmitter(): FrameworkEmitter {
  return {
    id: "svelte",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      const sfc = generateSvelteComponentSource(ir);
      const css = emitCss(ir);
      const files: GeneratedFile[] = [
        {
          relativePath: `${ir.name}/${ir.name}.svelte`,
          contents: sfc,
          preservable: true,
        },
        {
          relativePath: `${ir.name}/${ir.name}.css`,
          contents: css,
          preservable: true,
        },
      ];
      // Compound parts — one .svelte per part (Svelte components are 1:1
      // with files).
      for (const part of ir.compoundParts) {
        const subName = `${ir.name}${part.name[0].toUpperCase()}${part.name.slice(1)}`;
        files.push({
          relativePath: `${ir.name}/${subName}.svelte`,
          contents: generateSvelteCompoundPartSource(ir.cssPrefix, part),
          preservable: true,
        });
      }
      return files;
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
          contents: generateSvelteTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      const source = generateSvelteHookSource(ir);
      if (!source) return [];
      return [
        {
          // `.svelte.ts` extension marks this as a rune-using non-component file
          relativePath: `${ir.name}/use${ir.name}.svelte.ts`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[], componentsRoot?: string): string {
      return generateSvelteBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs.readdirSync(componentsRoot).filter((d) => {
        const sfc = path.join(componentsRoot, d, `${d}.svelte`);
        return fs.existsSync(sfc);
      });
    },
  };
}
