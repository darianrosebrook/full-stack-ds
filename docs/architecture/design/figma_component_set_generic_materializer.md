---
doc_id: ARCH-FIGMA-COMPONENT-SET-GENERIC-MATERIALIZER-001
authority: working
status: draft
title: Figma component-set generic materializer
owner: "@darianrosebrook"
updated: 2026-05-27
governs:
  - packages/ds-figma-plugin/src/plugin.ts
  - packages/ds-figma-plugin/src/plugin.test.ts
note: |
  Slice FIGMA-COMPONENT-SET-GENERIC-MATERIALIZER-01. Generalizes the
  Button-only path from FIGMA-COMPONENT-SET-MATERIALIZATION-01 into a
  descriptor-driven generic materializer with explicit eligibility
  classification. Materializer body does not branch on component name;
  only the classifier consults an explicit allowlist. Proves the
  mechanism on Button + Chip + Status, with Card + Avatar held on the
  placeholder fallback to exercise both ineligibility reasons.
---

# Figma component-set generic materializer

## 1. Scope

**In**

- Extract the Button-specific materializer body into a generic
  `materializeComponentSet(descriptor, parent)` that consumes only
  `descriptor.variants`, `descriptor.css.blocks`, and
  `descriptor.component.cssPrefix`.
- Remove every `descriptor.component.name === "Button"` branch from
  the materializer. Component-name knowledge is confined to a
  `COMPONENT_SET_ALLOWLIST` consulted only by the classifier.
- Replace Button-specific token-name literals
  (`--fsds-button-color-background-default`, etc.) with semantic
  category matching across declaration names (`background`,
  `foreground`, `border`, `radius`, `padding-*`, `gap`, `font-size`,
  `min-height`).
- Add `classifyDescriptorForMaterialization(descriptor)` with explicit
  reasons: `component_set_materialized`, `placeholder_no_variants`,
  `placeholder_missing_css`, `placeholder_unsupported_shape`,
  `placeholder_deferred`.
- Materialize Button (18 cells), Chip (9 cells), and Status (5 cells)
  through the generic path.
- Record `fsds.eligibility.reason` on every node via `setPluginData`.

**Out**

- The other 42 components remain on the placeholder leaf path,
  classified as `placeholder_deferred` or `placeholder_no_variants`
  depending on whether their descriptor has variants.
- No prop-to-CSS IR mechanism. No iteration directive. No CSS-var
  binding schema work.
- No idempotent update path. No manifest-ID / private-plugin-data
  solution.
- No compound anatomy, no icon slots, no loading states, no pseudo-
  state variants.
- No live materialization verification in this slice. Live evidence
  is batched (see §5).

## 2. Eligibility matrix

The classifier evaluates every descriptor against four binary tests
in order. The first failed test produces the eligibility reason.

| Test | Passes when... | Failure reason |
|---|---|---|
| Has variants | At least one variant axis has ≥1 value | `placeholder_no_variants` |
| Has CSS | `descriptor.css.blocks` includes a base block at `.<cssPrefix>` | `placeholder_missing_css` |
| Allowlisted | `COMPONENT_SET_ALLOWLIST.includes(descriptor.component.name)` | `placeholder_deferred` |
| (reserved) | — | `placeholder_unsupported_shape` (future) |

This slice's allowlist: `["Button", "Chip", "Status"]`.

| Component | Variants | Base CSS | Allowlisted | Result | Cell count |
|---|---|---|---|---|---|
| Button | ✅ size × variant | ✅ | ✅ | `component_set_materialized` | 18 |
| Chip | ✅ variant × size | ✅ | ✅ | `component_set_materialized` | 9 |
| Status | ✅ status | ✅ | ✅ | `component_set_materialized` | 5 |
| Card (test mock) | ❌ no variants | — | — | `placeholder_no_variants` | — |
| Avatar (test mock) | ✅ size | ✅ | ❌ | `placeholder_deferred` | — |
| (all other 42) | varies | varies | ❌ | `placeholder_deferred` or `placeholder_no_variants` | — |

The slice intentionally uses an allowlist rather than auto-enrolling
everything that passes the variant + CSS tests. This bounds the blast
radius: a new descriptor shape we haven't seen yet won't silently
enter the generic path. Widening the allowlist is the next slice's
work.

## 3. Materializer mechanism

### 3.1 Variant matrix derivation

`enumerateVariantMatrix(variants)` produces the Cartesian product of
axis values in `Object.entries(variants)` order. Empty `variants` →
single `{ pairs: [] }` row. Axes with zero values are filtered out.

Output row count = product of axis cardinalities. Verified:

- Button (size: 3 × variant: 6) = 18
- Chip (variant: 3 × size: 3) = 9
- Status (status: 5) = 5

