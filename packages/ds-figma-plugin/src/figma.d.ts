declare module "*.css" {}

declare const figma: {
  editorType: "figma" | "figjam" | "dev" | "slides" | "buzz";
  mode: "default" | "textreview" | "inspect" | "codegen" | "linkpreview" | "auth";
  root: FigmaPageNode;
  currentPage: FigmaPageNode;
  createPage(): FigmaPageNode;
  createFrame(): FigmaFrameNode;
  createText(): FigmaTextNode;
  createComponent(): FigmaComponentNode;
  combineAsVariants(
    components: readonly FigmaComponentNode[],
    parent: FigmaBaseNode,
  ): FigmaComponentSetNode;
  loadFontAsync(font: { family: string; style: string }): Promise<void>;
  setCurrentPageAsync(page: FigmaPageNode): Promise<void>;
  showUI(html: string, options?: { width?: number; height?: number }): void;
  ui: {
    postMessage(message: unknown): void;
    onmessage: ((message: unknown) => void) | undefined;
    resize(width: number, height: number): void;
  };
  codegen: {
    on(
      type: "generate",
      callback: (event: FigmaCodegenEvent) => FigmaCodegenResult[] | Promise<FigmaCodegenResult[]>,
    ): void;
  };
  notify(message: string): void;
  closePlugin(message?: string): void;
};

interface FigmaBaseNode {
  name: string;
  appendChild(child: FigmaBaseNode): void;
  setPluginData(key: string, value: string): void;
  getPluginData(key: string): string;
}

interface FigmaPageNode extends FigmaBaseNode {}

interface FigmaSolidPaint {
  type: "SOLID";
  color: { r: number; g: number; b: number };
  opacity?: number;
}

type FigmaPaint = FigmaSolidPaint;

interface FigmaLayoutNode extends FigmaBaseNode {
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  itemSpacing: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "BASELINE";
  primaryAxisSizingMode?: "FIXED" | "AUTO";
  counterAxisSizingMode?: "FIXED" | "AUTO";
  minHeight?: number;
  cornerRadius?: number;
  fills?: readonly FigmaPaint[];
  strokes?: readonly FigmaPaint[];
  strokeWeight?: number;
  resize(width: number, height: number): void;
}

interface FigmaFrameNode extends FigmaLayoutNode {}

type FigmaComponentPropertyType = "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT";

/**
 * Component-property surface the state materializer writes to. This is a
 * plugin-local mock/typing subset (not full Figma API fidelity): the real live
 * materializer would use `addComponentProperty` for BOOLEAN and variant-naming
 * for VARIANT axes. Here a single recording method captures the materialization
 * intent so it is inspectable under the mocked Figma API.
 */
interface FigmaComponentPropertyHost {
  componentPropertyDefinitions?: Record<
    string,
    {
      type: FigmaComponentPropertyType;
      defaultValue?: string | boolean;
      variantOptions?: string[];
    }
  >;
  addComponentProperty(
    name: string,
    type: FigmaComponentPropertyType,
    options?: { defaultValue?: string | boolean; variantOptions?: string[] },
  ): string;
}

interface FigmaComponentNode extends FigmaLayoutNode, FigmaComponentPropertyHost {
  createInstance(): FigmaInstanceNode;
}

interface FigmaComponentSetNode extends FigmaBaseNode, FigmaComponentPropertyHost {}

interface FigmaInstanceNode extends FigmaBaseNode {}

interface FigmaTextNode extends FigmaBaseNode {
  characters: string;
  fontSize?: number;
  fills?: readonly FigmaPaint[];
}

type FigmaCodegenResult = {
  title: string;
  code: string;
  language:
    | "TYPESCRIPT"
    | "CPP"
    | "RUBY"
    | "CSS"
    | "JAVASCRIPT"
    | "HTML"
    | "JSON"
    | "GRAPHQL"
    | "PYTHON"
    | "GO"
    | "SQL"
    | "SWIFT"
    | "KOTLIN"
    | "RUST"
    | "BASH"
    | "PLAINTEXT";
};

type FigmaCodegenEvent = {
  node: FigmaBaseNode;
  language: string;
};
