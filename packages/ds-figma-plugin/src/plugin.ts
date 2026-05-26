import {
  figmaComponentRegistry,
  figmaPrimitiveRegistry,
} from "./generated/components/index.js";

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
    componentsPage.appendChild(materializeLeafComponent(descriptor, stackVariants));
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

  component.setPluginData("fsds.component", descriptor.component.name);
  component.setPluginData("fsds.cssPrefix", descriptor.component.cssPrefix);
  component.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));
  for (const prop of descriptor.props) {
    component.setPluginData(`fsds.prop.${prop.name}`, JSON.stringify(prop));
  }
  for (const [variantName, values] of Object.entries(descriptor.variants)) {
    component.setPluginData(`fsds.variant.${variantName}`, JSON.stringify(values));
  }

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

if (typeof figma !== "undefined") {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    figma.notify(`Full Stack DS plugin error: ${message}`);
    figma.closePlugin(`Plugin error: ${message}`);
  });
}
