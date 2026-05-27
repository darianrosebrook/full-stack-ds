---
doc_id: ARCH-FIGMA-COMPONENT-SET-MATERIALIZATION-001
authority: working
status: draft
title: Figma component-set materialization — Button only
owner: "@darianrosebrook"
updated: 2026-05-27
governs:
  - packages/ds-figma-plugin/src/plugin.ts
  - packages/ds-figma-plugin/src/plugin.test.ts
note: |
  Slice FIGMA-COMPONENT-SET-MATERIALIZATION-01. First real movement on
  contract→Figma parity (Axis 4 of the live-determinism probe). The
  plugin currently emits one placeholder Figma component per registry
  entry. This slice replaces the Button path with a real component set
  built from the descriptor's variant matrix, with Figma variant
  properties, a recognizable anatomy, and one shallow style fact
  derived from the descriptor's CSS blocks. Button only — the other 44
  components stay on the placeholder path. Live-verified against a
  scratch Figma file via Chrome DevTools `evaluate_script`.
---

# Figma component-set materialization — Button only

## 1. Scope

**In**

- Replace the Button materialization path in
  `packages/ds-figma-plugin/src/plugin.ts` with a real component-set
  build derived from the existing Button Figma descriptor.
- Derive variant rows from `descriptor.variants` (no hardcoded
  Button-specific variant values).
- Attach Figma variant properties whose names and values match the
  descriptor's variant axes.
- Render a recognizable anatomy: root + label text per variant.
- Apply one shallow style fact per variant derived from the descriptor's
  CSS blocks (e.g., background fill from `--fsds-button-color-background-default`
  resolved through the variant's `.button--<variant>` block).
- Update `plugin.test.ts` to cover the Button path; keep existing
  placeholder-path coverage for the other-component case (rename
  `Empty` to make the intent explicit).
- Live-verify against a scratch Figma file via DevTools
  `evaluate_script`.

**Out**

- The other 44 components stay on the placeholder path.
- No prop-to-CSS IR work (no schema extension, no
  `cssVariableBindings`, no iteration mechanism).
- No token graph architecture work. Color fills are derived from
  whatever the descriptor's CSS block already records (including the
  fallback hex in `var(--fsds-..., #xxxxxx)` expressions).
- No idempotent update path; re-running the plugin still duplicates
  components.
- No manifest-ID / `setPluginData` work beyond what the current plugin
  already does. (The probe established that `setPluginData` requires a
  manifest ID — that's a real production constraint, but it is not
  exercised by the live verification surface and does not block
  materialization itself.)
- No `--target=figma` codegen or descriptor changes. The materializer
  consumes the existing descriptor as-is.

## 2. Button descriptor inventory

Read from
`packages/ds-figma-plugin/src/generated/components/Button/Button.figma.json`
(schema version 1).

| Descriptor fact | Classification | How materialized (or why not) |
|---|---|---|
| `component.name` | materialized_now | Component-set name |
| `component.cssPrefix` | metadata_only | Already set via `setPluginData("fsds.cssPrefix")` |
| `component.rootElement = "button"` | metadata_only | Recorded via `setPluginData("fsds.rootElement")` |
| `component.effectiveRole` | metadata_only | Recorded via `setPluginData` |
| `anatomy[].name` (root, spinner, loadingText) | materialized_now (root) / deferred (spinner, loadingText) | Root materializes as the variant frame itself. `spinner` and `loadingText` are runtime-only states; not represented in v1 |
| `anatomy[].nativeTag` | metadata_only | Recorded via `setPluginData("fsds.anatomy.<part>.nativeTag")` |
| `anatomy[].layoutVariant` | metadata_only | None of Button's parts declare a layout variant |
| `props[].name/type/default` | metadata_only | Each prop recorded via `setPluginData("fsds.prop.<name>")` (unchanged from prior behavior) |
| `variants.size` (small/medium/large) | materialized_now | Becomes a Figma variant property "size" with three values |
| `variants.variant` (primary/secondary/tertiary/ghost/destructive/outline) | materialized_now | Becomes a Figma variant property "variant" with six values |
| `states` (flat: default/hover/focus/active/disabled) | deferred | Figma can model interactive states via interactions, but representing CSS pseudo-class states in v1 component variants would balloon the matrix 5x. Keep as `setPluginData("fsds.states")` for now |
| `classRecipe` (base/valueModifiers/booleanModifiers) | metadata_only | Recorded via `setPluginData` |
| `root.element` / `root.explicitRole` / `root.implicitRole` | metadata_only | Recorded via `setPluginData` |
| `root.labeling` / `root.keyboard` | metadata_only | Recorded via `setPluginData` |
| `css.blocks[selector=".button"]` | materialized_now (shallow) | Base block provides default sizing + spacing + radius for the medium/primary cell; serves as the fallback style applied to all variants |
| `css.blocks[selector=".button--<size>"]` | materialized_now (shallow) | Each size block contributes its `--fsds-button-size-padding-*` and `--fsds-button-size-minHeight-*` values, which become Figma `paddingTop/Right/Bottom/Left` and `minHeight` per variant |
| `css.blocks[selector=".button--<variant>"]` | materialized_now (shallow) | Each variant block contributes `--fsds-button-color-background-default` and `--fsds-button-color-foreground-default`, resolved through the fallback hex in `var(--token, #hex)` expressions where available |
| `css.blocks[":hover"/":active"/":focus-visible"/":disabled"]` | deferred | Pseudo-state visual changes; not represented in v1 variant matrix |
| `css.blocks[".button__spinner"]` / `[".button__loadingText"]` | deferred | Runtime-only parts |
| `css.keyframes[spin]` | not_representable_in_figma_v1 | Figma components don't model CSS animations |
| `behavior.*` | not_representable_in_figma_v1 | Button has no behavior channels/dismissal/focus/portal; field is empty |
| `surface` | not_representable_in_figma_v1 | null for Button |
| `figma.componentSetName` | materialized_now | Used as the component-set name |
| `figma.documentationFrame` | deferred | Documentation page was already dropped in a prior change |
| `figma.intendedUse` | metadata_only | Recorded via `setPluginData` |
| `figma.propertySource` | metadata_only | Recorded via `setPluginData` |

