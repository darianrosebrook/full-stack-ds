import { describe, expect, it, vi } from "vitest";

vi.mock("./generated/components/index.js", () => ({
  figmaComponentRegistry: {
    Button: {
      schemaVersion: 1,
      component: {
        name: "Button",
        cssPrefix: "button",
        rootElement: "button",
        effectiveRole: "button",
      },
      anatomy: [
        { name: "root", layoutVariant: null },
        { name: "spinner", layoutVariant: null },
        { name: "loadingText", layoutVariant: null },
      ],
      props: [
        {
          name: "size",
          type: "ButtonSize",
          required: false,
          defaultExpr: '"medium"',
        },
        {
          name: "variant",
          type: "ButtonVariant",
          required: false,
          defaultExpr: '"primary"',
        },
      ],
      variants: {
        size: ["small", "medium", "large"],
        variant: ["primary", "secondary", "tertiary", "ghost", "destructive", "outline"],
      },
      css: {
        blocks: [
          {
            selector: ".button",
            declarations: {
              "--fsds-button-size-gap-default": "var(--fsds-core-spacing-size-04, 8px)",
              "--fsds-button-size-radius": "var(--fsds-core-shape-radius-full, 9999px)",
              "--fsds-button-size-border": "var(--fsds-core-shape-border-width-hairline, 1px)",
              "--fsds-button-color-background-default":
                "var(--fsds-semantic-color-action-background-primary-default, #d9292b)",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-inverse, #fafafa)",
              "--fsds-button-color-border-default":
                "var(--fsds-semantic-color-border-light, #fceaea)",
              "--fsds-button-size-padding-block-medium":
                "var(--fsds-core-spacing-size-04, 8px)",
              "--fsds-button-size-padding-inline-medium":
                "var(--fsds-core-spacing-size-05, 12px)",
              "--fsds-button-size-minHeight-medium":
                "var(--fsds-core-dimension-actionMinHeight, 36px)",
              "--fsds-button-size-fontSize-medium":
                "var(--fsds-core-typography-ramp-4, 1rem)",
            },
          },
          {
            selector: ".button--small",
            declarations: {
              "--fsds-button-size-padding-block-medium":
                "var(--fsds-core-spacing-size-03, 4px)",
              "--fsds-button-size-padding-inline-medium":
                "var(--fsds-core-spacing-size-04, 8px)",
              "--fsds-button-size-minHeight-medium":
                "var(--fsds-core-dimension-actionMinHeightSmall, 28px)",
              "--fsds-button-size-fontSize-medium":
                "var(--fsds-core-typography-ramp-3, 0.875rem)",
            },
          },
          {
            selector: ".button--medium",
            declarations: {
              "--fsds-button-size-padding-block-medium":
                "var(--fsds-core-spacing-size-04, 8px)",
              "--fsds-button-size-padding-inline-medium":
                "var(--fsds-core-spacing-size-05, 12px)",
              "--fsds-button-size-minHeight-medium":
                "var(--fsds-core-dimension-actionMinHeight, 36px)",
              "--fsds-button-size-fontSize-medium":
                "var(--fsds-core-typography-ramp-4, 1rem)",
            },
          },
          {
            selector: ".button--large",
            declarations: {
              "--fsds-button-size-padding-block-medium":
                "var(--fsds-core-spacing-size-05, 12px)",
              "--fsds-button-size-padding-inline-medium":
                "var(--fsds-core-spacing-size-06, 16px)",
              "--fsds-button-size-minHeight-medium":
                "var(--fsds-core-dimension-actionMinHeightLarge, 48px)",
              "--fsds-button-size-fontSize-medium":
                "var(--fsds-core-typography-ramp-5, 1.125rem)",
            },
          },
          {
            selector: ".button--primary",
            declarations: {
              "--fsds-button-color-background-default":
                "var(--fsds-semantic-color-action-background-primary-default, #d9292b)",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-inverse, #fafafa)",
              "--fsds-button-color-border-default":
                "var(--fsds-semantic-color-action-background-primary-default, #d9292b)",
            },
          },
          {
            selector: ".button--secondary",
            declarations: {
              "--fsds-button-color-background-default":
                "var(--fsds-semantic-color-action-background-secondary-default, #efefef)",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-primary, #141414)",
              "--fsds-button-color-border-default":
                "var(--fsds-semantic-color-border-default, #8f8f8f)",
            },
          },
          {
            selector: ".button--tertiary",
            declarations: {
              "--fsds-button-color-background-default": "transparent",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-primary, #141414)",
              "--fsds-button-color-border-default": "transparent",
            },
          },
          {
            selector: ".button--ghost",
            declarations: {
              "--fsds-button-color-background-default": "transparent",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-primary, #141414)",
              "--fsds-button-color-border-default": "transparent",
            },
          },
          {
            selector: ".button--destructive",
            declarations: {
              "--fsds-button-color-background-default":
                "var(--fsds-semantic-color-action-background-danger-default, #d9292b)",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-inverse, #fafafa)",
              "--fsds-button-color-border-default":
                "var(--fsds-semantic-color-action-background-danger-default, #d9292b)",
            },
          },
          {
            selector: ".button--outline",
            declarations: {
              "--fsds-button-color-background-default": "transparent",
              "--fsds-button-color-foreground-default":
                "var(--fsds-semantic-color-foreground-primary, #141414)",
              "--fsds-button-color-border-default":
                "var(--fsds-semantic-color-border-default, #8f8f8f)",
            },
          },
        ],
      },
    },
    Card: {
      schemaVersion: 1,
      component: {
        name: "Card",
        cssPrefix: "card",
        rootElement: "div",
        effectiveRole: null,
      },
      anatomy: [
        { name: "root", layoutVariant: null },
        { name: "media", layoutVariant: "horizontal" },
      ],
      props: [
        {
          name: "variant",
          type: "'default' | 'elevated'",
          required: false,
          defaultExpr: '"default"',
        },
      ],
      variants: { variant: ["default", "elevated"] },
    },
  },
  figmaPrimitiveRegistry: {
    Stack: {
      schemaVersion: 1,
      primitive: { kind: "stack", name: "Stack" },
      variants: { variant: ["vertical", "horizontal"] },
      figma: {
        intendedUse: "figma-library-materialization",
        componentSetName: "Stack",
        propertySource: "primitive contract Stack.variant",
      },
    },
  },
}));

