/**
 * Dead-slot disposition classifier (RAIL-STYLING-REALIZATION-LEDGERS-01, A4).
 *
 * A dead slot is a symptom; the disposition is the diagnosis. Assigning one
 * mechanically is what turns 134 findings into a handful of reviewable rules —
 * the reviewer audits the RULE, not 134 rows. It is also the honest test of
 * this repo's thesis: if closing the corpus required 134 bespoke judgments, the
 * contract would not be at the right level of abstraction.
 *
 * Dispositions, evaluated in order (first match wins):
 *
 *   shadowed          A `box-model.*` primitive slot whose consumer property is
 *                     overridden by an author rule in `styles.root`.
 *                     `renderBoxModelConsumers()` (ir.ts) emits
 *                     `gap: var(--fsds-box-model-gap)` on EVERY root
 *                     unconditionally; an author `gap` in styles.root merges on
 *                     top and wins. The slot is wired — just outranked. Not a
 *                     defect, and not "dead" in any sense the reader expects.
 *
 *   repoint           A variant/state block redefines a SIBLING slot with a
 *                     `{resolvesTo, fallback}` pair byte-identical to the dead
 *                     slot's own declaration — reaching past the leaf, which is
 *                     thereby orphaned. Blockquote's `--sm` block redefines
 *                     `blockquote.size.padding.default` to exactly what
 *                     `blockquote.size.padding.sm` already declares. The repair
 *                     is one `resolvesTo` edit and is a computed no-op.
 *
 *   repoint-divergent Same shape, but the values DIFFER. Re-pointing here would
 *                     change rendered output, so it is never batched with the
 *                     no-op class. Split out precisely so a visual change can
 *                     never ride along inside a "mechanical" batch.
 *
 *   unconsumed-       The leaf names a real axis value AND a block named for
 *   vocabulary        that value redefines the slot — and still nothing reads
 *                     it. A parallel vocabulary: the consumer reads a different
 *                     slot family. Button declares `button.size.padding-*` and
 *                     `minHeight` in all three size blocks while Button.css
 *                     reads `--fsds-box-model-*`; the whole `button.size.*`
 *                     geometry vocabulary is dead. Repair is to drop the
 *                     duplicate or re-point the consumer — NOT to author new
 *                     styling.
 *
 *   wire              The leaf names a real axis value and NO block redefines
 *                     the slot — genuinely missing consumption, to be authored.
 *
 *   delete            POSITIVE evidence of an overclaim: the slot hangs off an
 *                     anatomy part that the generated component never renders,
 *                     so nothing can consume it as declared. Removed rather
 *                     than "fixed" (the FEAT-A11Y-RELATIONSHIP-STRAGGLERS-01 A4
 *                     precedent). Card's `card.color.badge.*` is the canonical
 *                     case — `badge` is a declared part that renders nowhere.
 *
 *   review            The residual: no rule matched. This is deliberately NOT
 *                     folded into `delete`. A fall-through is the absence of a
 *                     classification, not evidence of an overclaim, and
 *                     auto-deleting on "no rule matched" would delete real
 *                     intent while reporting a clean mechanical burn-down.
 *                     These need human adjudication, and the size of this
 *                     bucket is the honest measure of how much of the corpus
 *                     the rules actually explain.
 *
 * Every disposition carries `evidence` — the concrete reason, naming the block
 * or value that decided it. That string becomes the ledger `note`, so a later
 * reader can re-derive the call instead of re-litigating it.
 */

/** Slot path → its parent path and leaf segment. */
function splitSlot(slot) {
  const segments = slot.split(".");
  return { parent: segments.slice(0, -1).join("."), leaf: segments[segments.length - 1] };
}

/** A styles block key normalized to the axis value it represents (`--sm` → `sm`). */
function blockValue(key) {
  return key.startsWith("--") ? key.slice(2) : key;
}

