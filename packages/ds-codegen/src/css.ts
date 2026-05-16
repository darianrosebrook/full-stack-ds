/**
 * CSS string formatting from IR.
 *
 * All selector expansion and block computation now lives in `ir.ts`
 * (via `computeCssBlocks`); this module is a target-neutral text
 * formatter that any framework emitter can call to produce a `.css`
 * file alongside its rendered component.
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

/** Format a single CSS block (selector + declarations + comments) as text. */
function formatBlock(block: CssBlockIR): string {
  const declLines = Object.entries(block.declarations).map(
    ([prop, val]) => `  ${prop}: ${val};`,
  );
  const commentLines = (block.comments ?? []).map((c) => `  ${c}`);
  const innerLines = [...declLines, ...commentLines];
  if (innerLines.length === 0) return `${block.selector} {}\n`;
  return `${block.selector} {\n${innerLines.join("\n")}\n}\n`;
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
 * Format the IR-derived blocks + keyframes as a single CSS string,
 * partitioned into named regions so designer tweaks can be preserved
 * across regenerations.
 *
 * Regions:
 *   `styles`     (gen) — root, variant, state, and part blocks
 *   `keyframes`  (gen — only emitted when the IR has keyframes)
 *   `overrides`  (cust, empty default)
 */
export function emitCss(ir: ComponentIR): string {
  const stylesBody = ir.cssBlocks.map(formatBlock).join("\n").trimEnd();
  const keyframesBody = ir.keyframes.map(formatKeyframes).join("\n").trimEnd();

  const sections: Section[] = [
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
 * Convenience wrapper retained for backward compatibility with callers that
 * still pass raw contracts. New code should call `emitCss(ir)` directly.
 */
export function generateCSS(contract: ComponentContract): string {
  return emitCss(buildComponentIR(contract));
}
