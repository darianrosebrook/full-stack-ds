import { describe, expect, it } from "vitest";
import type { DomNodeIR } from "../ir.js";
import {
  collectComponentRefs,
  resolveComponentRefImport,
  resolveComponentRefImports,
} from "./component-ref-imports.js";

/** Minimal DomNodeIR factory for tests. */
function node(partial: Partial<DomNodeIR>): DomNodeIR {
  return {
    tag: "div",
    componentRef: undefined,
    slotName: undefined,
    part: undefined,
    attrs: {},
    bindings: {},
    propertyBindings: {},
    events: {},
    content: undefined,
    children: [],
    ifProp: undefined,
    ifNegated: false,
    iteration: undefined,
    cssVarBindings: [],
    iconGlyph: undefined,
    generatedIdSlug: undefined,
    idRefAttrs: [],
    ...partial,
  };
}

describe("collectComponentRefs", () => {
  it("returns empty for an undefined tree", () => {
    expect(collectComponentRefs(undefined)).toEqual([]);
  });

  it("returns empty when no node has a componentRef", () => {
    const dom = node({ tag: "div", children: [node({ tag: "span" })] });
    expect(collectComponentRefs(dom)).toEqual([]);
  });

  it("collects a single child componentRef", () => {
    const dom = node({
      tag: "div",
      children: [node({ tag: "", componentRef: "Image" })],
    });
    expect(collectComponentRefs(dom)).toEqual(["Image"]);
  });

  it("collects nested + multiple refs in deterministic pre-order, deduped", () => {
    const dom = node({
      tag: "div",
      children: [
        node({ tag: "", componentRef: "Label" }),
        node({
          tag: "div",
          children: [
            node({ tag: "", componentRef: "Input" }),
            node({ tag: "", componentRef: "Label" }), // dup
          ],
        }),
      ],
    });
    expect(collectComponentRefs(dom)).toEqual(["Label", "Input"]);
  });

  it("collects a root componentRef (forward-compat: no positional restriction)", () => {
    const dom = node({ tag: "", componentRef: "Button" });
    expect(collectComponentRefs(dom)).toEqual(["Button"]);
  });
});

describe("resolveComponentRefImport", () => {
  it("React: named import, no extension", () => {
    expect(resolveComponentRefImport("Avatar", "Image", "react")).toEqual({
      refName: "Image",
      identifier: "Image",
      specifier: "../Image/Image",
      kind: "named",
    });
  });

  it("Vue: named import with .vue", () => {
    expect(resolveComponentRefImport("Avatar", "Image", "vue").specifier).toBe(
      "../Image/Image.vue",
    );
  });

  it("Svelte: named import with .svelte", () => {
    expect(
      resolveComponentRefImport("Avatar", "Image", "svelte").specifier,
    ).toBe("../Image/Image.svelte");
  });

  it("Angular: imports the <Ref>Component class from <Ref>.component.js", () => {
    expect(resolveComponentRefImport("Avatar", "Image", "angular")).toEqual({
      refName: "Image",
      identifier: "ImageComponent",
      specifier: "../Image/Image.component.js",
      kind: "named",
    });
  });

  it("Lit: side-effect import from .js (custom element self-registers)", () => {
    expect(resolveComponentRefImport("Avatar", "Image", "lit")).toEqual({
      refName: "Image",
      identifier: "Image",
      specifier: "../Image/Image.js",
      kind: "side-effect",
    });
  });
});

describe("resolveComponentRefImports", () => {
  it("maps a tree's refs to framework imports in order", () => {
    const dom = node({
      tag: "div",
      children: [
        node({ tag: "", componentRef: "Label" }),
        node({ tag: "", componentRef: "Input" }),
      ],
    });
    const imports = resolveComponentRefImports("TextField", dom, "react");
    expect(imports.map((i) => i.specifier)).toEqual([
      "../Label/Label",
      "../Input/Input",
    ]);
  });
});
