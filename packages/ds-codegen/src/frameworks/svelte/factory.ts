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
import { emitCss, emitTokensCss } from "../../css.js";
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import {
  generateSvelteComponentSource,
  generateSvelteCompoundPartSource,
  generateSvelteCompoundStateParts,
  generateSvelteDisclosureStateParts,
} from "./component-source.js";
import { generateSvelteHookSource } from "./hook-source.js";
import { generateSvelteBarrel } from "./barrel.js";
import { generateSvelteTest } from "./tests.js";
import { isCompoundStateContainer, isDisclosureContainer } from "../react/hook-source.js";
import {
  generateSvelteSurfaceFiles,
  isSurfaceComponent,
} from "./surface-emit.js";
import { generateSvelteSurfaceTestFiles } from "./surface-tests.js";

export function createSvelteEmitter(): FrameworkEmitter {
  return {
    id: "svelte",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      // F-2C-2: Presence-surface family — emits the compound API as
      // three SFCs (root, Trigger, Content) plus a composable in the
      // emitHook step.
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateSvelteSurfaceFiles(ir);
        const css = emitCss(ir);
        const tokensCss = emitTokensCss(ir);
        return [
          { relativePath: `${ir.name}/${ir.name}.svelte`, contents: surfaceFiles.rootSfc, preservable: true },
          { relativePath: `${ir.name}/${ir.name}.css`, contents: css, preservable: true },
          { relativePath: `${ir.name}/${ir.name}.tokens.css`, contents: tokensCss, preservable: true },
          { relativePath: `${ir.name}/${ir.name}Trigger.svelte`, contents: surfaceFiles.triggerSfc, preservable: true },
          { relativePath: `${ir.name}/${ir.name}Content.svelte`, contents: surfaceFiles.contentSfc, preservable: true },
        ];
      }
      const sfc = generateSvelteComponentSource(ir);
      const css = emitCss(ir);
      const tokensCss = emitTokensCss(ir);
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
        {
          relativePath: `${ir.name}/${ir.name}.tokens.css`,
          contents: tokensCss,
          preservable: true,
        },
      ];
      if (isDisclosureContainer(ir)) {
        // Repeated-disclosure container (Accordion): Item/Trigger/Content SFCs
        // wired via setContext/getContext disclosure context.
        for (const part of generateSvelteDisclosureStateParts(ir)) {
          files.push({
            relativePath: `${ir.name}/${part.name}.svelte`,
            contents: part.content,
            preservable: true,
          });
        }
      } else if (isCompoundStateContainer(ir)) {
        // Compound-state-container: emit sub-component SFCs (List, Tab, Panel)
        // that are wired via setContext/getContext context.
        for (const part of generateSvelteCompoundStateParts(ir)) {
          files.push({
            relativePath: `${ir.name}/${part.name}.svelte`,
            contents: part.content,
            preservable: true,
          });
        }
      } else {
        // Legacy compound parts (e.g. ModalHeader, ModalBody) — each becomes
        // its own .svelte file because Svelte components are 1:1 with files.
        for (const part of ir.compoundParts) {
          const subName = `${ir.name}${part.name[0].toUpperCase()}${part.name.slice(1)}`;
          files.push({
            relativePath: `${ir.name}/${subName}.svelte`,
            contents: generateSvelteCompoundPartSource(ir.cssPrefix, part),
            preservable: true,
          });
        }
      }
      return files;
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceTests = generateSvelteSurfaceTestFiles(ir);
        return [
          {
            relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
            contents: surfaceTests.testFile,
            preservable: true,
          },
          {
            relativePath: `${ir.name}/__tests__/${ir.name}Fixture.svelte`,
            contents: surfaceTests.fixtureFile,
            preservable: true,
          },
        ];
      }
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
          contents: generateSvelteTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      if (isSurfaceComponent(ir)) {
        const surfaceFiles = generateSvelteSurfaceFiles(ir);
        return [
          {
            relativePath: `${ir.name}/use${ir.name}.svelte.ts`,
            contents: surfaceFiles.composable,
            preservable: true,
          },
        ];
      }
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
