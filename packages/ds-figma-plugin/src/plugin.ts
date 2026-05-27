import {
  figmaComponentRegistry,
  figmaPrimitiveRegistry,
} from "./generated/components/index.js";

type FigmaCssBlock = {
  selector: string;
  declarations: Record<string, string>;
};

type FigmaComponentDescriptor = {
  schemaVersion: number;
  component: {
    name: string;
    cssPrefix: string;
    rootElement?: string;
    effectiveRole?: string | null;
  };
  anatomy: Array<{
    name: string;
    layoutVariant?: "horizontal" | "vertical" | null;
  }>;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultExpr?: string | null;
  }>;
  variants: Record<string, string[]>;
  css?: {
    blocks?: FigmaCssBlock[];
  };
};

type FigmaStackPrimitiveDescriptor = {
  schemaVersion: number;
  primitive: { kind: string; name: string };
  variants: { variant: string[] };
  figma: { componentSetName: string };
};

type StackVariants = {
  vertical: FigmaComponentNode;
  horizontal: FigmaComponentNode;
};

export async function main(): Promise<void> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const componentsPage = ensurePage("Full Stack DS / Components");

  const stackVariants = materializeStackPrimitive(componentsPage);
  const descriptors = Object.values(figmaComponentRegistry) as FigmaComponentDescriptor[];
  for (const descriptor of descriptors) {
    if (descriptor.component.name === "Button") {
      materializeButtonComponentSet(descriptor, componentsPage);
    } else {
      componentsPage.appendChild(materializeLeafComponent(descriptor, stackVariants));
    }
  }

  figma.notify(`Full Stack DS: scaffolded Stack + ${descriptors.length} component(s).`);
  figma.closePlugin(`Scaffolded Stack + ${descriptors.length} component(s).`);
}

function ensurePage(name: string): FigmaPageNode {
  const page = figma.createPage();
  page.name = name;
  return page;
}

function materializeStackPrimitive(parent: FigmaPageNode): StackVariants {
  const descriptor = figmaPrimitiveRegistry.Stack as FigmaStackPrimitiveDescriptor;
  const vertical = createStackVariantComponent("variant=vertical", "VERTICAL");
  const horizontal = createStackVariantComponent("variant=horizontal", "HORIZONTAL");
  const set = figma.combineAsVariants([vertical, horizontal], parent);
  set.name = descriptor.figma.componentSetName;
  set.setPluginData("fsds.primitive", "Stack");
  set.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));
  return { vertical, horizontal };
}

function createStackVariantComponent(
  variantName: string,
  layoutMode: "VERTICAL" | "HORIZONTAL",
): FigmaComponentNode {
  const component = figma.createComponent();
  component.name = variantName;
  component.layoutMode = layoutMode;
  component.itemSpacing = 8;
  component.paddingTop = 8;
  component.paddingRight = 8;
  component.paddingBottom = 8;
  component.paddingLeft = 8;
  component.resize(240, 80);
  return component;
}

function materializeLeafComponent(
  descriptor: FigmaComponentDescriptor,
  stack: StackVariants,
): FigmaComponentNode {
  const component = figma.createComponent();
  component.name = descriptor.component.name;
  component.layoutMode = "VERTICAL";
  component.itemSpacing = 8;
  component.paddingTop = 16;
  component.paddingRight = 16;
  component.paddingBottom = 16;
  component.paddingLeft = 16;
  component.resize(320, 200);

  recordDescriptorPluginData(component, descriptor);

  const parts = descriptor.anatomy.length > 0
    ? descriptor.anatomy
    : [{ name: "root", layoutVariant: null as "horizontal" | "vertical" | null }];
  for (const part of parts) {
    const variant = part.layoutVariant === "horizontal" ? stack.horizontal : stack.vertical;
    const instance = variant.createInstance();
    instance.name = part.name;
    component.appendChild(instance);
  }

  return component;
}

