import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateSvelteComponentSource } from "./component-source.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve a path relative to the repo root. This file lives at
 * `<root>/packages/ds-codegen/src/frameworks/svelte/`, three levels below
 * `packages/ds-codegen`, so the repo root is five levels up.
 */
function repoRoot(): string {
  return resolve(__dirname, "../../../../..");
}

function loadContract(name: string): ComponentContract {
  const folder = resolve(repoRoot(), "packages/ds-contracts/components", name);
  return JSON.parse(
    readFileSync(resolve(folder, `${name}.contract.json`), "utf8"),
  ) as ComponentContract;
}

// ICON-CATALOG-RUNTIME-DELIVERY-01 — Svelte lowering of the `iconGlyph`
// IR fact (see packages/ds-codegen/src/frameworks/icon-glyph.ts for the
// shared facts, and the React reference lowering in
// packages/ds-codegen/src/frameworks/react/component-source.ts).
//
// Icon.contract.json declares an svg node with
//   iconGlyph: { nameFrom: "prop:name", sizeFrom: "prop:size",
//                sizeHints: { sm: 16, md: 20, lg: 24, xl: 32 } }
// The Svelte emitter must lower this to a `resolveIcon` catalog lookup
// (imported from the committed @full-stack-ds/iconography root module),
// a $derived-reactive resolved glyph, an {#if} null-guard for an unknown
// icon name, and an {#each} loop rendering one <path> per glyph path
// record using kebab-case SVG attribute names.

describe("Svelte iconGlyph lowering (Icon contract)", () => {
  const contract = loadContract("Icon");
  const ir = buildComponentIR(contract);
  const source = generateSvelteComponentSource(ir);

  it("imports resolveIcon from the committed iconography package root", () => {
    expect(source).toContain(
      'import { resolveIcon } from "@full-stack-ds/iconography";',
    );
  });

  it("resolves the glyph reactively from the name/size props", () => {
    expect(source).toContain(
      "const iconGlyph = $derived(resolveIcon(name, iconGlyphPx ?? Number.NaN));",
    );
  });

  it("maps the size prop through the contract's sizeHints literal", () => {
    expect(source).toContain(
      'const ICON_GLYPH_SIZE_HINTS: Record<string, number> = { "sm": 16, "md": 20, "lg": 24, "xl": 32 };',
    );
    expect(source).toContain(
      "const iconGlyphPx = $derived(ICON_GLYPH_SIZE_HINTS[size]);",
    );
  });

  it("wraps the svg in an {#if} null-guard keyed on the resolved glyph", () => {
    expect(source).toContain("{#if iconGlyph}");
    expect(source).toContain("{/if}");
  });

  it("stamps data-fsds-icon and viewBox from the resolved glyph", () => {
    expect(source).toContain("data-fsds-icon={iconGlyph.name}");
    expect(source).toContain("viewBox={iconGlyph.viewBox}");
  });

  it("sizes the svg from the requested pixel value, falling back to the glyph's natural size", () => {
    expect(source).toContain("width={iconGlyphPx ?? iconGlyph.size}");
    expect(source).toContain("height={iconGlyphPx ?? iconGlyph.size}");
  });

  it("renders one <path> per glyph path record via an {#each} loop with kebab-case SVG attrs", () => {
    expect(source).toContain(
      "{#each iconGlyph.paths as glyphPath, glyphIndex (glyphIndex)}",
    );
    expect(source).toContain(
      "<path d={glyphPath.d} fill={glyphPath.fill} stroke={glyphPath.stroke} " +
        "stroke-width={glyphPath.strokeWidth} stroke-linecap={glyphPath.strokeLineCap} " +
        "stroke-linejoin={glyphPath.strokeLineJoin} stroke-dasharray={glyphPath.strokeDasharray} " +
        "fill-rule={glyphPath.fillRule} clip-rule={glyphPath.clipRule} />",
    );
  });

  it("preserves the contract's authored static svg attrs (fill, xmlns)", () => {
    expect(source).toContain('fill="none"');
    expect(source).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("does not emit iconGlyph scaffolding for a component with no glyph nodes", () => {
    const plainContract: ComponentContract = {
      name: "FixturePlain",
      layer: "primitive",
      cssPrefix: "fixture-plain",
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "div",
          part: "root",
          children: [{ tag: "children" }],
        },
      },
      props: { styled: { members: [] } },
    };
    const plainIr = buildComponentIR(plainContract);
    const plainSource = generateSvelteComponentSource(plainIr);
    expect(plainSource).not.toContain("resolveIcon");
    expect(plainSource).not.toContain("iconGlyph");
  });
});
