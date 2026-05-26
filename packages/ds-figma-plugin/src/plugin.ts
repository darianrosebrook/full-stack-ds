import { figmaComponentRegistry } from "./generated/components/index.js";

type FigmaComponentDescriptor = {
  schemaVersion: number;
  component: {
    name: string;
    cssPrefix: string;
    rootElement?: string;
    effectiveRole?: string | null;
  };
  anatomy: Array<{ name: string }>;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultExpr?: string | null;
  }>;
  variants: Record<string, string[]>;
  states: unknown;
  figma?: {
    documentationFrame?: string;
    componentSetName?: string;
  };
};

export async function main(): Promise<void> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const descriptors = Object.values(figmaComponentRegistry) as FigmaComponentDescriptor[];
  const docsPage = ensurePage("Full Stack DS / Documentation");
  const componentsPage = ensurePage("Full Stack DS / Components");

  for (const descriptor of descriptors) {
    docsPage.appendChild(createDocumentationFrame(descriptor));
    componentsPage.appendChild(createComponentPlaceholder(descriptor));
  }

  figma.notify(`Full Stack DS: scaffolded ${descriptors.length} contract descriptor(s).`);
  figma.closePlugin(`Scaffolded ${descriptors.length} contract descriptor(s).`);
}

function ensurePage(name: string): FigmaPageNode {
  const page = figma.createPage();
  page.name = name;
  return page;
}

function createDocumentationFrame(descriptor: FigmaComponentDescriptor): FigmaFrameNode {
  const frame = createAutoLayoutFrame(
    descriptor.figma?.documentationFrame ?? `${descriptor.component.name} / Documentation`,
  );
  frame.setPluginData("fsds.component", descriptor.component.name);
  frame.setPluginData("fsds.descriptorSchemaVersion", String(descriptor.schemaVersion));

  frame.appendChild(createText(`${descriptor.component.name}`));
  frame.appendChild(createText(`Root: ${descriptor.component.rootElement ?? "unknown"}`));
  frame.appendChild(createText(`Role: ${descriptor.component.effectiveRole ?? "none"}`));
  frame.appendChild(createText(`Anatomy: ${descriptor.anatomy.map((part) => part.name).join(", ")}`));
  frame.appendChild(createText(`Props: ${descriptor.props.map((prop) => prop.name).join(", ")}`));
  frame.appendChild(createText(`Variants: ${Object.keys(descriptor.variants).join(", ") || "none"}`));

  return frame;
}

function createComponentPlaceholder(descriptor: FigmaComponentDescriptor): FigmaFrameNode {
  const frame = createAutoLayoutFrame(descriptor.figma?.componentSetName ?? descriptor.component.name);
  frame.setPluginData("fsds.component", descriptor.component.name);
  frame.setPluginData("fsds.cssPrefix", descriptor.component.cssPrefix);
  frame.appendChild(createText(descriptor.component.name));

  for (const prop of descriptor.props) {
    frame.setPluginData(`fsds.prop.${prop.name}`, JSON.stringify(prop));
  }

  for (const [variantName, values] of Object.entries(descriptor.variants)) {
    frame.setPluginData(`fsds.variant.${variantName}`, JSON.stringify(values));
  }

  return frame;
}

function createAutoLayoutFrame(name: string): FigmaFrameNode {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = "VERTICAL";
  frame.itemSpacing = 8;
  frame.paddingTop = 16;
  frame.paddingRight = 16;
  frame.paddingBottom = 16;
  frame.paddingLeft = 16;
  frame.resize(640, 320);
  return frame;
}

function createText(characters: string): FigmaTextNode {
  const text = figma.createText();
  text.characters = characters;
  return text;
}

if (typeof figma !== "undefined") {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    figma.notify(`Full Stack DS plugin error: ${message}`);
    figma.closePlugin(`Plugin error: ${message}`);
  });
}
