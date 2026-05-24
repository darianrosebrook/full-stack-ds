import fs from "node:fs";
import path from "node:path";
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";
import {
  FIGMA_COMPONENT_DESCRIPTOR_SCHEMA_VERSION,
  FIGMA_COMPONENT_DESCRIPTOR_SOURCE,
  type FigmaComponentDescriptorV1,
} from "./descriptor.js";

export function createFigmaEmitter(): FrameworkEmitter {
  return {
    id: "figma",

    emitComponent(ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [
        {
          relativePath: `${ir.name}/${ir.name}.figma.json`,
          contents: `${JSON.stringify(toFigmaComponentDescriptor(ir), null, 2)}\n`,
          preservable: false,
        },
        {
          relativePath: `${ir.name}/README.md`,
          contents: generateComponentReadme(ir),
          preservable: true,
        },
      ];
    },

    emitTests(_ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [];
    },

    emitHook(_ir: ComponentIR, _opts: EmitOptions): GeneratedFile[] {
      return [];
    },

    emitBarrel(componentNames: string[]): string {
      const imports = componentNames
        .map((name) => `import ${name} from "./${name}/${name}.figma.json" assert { type: "json" };`)
        .join("\n");
      const entries = componentNames
        .map((name) => `  ${JSON.stringify(name)}: ${name},`)
        .join("\n");
      return `${imports}\n\nexport const figmaComponentRegistry = {\n${entries}\n} as const;\n\nexport type FigmaComponentName = keyof typeof figmaComponentRegistry;\n`;
    },

    discoverComponentIds(componentsRoot: string): string[] {
      if (!fs.existsSync(componentsRoot)) return [];
      return fs.readdirSync(componentsRoot).filter((entry) => {
        const descriptor = path.join(componentsRoot, entry, `${entry}.figma.json`);
        return fs.existsSync(descriptor);
      });
    },
  };
}

export function toFigmaComponentDescriptor(ir: ComponentIR): FigmaComponentDescriptorV1 {
  return {
    schemaVersion: FIGMA_COMPONENT_DESCRIPTOR_SCHEMA_VERSION,
    source: FIGMA_COMPONENT_DESCRIPTOR_SOURCE,
    component: {
      name: ir.name,
      cssPrefix: ir.cssPrefix,
      rootElement: ir.root.element,
      effectiveRole: ir.root.effectiveRole ?? null,
    },
    anatomy: ir.parts.map((part) => ({
      name: part.name,
      semanticElement: part.semanticElement ?? null,
      nativeTag: part.nativeTag ?? null,
      isCompound: part.isCompound,
      isRootOnly: part.isRootOnly,
      layoutVariant: part.layoutVariant ?? null,
    })),
    props: ir.styledProps.map((prop) => ({
      name: prop.name,
      safeName: prop.safeName,
      type: prop.type,
      required: prop.required,
      description: prop.description ?? null,
      defaultExpr: prop.defaultExpr ?? null,
      nodeKind: prop.nodeKind ?? null,
    })),
    variants: ir.variants,
    states: ir.states,
    classRecipe: ir.classRecipe,
    root: ir.root,
    css: {
      blocks: ir.cssBlocks,
      keyframes: ir.keyframes,
    },
    behavior: {
      channels: ir.behavior.normalizedChannels,
      dismissalTriggers: ir.behavior.normalizedDismissalTriggers,
      events: ir.behavior.normalizedEvents,
      form: ir.behavior.form ?? null,
      focus: ir.behavior.focus ?? null,
      portal: ir.behavior.portal ?? null,
    },
    surface: ir.surface ?? null,
    figma: {
      intendedUse: "figma-library-materialization",
      documentationFrame: `${ir.name} / Documentation`,
      componentSetName: ir.name,
      propertySource: "IR styledProps + variants + states + behavior",
    },
  };
}

function generateComponentReadme(ir: ComponentIR): string {
  return `# ${ir.name}\n\nGenerated Figma descriptor for ${ir.name}.\n\nThis file is emitted by \`@full-stack-ds/codegen --target=figma\` and is intended to be consumed by \`@full-stack-ds/figma-plugin\`.\n\nThe descriptor is a transfer artifact, not the source of truth. Edit the component contract instead.\n`;
}
