# Variant/style realization audit

`VARIANT-STYLE-REALIZATION-AUDIT-01` — a **read-only** audit that cross-checks the
variant AXES declared in each contract (`variants`) against the CSS that actually
realizes them, to surface the "declared variant axis → no visual realization"
defect class. Spinner is the canary: 3 axes declared, classes emitted, no
consuming selector.

This is a **candidate-finder, not a confirmed-defect list.** It deterministically
flags axes that lack the standard realization; whether each flagged axis is a
user-facing defect (vs. realized by a non-standard mechanism, or a descriptive-only
contract axis) needs per-axis triage / the runtime+visual rails.

## Realization mechanism (how variants are styled here)

The base `.<prefix>` rule consumes CSS vars (`var(--fsds-button-color-background-default)`).
A variant class **re-scopes** those vars in `<Name>.tokens.css`:

```css
.button--primary { --fsds-button-color-background-default: …primary…; }
```

generated from `<Name>.styles.json` `--value` selectors. So a variant VALUE is
**realized** iff a `.<prefix>--<value>` selector exists in `<Name>.css` **or**
`<Name>.tokens.css`.

## Discriminators (false-positive controls)

1. **Styling intent.** An axis is only a realization gap if its VALUES show styling
   intent — a per-value component token (e.g. `spinner.thickness.{hairline,regular,bold}`)
   or a styles.json `--value` selector. Axes with neither are **behavioral / DOM-structural**
   (`mode`, `type`, `orientation`, `as`, `level`, `placement`) and correctly need no CSS.
   This cut the naive flag set from **52 → 17** axes (behavioral axes dropped).
2. **Default base-coverage.** The default value is realized by the base `.<prefix>`
   rule and needs no per-value selector; only NON-DEFAULT values without a selector
   are gaps.

Locked in `realization.test.mjs` (8 assertions): Spinner flagged; Button (fully
var-scoped) not flagged; Calendar.`mode` / NavList.`orientation` / OTP.`mode`
(behavioral) not flagged.

## Findings

36 components declare variants · 65 axes · 239 values.

- **17 fully-unrealized axes with styling intent** (highest-confidence candidates):
  Spinner.{size,variant,thickness}, Avatar.size, Badge.variant, Blockquote.variant,
  Chip.variant, Details.variant, List.{variant,marker,spacing,size}, Progress.intent,
  Select.size, Stat.{size,trend}, Text.weight.
- **2 partially-realized axes** (some non-default values lack a selector):
  Divider.orientation, Text.variant.
- Behavioral axes (mode/type/orientation/as/level/placement) **excluded** — no styling intent.

### Confirmed canary (verified manually)

- **Spinner** — `size`/`variant`/`thickness` declared, classes emitted
  (`spinner--md spinner--ring spinner--hairline`), **no consuming selector in either
  CSS file**. The ring is sized by inherited `1em`; `spinner.thickness.{…}` tokens
  exist but nothing applies them per-variant. All three axes are inert. (This is the
  defect that motivated the audit.)

### Calibration notes (why this is a candidate list)

- **Text** *realizes* `--body`/`--title` selectors that don't match its *declared*
  variant values (`variant: display/headline/caption/overline/code`, `weight: …`) —
  a contract↔styles **naming mismatch**, not a simple missing-selector gap.
- **Progress.intent** / **Avatar.size** have no per-variant selectors at all; whether
  they realize via inline style / a different var needs a runtime check.
- **DOM-structural variants** (Spinner `variant: ring/dots/bars`) can't be confirmed
  statically — only `ring` renders; `dots`/`bars` need DOM-structure logic. Flagged
  here when token/styles intent exists, but the realization is a render concern.

## Proposed smallest fix slice

The verified canary first: **realize Spinner's variant axes** — `size`→font-size per
`spinner--<size>` (consuming `spinner.size.*`), `thickness`→border-width per
`spinner--<thickness>` (consuming `spinner.thickness.*`), and `variant`→actual
dots/bars DOM+CSS (or restrain the contract to `ring` until built). The other 16
candidates should be triaged individually (realized-elsewhere vs. genuine gap vs.
descriptive contract axis) before fixing — not batch-"fixed" on the audit's say-so.

## Out of scope

Pseudo-state styling (`:hover`/`:focus`/disabled/invalid/checked) — the separate
state/pseudo-styling rail. Visual correctness / a11y — the later visual+axe layer.
