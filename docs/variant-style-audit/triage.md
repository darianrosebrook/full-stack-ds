---
doc_id: REF-VARIANT-STYLE-TRIAGE-001
authority: reference
status: draft
title: Variant-realization candidate triage (measured)
owner: "@darianrosebrook"
updated: 2026-06-05
---

# Variant-realization candidate triage

`VARIANT-STYLE-CANDIDATE-TRIAGE-01` — converts the 17 fully-unrealized + 2 partial
candidates from `VARIANT-STYLE-REALIZATION-AUDIT-01` into typed dispositions with
source evidence, and proposes fix batches **by mechanism**. Read-only: no contracts,
styles, or CSS were changed.

## Disposition vocabulary outcome

| disposition | count | axes |
|---|---|---|
| `confirmed-defect` | **17** | Spinner.size, Spinner.thickness, Avatar.size, Select.size, Stat.size, Badge.variant, Blockquote.variant, Chip.variant, Details.variant, List.variant, List.marker, List.spacing, List.size, Progress.intent, Stat.trend, Text.weight, Text.variant |
| `needs-contract-decision` | **1** | Spinner.variant |
| `realized-elsewhere` | **1** | Divider.orientation |
| `contract-style-mismatch` | 0 | — (Text suspected; disproven) |
| `descriptive-axis` | 0 | — (behavioral axes already excluded by the audit's styling-intent gate) |

## Calibration (A2 — ≥3 proven examples)

- **Spinner** — `size`/`thickness` are `confirmed-defect`: classes emitted, no consuming
  selector; `.spinner__visual { border-width: var(--fsds-spinner-thickness-regular) }` is
  unconditional, and `font-size` is never set per size (the ring stays `1em`). `variant`
  (ring/dots/bars) is `needs-contract-decision`: the anatomy renders a single
  `<span part="visual">` ring; dots/bars require DOM that doesn't exist.
- **Text** — the suspected `contract-style-mismatch` **did NOT hold**. `--title`/`--body`
  DO match declared variant values `title`/`body` and ARE realized; the other 5
  (display/headline/caption/overline/code) simply have no styles.json entry → `Text.variant`
  is a **partial `confirmed-defect`** (5 of 7 unrealized), not a naming mismatch.
- **Divider.orientation** — `realized-elsewhere` (audit false positive). `.divider--vertical`
  exists with full structural overrides; `horizontal` is correctly realized by the base
  `.divider` rule. The audit flagged `horizontal` only because the `orientation` prop
  declares no `default`, so the base-default could not be exempted. (Audit left unchanged
  per A5 — the realization mechanism was detected correctly; this is an undeclared-default
  limitation, noted as a future refinement: infer base-default in partially-realized axes.)

## Fix batches — by MECHANISM, ordered by confidence × (inverse) blast radius

### Batch 1 — var-rescope selectors, per-value tokens ALREADY exist (purely mechanical)
The component already defines per-value tokens; only the `.<prefix>--<value>` selector that
re-scopes the consumed var is missing. Lowest risk, no new design values, shared mechanism.
- **Spinner.thickness** — tokens `spinner.thickness.{hairline,regular,bold}` exist → add
  `.spinner--<thickness>` re-scoping the border-width var.
- **Stat.trend** — tokens `stat.color.foreground.trend.{up,down,neutral}` exist → add
  `.stat--<trend>` re-scoping the value color.
- **Select.size** — tokens `select.size.{sm,md,lg}.height` exist (orphaned) → add
  `.select--<size>` applying the height var.

### Batch 2 — per-value tokens MISSING + selectors missing (needs design token values)
Color/size axes where some values lack tokens; requires authoring the token values, then the
selectors. Shared "size-axis consumer" + "intent-color" mechanisms across components.
- **Intent colors:** Progress.intent (only `info` token → add success/warning/danger + selectors).
- **Size axis:** Spinner.size, Avatar.size, Stat.size, List.size (only a default/`md` token →
  author per-size tokens + selectors). *This is the shared size-axis pattern across 4
  components — batch it, don't one-off.*

### Batch 3 — full per-variant styling authoring (no styles AND no tokens; design-heavy)
The axis has neither styles.json `--value` selectors nor per-value tokens — the variant was
never given a visual design. Largest effort; each needs design decisions.
- Badge.variant, Blockquote.variant, Chip.variant, Details.variant (+ Details.icon, same shape),
  List.{variant,marker,spacing}, Text.weight, Text.variant (5 of 7).

### Contract decision (separate)
- **Spinner.variant** — build `dots`/`bars` DOM + CSS, or restrain the contract to `ring`
  until that work is scheduled.

## Recommended first fix batch

Per the rule "batch the shared mechanism, don't land a one-off": **Batch 1 (var-rescope where
tokens already exist)** — `Spinner.thickness`, `Stat.trend`, `Select.size`. It is a single
shared mechanism (add the per-value selector that re-scopes an existing var), purely codegen/
styles wiring with **no new design values**, the lowest-risk and highest-confidence of the
batches, and it closes part of the Spinner canary (thickness) while proving the pattern across
three components. Spinner.size then falls into Batch 2 (needs per-size tokens), and Spinner.variant
into the contract decision — so Spinner is fully resolved across Batches 1–2 + the decision,
rather than as an isolated one-off.
