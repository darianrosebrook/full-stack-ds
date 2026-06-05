/**
 * Rendered-geometry probe for COMPONENT-AUDIT-TOOL-01 (A2).
 *
 * Static comparison only proves the generated CSS *references* the right token.
 * It cannot prove the token chain RESOLVES to the expected value, nor that the
 * box actually renders that way (a cascade override or broken chain passes
 * static but renders wrong). This probe loads each component's isolated preview
 * (/preview/react/<Name>, default props) in real chromium and reads the root's
 * computed style + bounding box — the ground-truth "reality".
 *
 * Requires the Vite dev server at AUDIT_BASE_URL (default http://localhost:5173).
 * READ-ONLY: navigates + reads; mutates nothing.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.AUDIT_BASE_URL || "http://localhost:5173";

/** "12px"->12, "0"->0, "1rem"->16, "auto"/"none"->NaN. */
function toPx(v) {
  if (v == null) return NaN;
  const s = String(v).trim();
  if (s === "0") return 0;
  const m = s.match(/^(-?[\d.]+)(px|rem|em)?$/);
  if (!m) return NaN;
  const n = parseFloat(m[1]);
  if (m[2] === "rem" || m[2] === "em") return n * 16;
  return n;
}

export async function probeBatch(statics) {
  const results = new Map();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  for (const s of statics) {
    try {
      results.set(s.component, await probeOne(page, s));
    } catch (e) {
      results.set(s.component, { expected: fmtExpected(s), actual: "", verdict: `(probe error: ${e.message})` });
    }
  }
  await browser.close();
  return results;
}

// The /preview route mounts each component with its SHOWCASE DEMO props (e.g.
// Button -> small/primary), not base props, so the rendered size-variant is
// demo-chosen. We therefore compare only config-INDEPENDENT expectations:
//   - the contract-declared root `display` (size variants must not change it)
//   - min-height honored (rendered height vs the SAME render's computed min-height)
// Box-model padding/sizing for the specific demo config is recorded as a
// reality snapshot (for drift) rather than diffed against base fallbacks.
function fmtExpected(s) {
  return `display=${s.expect.display} (contract); min-height honored; box-model per demo config`;
}

async function probeOne(page, s) {
  const url = `${BASE}/preview/react/${s.component}`;
  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
  const expected = fmtExpected(s);
  if (!resp || !resp.ok()) {
    return { expected, actual: "", verdict: `(preview HTTP ${resp ? resp.status() : "no-response"})` };
  }
  // Give the framework a beat to mount, then look for the BEM root.
  const sel = `.${s.prefix}`;
  const el = await page.waitForSelector(sel, { state: "attached", timeout: 6000 }).catch(() => null);
  if (!el) {
    return {
      expected,
      actual: "(root not rendered)",
      verdict: `(no .${s.prefix} in default render — portal/trigger or empty-state; needs manual)`,
    };
  }
  const m = await el.evaluate((node) => {
    const cs = getComputedStyle(node);
    const r = node.getBoundingClientRect();
    const round = (n) => Math.round(n * 100) / 100;
    return {
      className: typeof node.className === "string" ? node.className : String(node.getAttribute("class") || ""),
      display: cs.display,
      height: round(r.height),
      width: round(r.width),
      visible: r.width > 0 && r.height > 0,
      paddingInlineStart: cs.paddingInlineStart,
      paddingBlockStart: cs.paddingBlockStart,
      gap: cs.columnGap && cs.columnGap !== "normal" ? cs.columnGap : cs.gap,
      minHeight: cs.minHeight,
    };
  });

  const actual = `class="${m.className}"; disp=${m.display}; pad-i=${m.paddingInlineStart}; pad-b=${m.paddingBlockStart}; min-h=${m.minHeight}; h=${m.height}px; w=${m.width}px; gap=${m.gap}`;

  // --- verdict: config-INDEPENDENT correctness checks only ---
  if (!m.visible) {
    return { expected, actual, verdict: "(root present but zero-size — collapsed/empty default; manual)" };
  }
  const issues = [];
  // (1) declared root display vs rendered. The preview shell mounts the
  //     component as a direct child of `body { display: flex }`, so the root is
  //     a flex ITEM and CSS blockifies its display (inline-flex->flex,
  //     inline-block->block, inline->block, inline-grid->grid). Accept the
  //     blockified equivalent; a genuine mismatch (e.g. grid vs block) still flags.
  const blockify = (d) =>
    ({ "inline-flex": "flex", "inline-block": "block", inline: "block", "inline-grid": "grid" }[d] ?? d);
  if (
    s.expect.display !== "(default)" &&
    m.display !== s.expect.display &&
    m.display !== blockify(s.expect.display)
  ) {
    issues.push(`display rendered=${m.display} vs contract ${s.expect.display}`);
  }
  // (2) min-height honored — compare rendered height to the SAME render's
  //     computed min-height (config-independent: both reflect the demo config)
  const minh = toPx(m.minHeight);
  if (Number.isFinite(minh) && minh > 0 && m.height + 0.5 < minh) {
    issues.push(`height ${m.height}px < computed min-height ${m.minHeight} (not honored)`);
  }
  const verdict = issues.length ? `FLAG: ${issues.join("; ")}` : `ok (${m.display}, ${m.width}×${m.height}px)`;
  return { expected, actual, verdict };
}
