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

// A2 (FIX-DEAD-SLOT-BOXMODEL-SHADOW-01). Reclassifying 17 slots out of the dead
// count narrows what "dead" means, so the reclassification must be falsifiable
// in the direction that would expose goalpost-moving. Verified end-to-end for
// this slice by deleting Accordion's styles.root `gap`, regenerating, and
// observing box-model.gap return to `consumed` (NOT `shadowed`) — the shadow
// verdict tracks the author override, not the audit's convenience.
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

// --- topology-conflict -----------------------------------------------------
// FIX-DEAD-SLOT-UNRENDERED-PART-AUTHORITY-01. This shape used to return
// `delete`. It cannot: the generated component is the artifact under
// evaluation, so its silence is not testimony that the contract is stale.
// Deleting on it lets a deficient realization become self-consistent by
// erasing the requirement it violates.
check("a declared anatomy part absent from the realization is `topology-conflict`", () => {
  const r = classifyDisposition(
    "card.color.badge.success.background",
    ctx({
      prefix: "card",
      contract: { anatomy: { parts: ["root", "badge"] } },
      renderedParts: new Set(["root"]),
    }),
  );
  assert.equal(r.disposition, "topology-conflict");
});

check("generated absence NEVER yields `delete`, however the slot is shaped", () => {
  // The invariant itself, stated as an assertion rather than implied by the
  // positive case above: no combination of declared-part + absent-realization
  // may reach the deletion disposition.
  for (const slot of [
    "card.color.badge.success.background",
    "checkbox.color.indicator.default",
    "button.size.spinner.diameter",
  ]) {
    const part = slot.split(".")[2];
    const r = classifyDisposition(
      slot,
      ctx({
        prefix: slot.split(".")[0],
        contract: { anatomy: { parts: ["root", part] } },
        renderedParts: new Set(["root"]),
      }),
    );
    assert.notEqual(r.disposition, "delete", `${slot} reached delete on generated absence alone`);
  }
});

check("the conflict evidence names the contradiction, not just the absence", () => {
  // The evidence string becomes the ledger note, so it has to carry the causal
  // fact a later reader needs: BOTH sides, and that neither one wins by
  // default. `review` would lose exactly this.
  const r = classifyDisposition(
    "card.color.badge.success.background",
    ctx({
      prefix: "card",
      contract: { anatomy: { parts: ["root", "badge"] } },
      renderedParts: new Set(["root"]),
    }),
  );
  assert.match(r.evidence, /contract declares anatomy part "badge"/);
  assert.match(r.evidence, /measured realization lacks it/);
  assert.match(r.evidence, /do NOT infer the contract is stale/);
});

// A3: the Checkbox shape that settles the direction of the inference. Its
// contract declares `indicator` and describes the visual checked mark; the
// realization is a bare `<input>`. Under the old rule this classified as
// `delete` — i.e. the audit would have proposed removing the declaration that
// proves the realization incomplete.
check("Checkbox-shaped fixture: declared `indicator`, bare-input realization", () => {
  const checkboxSource = '<input type="checkbox" className="checkbox checkbox--md" />';
  const r = classifyDisposition(
    "checkbox.color.indicator.background.checked",
    ctx({
      prefix: "checkbox",
      contract: { anatomy: { parts: ["root", "input", "indicator"] } },
      renderedParts: renderedPartsOf(checkboxSource, "checkbox"),
    }),
  );
  assert.equal(r.disposition, "topology-conflict");
  assert.notEqual(r.disposition, "delete");
});

// A7: the falsifier. The classifier must be responding to the observed
// contradiction, not to component identity or slot spelling — so making the
// part present must make the conflict stop reproducing.
check("A7 falsifier: rendering the part makes the conflict stop reproducing", () => {
  const contract = { anatomy: { parts: ["root", "input", "indicator"] } };
  const slot = "checkbox.color.indicator.background.checked";

  const absent = classifyDisposition(
    slot,
    ctx({
      prefix: "checkbox",
      contract,
      renderedParts: renderedPartsOf('<input className="checkbox" />', "checkbox"),
    }),
  );
  const present = classifyDisposition(
    slot,
    ctx({
      prefix: "checkbox",
      contract,
      renderedParts: renderedPartsOf(
        '<span className="checkbox"><span className="checkbox__indicator" /></span>',
        "checkbox",
      ),
    }),
  );
  assert.equal(absent.disposition, "topology-conflict");
  assert.notEqual(present.disposition, "topology-conflict");
});

check("a slot on a part that DOES render is not a topology conflict", () => {
  // Control: the conflict requires positive evidence the part is absent.
  const r = classifyDisposition(
    "card.color.badge.success.background",
    ctx({
      prefix: "card",
      contract: { anatomy: { parts: ["root", "badge"] } },
      renderedParts: new Set(["root", "badge"]),
    }),
  );
  assert.notEqual(r.disposition, "topology-conflict");
});

