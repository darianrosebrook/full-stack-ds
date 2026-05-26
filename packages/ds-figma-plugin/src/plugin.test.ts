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
        { name: "icon", layoutVariant: "horizontal" },
      ],
      props: [
        {
          name: "variant",
          type: "'primary' | 'secondary'",
          required: false,
          defaultExpr: "primary",
        },
      ],
      variants: { variant: ["primary", "secondary"] },
    },
    Empty: {
      schemaVersion: 1,
      component: {
        name: "Empty",
        cssPrefix: "empty",
        rootElement: "div",
        effectiveRole: null,
      },
      anatomy: [],
      props: [],
      variants: {},
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

type MockNode = {
  kind: NodeKind;
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

describe("Figma plugin scaffold materialization", () => {
  it("materializes Stack primitive and leaf components onto a single Components page", async () => {
    const { main } = await import("./plugin.js");
    const pages: MockNode[] = [];
    const components: MockNode[] = [];
    const componentSets: MockNode[] = [];
    const instances: MockNode[] = [];
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
      createText: vi.fn(() => createNode("text")),
      createComponent: vi.fn(() => {
        const component = createNode("component");
        component.createInstance = (): MockNode => {
          const instance = createNode("instance");
          instance.master = component;
          instances.push(instance);
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

    await main();

    expect(loadFontAsync).toHaveBeenCalledWith({ family: "Inter", style: "Regular" });

    // Single page (Documentation page was dropped).
    expect(pages.map((page) => page.name)).toEqual([
      "Full Stack DS / Components",
    ]);

    // Exactly one Stack component set with two variants, plus two leaf components.
    expect(componentSets).toHaveLength(1);
    const [stackSet] = componentSets;
    expect(stackSet.name).toBe("Stack");
    expect(stackSet.pluginData).toMatchObject({
      "fsds.primitive": "Stack",
      "fsds.descriptorSchemaVersion": "1",
    });
    expect(stackSet.children.map((child) => child.name)).toEqual([
      "variant=vertical",
      "variant=horizontal",
    ]);
    expect(stackSet.children.map((child) => child.layoutMode)).toEqual([
      "VERTICAL",
      "HORIZONTAL",
    ]);

    // 2 stack variants + 2 leaves = 4 component nodes total.
    expect(components.map((c) => c.name)).toEqual([
      "variant=vertical",
      "variant=horizontal",
      "Button",
      "Empty",
    ]);

    // Ordering: stack components are created before any leaf component
    // (required because the leaves instantiate them).
    expect(components[0].kind).toBe("component");
    expect(components[1].kind).toBe("component");
    expect(components[0].parent).toBe(stackSet);
    expect(components[1].parent).toBe(stackSet);

    // The two leaf components live directly on the Components page,
    // not under the Stack set.
    const buttonComponent = components.find((c) => c.name === "Button")!;
    const emptyComponent = components.find((c) => c.name === "Empty")!;
    expect(buttonComponent.parent).toBe(pages[0]);
    expect(emptyComponent.parent).toBe(pages[0]);

    // Button: 2 anatomy parts -> 2 stack instances. Icon is layoutVariant=horizontal.
    expect(buttonComponent.children.map((child) => child.kind)).toEqual([
      "instance",
      "instance",
    ]);
    expect(buttonComponent.children.map((child) => child.name)).toEqual([
      "root",
      "icon",
    ]);
    expect(buttonComponent.children[0].master?.name).toBe("variant=vertical");
    expect(buttonComponent.children[1].master?.name).toBe("variant=horizontal");

    // Empty: zero anatomy -> single fallback root stack instance.
    expect(emptyComponent.children.map((child) => child.kind)).toEqual(["instance"]);
    expect(emptyComponent.children[0].name).toBe("root");
    expect(emptyComponent.children[0].master?.name).toBe("variant=vertical");

    // Plugin data on leaves.
    expect(buttonComponent.pluginData).toMatchObject({
      "fsds.component": "Button",
      "fsds.cssPrefix": "button",
      "fsds.descriptorSchemaVersion": "1",
      "fsds.prop.variant": JSON.stringify({
        name: "variant",
        type: "'primary' | 'secondary'",
        required: false,
        defaultExpr: "primary",
      }),
      "fsds.variant.variant": JSON.stringify(["primary", "secondary"]),
    });
    expect(emptyComponent.pluginData).toMatchObject({
      "fsds.component": "Empty",
      "fsds.cssPrefix": "empty",
      "fsds.descriptorSchemaVersion": "1",
    });

    expect(notify).toHaveBeenCalledWith(
      "Full Stack DS: scaffolded Stack + 2 component(s).",
    );
    expect(closePlugin).toHaveBeenCalledWith(
      "Scaffolded Stack + 2 component(s).",
    );
  });
});
