import fs from "node:fs";
import path from "node:path";
import type {
  EmitOptions,
  FrameworkEmitter,
  GeneratedFile,
} from "../../emitter.js";
import type { ComponentIR } from "../../ir.js";

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

function toFigmaComponentDescriptor(ir: ComponentIR): object {
  return {
    schemaVersion: 1,
    source: "@full-stack-ds/codegen/frameworks/figma",
    component: {
      name: ir.name,
      cssPrefix: ir.cssPrefix,
      layer: ir.layer,
    },
    anatomy: ir.parts.map((part) => ({
      name: part.name,
      semanticElement: part.semanticElement ?? null,
      nativeTag: part.nativeTag ?? null,
      isCompound: part.isCompound,
      isRootOnly: part.isRootOnly,
      layoutVariant: part.layoutVariant ?? null,
    })),
    props: ir.props.map((prop) => ({
      name: prop.name,
      type: prop.type,
      required: prop.required,
      defaultValue: prop.defaultValue ?? null,
    })),
    variants: ir.variants,
    states: ir.states,
    tokens: ir.tokens,
    a11y: ir.a11y,
    behavior: {
      channels: ir.behavior?.channels ?? {},
      events: ir.events,
    },
    figma: {
      intendedUse: "desktop-plugin-materialization",
      documentationFrame: `${ir.name} / Documentation`,
      componentSetName: ir.name,
      propertySource: "contract.props + contract.variants + contract.states",
    },
  };
}

function generateComponentReadme(ir: ComponentIR): string {
  return `# ${ir.name}\n\nGenerated Figma descriptor for ${ir.name}.\n\nThis file is emitted by \`@full-stack-ds/codegen --target=figma\` and is intended to be consumed by \`@full-stack-ds/figma-plugin\`.\n\nThe descriptor is a transfer artifact, not the source of truth. Edit the component contract instead.\n`;
}
