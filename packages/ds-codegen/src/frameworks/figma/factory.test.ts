import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentIR } from "../../ir.js";
import { assertFigmaComponentDescriptorV1 } from "./descriptor.js";
import { createFigmaEmitter, toFigmaComponentDescriptor } from "./factory.js";

function fixtureIR(): ComponentIR {
  return {
    name: "Button",
    cssPrefix: "button",
    root: { element: "button", effectiveRole: "button" },
    parts: [
      {
        name: "root",
        semanticElement: "button",
        nativeTag: "button",
        isCompound: false,
        isRootOnly: true,
      },
    ],
    styledProps: [
      {
        name: "variant",
        safeName: "variant",
        type: "'primary' | 'secondary'",
        typeRefs: [],
        required: false,
        description: "Visual treatment.",
        defaultExpr: "primary",
      },
    ],
    variants: { variant: ["primary", "secondary"] },
    states: { boolean: [], enum: {} },
    classRecipe: { base: "button" },
    cssBlocks: [".button {}"],
    keyframes: [],
    behavior: {
      normalizedChannels: {},
      normalizedDismissalTriggers: [],
      normalizedEvents: {},
      form: null,
      focus: null,
      portal: null,
    },
    surface: null,
  } as unknown as ComponentIR;
}

describe("Figma descriptor schema", () => {
  it("accepts descriptors emitted from governed ComponentIR", () => {
    const descriptor = toFigmaComponentDescriptor(fixtureIR());
    assertFigmaComponentDescriptorV1(descriptor);
    expect(descriptor).toMatchObject({
      schemaVersion: 1,
      source: "@full-stack-ds/codegen/frameworks/figma",
      component: {
        name: "Button",
        cssPrefix: "button",
        rootElement: "button",
        effectiveRole: "button",
      },
      figma: {
        intendedUse: "figma-library-materialization",
        documentationFrame: "Button / Documentation",
        componentSetName: "Button",
        propertySource: "IR styledProps + variants + states + behavior",
      },
    });
  });

  it("rejects malformed or ungoverned descriptors", () => {
    expect(() =>
      assertFigmaComponentDescriptorV1({
        schemaVersion: 1,
        source: "hand-authored",
        component: { name: "Button" },
      }),
    ).toThrow(/source is not governed/);
  });
});

describe("createFigmaEmitter", () => {
  it("emits deterministic descriptor and README transfer artifacts", () => {
    const emitter = createFigmaEmitter();
    const files = emitter.emitComponent(fixtureIR(), {
      componentsRoot: "/tmp/components",
      contractsRoot: "/tmp/contracts",
    });

    expect(files.map((file) => file.relativePath)).toEqual([
      "Button/Button.figma.json",
      "Button/README.md",
    ]);
    expect(files[0]!.preservable).toBe(false);
    expect(files[1]!.preservable).toBe(true);
    expect(JSON.parse(files[0]!.contents)).toEqual(toFigmaComponentDescriptor(fixtureIR()));
    expect(files[1]!.contents).toContain("transfer artifact, not the source of truth");
  });

  it("emits a JSON descriptor registry barrel", () => {
    const barrel = createFigmaEmitter().emitBarrel(["Button", "Input"]);
    expect(barrel).toContain('import Button from "./Button/Button.figma.json" with { type: "json" };');
    expect(barrel).toContain('import Input from "./Input/Input.figma.json" with { type: "json" };');
    expect(barrel).toContain('"Button": Button');
    expect(barrel).toContain('export type FigmaComponentName = keyof typeof figmaComponentRegistry;');
  });

  it("discovers only component directories with matching figma descriptors", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "figma-emitter-"));
    fs.mkdirSync(path.join(root, "Button"));
    fs.writeFileSync(path.join(root, "Button", "Button.figma.json"), "{}\n");
    fs.mkdirSync(path.join(root, "Input"));
    fs.writeFileSync(path.join(root, "Input", "README.md"), "partial\n");

    expect(createFigmaEmitter().discoverComponentIds(root)).toEqual(["Button"]);
  });
});
