/**
 * React FrameworkEmitter implementation.
 *
 * Translates `ComponentIR` into the file shape the `@full-stack-ds/react`
 * package expects. Every emitted file carries `@generated`/`@custom`
 * preservation markers (see `preserve.ts`); the CLI merges new output
 * with existing content section-by-section so hand-authored regions
 * survive regeneration.
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
import { generateReactComponentSource } from "./component-source.js";
import { generateReactHookSource } from "./hook-source.js";
import { generateBarrel, generateReactTest } from "./tests.js";
import { isSurfaceComponent } from "./surface-emit.js";

export interface ReactEmitterOptions {
  /**
   * Relative import path from each generated component folder to the Stack
   * primitive module. Resolved by the CLI from `Stack.primitive.json`.
   */
  stackImportRelative: string;
}

export function createReactEmitter(
  options: ReactEmitterOptions,
): FrameworkEmitter {
  const { stackImportRelative } = options;

  return {
    id: "react",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      const tsx = generateReactComponentSource(ir, stackImportRelative);
      const css = emitCss(ir);
      const tokensCss = emitTokensCss(ir);
      return [
        {
          relativePath: `${ir.name}/${ir.name}.tsx`,
          contents: tsx,
          preservable: true,
        },
        {
          relativePath: `${ir.name}/${ir.name}.css`,
          contents: css,
          preservable: true,
        },
        {
          // Two-hop indirection slot declarations. Imported by .css
          // at the top of the file; brands/themes override slots here.
          relativePath: `${ir.name}/${ir.name}.tokens.css`,
          contents: tokensCss,
          preservable: true,
        },
      ];
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.tsx`,
          contents: generateReactTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      // Surface-family components import substrate hooks
      // (useAnchoredSurface) directly from the primitives package
      // and do NOT emit a per-component useX hook. The compound
      // source owns its own state plumbing.
      if (isSurfaceComponent(ir)) return [];
      const source = generateReactHookSource(ir);
      if (!source) return [];
      return [
        {
          relativePath: `${ir.name}/use${ir.name}.ts`,
          contents: source,
          preservable: true,
        },
      ];
    },

    emitBarrel(componentNames: string[]): string {
      return generateBarrel(componentNames);
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs.readdirSync(componentsRoot).filter((d) => {
        const tsx = path.join(componentsRoot, d, `${d}.tsx`);
        return fs.existsSync(tsx);
      });
    },
  };
}