function recordDescriptorPluginData(
  node: FigmaBaseNode,
  descriptor: FigmaComponentDescriptor,
): void {
  node.setPluginData("fsds.component", descriptor.component.name);
  node.setPluginData("fsds.cssPrefix", descriptor.component.cssPrefix);
  node.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));
  for (const prop of descriptor.props) {
    node.setPluginData(`fsds.prop.${prop.name}`, JSON.stringify(prop));
  }
  for (const [variantName, values] of Object.entries(descriptor.variants)) {
    node.setPluginData(`fsds.variant.${variantName}`, JSON.stringify(values));
  }
}

function materializeButtonComponentSet(
  descriptor: FigmaComponentDescriptor,
  parent: FigmaPageNode,
): FigmaComponentSetNode {
  const rows = enumerateVariantMatrix(descriptor.variants);
  const blocksBySelector = indexCssBlocks(descriptor.css?.blocks ?? []);
  const baseBlock = blocksBySelector.get(`.${descriptor.component.cssPrefix}`) ?? null;

  const variantComponents: FigmaComponentNode[] = rows.map((row) =>
    createButtonVariantComponent(descriptor, row, blocksBySelector, baseBlock),
  );

  const set = figma.combineAsVariants(variantComponents, parent);
  set.name = descriptor.component.name;
  recordDescriptorPluginData(set, descriptor);
  set.setPluginData("fsds.materializer", "component-set");
  set.setPluginData("fsds.variantMatrix.size", String(rows.length));
  return set;
}

function createButtonVariantComponent(
  descriptor: FigmaComponentDescriptor,
  row: VariantRow,
  blocksBySelector: Map<string, FigmaCssBlock>,
  baseBlock: FigmaCssBlock | null,
): FigmaComponentNode {
  const prefix = descriptor.component.cssPrefix;
  const sizeBlock = row.size ? blocksBySelector.get(`.${prefix}--${row.size}`) ?? null : null;
  const variantBlock = row.variant
    ? blocksBySelector.get(`.${prefix}--${row.variant}`) ?? null
    : null;

  const component = figma.createComponent();
  component.name = formatVariantName(row.pairs);
  component.layoutMode = "HORIZONTAL";
  component.primaryAxisAlignItems = "CENTER";
  component.counterAxisAlignItems = "CENTER";
  component.primaryAxisSizingMode = "AUTO";
  component.counterAxisSizingMode = "AUTO";

  const padBlock = pickPx(sizeBlock, "--fsds-button-size-padding-block-medium")
    ?? pickPx(baseBlock, "--fsds-box-model-padding-block-start")
    ?? 8;
  const padInline = pickPx(sizeBlock, "--fsds-button-size-padding-inline-medium")
    ?? pickPx(baseBlock, "--fsds-box-model-padding-inline-start")
    ?? 12;
  const minHeight = pickPx(sizeBlock, "--fsds-button-size-minHeight-medium")
    ?? pickPx(baseBlock, "--fsds-box-model-min-height")
    ?? 36;
  const itemSpacing = pickPx(baseBlock, "--fsds-button-size-gap-default")
    ?? pickPx(baseBlock, "--fsds-box-model-gap")
    ?? 8;
  const cornerRadius = pickPx(baseBlock, "--fsds-button-size-radius") ?? 0;
  const strokeWeight = pickPx(baseBlock, "--fsds-button-size-border") ?? 1;

  component.paddingTop = padBlock;
  component.paddingBottom = padBlock;
  component.paddingLeft = padInline;
  component.paddingRight = padInline;
  component.itemSpacing = itemSpacing;
  component.cornerRadius = cornerRadius;
  component.minHeight = minHeight;
  component.resize(Math.max(minHeight * 2.5, 96), minHeight);

  const backgroundDecl = pickDecl(variantBlock, "--fsds-button-color-background-default")
    ?? pickDecl(baseBlock, "--fsds-button-color-background-default");
  const backgroundFill = backgroundDecl ? resolveSolidPaint(backgroundDecl) : null;
  if (backgroundFill) {
    component.fills = [backgroundFill];
  } else if (isTransparent(backgroundDecl)) {
    component.fills = [];
  }

  const borderDecl = pickDecl(variantBlock, "--fsds-button-color-border-default")
    ?? pickDecl(baseBlock, "--fsds-button-color-border-default");
  const borderFill = borderDecl ? resolveSolidPaint(borderDecl) : null;
  if (borderFill) {
    component.strokes = [borderFill];
    component.strokeWeight = strokeWeight;
  } else if (isTransparent(borderDecl)) {
    component.strokes = [];
  }

  const foregroundDecl = pickDecl(variantBlock, "--fsds-button-color-foreground-default")
    ?? pickDecl(baseBlock, "--fsds-button-color-foreground-default");
  const foregroundFill = foregroundDecl ? resolveSolidPaint(foregroundDecl) : null;

  const label = figma.createText();
  label.name = "label";
  label.characters = "Button";
  const fontSize = pickPx(sizeBlock, "--fsds-button-size-fontSize-medium")
    ?? pickPx(baseBlock, "--fsds-button-size-fontSize-medium")
    ?? 16;
  label.fontSize = fontSize;
  if (foregroundFill) {
    label.fills = [foregroundFill];
  }
  component.appendChild(label);

  return component;
}

