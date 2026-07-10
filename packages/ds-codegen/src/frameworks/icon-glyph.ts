/**
 * Shared icon-glyph lowering facts (ICON-CATALOG-RUNTIME-DELIVERY-01).
 *
 * A `DomNodeIR.iconGlyph` directive renders an svg's viewBox and `<path>`
 * children from the `@full-stack-ds/iconography` catalog, looked up at
 * runtime by the bound name/size props. This module carries the facts every
 * framework emitter shares — the package specifier, the tree walk, the
 * path-record→attribute mapping, and the pixel-expression builder — so each
 * emitter's `component-source.ts` does last-mile syntax only.
 *
 * Import direction matters: emitters import the COMMITTED package-root
 * module (`@full-stack-ds/iconography`), never anything under the package's
 * gitignored `generated/` scratch tree.
 */
import type { DomNodeIR, IconGlyphIR } from "../ir.js";

/** The workspace package specifier generated components import from. */
export const ICONOGRAPHY_MODULE = "@full-stack-ds/iconography";

export interface IconGlyphNodeEntry {
  node: DomNodeIR;
  glyph: IconGlyphIR;
  /**
   * Identifier suffix for emitted locals ("" for the first glyph node,
   * "2"/"3"/... for subsequent ones) so multiple glyph nodes in one tree
   * cannot collide.
   */
  suffix: string;
}

/** Depth-first collection of every iconGlyph-bearing node in a DOM tree. */
export function collectIconGlyphNodes(
  dom: DomNodeIR | undefined,
): IconGlyphNodeEntry[] {
  const found: IconGlyphNodeEntry[] = [];
  const walk = (node: DomNodeIR | undefined): void => {
    if (!node) return;
    if (node.iconGlyph) {
      found.push({
        node,
        glyph: node.iconGlyph,
        suffix: found.length === 0 ? "" : String(found.length + 1),
      });
    }
    for (const child of node.children) walk(child);
  };
  walk(dom);
  return found;
}

/**
 * Glyph path-record fields in emission order.
 * `recordKey` is the key on the catalog's path record (the icon contract
 * vocabulary), `reactProp` is the JSX/React-Native prop spelling, and
 * `svgAttr` is the kebab-case SVG attribute spelling used by Vue, Svelte,
 * Angular, and Lit templates.
 */
export const ICON_GLYPH_PATH_ATTRS: ReadonlyArray<{
  recordKey: string;
  reactProp: string;
  svgAttr: string;
}> = [
  { recordKey: "d", reactProp: "d", svgAttr: "d" },
  { recordKey: "fill", reactProp: "fill", svgAttr: "fill" },
  { recordKey: "stroke", reactProp: "stroke", svgAttr: "stroke" },
  { recordKey: "strokeWidth", reactProp: "strokeWidth", svgAttr: "stroke-width" },
  { recordKey: "strokeLineCap", reactProp: "strokeLinecap", svgAttr: "stroke-linecap" },
  { recordKey: "strokeLineJoin", reactProp: "strokeLinejoin", svgAttr: "stroke-linejoin" },
  { recordKey: "strokeDasharray", reactProp: "strokeDasharray", svgAttr: "stroke-dasharray" },
  { recordKey: "fillRule", reactProp: "fillRule", svgAttr: "fill-rule" },
  { recordKey: "clipRule", reactProp: "clipRule", svgAttr: "clip-rule" },
];

/**
 * JS object-literal text for the size-hints map, deterministic key order as
 * authored in the contract (e.g. `{ "sm": 16, "md": 20 }`).
 */
export function iconGlyphSizeHintsLiteral(
  hints: Record<string, number>,
): string {
  const entries = Object.entries(hints).map(
    ([key, px]) => `"${key}": ${px}`,
  );
  return `{ ${entries.join(", ")} }`;
}

/**
 * Expression resolving the requested pixel size, given the
 * framework-specific accessor for the size prop (`size`, `props.size`,
 * `this.size`, ...) and the identifier the emitter gave the hints map.
 * Returns `undefined` when the glyph has no size binding at all — the
 * emitter then renders at the resolved variant's natural size.
 */
export function iconGlyphPxExpr(
  glyph: IconGlyphIR,
  sizeAccessor: string | undefined,
  hintsIdent: string | undefined,
): string | undefined {
  if (glyph.sizeFrom === undefined || sizeAccessor === undefined) {
    return undefined;
  }
  if (glyph.sizeHints !== undefined && hintsIdent !== undefined) {
    return `${hintsIdent}[${sizeAccessor}]`;
  }
  return sizeAccessor;
}