type NodeKind =
  | "page"
  | "frame"
  | "text"
  | "component"
  | "componentSet"
  | "instance";

type MockSolidPaint = {
  type: "SOLID";
  color: { r: number; g: number; b: number };
  opacity?: number;
};

type MockNode = {
  kind: NodeKind;
  name?: string;
  children: MockNode[];
  pluginData: Record<string, string>;
  characters?: string;
  fontSize?: number;
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  minHeight?: number;
  cornerRadius?: number;
  strokeWeight?: number;
  width?: number;
  height?: number;
  fills?: readonly MockSolidPaint[];
  strokes?: readonly MockSolidPaint[];
  parent?: MockNode;
  master?: MockNode;
  appendChild(child: MockNode): void;
  setPluginData(key: string, value: string): void;
  resize(width: number, height: number): void;
  createInstance?(): MockNode;
};

function createNode(kind: NodeKind): MockNode {
  return {
    kind,
    children: [],
    pluginData: {},
    appendChild(child: MockNode): void {
      child.parent = this;
      this.children.push(child);
    },
    setPluginData(key: string, value: string): void {
      this.pluginData[key] = value;
    },
    resize(width: number, height: number): void {
      this.width = width;
      this.height = height;
    },
  };
}

function setupFigma(): {
  pages: MockNode[];
  components: MockNode[];
  componentSets: MockNode[];
  texts: MockNode[];
  notify: ReturnType<typeof vi.fn>;
  closePlugin: ReturnType<typeof vi.fn>;
} {
  const pages: MockNode[] = [];
  const components: MockNode[] = [];
  const componentSets: MockNode[] = [];
  const texts: MockNode[] = [];
  const notify = vi.fn();
  const closePlugin = vi.fn();
  const loadFontAsync = vi.fn(() => Promise.resolve());

  vi.stubGlobal("figma", {
    createPage: vi.fn(() => {
      const page = createNode("page");
      pages.push(page);
      return page;
    }),
    createFrame: vi.fn(() => createNode("frame")),
    createText: vi.fn(() => {
      const text = createNode("text");
      texts.push(text);
      return text;
    }),
    createComponent: vi.fn(() => {
      const component = createNode("component");
      component.createInstance = (): MockNode => {
        const instance = createNode("instance");
        instance.master = component;
        return instance;
      };
      components.push(component);
      return component;
    }),
    combineAsVariants: vi.fn(
      (variants: MockNode[], parent: MockNode): MockNode => {
        const set = createNode("componentSet");
        for (const variant of variants) {
          variant.parent = set;
          set.children.push(variant);
        }
        set.parent = parent;
        parent.children.push(set);
        componentSets.push(set);
        return set;
      },
    ),
    loadFontAsync,
    notify,
    closePlugin,
  });

  return { pages, components, componentSets, texts, notify, closePlugin };
}

