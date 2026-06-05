/**
 * Static extraction for the component box-model / sizing / token audit.
 *
 * Reads, per component, the contract + sidecars (the EXPECTATION) and the
 * generated React CSS (the emitted REALITY), and derives the box-model slot
 * overrides, intrinsic sizing tokens, token-usage, and declared layout. This
 * is the file-only half of COMPONENT-AUDIT-TOOL-01; rendered geometry (the
 * true reality) is added by geometry.mjs.
 *
 * READ-ONLY: never writes to contracts, sidecars, or generated artifacts.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(HERE, "../..");

const CONTRACTS = resolve(REPO, "packages/ds-contracts/components");
const REACT = resolve(REPO, "packages/ds-react/src/components");

const BOX_SLOTS = [
  "padding",
  "padding-block",
  "padding-block-start",
  "padding-block-end",
  "padding-inline",
  "padding-inline-start",
  "padding-inline-end",
  "gap",
  "width",
  "min-width",
  "max-width",
  "height",
  "min-height",
  "max-height",
];
// Primitive defaults (BoxModel.primitive.json) — a slot is "overridden" when
// its emitted value differs from these.
const BOX_DEFAULT = {
  width: "auto",
  height: "auto",
  "max-width": "none",
  "max-height": "none",
};
const boxDefault = (slot) => BOX_DEFAULT[slot] ?? "0";

/** Inline-flex / inline-block / inline are control-ish; block/flex/grid roots are layout-ish. */
const INLINE_DISPLAYS = new Set(["inline-flex", "inline-block", "inline", "inline-grid"]);

export const ALL_COMPONENTS = () =>
  readdirSync(CONTRACTS)
    .filter((d) => statSync(resolve(CONTRACTS, d)).isDirectory())
    .filter((d) => existsSync(resolve(CONTRACTS, d, `${d}.contract.json`)))
    .sort();

const readJSON = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readText = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

/**
 * Return the inner text of the first top-level `selector { ... }` block,
 * brace-matched so nested `&:hover { }` rules are included in the slice.
 */
function blockBody(css, selector) {
  const open = css.indexOf(`${selector} {`);
  if (open < 0) return "";
  let i = css.indexOf("{", open);
  let depth = 0;
  const start = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start, i);
    }
  }
  return css.slice(start);
}

