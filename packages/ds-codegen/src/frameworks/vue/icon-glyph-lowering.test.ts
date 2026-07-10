import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateVueComponentSource } from "./component-source.js";

// ICON-CATALOG-RUNTIME-DELIVERY-01 — Vue lowering.
//
// Mirrors the real `Icon.contract.json` dom shape (svg node carrying an
// `iconGlyph` directive with `nameFrom`/`sizeFrom`/`sizeHints`) rather than
// loading the corpus file directly, so this test pins the structural
// contract→IR→Vue-emitter path independent of the Icon component's own
// authoring. Fixture pattern follows the inline-`ComponentContract` +
// `buildComponentIR` convention used across this directory's other
// `frameworks/*.test.ts` files (see events-content-bindings.test.ts,
// iteration-bindings.test.ts).
const ICON_CONTRACT: ComponentContract = {
  name: "FixtureGlyphIcon",
  layer: "primitive",
  cssPrefix: "fixture-glyph-icon",
  anatomy: {
    parts: ["root"],
    dom: {
      tag: "span",
      part: "root",
      attrs: { "aria-hidden": "true" },
      children: [
        {
          tag: "svg",
          attrs: {
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
          },
          iconGlyph: {
            nameFrom: "prop:name",
            sizeFrom: "prop:size",
            sizeHints: { sm: 16, md: 20, lg: 24, xl: 32 },
          },
        },
      ],
    },
  },
  props: {
    designed: {
      members: [
        {
          name: "name",
          propType: { kind: "string" },
          description: "Canonical icon name.",
          required: true,
        },
        {
          name: "size",
          propType: { kind: "enum", values: ["sm", "md", "lg", "xl"] },
          description: "Rendered glyph size.",
          default: "md",
        },
      ],
    },
  },
};

const ir = buildComponentIR(ICON_CONTRACT);
const source = generateVueComponentSource(ir);

describe("Vue iconGlyph lowering", () => {
  it("imports resolveIcon from the committed iconography package root", () => {
    expect(source).toContain(
      'import { resolveIcon } from "@full-stack-ds/iconography";',
    );
  });

  it("emits a size-hints const and computed() values resolving the catalog lookup", () => {
    expect(source).toContain(
      'const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };',
    );
    expect(source).toContain(
      "const iconGlyphPx = computed(() => ICON_GLYPH_SIZE_HINTS[props.size]);",
    );
    expect(source).toContain(
      "const iconGlyph = computed(() => resolveIcon(props.name, iconGlyphPx.value ?? Number.NaN));",
    );
  });

  it("guards the svg with a v-if null-guard on the resolved glyph", () => {
    expect(source).toContain('v-if="iconGlyph"');
  });

  it("stamps data-fsds-icon, viewBox, and requested-pixel width/height on the svg", () => {
    expect(source).toContain(':data-fsds-icon="iconGlyph.name"');
    expect(source).toContain(':viewBox="iconGlyph.viewBox"');
    expect(source).toContain(':width="iconGlyphPx ?? iconGlyph.size"');
    expect(source).toContain(':height="iconGlyphPx ?? iconGlyph.size"');
  });

  it("renders one <path> per glyph path record via v-for, with kebab-case svg attrs bound to camelCase record keys", () => {
    expect(source).toContain(
      '<path v-for="(glyphPath, glyphIndex) in iconGlyph.paths" :key="glyphIndex"',
    );
    expect(source).toContain(':d="glyphPath.d"');
    expect(source).toContain(':fill="glyphPath.fill"');
    expect(source).toContain(':stroke="glyphPath.stroke"');
    expect(source).toContain(':stroke-width="glyphPath.strokeWidth"');
    expect(source).toContain(':stroke-linecap="glyphPath.strokeLineCap"');
    expect(source).toContain(':stroke-linejoin="glyphPath.strokeLineJoin"');
    expect(source).toContain(':stroke-dasharray="glyphPath.strokeDasharray"');
    expect(source).toContain(':fill-rule="glyphPath.fillRule"');
    expect(source).toContain(':clip-rule="glyphPath.clipRule"');
  });

  it("keeps authored static attrs (fill, xmlns) on the svg alongside the glyph bindings", () => {
    expect(source).toMatch(/<svg[^>]*fill="none"/);
    expect(source).toMatch(/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  it("does not emit the resolveIcon import or any glyph scaffolding for a component with no iconGlyph node", () => {
    const plainContract: ComponentContract = {
      name: "FixturePlain",
      layer: "primitive",
      cssPrefix: "fixture-plain",
      anatomy: {
        parts: ["root"],
        dom: { tag: "div", part: "root", children: [{ tag: "children" }] },
      },
    };
    const plainSource = generateVueComponentSource(buildComponentIR(plainContract));
    expect(plainSource).not.toContain("resolveIcon");
    expect(plainSource).not.toContain("iconGlyph");
  });
});
