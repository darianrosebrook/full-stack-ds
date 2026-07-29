/**
 * Discriminator test for the dead-slot disposition classifier
 * (RAIL-STYLING-REALIZATION-LEDGERS-01, A4) — one fixture per disposition,
 * plus the controls that keep each rule from over-reaching.
 *
 * These pin BEHAVIOUR, not implementation: each case states the corpus shape
 * it represents, because the dispositions drive what a later slice does to the
 * contract (edit vs. delete). A misclassification here becomes a wrong edit or
 * a wrong deletion, so the boundaries matter more than the happy paths.
 *
 * Standalone Node, matching the sibling classification.test.mjs.
 */
import assert from "node:assert/strict";

import { classifyDisposition, renderedPartsOf } from "./disposition.mjs";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

const ctx = (over = {}) => ({
  tokens: {},
  styles: {},
  contract: {},
  prefix: "demo",
  renderedParts: new Set(),
  ...over,
});

console.log("dead-slot disposition classifier");

// --- shadowed --------------------------------------------------------------
check("a box-model slot overridden by an author root rule is `shadowed`", () => {
  // renderBoxModelConsumers() emits `gap: var(--fsds-box-model-gap)` on every
  // root; an author `gap` in styles.root merges on top and wins.
  const r = classifyDisposition("box-model.gap", ctx({ styles: { root: { gap: {} } } }));
  assert.equal(r.disposition, "shadowed");
});

check("a box-model slot with NO author override is not `shadowed`", () => {
  // Control: without the override the primitive consumer is live, so calling
  // it shadowed would be the goalpost-moving failure mode this rule risks.
  const r = classifyDisposition("box-model.gap", ctx({ styles: { root: { color: {} } } }));
  assert.notEqual(r.disposition, "shadowed");
});

// --- repoint ---------------------------------------------------------------
const repointStyles = {
  "--sm": {
    "blockquote.size.padding.default": { resolvesTo: "core.spacing.size.04", fallback: "8px" },
  },
};
const repointTokens = {
  "blockquote.size.padding.sm": { resolvesTo: "core.spacing.size.04", fallback: "8px" },
};

check("a sibling redefined with identical {resolvesTo, fallback} is `repoint`", () => {
  const r = classifyDisposition(
    "blockquote.size.padding.sm",
    ctx({ tokens: repointTokens, styles: repointStyles }),
  );
  assert.equal(r.disposition, "repoint");
  assert.match(r.evidence, /value-identical/);
});

check("a sibling redefined with DIFFERENT values is `repoint-divergent`, never `repoint`", () => {
  // This split is load-bearing: batching a divergent re-point as a "no-op"
  // would silently restyle the component.
  const r = classifyDisposition(
    "blockquote.size.padding.sm",
    ctx({
      tokens: repointTokens,
      styles: {
        "--sm": {
          "blockquote.size.padding.default": {
            resolvesTo: "core.spacing.size.09",
            fallback: "32px",
          },
        },
      },
    }),
  );
  assert.equal(r.disposition, "repoint-divergent");
});

check("a redefinition in a block that does NOT name this slot's value is not a repoint", () => {
  // Control: only the block matching the slot's own axis value can orphan it.
  const r = classifyDisposition(
    "blockquote.size.padding.sm",
    ctx({
      tokens: repointTokens,
      styles: {
        "--lg": {
          "blockquote.size.padding.default": { resolvesTo: "core.spacing.size.04", fallback: "8px" },
        },
      },
    }),
  );
  assert.notEqual(r.disposition, "repoint");
});

check("a non-sibling slot with identical values does not count as a repoint", () => {
  // Control: the redefinition must be in the same slot family, otherwise any
  // coincidental value match across the contract would read as a re-point.
  const r = classifyDisposition(
    "blockquote.size.padding.sm",
    ctx({
      tokens: repointTokens,
      styles: {
        "--sm": {
          "blockquote.color.border.default": {
            resolvesTo: "core.spacing.size.04",
            fallback: "8px",
          },
        },
      },
    }),
  );
  assert.notEqual(r.disposition, "repoint");
});