/** Top-level `prop: value` declarations only (skip anything inside a nested `{}`). */
function topLevelDecls(body) {
  const out = [];
  let depth = 0;
  let buf = "";
  for (const ch of body) {
    if (ch === "{") {
      depth++;
      // the selector text accumulated before `{` is a nested rule head — drop it
      buf = "";
      continue;
    }
    if (ch === "}") {
      depth--;
      buf = "";
      continue;
    }
    if (depth === 0) {
      if (ch === ";") {
        const m = buf.match(/^\s*([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
        if (m) out.push([m[1], m[2].trim()]);
        buf = "";
      } else {
        buf += ch;
      }
    }
  }
  return out;
}

/** var(--chain, fallback) → fallback; literal → itself. */
function fallbackOf(value) {
  const m = value.match(/var\([^,]+,\s*([^)]+)\)\s*$/);
  return (m ? m[1] : value).trim();
}

const DIMENSION_PROPS = new Set([
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "padding",
  "padding-block",
  "padding-inline",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "margin",
  "gap",
  "row-gap",
  "column-gap",
  "font-size",
  "line-height",
  "border-width",
  "border-radius",
  "inset",
  "top",
  "left",
  "right",
  "bottom",
]);
// Literal dimensional values that are intentional/benign (icon sizing, resets).
const BENIGN_DIM = new Set(["0", "auto", "none", "1em", "100%", "1px", "2px", "inherit", "fit-content"]);

export function extractStatic(name) {
  const cdir = resolve(CONTRACTS, name);
  const contract = readJSON(resolve(cdir, `${name}.contract.json`)) ?? {};
  const tokensJson = readJSON(resolve(cdir, `${name}.tokens.json`)) ?? {};
  const stylesJson = readJSON(resolve(cdir, `${name}.styles.json`)) ?? {};

  const css = readText(resolve(REACT, name, `${name}.css`));
  const tokensCss = readText(resolve(REACT, name, `${name}.tokens.css`));

  // cssPrefix from the first `.X {` rule in the generated tokens.css (authoritative).
  const prefixMatch =
    tokensCss.match(/\.([a-zA-Z][\w-]*)\s*\{/) || css.match(/\.([a-zA-Z][\w-]*)\s*\{/);
  const prefix = prefixMatch ? prefixMatch[1] : name.toLowerCase();

  const rootTag = contract?.anatomy?.dom?.tag ?? contract?.anatomy?.details?.root?.tag ?? "div";
  const category = contract?.category ?? "";
  const layer = contract?.layer ?? "";

  // --- Box model: emitted --fsds-box-model-* from tokens.css root block ---
  const tokensBody = blockBody(tokensCss, `.${prefix}`);
  const tokenDecls = topLevelDecls(tokensBody);
  const boxEmitted = {};
  const sizing = {};
  for (const [propRaw, value] of tokenDecls) {
    const slot = propRaw.replace(/^--fsds-box-model-/, "");
    if (propRaw.startsWith("--fsds-box-model-") && BOX_SLOTS.includes(slot)) {
      boxEmitted[slot] = value;
    } else if (propRaw.startsWith(`--fsds-${prefix}-`)) {
      // intrinsic sizing tokens: keep size/height/width/radius/border/gap-ish
      const key = propRaw.replace(`--fsds-${prefix}-`, "");
      if (/size|height|width|radius|border|gap|space|inset|min|max/i.test(key)) {
        sizing[key] = fallbackOf(value);
      }
    }
  }
  const boxOverrides = {};
  for (const slot of BOX_SLOTS) {
    const v = boxEmitted[slot];
    if (v === undefined) continue;
    const isVar = v.startsWith("var(");
    if (isVar || v !== boxDefault(slot)) {
      boxOverrides[slot] = isVar ? fallbackOf(v) : v;
    }
  }

  // --- Token usage: root .{prefix} block in the component CSS ---
  const cssBody = blockBody(css, `.${prefix}`);
  const rootDecls = topLevelDecls(cssBody);
  let tokenized = 0;
  let literal = 0;
  const literalDims = [];
  for (const [prop, value] of rootDecls) {
    const usesVar = value.includes("var(--fsds-");
    if (usesVar) tokenized++;
    else {
      literal++;
      if (DIMENSION_PROPS.has(prop) && !BENIGN_DIM.has(value) && /\d/.test(value)) {
        literalDims.push(`${prop}=${value}`);
      }
    }
  }

  // --- Layout (declared): display + flex/grid hints from styles.root ---
  const sRoot = stylesJson.root ?? {};
  const lit = (k) => (sRoot[k] && "literal" in sRoot[k] ? sRoot[k].literal : undefined);
  const display = lit("display") ?? rootDecls.find(([p]) => p === "display")?.[1] ?? "(default)";
  const flexDir = lit("flex-direction");
  const align = lit("align-items");
  const justify = lit("justify-content");
  const gridCols = lit("grid-template-columns");
  const layoutBits = [display];
  if (flexDir) layoutBits.push(`dir=${flexDir}`);
  if (align) layoutBits.push(`align=${align}`);
  if (justify) layoutBits.push(`justify=${justify}`);
  if (gridCols) layoutBits.push(`grid-cols=${gridCols}`);
  if (boxOverrides.gap) layoutBits.push(`gap=${boxOverrides.gap}`);

  // --- Heuristic flags ---
  const flags = [];
  const isLayoutish = layer === "compound" || category === "structure" || category === "layout";
  const widthAuto = (boxEmitted.width ?? "auto") === "auto";
  if (isLayoutish && widthAuto && !INLINE_DISPLAYS.has(display)) {
    flags.push("layout-root width:auto (block component may expect 100%)");
  }
  if (literalDims.length) {
    flags.push(`${literalDims.length} hardcoded dim(s)`);
  }
  // a non-inline display with no box-model padding override is worth an eye
  if (!INLINE_DISPLAYS.has(display) && Object.keys(boxOverrides).filter((s) => s.startsWith("padding")).length === 0) {
    flags.push("no padding override on non-inline root");
  }

  return {
    component: name,
    category,
    layer,
    rootTag,
    prefix,
    display,
    boxOverrides,
    boxEmitted,
    sizing,
    tokenized,
    literal,
    literalDims,
    layout: layoutBits.join("; "),
    flags,
    // expected rendered geometry seeds (used + checked by geometry.mjs)
    expect: {
      minHeight: boxOverrides["min-height"] ?? boxEmitted["min-height"] ?? "0",
      height: boxEmitted.height ?? "auto",
      paddingInlineStart: boxOverrides["padding-inline-start"] ?? boxOverrides["padding-inline"] ?? boxEmitted["padding-inline-start"] ?? "0",
      paddingBlockStart: boxOverrides["padding-block-start"] ?? boxOverrides["padding-block"] ?? boxEmitted["padding-block-start"] ?? "0",
      gap: boxOverrides.gap ?? "0",
      display,
    },
  };
}
