/**
 * CSS string formatting from IR.
 *
 * All selector expansion and block computation now lives in `ir.ts`
 * (via `computeCssBlocks`); this module is a target-neutral text
 * formatter that any framework emitter can call to produce a `.css`
 * file alongside its rendered component.
 *
 * Since TOKENS-WORKSTREAM-STEP-06A-III, two CSS artifacts are emitted
 * per component:
 *
 *   - `<Component>.css`        Property references (the consumer side
 *                              of the two-hop indirection). Imports
 *                              its sibling .tokens.css at the top.
 *                              Uses native CSS nesting for BEM
 *                              modifiers, states, and parts.
 *
 *   - `<Component>.tokens.css` Slot declarations (the indirection
 *                              layer). One block per non-empty
 *                              selector, also nested. Brands and
 *                              themes override these slots at
 *                              cascade-layer time.
 *
 * Both partitions take the same flat `cssBlocks: CssBlockIR[]` from
 * the IR and re-group them on output — the IR does not encode
 * nesting because the same data feeds two different consumers
 * (the .css and .tokens.css files) which group it differently.
 */
import type { ComponentContract } from "./contract.js";
import type { ComponentIR, CssBlockIR, KeyframeIR } from "./ir.js";
import {
  buildComponentIR,
  computeCssBlocks,
  expandComplexSelector,
} from "./ir.js";
import { getCssPrefix } from "./contract.js";
import { renderSections, type Section } from "./preserve.js";

export { computeCssBlocks, expandComplexSelector, getCssPrefix };

const INDENT = "  ";

/**
 * Test a CSS custom-property name. Slot declarations from the two-hop
 * indirection use this prefix; everything else is a real CSS property.
 */
function isSlotDeclaration(prop: string): boolean {
  return prop.startsWith("--");
}

/**
 * Given the root selector (`.switch`), convert a sibling selector
 * (`.switch:hover`, `.switch[data-x="y"]`) into its nested form
 * (`&:hover`, `&[data-x="y"]`).
 *
 * Returns null when the selector cannot be safely nested under `&`.
 * The caller then emits the block as a flat sibling rule, which is
 * the only spec-compliant way to express BEM child / modifier
 * selectors under the current root.
 *
 * The CSS Nesting Level 1 spec requires `&` to behave like a single
 * compound-selector token: it can be followed by `:` (pseudo-class),
 * `::` (pseudo-element), `[` (attribute), or a combinator / whitespace.
 * It CANNOT be followed by an identifier-continuing character — `-`
 * or `_` start an identifier, and the parser will not concatenate
 * `&--md` into `.switch--md`. Chromium, Firefox, and Safari all drop
 * such rules silently (verified empirically and against
 * https://www.w3.org/TR/css-nesting-1/ and
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting).
 *
 * Concretely: `.switch__track`, `.switch--md`, `.switch__thumb` must
 * be emitted as standalone selectors. Only state pseudo-classes
 * (`:hover`, `:checked`) and attribute selectors (`[aria-expanded]`)
 * are eligible for nesting.
 */
function toNestedSelector(rootSelector: string, child: string): string | null {
  if (!child.startsWith(rootSelector)) return null;
  const remainder = child.slice(rootSelector.length);
  if (remainder === "") return null; // identical to root, would be a no-op
  // Only `:` (pseudo) and `[` (attribute) start a fragment the parser
  // will append to `&` as part of the same compound selector. `-` and
  // `_` start identifiers and break nesting (see docblock above).
  if (/^[:[]/.test(remainder)) {
    return `&${remainder}`;
  }
  return null;
}

/**
 * Format declarations as indented CSS property lines.
 */
function formatDecls(
  decls: Record<string, string>,
  indent: string,
): string[] {
  return Object.entries(decls).map(
    ([prop, val]) => `${indent}${prop}: ${val};`,
  );
}

/**
 * Format a block's comments (already raw block-comment strings) as indented lines.
 */
function formatComments(comments: string[] | undefined, indent: string): string[] {
  if (!comments?.length) return [];
  return comments.map((c) => `${indent}${c}`);
}

/**
 * Group flat blocks by their base selector. Children are nested-eligible
 * blocks; orphans are blocks whose selector doesn't extend any other
 * block's selector and which therefore stand alone.
 *
 * Heuristic: the base selector is the longest selector that's a prefix
 * of the block's selector AND is itself a block in the input list.
 * In practice — given how `computeCssBlocks` emits — the base selector
 * is always the root `.cssPrefix` for component blocks.
 */
interface GroupedBlock {
  selector: string;
  decls: Record<string, string>;
  comments: string[];
  children: Array<{
    selector: string; // nested form, only ever `&:state` or `&[attr]`
    decls: Record<string, string>;
    comments: string[];
  }>;
}

function groupBlocksByRoot(
  blocks: CssBlockIR[],
  rootSelector: string,
): GroupedBlock[] {
  const root: GroupedBlock = {
    selector: rootSelector,
    decls: {},
    comments: [],
    children: [],
  };
  const orphans: GroupedBlock[] = [];

  for (const block of blocks) {
    if (block.selector === rootSelector) {
      Object.assign(root.decls, block.declarations);
      if (block.comments) root.comments.push(...block.comments);
      continue;
    }
    const nested = toNestedSelector(rootSelector, block.selector);
    if (nested) {
      root.children.push({
        selector: nested,
        decls: block.declarations,
        comments: block.comments ?? [],
      });
      continue;
    }
    // Compound or unrelated selector — stands alone.
    orphans.push({
      selector: block.selector,
      decls: block.declarations,
      comments: block.comments ?? [],
      children: [],
    });
  }

  return [root, ...orphans];
}

/**
 * Strip a block's declarations of slot decls (keeping only properties)
 * or vice versa, depending on the requested output.
 */
function filterGroupedBlock(
  group: GroupedBlock,
  keep: "slots" | "properties",
): GroupedBlock {
  const filter = (decls: Record<string, string>): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(decls)) {
      const isSlot = isSlotDeclaration(k);
      if ((keep === "slots") === isSlot) out[k] = v;
    }
    return out;
  };
  return {
    selector: group.selector,
    decls: filter(group.decls),
    // Comments only belong on the .css side — they're authoring hints
    // about unresolved property bindings, not slot intent.
    comments: keep === "properties" ? group.comments : [],
    children: group.children
      .map((c) => ({
        selector: c.selector,
        decls: filter(c.decls),
        comments: keep === "properties" ? c.comments : [],
      }))
      .filter((c) => Object.keys(c.decls).length > 0 || c.comments.length > 0),
  };
}