Variant child name format: `"axis=value, axis=value, ..."`,
joining pairs with `", "`. This is Figma's canonical variant-name
encoding from which `figma.combineAsVariants` derives variant
properties. Single-axis components produce names like `"status=info"`.

### 3.2 Generic CSS extraction

`extractShallowStyles(blocks)` walks declarations across an ordered
block list looking for declaration *names* (or top-level CSS
properties) matching semantic category hints. The order is:

1. Variant-scoped blocks (one per `(axis, value)` pair, named
   `.<cssPrefix>--<value>`), in axis-iteration order.
2. The base block `.<cssPrefix>`.

This order mirrors CSS cascade for class selectors of equal weight,
resolved by source order — variant blocks are more specific.

Categories handled:

| Category | Hints | Maps to |
|---|---|---|
| background | `background` | `node.fills` (SOLID paint from hex fallback in `var(--token, #hex)`) |
| foreground | `foreground`, `color-text`, `text-color` | `label.fills` |
| border | `border`, `stroke` | `node.strokes` |
| padding (block) | `padding-block`, `padding-top`, `padding-bottom`, `padding-vertical` → fallback to bare `padding` | `node.paddingTop / paddingBottom` |
| padding (inline) | `padding-inline`, `padding-left`, `padding-right`, `padding-horizontal` → fallback to bare `padding` | `node.paddingLeft / paddingRight` |
| gap | `gap` | `node.itemSpacing` |
| corner-radius | `radius`, `border-radius` | `node.cornerRadius` |
| min-height | `min-height`, `minheight` | `node.minHeight` |
| stroke-width | `border-width`, `stroke-width` | `node.strokeWeight` |
| font-size | `font-size`, `fontsize`, `text-size` | `label.fontSize` |

Hints are substring-matched against lowercased declaration names. The
first resolvable value wins. A `transparent` literal short-circuits to
"no paint" (empty `fills` / `strokes` array), correctly overriding a
less-specific block that would otherwise contribute a hex.

Bare `padding` is a separate fallback that excludes any
direction-qualified hints to avoid double-counting.

### 3.3 What gets applied to each variant component

Per variant row, the materializer creates:

1. A `figma.createComponent()` with `layoutMode = "HORIZONTAL"`,
   center-aligned both axes, AUTO sizing both axes, named per §3.1.
2. Padding / gap / corner-radius / min-height from extracted styles
   (applied only if the value is resolvable; otherwise omitted).
3. `fills` / `strokes` from extracted paints, with explicit empty
   arrays when the relevant category resolved to `transparent`.
4. One `figma.createText()` child with `characters =
   descriptor.component.name`, `fontSize` from extracted styles,
   `fills` from extracted foreground paint.

Components whose CSS blocks lack a category yield variants with that
property omitted — not invented. Chip and Status illustrate this: with
no per-variant CSS, all 9 (Chip) / 5 (Status) variants share the base
block's geometry and fills.

## 4. Test coverage

`packages/ds-figma-plugin/src/plugin.test.ts` — 10 tests, all pass.

| # | Test | Proves |
|---|---|---|
| 1 | Button routes to component-set path with 18 cells | Allowlisted + eligible → component_set_materialized |
| 2 | Chip routes to same path with 9 cells, variant names descriptor-derived | Two-axis cartesian via generic path; no Button-specific logic |
| 3 | Status routes to same path with 5 cells, single-axis names | Single-axis cartesian via generic path |
| 4 | Card (no variants) → `placeholder_no_variants` leaf | Classifier rejects on missing variants |
| 5 | Avatar (variants but not allowlisted) → `placeholder_deferred` leaf | Classifier rejects on allowlist |
| 6 | Button per-variant geometry differentiates across sizes; tertiary's transparent overrides base hex | Cascade-correct generic CSS extraction |
| 7 | Chip variants share base-block styling (no per-variant CSS → no invented differentiation) | Generic extractor degrades gracefully |
| 8 | Status variants share base-block styling, label text = component name | Same on single-axis |
| 9 | `classifyDescriptorForMaterialization` pure, exported, returns 4 distinct reasons on 4 input shapes | Classifier is testable in isolation |
| 10 | Full page scaffold: 1 Stack set + 3 component sets + 2 placeholder leaves; notify/closePlugin message text | Integration: dispatcher dispatches correctly |

The critical assertion across tests 1+2+3 is *the same materializer
function produces three different output shapes from three different
descriptor shapes without component-name branching*. Tests 1/2/3 each
hit `materializeComponentSet`, which contains no Button or Chip or
Status logic.

False-confidence risks acknowledged:

- Tests mock `figma.*`. They prove materializer *shape*, not Figma
  API acceptance. Live verification (§5) closes this.
- Tests use representative descriptor mocks. The real descriptors
  carry more declarations; we are relying on the substring-matching
  extractor to not catch false positives like a hypothetical
  `padding-block-not-really-a-padding` declaration. Not seen today.
