# Component box-model / sizing / token + geometry audit

A reusable, **occasionally-run** drift audit for the DS components. It is **not a
CI gate** — run it by hand when you want to check how the components realize
their contracts (box model, intrinsic sizing, token usage, rendered geometry)
and what has drifted since the last run.

Spec: `COMPONENT-AUDIT-TOOL-01`. Tool: `scripts/component-audit/`. Output (this
dir): `component-audit.csv` — one row per component, alphabetical.

## Run it

```bash
# static only (box-model / sizing / token-usage from contract + generated CSS)
node scripts/component-audit/audit.mjs --all

# a batch (alphabetical), e.g. first 8
node scripts/component-audit/audit.mjs --batch 1 --size 8

# specific components
node scripts/component-audit/audit.mjs --components Button,Card,Table

# + rendered geometry (needs the dev server up):
pnpm run dev          # in another shell — serves /preview/react/<Name>
node scripts/component-audit/audit.mjs --batch 1 --geometry
```

`reviewed` and `notes` columns are **preserved** across runs, so human review
state survives a re-audit. Changed rows are reported as **drift** on stderr.

## What each side means

- **Expectation** is the contract: `<Name>.styles.json` (literal vs `resolvesTo`
  per property/variant/state) + `<Name>.tokens.json` (box-model slot overrides)
  + the `BoxModel` primitive defaults.
- **Reality (static)** is the generated React CSS — `<Name>.tokens.css`
  (resolved `--fsds-box-model-*` + `--fsds-<prefix>-*` values with px fallbacks)
  and `<Name>.css` (what's actually consumed on the root).
- **Reality (rendered)** is the live computed style + bounding box of the root,
  read from the isolated `/preview/react/<Name>` render.

## Columns

`box_model` (slot overrides vs the all-default 0/auto/none) · `box_flags`
(heuristics, e.g. a layout root left at `width:auto`) · `sizing` (intrinsic size
tokens, resolved) · `token_usage` (`Ntok/Mlit`, flagged hardcoded dimensions) ·
`layout` (declared display + flex/grid) · `geom_expected` / `geom_actual`
(rendered snapshot) / `geom_verdict` (`ok` or `FLAG: …`) · `visual_review`
(heuristic "needs eyes") · `reviewed` / `notes` (human, preserved).

## Confounds the geometry probe accounts for (read before trusting a FLAG)

1. **The preview mounts each component with its showcase DEMO props, not base
   props** (e.g. Button → `small`/`primary`). So the rendered box-model reflects
   the demo's size-variant, not the base. The probe therefore does **only
   config-independent** checks: declared root `display`, and whether the
   rendered height honors the *same render's* computed `min-height`. Per-variant
   box-model is recorded as a snapshot, not diffed against base fallbacks.
2. **Flex-item blockification.** The preview shell sets `body { display: flex }`
   and mounts the root as a direct flex item, so CSS blockifies its display
   (`inline-flex`→`flex`, etc.). The display check accepts the blockified
   equivalent; a genuine mismatch (e.g. `grid` vs `block`) still flags.
3. **The flex-centered body shrinks `width:auto` roots to content width.** A
   block/feedback component that would fill its container in a real page renders
   at content width in the isolated preview. So "should this root be 100%?"
   cannot be decided from geometry alone — those rows carry `visual_review=yes`
   for a contextual look.

## Not in scope

Visual aesthetics (does it look on-brand), interaction states beyond the default
render, and portal/trigger components whose root isn't in the default DOM (those
rows record a `(no root … manual)` geometry verdict).
