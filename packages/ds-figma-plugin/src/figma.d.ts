declare const figma: {
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
  notify(message: string): void;
  closePlugin(message?: string): void;
};

interface FigmaBaseNode {
  name: string;
  appendChild(child: FigmaBaseNode): void;
  setPluginData(key: string, value: string): void;
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

interface FigmaComponentNode extends FigmaLayoutNode {
  createInstance(): FigmaInstanceNode;
}

interface FigmaComponentSetNode extends FigmaBaseNode {}

interface FigmaInstanceNode extends FigmaBaseNode {}

interface FigmaTextNode extends FigmaBaseNode {
  characters: string;
  fontSize?: number;
  fills?: readonly FigmaPaint[];
}