/**
 * Format a grouped block. Empty groups (no own decls/comments AND no
 * non-empty children) return an empty string so the caller can drop them.
 */
function formatGroupedBlock(group: GroupedBlock): string {
  const hasOwnContent =
    Object.keys(group.decls).length > 0 || group.comments.length > 0;
  if (!hasOwnContent && group.children.length === 0) return "";

  const lines: string[] = [`${group.selector} {`];
  lines.push(...formatDecls(group.decls, INDENT));
  lines.push(...formatComments(group.comments, INDENT));

  for (const child of group.children) {
    const childLines = [`${INDENT}${child.selector} {`];
    childLines.push(...formatDecls(child.decls, INDENT + INDENT));
    childLines.push(...formatComments(child.comments, INDENT + INDENT));
    childLines.push(`${INDENT}}`);
    // Blank line before each child for readability.
    lines.push("");
    lines.push(...childLines);
  }

  lines.push(`}`);
  return lines.join("\n");
}

function formatKeyframes(kf: KeyframeIR): string {
  const lines: string[] = [`@keyframes ${kf.name} {`];
  for (const frame of kf.frames) {
    const decls = Object.entries(frame.declarations)
      .map(([p, v]) => `    ${p}: ${v};`)
      .join("\n");
    lines.push(`  ${frame.selector} {\n${decls}\n  }`);
  }
  lines.push(`}\n`);
  return lines.join("\n");
}

/**
 * Format the IR-derived blocks + keyframes as the `<Component>.css`
 * artifact: nested BEM via `&-...`, property references only (slots
 * live in the sibling `.tokens.css`), `@import` at the top.
 *
 * Regions (see `preserve.ts`):
 *   `styles`     (gen) — root block + nested children
 *   `keyframes`  (gen, optional) — keyframes if any
 *   `overrides`  (cust, empty default) — designer escape hatch
 */
export function emitCss(ir: ComponentIR): string {
  const rootSelector = `.${ir.cssPrefix}`;
  const grouped = groupBlocksByRoot(ir.cssBlocks, rootSelector)
    .map((g) => filterGroupedBlock(g, "properties"))
    .map((g) => formatGroupedBlock(g))
    .filter((s) => s.length > 0);

  // The @import lives outside the `@generated:start styles` block so
  // designer-authored regions don't fight it. It's emitted as raw
  // pre-content via `renderSections`' "between" region.
  const importLine = `@import "./${ir.name}.tokens.css";`;
  const stylesBody = grouped.join("\n\n").trimEnd();
  const keyframesBody = ir.keyframes.map(formatKeyframes).join("\n").trimEnd();

  const sections: Section[] = [
    { kind: "between", body: importLine },
    { kind: "between", body: "" },
    { kind: "generated", id: "styles", body: stylesBody },
    { kind: "between", body: "" },
  ];
  if (keyframesBody) {
    sections.push(
      { kind: "generated", id: "keyframes", body: keyframesBody },
      { kind: "between", body: "" },
    );
  }
  sections.push(
    { kind: "custom", id: "overrides", body: "" },
    { kind: "between", body: "" },
  );

  return renderSections(sections, "block");
}

/**
 * Format the IR-derived blocks as the `<Component>.tokens.css` artifact:
 * one nested block per non-empty selector containing slot declarations
 * (`--fsds-<component>-…: var(--fsds-<global>, <fallback>);`). No
 * @import; no property references.
 *
 * Regions:
 *   `tokens`     (gen) — slot declarations
 *   `overrides`  (cust, empty default) — brand/density overrides at
 *                                       authoring time live here
 */