type VariantRow = {
  pairs: Array<[string, string]>;
  size?: string;
  variant?: string;
};

function enumerateVariantMatrix(
  variants: Record<string, string[]>,
): VariantRow[] {
  const axes = Object.entries(variants).filter(([, values]) => values.length > 0);
  if (axes.length === 0) {
    return [{ pairs: [] }];
  }
  let rows: Array<Array<[string, string]>> = [[]];
  for (const [axis, values] of axes) {
    const next: Array<Array<[string, string]>> = [];
    for (const prefix of rows) {
      for (const value of values) {
        next.push([...prefix, [axis, value]]);
      }
    }
    rows = next;
  }
  return rows.map((pairs) => {
    const lookup = Object.fromEntries(pairs);
    return {
      pairs,
      size: lookup.size,
      variant: lookup.variant,
    };
  });
}

function formatVariantName(pairs: Array<[string, string]>): string {
  if (pairs.length === 0) return "default";
  return pairs.map(([k, v]) => `${k}=${v}`).join(", ");
}

function indexCssBlocks(blocks: FigmaCssBlock[]): Map<string, FigmaCssBlock> {
  const map = new Map<string, FigmaCssBlock>();
  for (const block of blocks) {
    map.set(block.selector, block);
  }
  return map;
}

function pickDecl(block: FigmaCssBlock | null, name: string): string | null {
  if (!block) return null;
  return block.declarations[name] ?? null;
}

const PX_RE = /(-?\d+(?:\.\d+)?)px/;
const REM_RE = /(-?\d+(?:\.\d+)?)rem/;

function pickPx(block: FigmaCssBlock | null, name: string): number | null {
  const decl = pickDecl(block, name);
  if (!decl) return null;
  return extractPx(decl);
}

function extractPx(value: string): number | null {
  const pxMatch = value.match(PX_RE);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const remMatch = value.match(REM_RE);
  if (remMatch) return parseFloat(remMatch[1]) * 16;
  return null;
}

function isTransparent(decl: string | null | undefined): boolean {
  if (!decl) return false;
  return decl.trim() === "transparent";
}

const HEX_RE = /#([0-9a-fA-F]{3,8})\b/;

function resolveSolidPaint(decl: string): FigmaSolidPaint | null {
  if (isTransparent(decl)) return null;
  const match = decl.match(HEX_RE);
  if (!match) return null;
  const rgb = parseHexColor(match[1]);
  if (!rgb) return null;
  return { type: "SOLID", color: rgb };
}

function parseHexColor(
  hex: string,
): { r: number; g: number; b: number } | null {
  let value = hex;
  if (value.length === 3) {
    value = value.split("").map((c) => c + c).join("");
  } else if (value.length === 4) {
    value = value
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (value.length === 8) {
    value = value.slice(0, 6);
  } else if (value.length !== 6) {
    return null;
  }
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

if (typeof figma !== "undefined") {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    figma.notify(`Full Stack DS plugin error: ${message}`);
    figma.closePlugin(`Plugin error: ${message}`);
  });
}