describe("Figma plugin scaffold materialization", () => {
  it("scaffolds the components page with Stack primitive + Button component set + non-Button placeholders", async () => {
    const { main } = await import("./plugin.js");
    const { pages, components, componentSets, notify, closePlugin } = setupFigma();

    await main();

    expect(pages.map((p) => p.name)).toEqual(["Full Stack DS / Components"]);

    // 1 Stack set + 1 Button set = 2 component sets total.
    expect(componentSets).toHaveLength(2);
    const stackSet = componentSets.find((set) => set.name === "Stack");
    const buttonSet = componentSets.find((set) => set.name === "Button");
    expect(stackSet).toBeDefined();
    expect(buttonSet).toBeDefined();

    // Stack: 2 children (vertical + horizontal).
    expect(stackSet!.children.map((c) => c.name)).toEqual([
      "variant=vertical",
      "variant=horizontal",
    ]);

    // Button: 3 sizes × 6 variants = 18 children.
    expect(buttonSet!.children).toHaveLength(18);

    // Non-Button (Card) goes through the placeholder leaf path: a single
    // FigmaComponentNode on the page, not a component set.
    const cardComponent = components.find((c) => c.name === "Card");
    expect(cardComponent).toBeDefined();
    expect(cardComponent!.parent).toBe(pages[0]);
    expect(cardComponent!.children.map((c) => c.kind)).toEqual([
      "instance",
      "instance",
    ]);

    expect(notify).toHaveBeenCalledWith(
      "Full Stack DS: scaffolded Stack + 2 component(s).",
    );
    expect(closePlugin).toHaveBeenCalledWith(
      "Scaffolded Stack + 2 component(s).",
    );
  });

  it("Button component set carries variant property pairs derived from descriptor.variants", async () => {
    const { componentSets } = setupFigma();
    const { main } = await import("./plugin.js");
    await main();

    const buttonSet = componentSets.find((set) => set.name === "Button")!;
    const variantNames = buttonSet.children.map((c) => c.name);

    expect(variantNames).toContain("size=small, variant=primary");
    expect(variantNames).toContain("size=medium, variant=primary");
    expect(variantNames).toContain("size=large, variant=outline");
    expect(variantNames).toContain("size=small, variant=destructive");

    // Cartesian product completeness.
    const sizes = ["small", "medium", "large"];
    const variants = ["primary", "secondary", "tertiary", "ghost", "destructive", "outline"];
    for (const size of sizes) {
      for (const variant of variants) {
        expect(variantNames).toContain(`size=${size}, variant=${variant}`);
      }
    }

    expect(buttonSet.pluginData["fsds.materializer"]).toBe("component-set");
    expect(buttonSet.pluginData["fsds.variantMatrix.size"]).toBe("18");
  });

  it("each Button variant has horizontal layout, a label text child, and CSS-derived sizing/styling", async () => {
    const { componentSets, texts } = setupFigma();
    const { main } = await import("./plugin.js");
    await main();

    const buttonSet = componentSets.find((set) => set.name === "Button")!;
    const small = buttonSet.children.find((c) => c.name === "size=small, variant=primary")!;
    const medium = buttonSet.children.find((c) => c.name === "size=medium, variant=primary")!;
    const large = buttonSet.children.find((c) => c.name === "size=large, variant=primary")!;

    for (const variant of [small, medium, large]) {
      expect(variant.layoutMode).toBe("HORIZONTAL");
      expect(variant.primaryAxisAlignItems).toBe("CENTER");
      expect(variant.counterAxisAlignItems).toBe("CENTER");
      expect(variant.children).toHaveLength(1);
      expect(variant.children[0].kind).toBe("text");
      expect(variant.children[0].characters).toBe("Button");
    }

    // Size differentiation: small=4 pad-block / 8 pad-inline / 28 min-height.
    expect(small.paddingTop).toBe(4);
    expect(small.paddingLeft).toBe(8);
    expect(small.minHeight).toBe(28);
    // Medium: 8 / 12 / 36.
    expect(medium.paddingTop).toBe(8);
    expect(medium.paddingLeft).toBe(12);
    expect(medium.minHeight).toBe(36);
    // Large: 12 / 16 / 48.
    expect(large.paddingTop).toBe(12);
    expect(large.paddingLeft).toBe(16);
    expect(large.minHeight).toBe(48);

    // Primary variant has a background fill from the variant block's fallback hex.
    expect(medium.fills).toBeDefined();
    expect(medium.fills!.length).toBe(1);
    expect(medium.fills![0].type).toBe("SOLID");
    // #d9292b ≈ rgb(217, 41, 43).
    expect(medium.fills![0].color.r).toBeCloseTo(217 / 255, 2);

    // Tertiary, ghost, outline all have `transparent` background — fills cleared to [].
    const tertiary = buttonSet.children.find(
      (c) => c.name === "size=medium, variant=tertiary",
    )!;
    expect(tertiary.fills).toEqual([]);

    // Text label fontSize derived from size block, rem→px (1rem=16, 0.875rem=14, 1.125rem=18).
    const smallLabel = small.children[0];
    const mediumLabel = medium.children[0];
    const largeLabel = large.children[0];
    expect(smallLabel.fontSize).toBeCloseTo(14, 1);
    expect(mediumLabel.fontSize).toBeCloseTo(16, 1);
    expect(largeLabel.fontSize).toBeCloseTo(18, 1);

    // Text label has a fill from the variant's foreground color.
    expect(mediumLabel.fills).toBeDefined();
    expect(mediumLabel.fills![0].type).toBe("SOLID");

    // Sanity: as many text nodes were created as there are variants.
    expect(texts).toHaveLength(buttonSet.children.length);
  });

  it("Button set records descriptor metadata via setPluginData", async () => {
    const { componentSets } = setupFigma();
    const { main } = await import("./plugin.js");
    await main();

    const buttonSet = componentSets.find((set) => set.name === "Button")!;
    expect(buttonSet.pluginData).toMatchObject({
      "fsds.component": "Button",
      "fsds.cssPrefix": "button",
      "fsds.descriptorSchemaVersion": "1",
      "fsds.materializer": "component-set",
      "fsds.variantMatrix.size": "18",
    });
    expect(buttonSet.pluginData["fsds.variant.size"]).toBe(
      JSON.stringify(["small", "medium", "large"]),
    );
    expect(buttonSet.pluginData["fsds.variant.variant"]).toBe(
      JSON.stringify([
        "primary",
        "secondary",
        "tertiary",
        "ghost",
        "destructive",
        "outline",
      ]),
    );
  });
});