/** Does this entry look like a slot resolution (as opposed to a CSS property)? */
function isResolution(entry) {
  return Boolean(entry) && typeof entry === "object" && typeof entry.resolvesTo === "string";
}

function sameResolution(a, b) {
  return (
    isResolution(a) && isResolution(b) && a.resolvesTo === b.resolvesTo && a.fallback === b.fallback
  );
}

/** Collect every value across the contract's variant axes and state dimensions. */
function declaredAxisValues(contract) {
  const values = new Set();
  const variants = contract?.variants;
  if (variants && typeof variants === "object") {
    for (const axis of Object.values(variants)) {
      const list = Array.isArray(axis) ? axis : axis?.values;
      if (Array.isArray(list)) for (const v of list) values.add(String(v));
    }
  }
  const dimensions = contract?.states?.dimensions;
  if (dimensions && typeof dimensions === "object") {
    for (const dim of Object.values(dimensions)) {
      if (Array.isArray(dim?.values)) for (const v of dim.values) values.add(String(v));
    }
  }
  return values;
}

/**
 * The box-model primitive slots that `renderBoxModelConsumers()` emits on every
 * root, mapped to the CSS property each one feeds. Kept as an explicit list
 * rather than derived from the slot name so a rename in ir.ts surfaces here as
 * a classifier miss rather than silently re-labelling slots as shadowed.
 */
const BOX_MODEL_CONSUMERS = {
  "box-model.padding-block-start": "padding-block-start",
  "box-model.padding-block-end": "padding-block-end",
  "box-model.padding-inline-start": "padding-inline-start",
  "box-model.padding-inline-end": "padding-inline-end",
  "box-model.gap": "gap",
  "box-model.width": "width",
  "box-model.min-width": "min-width",
  "box-model.max-width": "max-width",
  "box-model.height": "height",
  "box-model.min-height": "min-height",
  "box-model.max-height": "max-height",
};

/**
 * Which anatomy parts does the generated component actually render?
 *
 * Deliberately reads the RENDER source (`<C>.tsx`), not the CSS. A part can
 * have a styling block — and therefore a `.prefix__part` rule in the CSS —
 * while no element ever carries that class. Card is exactly this: `badge` is a
 * declared part with a styles block whose markup is nowhere in `Card.tsx`.
 * Keying off the CSS would score it as rendered and hide the overclaim.
 */
export function renderedPartsOf(componentSource, prefix) {
  const found = new Set();
  if (typeof componentSource !== "string" || componentSource.length === 0) return found;
  const re = new RegExp(`${prefix.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}__([A-Za-z0-9-]+)`, "g");
  for (const match of componentSource.matchAll(re)) found.add(match[1]);
  return found;
}

/**
 * Classify one dead slot.
 *
 * @param {string} slot   the dead slot path
 * @param {object} ctx
 * @param {object} ctx.tokens         parsed `<C>.tokens.json`
 * @param {object} ctx.styles         parsed `<C>.styles.json`
 * @param {object} ctx.contract       parsed `<C>.contract.json`
 * @param {string} ctx.prefix         the component's cssPrefix
 * @param {Set<string>} ctx.renderedParts  parts present in the render source
 * @returns {{disposition: string, evidence: string}}
 */