- Tests do not exercise `placeholder_missing_css` directly via the
  full `main()` path — only via the classifier unit test. A
  malformed descriptor without `.<cssPrefix>` base block would reach
  the leaf path correctly, but the integration coverage is gap.

## 5. Live verification — batched protocol

The probe established that Chrome DevTools `evaluate_script` against
a logged-in Figma scratch tab exposes the full `figma.*` plugin API.
The Button-only slice deferred live verification because no Figma tab
was open and the agent declined to open the user's account.

This slice adopts a **batched protocol** going forward:

1. When the user next has a Figma scratch tab open in the controlled
   browser, run a single live-check script that exercises Button +
   Chip + Status materialization in one pass.
2. Record per-component-set: node id, child count, sample child
   variant property pairs (from
   `componentSet.componentPropertyDefinitions`), sample child layout
   mode + padding + minHeight + text content + applied fills.
3. Clean up the probe component sets after recording.
4. Update this doc's §5 with the recorded evidence.

Until that batch runs, the slice closes with unit-test evidence
covering materializer *shape* across three component shapes. The
generic mechanism is the proof object; live coverage of Button alone
in the prior slice gives partial confidence that the underlying
`figma.combineAsVariants` call shape is correct.

## 6. Acceptance

1. ✅ The materializer body contains no
   `descriptor.component.name === "<X>"` branch. (Verified by code
   inspection; the only `name`-aware code is the classifier's
   `COMPONENT_SET_ALLOWLIST.includes(...)` line.)
2. ✅ Eligibility is explicit and recorded on every node via
   `setPluginData("fsds.eligibility.reason")`.
3. ✅ Materialization proven on Button + 2 additional components
   (Chip, Status) via the same code path.
4. ✅ Variant matrix derivation is generic: 18 / 9 / 5 cells from
   the same `enumerateVariantMatrix` call.
5. ✅ CSS extraction is generic: handles three different declaration
   naming conventions (Button's `padding-block`, Chip's
   `padding-horizontal`, Status's bare `padding`) via category hints
   + bare-padding fallback. Missing categories result in omitted
   styling, not invented styling.
6. ✅ Anatomy stays shallow: every materialized variant gets root +
   single text label. Compound anatomy deferred.
7. ✅ Tests prove cross-component reuse (tests 1+2+3+6+7+8). Button
   assertions retained; non-Button proof present.
8. ✅ Placeholder path remains intact for ineligible descriptors
   (test 4 + 5). Plugin import path unbroken for the other 42
   components.
9. ⚠️ Live verification batched. Not executed this slice. Single
   live-check script will exercise Button + Chip + Status when a
   Figma tab is available.
10. Successor named (§7).

## 7. Successor candidates

1. **`FIGMA-LIVE-MATERIALIZATION-BATCH-01`** — Run the batched live
   verification protocol from §5. One paste-into-DevTools session,
   three component sets verified, evidence recorded back into this
   doc and the Button doc. Smallest jump, highest confidence gain.

2. **`FIGMA-DESCRIPTOR-LABEL-TEXT-01`** — Extend the descriptor with
   a designer-facing label string (replacing the
   `descriptor.component.name` literal currently used for label
   text). Surface this through the contract or via a derived field.

3. **`FIGMA-TOKEN-STYLE-RESOLUTION-01`** — Move from
   "hex-from-fallback" to actual token resolution. The categorical
   extractor would consult a token resolution table for `var(--token)`
   expressions without inline fallbacks. Unlocks meaningful color
   styling for components whose tokens don't currently inline a hex.

4. **`FIGMA-COMPONENT-SET-ALLOWLIST-WIDEN-01`** — Add Badge (4×4×3=48),
   Spinner (4×3×3=36), and others to the allowlist, after the live
   batch confirms the mechanism. Variant matrix size becomes the new
   constraint.

5. **`FIGMA-IDEMPOTENT-LIVE-UPDATE-01`** — Still blocked on
   manifest-ID question.

## 8. Non-claims

- Does NOT prove Chip or Status design fidelity. Their contracts
  currently lack per-variant CSS; all 9 / 5 variants share base-block
  styling. This is correct mechanism behavior, not a defect.
- Does NOT prove generic *coverage* — only the generic *mechanism*.
  Three components × three descriptor shapes is enough to demonstrate
  the materializer doesn't branch on identity. Widening the allowlist
  is named follow-up work.
- Does NOT touch any contract, IR, emitter, or descriptor codegen.
- Does NOT solve token resolution beyond hex-from-fallback.
- Does NOT verify against the real Figma API in this slice. Batched
  live verification is the next slice's primary purpose.
- Does NOT modify the figma-plugin generated `index.ts` barrel or
  any descriptor JSON. Plugin consumes the existing registry as-is.
- Does NOT solve the manifest-ID / private-plugin-data constraint
  surfaced in the probe.