// --- review (the residual) -------------------------------------------------
check("an unmatched slot is `review`, NOT `delete`", () => {
  // The most important boundary in this file: a fall-through is the absence of
  // a classification. Folding it into `delete` would destroy real intent while
  // reporting a clean mechanical burn-down.
  const r = classifyDisposition("accordion.border.width", ctx({ prefix: "accordion" }));
  assert.equal(r.disposition, "review");
});

// --- delete 5b: preset on a freeform-prop axis -----------------------------
// FEAT-COMPONENT-SLOT-BINDING-COMPLETENESS-01 A3's higher deletion bar: a
// leaf that concatenates a FREEFORM prop's name with a value suffix names an
// axis the component's design surface does not have — positive evidence, so
// it deletes. Every near-miss below must NOT delete.
//
// A4 (FIX-DEAD-SLOT-UNRENDERED-PART-AUTHORITY-01): this rule is why that slice
// narrows the deletion ground rather than removing the disposition. Its
// evidence is entirely contract-sourced — a declared prop, its declared
// propType, and the leaf's decomposition onto that prop name — and the
// classifier reaches it without consulting `renderedParts` at all. A contract
// that contradicts itself can still be cleaned up mechanically; a contract the
// realization merely fails to satisfy cannot.
check("A4: the deletion disposition survives on contract-sourced evidence", () => {
  const r = classifyDisposition(
    "divider.size.thicknessThick",
    ctx({
      prefix: "divider",
      // No renderedParts at all: if `delete` still fires, the rule provably
      // does not depend on what the generator emitted.
      renderedParts: new Set(),
      contract: {
        anatomy: { parts: ["root"] },
        props: { designed: { members: [{ name: "thickness", propType: { kind: "string" } }] } },
      },
    }),
  );
  assert.equal(r.disposition, "delete");
  assert.doesNotMatch(r.evidence, /render|emitted source/);
});

check("5b: a preset of a freeform string prop is `delete`, with evidence naming the prop", () => {
  const r = classifyDisposition(
    "divider.size.thicknessThick",
    ctx({
      prefix: "divider",
      contract: {
        anatomy: { parts: ["root"] },
        props: {
          designed: {
            members: [{ name: "thickness", propType: { kind: "string" } }],
          },
        },
      },
    }),
  );
  assert.equal(r.disposition, "delete");
  assert.match(r.evidence, /preset of designed prop "thickness"/);
  assert.match(r.evidence, /propType string, freeform/);
});

check("5b boundary: an ENUM prop has a value vocabulary, so its presets are NOT 5b deletes", () => {
  const r = classifyDisposition(
    "x.size.thicknessThick",
    ctx({
      prefix: "x",
      contract: {
        anatomy: { parts: ["root"] },
        props: {
          designed: {
            members: [
              { name: "thickness", propType: { kind: "ref", ref: "Thickness" } },
            ],
          },
        },
      },
    }),
  );
  assert.notEqual(r.disposition, "delete");
});

check("5b boundary: a leaf that IS the prop name (no preset suffix) is NOT a 5b delete", () => {
  const r = classifyDisposition(
    "x.size.thickness",
    ctx({
      prefix: "x",
      contract: {
        anatomy: { parts: ["root"] },
        props: {
          designed: {
            members: [{ name: "thickness", propType: { kind: "string" } }],
          },
        },
      },
    }),
  );
  assert.notEqual(r.disposition, "delete");
});

// A8 (FIX-DEAD-SLOT-UNRENDERED-PART-AUTHORITY-01): 5b's authority audit. The
// worry is that 5b is the same bug one level down — reading "the prop is typed
// freeform" as retirement authority when the contract's own `variants` block
// says the vocabulary exists. It is not, and this pins why: rule 4 evaluates
// `declaredAxisValues` (variants ∪ state dimensions) BEFORE 5b, so a leaf the
// contract declares as an axis value can never reach the deletion rule, even
// when a freeform prop of the same name would otherwise decompose it. When the
// two disagree, the declared vocabulary wins and the slot is `wire`.
check("A8: a declared axis value outranks a freeform prop of the same name", () => {
  const r = classifyDisposition(
    "postcard.size.typeImage",
    ctx({
      prefix: "postcard",
      contract: {
        anatomy: { parts: ["root"] },
        variants: { type: ["typeImage", "typeVideo"] },
        props: { designed: { members: [{ name: "type", propType: { kind: "string" } }] } },
      },
    }),
  );
  assert.notEqual(r.disposition, "delete");
  assert.equal(r.disposition, "wire");
});

check("5b boundary: a leaf starting with a freeform prop name by coincidence is only reviewed", () => {
  // "titleTagged" starts with "title" — but only full-prefix decomposition on
  // a REAL prop counts; this fixture's prop list doesn't contain "title", so
  // no rule matches and the residual must stay `review`.
  const r = classifyDisposition(
    "x.size.titleTagged",
    ctx({
      prefix: "x",
      contract: {
        anatomy: { parts: ["root"] },
        props: { designed: { members: [] } },
      },
    }),
  );
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