// --- wire ------------------------------------------------------------------
check("a leaf naming a declared variant value with no block is `wire`", () => {
  const r = classifyDisposition(
    "alert.size.padding.inline",
    ctx({ contract: { variants: { layout: ["inline", "page"] } } }),
  );
  assert.equal(r.disposition, "wire");
});

check("a slot redefined per axis value but read by nothing is `unconsumed-vocabulary`", () => {
  // Button's reference case: every size block redefines button.size.padding-*,
  // while Button.css reads --fsds-box-model-*. Calling this `wire` would tell a
  // later slice to author styling, when the repair is to drop the duplicate
  // vocabulary or re-point the consumer.
  const r = classifyDisposition("button.size.padding-block.medium", {
    ...ctx({ contract: { variants: { size: ["small", "medium", "large"] } } }),
    styles: {
      "--medium": { "button.size.padding-block.medium": { resolvesTo: "x", fallback: "8px" } },
    },
  });
  assert.equal(r.disposition, "unconsumed-vocabulary");
});

check("`wire` is only used when NO block redefines the slot", () => {
  // Guards the exact defect this split fixes: the previous rule asserted "no
  // styling block" in its evidence without ever checking for one.
  const r = classifyDisposition("button.size.padding-block.medium", {
    ...ctx({ contract: { variants: { size: ["small", "medium", "large"] } } }),
    styles: { "--medium": { "some.other.slot": { resolvesTo: "x", fallback: "1px" } } },
  });
  assert.equal(r.disposition, "wire");
  assert.match(r.evidence, /no styling block redefines this slot/);
});

check("a leaf naming a declared STATE value is also `wire`", () => {
  const r = classifyDisposition(
    "chip.color.background.selected",
    ctx({ contract: { states: { dimensions: { selection: { values: ["unselected", "selected"] } } } } }),
  );
  assert.equal(r.disposition, "wire");
});

// --- delete ----------------------------------------------------------------
check("a slot on an anatomy part that never renders is `delete`", () => {
  const r = classifyDisposition(
    "card.color.badge.success.background",
    ctx({
      prefix: "card",
      contract: { anatomy: { parts: ["root", "badge"] } },
      renderedParts: new Set(["root"]),
    }),
  );
  assert.equal(r.disposition, "delete");
  assert.match(r.evidence, /never renders/);
});

check("a slot on a part that DOES render is not `delete`", () => {
  // Control: deletion requires positive evidence the part is absent.
  const r = classifyDisposition(
    "card.color.badge.success.background",
    ctx({
      prefix: "card",
      contract: { anatomy: { parts: ["root", "badge"] } },
      renderedParts: new Set(["root", "badge"]),
    }),
  );
  assert.notEqual(r.disposition, "delete");
});

// --- review (the residual) -------------------------------------------------
check("an unmatched slot is `review`, NOT `delete`", () => {
  // The most important boundary in this file: a fall-through is the absence of
  // a classification. Folding it into `delete` would destroy real intent while
  // reporting a clean mechanical burn-down.
  const r = classifyDisposition("accordion.border.width", ctx({ prefix: "accordion" }));
  assert.equal(r.disposition, "review");
});

// --- renderedPartsOf -------------------------------------------------------
check("renderedPartsOf reads BEM parts out of the render source", () => {
  const parts = renderedPartsOf('<div className="card__header"><span class="card__media" />', "card");
  assert.ok(parts.has("header"));
  assert.ok(parts.has("media"));
  assert.ok(!parts.has("badge"));
});

check("renderedPartsOf returns empty for absent source rather than throwing", () => {
  assert.equal(renderedPartsOf("", "card").size, 0);
  assert.equal(renderedPartsOf(undefined, "card").size, 0);
});

if (failures > 0) {
  console.error(`\ndisposition classifier FAILED (${failures})`);
  process.exit(1);
}
console.log("disposition classifier PASS");
