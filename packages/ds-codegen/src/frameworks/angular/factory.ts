/**
 * Angular FrameworkEmitter.
 *
 * Produces Angular 17+ standalone components (`.component.ts`) driven by
 * `ComponentIR`. Output composes the `StackComponent` primitive from
 * `@full-stack-ds/angular/primitives` and uses Angular signals for
 * reactive class-name computation.
 *
 * Scope:
 *   - Standalone `@Component` with inline template + signal-based classes.
 *   - Class recipe driven by `ComponentIR.classRecipe`.
 *   - Variant props with defaults via `@Input()`.
 *   - Behavior hook (`useX.ts`) when the IR has channels / focus / portal.
 *   - Shared CSS via `emitCss(ir)`.
 *   - Tests deferred (Angular test runner not yet wired into workspace).
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
import { generateAngularComponentSource, generateAngularCompoundStateParts } from "./component-source.js";
import { generateAngularHookSource } from "./hook-source.js";
import { generateAngularBarrel } from "./barrel.js";
import { generateAngularTest } from "./tests.js";
import { isCompoundStateContainer } from "../react/hook-source.js";

export function createAngularEmitter(): FrameworkEmitter {
  return {
    id: "angular",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      const component = generateAngularComponentSource(ir);
      const css = emitCss(ir);
      const files: GeneratedFile[] = [
        {
          relativePath: `${ir.name}/${ir.name}.component.ts`,
          contents: component,
          preservable: true,
        },
        {
          relativePath: `${ir.name}/${ir.name}.css`,
          contents: css,
          preservable: true,
        },
      ];
      if (isCompoundStateContainer(ir)) {
        // Compound-state-container: emit sub-component files (List, Tab, Panel)
        // wired via Angular DI InjectionToken context.
        for (const part of generateAngularCompoundStateParts(ir)) {
          files.push({
            relativePath: `${ir.name}/${part.name}.component.ts`,
            contents: part.content,
            preservable: true,
          });
        }
      }
      return files;
    },

    emitTests(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [
        {
          relativePath: `${ir.name}/__tests__/${ir.name}.test.ts`,
          contents: generateAngularTest(ir),
          preservable: true,
        },
      ];
    },

    emitHook(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      const source = generateAngularHookSource(ir);
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
      return generateAngularBarrel(componentNames, componentsRoot);
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs.readdirSync(componentsRoot).filter((d) => {
        const component = path.join(componentsRoot, d, `${d}.component.ts`);
        return fs.existsSync(component);
      });
    },
  };
}