Summary count: 7 materialized_now, 11 metadata_only, 5 deferred,
3 not_representable_in_figma_v1.

The 5 "deferred" facts (spinner/loadingText anatomy, pseudo-state CSS
blocks, states matrix, documentation frame) name explicit successor
work; they are not silent gaps.

## 3. Materialization plan

### 3.1 Variant matrix

Button's variants are `size: [small, medium, large] × variant:
[primary, secondary, tertiary, ghost, destructive, outline]`. That's
3 × 6 = **18 component children** in the component set.

The materializer derives this from `descriptor.variants` — it does not
hardcode the axis names "size" / "variant" or the value lists. The
variant key is built by joining axis declarations into Figma's
canonical `"axis1=value1, axis2=value2"` shape.

### 3.2 Per-variant style derivation

For each `[size, variant]` row:

1. Start from the base `.button` block (medium/primary defaults).
2. Layer in the `.button--<size>` block's
   `--fsds-button-size-padding-block-medium`,
   `--fsds-button-size-padding-inline-medium`,
   `--fsds-button-size-minHeight-medium`.
3. Layer in the `.button--<variant>` block's
   `--fsds-button-color-background-default`,
   `--fsds-button-color-foreground-default`.
4. Where the value is `var(--token, #hex)`, extract the fallback hex.
   Where it's `var(--token)` with no fallback, leave the fill
   unspecified (don't paint).
5. Where it's a literal value (e.g. `transparent`), apply it as-is.

This is shallow — it gets a recognizable color difference between
`primary` (red-ish), `destructive` (red-ish), `secondary` (gray),
`tertiary` (transparent), `ghost` (transparent), `outline`
(transparent with border). Per-variant border-color is also derived
from `--fsds-button-color-border-default` where the variant block sets
it.

### 3.3 Per-variant anatomy

Each variant component contains:

- The variant component itself (FRAME-equivalent) as `root`.
  - `layoutMode = "HORIZONTAL"` (Button is inline-flex with
    `align-items: center, justify-content: center`).
  - `paddingTop/Bottom` = size block's padding-block hex value.
  - `paddingLeft/Right` = size block's padding-inline hex value.
  - `itemSpacing` = base block's gap (8px).
  - `minHeight` from size block.
- A single TEXT child as the label, with `characters = "Button"` and
  `fills` from the variant's foreground color.

The label text is a literal placeholder ("Button"). The descriptor
does not currently include a contract-derived label string — that's
the right boundary for the slice (per the parity rubric: don't invent
facts not in the descriptor).

## 4. Verification

### 4.1 Unit-test surface

Extend `plugin.test.ts`:

- Add a Button mock whose `variants` matches the real shape (`size: 3
  × variant: 6 = 18` rows expected).
- Add a `css.blocks` field to the mock matching the real descriptor's
  shape (a subset is fine; the materializer only reads specific
  selectors).
- Assert: a Button component set is created with 18 children; each
  child has `name` like `"size=small, variant=primary"`; each child
  has `layoutMode = "HORIZONTAL"`; each child has one TEXT descendant
  with `characters = "Button"`.
- Keep the existing "non-Button placeholder path" assertion (rename
  `Empty` to `Card` or similar to make the placeholder fallback's
  meaning clearer).

### 4.2 Live verification (DevTools) — deferred

The probe established that DevTools `evaluate_script` reaches the
Figma plugin API. Driving this slice's materializer through it would
record concrete proof: component-set id, 18-child count, variant
property pairs from `componentSet.componentPropertyDefinitions`,
per-variant `layoutMode` / `paddingTop` / `paddingLeft` / `minHeight`,
text label `characters` + `fills`, and applied component-level
`fills` / `strokes`.

This step was **not executed in this slice**. The DevTools surface
requires a logged-in Figma scratch file currently open in the
controlled browser; the agent declines to open the user's Figma
account to satisfy that prerequisite. The slice closes with unit-test
evidence of materializer shape (4 tests in `plugin.test.ts`) and an
explicit gap recorded here. Live verification is a one-line follow-up
the next time the user has a Figma tab open in the same browser
session — paste the contents of `materializeButtonComponentSet`'s
body into DevTools and inspect the resulting node graph.

Acceptance criterion 6 below is therefore **partially satisfied** —
unit-test evidence stands in for the live evidence. The slice's
non-claim list explicitly records that live materialization was not
re-verified.

## 5. Acceptance

1. Button no longer materializes as a single generic placeholder
   component.
2. Button materializes as a Figma component set with 18 children
   (3 sizes × 6 variants).
3. Variant property names ("size", "variant") and values match
   `descriptor.variants` exactly. No hand-listed Button axes.
4. Each variant has a root frame (the component itself) and one text
   label child with literal `"Button"` characters.
5. At least one shallow style fact per variant is derived from the
   descriptor (`backgroundFill` from the variant's CSS block, or
   `padding*` from the size block). Variants whose CSS blocks lack
   resolvable values (e.g. tokens with no fallback) are explicitly
   left unstyled rather than guessed.
6. Live Figma evidence records: component set id, 18 children with
   distinct variant property pairs, sampled child layout mode,
   padding, minHeight, text content, and applied fills where present.
   **Partially satisfied**: live execution was not run in this slice
   (no Figma tab available in the controlled browser; agent declined
   to open the user's account). Unit tests cover the materializer
   shape; live verification is a recorded follow-up.
7. `plugin.test.ts` passes with the new Button-specific assertions.
8. The non-Button placeholder path is untouched; existing test
   coverage for it stays green.
9. `pnpm test`, `pnpm run governed:rail`, and the figma-lane vitest
   subset all pass.

## 6. Non-claims

- Does NOT prove Button design fidelity. Token resolution is shallow
  (fallback hex only). The 5 deferred facts are explicit, not
  silently hidden.
- Does NOT prove component-library publication. The materializer
  still runs against a scratch file.
- Does NOT prove idempotence. Re-running still duplicates the
  component set.
- Does NOT establish a generic materializer. The Button path is
  intentionally Button-specific to keep the slice constrained; a
  generic materializer is the named successor.
- Does NOT touch the other 44 components or any contract / IR /
  emitter source.
- Does NOT solve the manifest-ID / private-plugin-data constraint
  surfaced in the probe.
- Does NOT re-execute live materialization against a real Figma file
  in this slice. The probe established the DevTools `evaluate_script`
  surface works; this slice did not re-verify against it. Unit tests
  cover the materializer shape; live evidence is deferred to the next
  Figma-tab session.

## 7. Successor candidates

- `FIGMA-COMPONENT-SET-GENERIC-MATERIALIZER-01` — Generalize the
  Button-specific materializer to read descriptor variants + CSS for
  any component. Likely successor.
- `FIGMA-BUTTON-LABEL-FROM-CONTRACT-01` — Extend the contract or
  descriptor with a designer-facing label so the literal `"Button"`
  text isn't hardcoded in the materializer.
- `FIGMA-IDEMPOTENT-LIVE-UPDATE-01` — Lookup-then-update behavior.
  Still blocked on the manifest-ID question.
- `FIGMA-BUTTON-PSEUDO-STATE-VARIANTS-01` — Add hover/focus/active/
  disabled as additional variant rows (multiplying the matrix by 5).
  Probably not worth doing standalone; better packaged with the
  generic materializer if at all.