export function classifyDisposition(slot, { tokens, styles, contract, prefix, renderedParts }) {
  const stylesObj = styles && typeof styles === "object" ? styles : {};
  const tokensObj = tokens && typeof tokens === "object" ? tokens : {};

  // 1. shadowed — a primitive box-model slot outranked by an author root rule.
  const consumerProperty = BOX_MODEL_CONSUMERS[slot];
  if (consumerProperty) {
    const root = stylesObj.root;
    if (root && typeof root === "object" && consumerProperty in root) {
      return {
        disposition: "shadowed",
        evidence: `styles.root overrides "${consumerProperty}", outranking the primitive consumer emitted by renderBoxModelConsumers()`,
      };
    }
    return {
      disposition: "wire",
      evidence: `box-model primitive consumer for "${consumerProperty}" is emitted but the slot resolves to nothing the structure CSS reads`,
    };
  }

  const { parent, leaf } = splitSlot(slot);
  const declaration = tokensObj[slot];

  // 2/3. re-point — a variant/state block redefines a sibling slot instead.
  for (const [blockKey, block] of Object.entries(stylesObj)) {
    if (!block || typeof block !== "object") continue;
    if (blockValue(blockKey) !== leaf) continue; // block must name this slot's axis value
    for (const [siblingSlot, siblingEntry] of Object.entries(block)) {
      if (siblingSlot === slot || !siblingSlot.includes(".")) continue;
      if (splitSlot(siblingSlot).parent !== parent) continue; // must be a sibling
      if (!isResolution(siblingEntry)) continue;
      if (sameResolution(siblingEntry, declaration)) {
        return {
          disposition: "repoint",
          evidence: `styles["${blockKey}"] redefines sibling "${siblingSlot}" with the identical {resolvesTo, fallback}, orphaning this slot; repair is a value-identical resolvesTo edit`,
        };
      }
      return {
        disposition: "repoint-divergent",
        evidence: `styles["${blockKey}"] redefines sibling "${siblingSlot}" but with DIFFERENT values (${siblingEntry.resolvesTo} / ${siblingEntry.fallback}) than this slot (${declaration?.resolvesTo} / ${declaration?.fallback}); re-pointing would change rendered output`,
      };
    }
  }

  // 4. The leaf names a real axis value. Two very different situations hide
  //    here, and the earlier version of this rule conflated them — it asserted
  //    "with no styling block" in its evidence while never checking for one.
  if (declaredAxisValues(contract).has(leaf)) {
    // 4a. unconsumed-vocabulary — a block named for this axis value DOES
    //     redefine the slot, per value, and still nothing reads it. That is a
    //     parallel slot vocabulary: the consumer reads a different family.
    //     Button is the reference case — every size block redefines
    //     `button.size.padding-*`/`minHeight`, while Button.css reads
    //     `--fsds-box-model-*`, so the whole `button.size.*` geometry
    //     vocabulary is declared, faithfully emitted, and dead. The repair is
    //     to drop the duplicate vocabulary or point the consumer at it — NOT
    //     to author new styling, which is what "wire" would have implied.
    const redefiningBlock = Object.entries(stylesObj).find(
      ([blockKey, block]) =>
        blockValue(blockKey) === leaf && block && typeof block === "object" && slot in block,
    );
    if (redefiningBlock) {
      return {
        disposition: "unconsumed-vocabulary",
        evidence: `styles["${redefiningBlock[0]}"] redefines this slot per axis value, but no rule reads it — a parallel vocabulary whose consumer reads a different slot family`,
      };
    }
    // 4b. wire — genuinely no block redefines it; consumption is missing.
    return {
      disposition: "wire",
      evidence: `"${leaf}" is a declared variant/state value and no styling block redefines this slot; consumption is genuinely missing`,
    };
  }

  // 5. delete — POSITIVE evidence only: the slot names an anatomy part that the
  //    generated component never renders, so no rule can ever reach it.
  const parts = Array.isArray(contract?.anatomy?.parts) ? contract.anatomy.parts : [];
  const segments = slot.split(".");
  for (const part of parts) {
    if (part === "root" || !segments.includes(part)) continue;
    if (!renderedParts.has(part)) {
      return {
        disposition: "delete",
        evidence: `slot hangs off anatomy part "${part}", which the generated component never renders (no .${prefix}__${part} in the emitted source); nothing can consume it`,
      };
    }
  }

  // 6. review — no rule matched. NOT an overclaim finding: a fall-through is the
  //    absence of evidence, and auto-deleting on it would destroy real intent.
  return {
    disposition: "review",
    evidence: `no rule matched: "${leaf}" is not an axis value, no sibling re-point redefines it, and its anatomy part (if any) does render — needs human adjudication`,
  };
}
