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
      anatomy: [{ name: "root" }, { name: "icon" }],
      props: [
        {
          name: "variant",
          type: "'primary' | 'secondary'",
          required: false,
          defaultExpr: "primary",
        },
      ],
      variants: { variant: ["primary", "secondary"] },
      states: {},
      figma: {
        documentationFrame: "Button / Documentation",
        componentSetName: "Button",
      },
    },
  },
}));

type MockNode = {
  type: "page" | "frame" | "text";
  name?: string;
  children: MockNode[];
  pluginData: Record<string, string>;
  characters?: string;
  layoutMode?: string;
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  width?: number;
  height?: number;
  appendChild(child: MockNode): void;
  setPluginData(key: string, value: string): void;
  resize(width: number, height: number): void;
};

function createNode(type: MockNode["type"]): MockNode {
  return {
    type,
    children: [],
    pluginData: {},
    appendChild(child: MockNode): void {
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

describe("Figma plugin scaffold materialization", () => {
  it("creates documentation and component-placeholder pages with provenance", async () => {
    const { main } = await import("./plugin.js");
    const pages: MockNode[] = [];
    const frames: MockNode[] = [];
    const texts: MockNode[] = [];
    const notify = vi.fn();
    const closePlugin = vi.fn();

    vi.stubGlobal("figma", {
      createPage: vi.fn(() => {
        const page = createNode("page");
        pages.push(page);
        return page;
      }),
      createFrame: vi.fn(() => {
        const frame = createNode("frame");
        frames.push(frame);
        return frame;
      }),
      createText: vi.fn(() => {
        const text = createNode("text");
        texts.push(text);
        return text;
      }),
      notify,
      closePlugin,
    });

    main();

    expect(pages.map((page) => page.name)).toEqual([
      "Full Stack DS / Documentation",
      "Full Stack DS / Components",
    ]);

    const [documentationFrame, componentFrame] = frames;
    expect(documentationFrame).toMatchObject({
      name: "Button / Documentation",
      layoutMode: "VERTICAL",
      itemSpacing: 8,
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      width: 640,
      height: 320,
      pluginData: {
        "fsds.component": "Button",
        "fsds.descriptorSchemaVersion": "1",
      },
    });
    expect(componentFrame).toMatchObject({
      name: "Button",
      pluginData: {
        "fsds.component": "Button",
        "fsds.cssPrefix": "button",
        "fsds.prop.variant": JSON.stringify({
          name: "variant",
          type: "'primary' | 'secondary'",
          required: false,
          defaultExpr: "primary",
        }),
        "fsds.variant.variant": JSON.stringify(["primary", "secondary"]),
      },
    });

    expect(texts.map((text) => text.characters)).toEqual([
      "Button",
      "Root: button",
      "Role: button",
      "Anatomy: root, icon",
      "Props: variant",
      "Variants: variant",
      "Button",
    ]);
    expect(notify).toHaveBeenCalledWith("Full Stack DS: scaffolded 1 contract descriptor(s).");
    expect(closePlugin).toHaveBeenCalledWith("Scaffolded 1 contract descriptor(s).");
  });
});
