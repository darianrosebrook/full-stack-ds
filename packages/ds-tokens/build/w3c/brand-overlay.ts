/**
 * Brand-overlaid resolved trees for the contrast gate.
 *
 * The base `resolved.tokens.json` is a single instantiation of the semantic
 * layer. Brands are emitted as a separate CSS cascade layer and never feed
 * back into that tree, so a gate reading only the resolved tree checks 1 of
 * the 10 registered brands. Every non-default brand's contrast was therefore
 * unproven — which is how `corporate` shipped foreground.onColor at 3.99:1 and
 * `monochrome` at 1.42:1 against their own accent fills.
 *
 * This module reconstructs, for one brand and one theme, the tree a consumer
 * actually resolves against, so `extractCanonicalPairs` can run over it
 * unchanged.
 *
 * Fidelity note: this mirrors the *token* cascade (base semantic value, then
 * the brand's light vars, then its dark vars in dark theme — the same order
 * `generateBrandLayerCSS` emits). It does NOT model CSS specificity between
 * theme-scoped and brand-scoped selectors; it answers "what value does this
 * brand declare for this token in this theme", which is what a contrast
 * contract is about.
 */
import { tokenPathToCSSVar } from "../core/index.js";

type Theme = "light" | "dark";

interface BrandVarSets {
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
}

/** A leaf is a DTCG node carrying `$value`. */
function isLeaf(node: unknown): node is Record<string, unknown> {
  return typeof node === "object" && node !== null && "$value" in node;
}

/**
 * Walk every leaf, yielding its dotted path. Group keys starting with `$`
 * are metadata, never path segments.
 */
function walkLeaves(
  node: unknown,
  path: string[],
  visit: (path: string[], leaf: Record<string, unknown>) => void,
): void {
  if (!node || typeof node !== "object") return;
  if (isLeaf(node)) {
    visit(path, node as Record<string, unknown>);
    return;
  }
  for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
    if (key.startsWith("$")) continue;
    walkLeaves(child, [...path, key], visit);
  }
}

/** Hex for a leaf in one theme, or null when it is not a resolved colour. */
function leafHex(leaf: Record<string, unknown>, theme: Theme): string | null {
  const v = leaf.$value;
  if (typeof v === "string") return v.startsWith("#") ? v : null;
  if (v && typeof v === "object") {
    const themed = (v as Record<string, unknown>)[theme] ??
      (v as Record<string, unknown>).light;
    return typeof themed === "string" && themed.startsWith("#") ? themed : null;
  }
  return null;
}

/**
 * Index the resolved tree by CSS variable name, so a brand override (which is
 * keyed by var name) can be mapped back onto a tree path and a hex value.
 */
export function indexResolvedTree(tree: unknown, theme: Theme): {
  varToPath: Map<string, string[]>;
  varToHex: Map<string, string>;
} {
  const varToPath = new Map<string, string[]>();
  const varToHex = new Map<string, string>();
  walkLeaves(tree, [], (path, leaf) => {
    const cssVar = tokenPathToCSSVar(path.join("."));
    varToPath.set(cssVar, path);
    const hex = leafHex(leaf, theme);
    if (hex) varToHex.set(cssVar, hex);
  });
  return { varToPath, varToHex };
}

/**
 * Resolve a brand override value to a hex.
 *
 * Brand values are emitted either as a literal (`#abc123`) or as a single
 * `var(--fsds-…)` reference into the core/semantic layers. A chained or
 * multi-var value (shadows, gradients) is not a colour pair input and yields
 * null so the caller skips it rather than guessing.
 */
export function resolveBrandValue(
  value: string,
  varToHex: Map<string, string>,
): string | null {
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) return trimmed;
  const m = /^var\(\s*(--[A-Za-z0-9-]+)\s*(?:,.*)?\)$/.exec(trimmed);
  if (!m) return null;
  return varToHex.get(m[1]) ?? null;
}

/**
 * Produce the resolved tree as `brand` instantiates it in `theme`.
 *
 * Light vars apply in both themes (the emitter only writes a dark var when the
 * brand declares an explicit `fsds.dark`, relying on the unconditional block
 * otherwise), so dark = base + lightVars + darkVars.
 */
export function overlayBrand(
  baseTree: unknown,
  brand: BrandVarSets,
  theme: Theme,
): unknown {
  const tree = structuredClone(baseTree) as Record<string, unknown>;
  const { varToPath, varToHex } = indexResolvedTree(tree, theme);

  const layers = theme === "dark"
    ? [brand.lightVars, brand.darkVars]
    : [brand.lightVars];

  for (const layer of layers) {
    for (const [cssVar, rawValue] of Object.entries(layer)) {
      const path = varToPath.get(cssVar);
      if (!path) continue; // brand declares a token the base layer does not
      const hex = resolveBrandValue(rawValue, varToHex);
      if (!hex) continue; // non-colour or unresolvable — not a contrast input
      let node = tree as Record<string, unknown>;
      for (const seg of path.slice(0, -1)) {
        node = node[seg] as Record<string, unknown>;
      }
      const leaf = node[path[path.length - 1]] as Record<string, unknown>;
      if (leaf) leaf.$value = hex;
    }
  }
  return tree;
}