export function emitTokensCss(ir: ComponentIR): string {
  const rootSelector = `.${ir.cssPrefix}`;
  // Portal-aware: when the contract enables a portal for its surface,
  // the content node renders at document.body. Component-local slot
  // declarations scoped to `.<cssPrefix>` don't reach it, so the
  // var(--…) references in the generated content rule resolve to
  // nothing. Hoist component slots to `:root` in that case — they're
  // already cssPrefix-qualified (`--fsds-modal-color-…`), so cross-
  // component bleed isn't possible.
  //
  // Box-model slots (`--fsds-box-model-…`) are UNSCOPED on purpose and
  // would leak across portal components if hoisted: two simultaneously-
  // open portal components would race for `:root`-defined values. Keep
  // them on `.<cssPrefix>` so the per-component override discipline
  // survives even for portaled surfaces. The portaled content node is
  // a descendant of document.body, not of `.<cssPrefix>` — so to
  // restore reachability for box-model slots specifically, the trigger
  // / surface node should still set these on a wrapping element, OR
  // the surface contract should declare a portal escape via the
  // existing `[data-<prefix>-content]` selector if it needs custom
  // sizing.
  const portalEnabled = ir.behavior.portal?.enabled === true;
  const grouped = groupBlocksByRoot(ir.cssBlocks, rootSelector)
    .map((g) => filterGroupedBlock(g, "slots"))
    .flatMap((g) => {
      if (!portalEnabled || g.selector !== rootSelector) return [g];
      // Split the root block into box-model (stays on `.<cssPrefix>`)
      // and the rest (hoists to `:root`).
      const stay: Record<string, string> = {};
      const hoist: Record<string, string> = {};
      for (const [prop, val] of Object.entries(g.decls)) {
        if (prop.startsWith("--fsds-box-model-")) {
          stay[prop] = val;
        } else {
          hoist[prop] = val;
        }
      }
      const out = [];
      if (Object.keys(hoist).length > 0) {
        out.push({
          selector: ":root",
          decls: hoist,
          comments: g.comments,
          children: g.children,
        });
      }
      if (Object.keys(stay).length > 0) {
        out.push({
          selector: rootSelector,
          decls: stay,
          comments: [] as string[],
          children: [] as typeof g.children,
        });
      }
      return out;
    })
    .map((g) => formatGroupedBlock(g))
    .filter((s) => s.length > 0);

  const tokensBody = grouped.join("\n\n").trimEnd();

  const sections: Section[] = [
    { kind: "generated", id: "tokens", body: tokensBody },
    { kind: "between", body: "" },
    { kind: "custom", id: "overrides", body: "" },
    { kind: "between", body: "" },
  ];

  return renderSections(sections, "block");
}

/**
 * Convenience wrapper retained for backward compatibility with callers that
 * still pass raw contracts. New code should call `emitCss(ir)` directly.
 */
export function generateCSS(contract: ComponentContract): string {
  return emitCss(buildComponentIR(contract));
}

/**
 * Produce the component's CSS text suitable for embedding inside a Lit
 * `css\`…\`` tagged template literal. Returns the slot declarations
 * (.tokens.css side) and property references (.css side) merged into
 * one body, without `@import`, `@generated`/`@custom` markers, or the
 * trailing custom-overrides empty block.
 *
 * Lit's shadow DOM means sibling `<Component>.css` / `<Component>.tokens.css`
 * files cannot be loaded into the shadow root via `@import` — those files
 * exist for documentation and audit parity with the other framework
 * targets, while this string is what actually styles the rendered
 * shadow tree at runtime.
 */
export function emitLitInlineCss(ir: ComponentIR): string {
  const rootSelector = `.${ir.cssPrefix}`;

  const tokensGroups = groupBlocksByRoot(ir.cssBlocks, rootSelector)
    .map((g) => filterGroupedBlock(g, "slots"))
    .map((g) => formatGroupedBlock(g))
    .filter((s) => s.length > 0);

  const propertyGroups = groupBlocksByRoot(ir.cssBlocks, rootSelector)
    .map((g) => filterGroupedBlock(g, "properties"))
    .map((g) => formatGroupedBlock(g))
    .filter((s) => s.length > 0);

  const keyframesBody = ir.keyframes.map(formatKeyframes).join("\n").trimEnd();

  const parts: string[] = [];
  if (tokensGroups.length > 0) parts.push(tokensGroups.join("\n\n"));
  if (propertyGroups.length > 0) parts.push(propertyGroups.join("\n\n"));
  if (keyframesBody) parts.push(keyframesBody);

  return parts.join("\n\n").trimEnd();
}

/**
 * Escape a CSS body for safe inclusion inside a Lit `css\`…\`` tagged
 * template literal. Backticks and `${` would terminate the literal /
 * inject an interpolation; nothing in our generated CSS legitimately
 * needs either, so we escape defensively rather than asserting absence.
 */
export function escapeCssForLitTemplate(css: string): string {
  return css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
