---
doc_id: ARCH-COMPONENT-LAYERING-001
authority: architecture
status: implemented
title: Component Layering — .css is structure, .tokens.css is resolution
owner: "@darianrosebrook"
updated: 2026-05-23
verified_at_commit: 9e0aa89
governs:
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/css.ts
  - packages/ds-codegen/src/validation/styles.ts
  - packages/ds-contracts/components/**/*.styles.json
  - packages/ds-contracts/components/**/*.tokens.json
---

# Component Layering

> Companion to [`ARCH-TOKENS-ARCHITECTURE-001`](./tokens-architecture.md), [`ARCH-BOX-MODEL-PRIMITIVE-001`](./box-model-primitive.md), [`SPEC-STATES-TO-CSS-001`](./states-to-css.md), and [`ARCH-CODEGEN-AUTHORITY-001`](./codegen-authority.md). Names the realized layering rule that determines what lives in `<Name>.css` vs `<Name>.tokens.css`, and the variant-redirection pattern that uses it.

Every generated component emits two CSS files: `<Name>.css` and `<Name>.tokens.css`. The split between them is not just file organization — it carries an architectural rule that makes variants, states, density, and brand overrides compose through the cascade without compound selectors or per-variant slot names. This doc is the durable record for that rule.

## What this proves

The layering rule provides:

1. **A single consumer site per CSS property.** `.button` reads `background-color: var(--fsds-button-color-background-default)` exactly once. Variants, states, and density don't rewrite the consumer — they rewrite the slot's resolution at the appropriate scope.
2. **Variants × states without compound selectors.** Hovering a primary button picks up the primary-hover color through cascade resolution, not through a `.button--primary:hover` selector. The `.button:hover` structural rule and the `.button--primary` variant scope compose automatically.
3. **A clear brand-override surface.** Brand customizers never need to touch CSS property names — only slot resolutions. The slot is the public API; the consumer is implementation detail.
4. **A clear density-override surface.** Density tokens shift semantic values (`semantic.action.size.medium.padding-block`); the box-model and component-local slots resolve through them automatically. No per-density slot proliferation.
5. **State slots as first-class siblings of the default.** `<prefix>.color.background.{default, hover, active, disabled}` are four parallel slots. The state pseudo-class rule reads the matching state slot; variants populate all four together.

## What this does NOT prove

- **It does not prove visual correctness.** The layering composes mathematically; it can still produce a bad-looking button if the semantic tokens chosen are wrong. Visual review is a separate pass.
- **It does not enforce that authors follow the rule.** The codegen emits whatever `styles.json` and `tokens.json` declare. An author who writes `background-color` directly in a `:hover` selector instead of reading a state slot will produce CSS that works but doesn't compose with variants. The convergence validators catch contract↔emit drift; they don't catch contract-shape mistakes.
- **It does not cover data-state or system-state axes.** Loading, empty, validation errors, server states (4xx/5xx) are not currently modeled as slot scopes. They live in component props and runtime logic. Future doctrine work may extend the contract schema to express them.
- **It does not address scroll/pagination behavior.** The layering rule speaks to visual states only. Scroll affordance, infinite vs. paged, capacity limits — these are component-API concerns documented in component contracts, not CSS layering concerns.

## The rule

> **`.css` holds structure. `.tokens.css` holds resolution.**

Concretely:

| Belongs in `.css` (durable structure) | Belongs in `.tokens.css` (resolution by scope) |
|---|---|
| Layout literals: `display`, `align-items`, `justify-content`, `flex-direction`, `position`, `box-sizing` | Root-scope slot declarations: `.button { --fsds-button-color-background-default: var(--fsds-semantic-...) }` |
| Cursor / affordance literals: `cursor`, `user-select`, `white-space`, `pointer-events` | Variant scopes: `.button--primary { --fsds-button-color-background-default: var(--fsds-semantic-color-action-background-primary-default); ... }` |
| CSS-property reads that consume slots: `padding-block-start: var(--fsds-box-model-padding-block-start)`, `background-color: var(--fsds-button-color-background-default)` | State scopes: `.button:hover { --fsds-button-color-background-default: var(--fsds-semantic-interaction-background-hover); }` (when state slot is named `default`) |
| State pseudo-class **rules** (the structural reaction): `&:hover { background-color: var(--fsds-button-color-background-hover) }` | State **slot resolutions** at root scope: `--fsds-button-color-background-hover: var(...)` |
| Keyframes, animations, transitions | Variant × state intersections happen implicitly through cascade composition; no `.button--primary:hover` selector is needed |

The litmus test, repeated in two forms:

- **"If a variant changes the rule, it belongs in `.css`. If a variant changes the resolved value, it belongs in `.tokens.css`."**
- **"What is the same for every variant?" → `.css`. "What differs by scope?" → `.tokens.css`.**

## The non-negotiable invariant

> **Every CSS property is read at exactly one consumer site. Every slot is declared at root, and may be redefined at any number of variant/state scopes.**

The single consumer site is what makes the cascade work. Two `background-color` rules at equal specificity would race. One `background-color` rule reading a slot that's redefined per scope cannot race — the cascade picks the most specific scope and resolves there.

The invariant is enforced by convention, not validation. An author who writes a second `background-color` rule inside a `--primary` selector breaks the cascade discipline; the codegen will still emit it but the result is fragile. The right shape is always: the consumer site is in `.css`; per-scope changes are slot redefinitions in `.tokens.css`.

## State slots are first-class siblings

The largest realization in adopting this rule was that **state slots are not "the default slot redirected at state scope."** Each state-keyed slot is a peer of the default. For Button:

```json
// Button.tokens.json
{
  "button.color.background.default":  { "resolvesTo": "..." },
  "button.color.background.hover":    { "resolvesTo": "..." },
  "button.color.background.active":   { "resolvesTo": "..." },
  "button.color.background.disabled": { "resolvesTo": "..." }
}
```

The structural rule in `.css`:

```css
.button {
  background-color: var(--fsds-button-color-background-default);

  &:hover    { background-color: var(--fsds-button-color-background-hover); }
  &:active   { background-color: var(--fsds-button-color-background-active); }
  &:disabled { background-color: var(--fsds-button-color-background-disabled); }
}
```

The hover rule reads the hover slot — a different name, not the default slot at hover scope.

### Why this matters: variants populate all state slots at once

When a variant block in `styles.json` redefines slots, it populates the entire state matrix at variant scope:

```json
// Button.styles.json
"--primary": {
  "button.color.background.default":  { "resolvesTo": "semantic.color.action.background.primary.default"  },
  "button.color.background.hover":    { "resolvesTo": "semantic.color.action.background.primary.hover"    },
  "button.color.background.active":   { "resolvesTo": "semantic.color.action.background.primary.active"   },
  "button.color.background.disabled": { "resolvesTo": "semantic.color.action.background.primary.disabled" }
}
```

Emits as:

```css
.button--primary {
  --fsds-button-color-background-default:  var(--fsds-semantic-color-action-background-primary-default);
  --fsds-button-color-background-hover:    var(--fsds-semantic-color-action-background-primary-hover);
  --fsds-button-color-background-active:   var(--fsds-semantic-color-action-background-primary-active);
  --fsds-button-color-background-disabled: var(--fsds-semantic-color-action-background-primary-disabled);
}
```

When the user hovers `.button.button--primary`:
1. The structural `.button:hover` rule reads `--fsds-button-color-background-hover`.
2. The `.button--primary` block has set that slot to the primary-hover semantic at primary scope.
3. Cascade resolves to the primary-hover color.

No `.button--primary:hover` selector. No compound rules. The intersection is implicit.

### Why this matters: density and brand override at one tier

The slot name `--fsds-button-color-background-hover` is **stable across every variant**. A brand wanting to shift action-primary-hover globally writes:

```css
[data-brand="myBrand"] {
  --fsds-semantic-color-action-background-primary-hover: <new value>;
}
```

Every primary action component picks it up automatically — because they all resolve through `semantic.color.action.background.primary.hover` at the variant tier.

If instead each variant had its own slot name (the older "every variant gets a uniquely-named slot" pattern), brand authors would have to chase `--fsds-button-color-background-primary-hover`, `--fsds-icon-button-color-background-primary-hover`, `--fsds-toggle-color-background-primary-hover`, etc. The one-slot-per-state pattern collapses that surface to the semantic tier where it belongs.

## The state taxonomy supported today

The codegen's `DERIVABLE_STATE_TO_PSEUDO` map (in `packages/ds-codegen/src/ir.ts`) recognizes these names as selector keys in `styles.json`:

| Selector key | Emits as | Tier |
|---|---|---|
| `hover` | `:hover` | Interaction |
| `active` | `:active` | Interaction |
| `focus` / `focus-visible` | `:focus-visible` | Interaction |
| `focus-within` | `:focus-within` | Interaction |
| `visited` | `:visited` | Interaction |
| `disabled` | `:disabled` | Stacked (disabled) |
| `read-only` | `:read-only` | Stacked (disabled) |
| `checked` | `:checked` | Stacked |
| `indeterminate` | `:indeterminate` | Stacked |
| `expanded` | `[aria-expanded="true"]` | Stacked (ARIA) |
| `pressed` | `[aria-pressed="true"]` | Stacked (ARIA) |
| `selected` | `[aria-selected="true"]` | Stacked (ARIA) |

The three tiers correspond to the conceptual taxonomy:

- **Interaction states** — what the user is doing right now. Stateless from the component's perspective; reset when the interaction stops.
- **Stacked states** — additional attributes that compose with interaction states (a disabled hover, a checked active). Often persistent across interactions.
- **ARIA-derived states** — semantic attributes the runtime sets on the element. Mapped to attribute selectors so they pair with their native equivalents.

Data-state and system-state axes (loading, empty, validation errors, server states) are **not currently in this map**. They live in component props and runtime conditional rendering, not in the slot taxonomy. Future doctrine work may add a `data-axis` field to the contract schema that lets authors declare `loading`, `empty`, `error` etc. as additional slot scopes — emitted as attribute selectors like `[data-loading="true"]`. The path is open; the model just isn't built yet.

## Load-bearing decisions

These choices are not arbitrary. Changing any of them invalidates load-bearing assumptions elsewhere.

### Decision 1: One consumer site per property, not per-variant rules

Variants in `.css` would mean compound selectors like `.button:hover` AND `.button--primary:hover` AND `.button--primary:hover:active` to cover the full matrix. The compound count explodes O(states × variants).

**Why one consumer site:** the cascade handles the matrix for free if the consumer reads a slot and variants redefine it at scope. O(states) consumer reads in `.css` + O(variants) variant blocks in `.tokens.css` = O(states + variants), not O(states × variants).

**Consequence:** authors writing styles.json must remember that state selectors at root (e.g. `"hover"`) live in `.css` as CSS-property reads, while variant selectors (e.g. `"--primary"`) live in `.tokens.css` as slot redefinitions. The migration script enforces this for slot families it recognizes; manual authoring outside that path is honor-system.

### Decision 2: State slots are siblings of the default, not scope-redirections

We tried the alternative — collapsing `<prefix>.color.background.{hover, active, disabled}` into a single canonical and using `.button:hover { --fsds-button-color-background-default: <hover> }` style scope-redirections at the state pseudo-class. That model broke under variant × state intersections: variants also redefined the default slot, source order put the variant rule later, and the hover redefine was silently shadowed.

**Why first-class siblings:** state slots and variant slots are orthogonal axes. Variants redefine all state slots together; state pseudo-class rules read the appropriate state slot. The two axes compose without fighting source order.

**Consequence:** every component with stateful color/border slots authors `<prefix>.<dim>.<concept>.{default, hover, active, disabled}` (and `focus`, etc., as needed). The migration script's `STATE_SUFFIXES` set prevents it from re-collapsing these into scope-redirections.

### Decision 3: The structural state pseudo-class rule lives in `.css`, nested under root

`&:hover { background-color: var(--fsds-button-color-background-hover) }` could live as a top-level selector in `.css`, but nesting it under `.button` makes the structural intent explicit: this is part of the Button's surface, not a separate rule.

**Why nested:** the visual organization of `.css` matches the conceptual hierarchy. The `.button` block holds Button's complete structural surface, including its state reactions. CSS nesting is well-supported (Chrome 112+, Safari 16.5+, Firefox 117+); we already use it for the BEM variant blocks.

**Consequence:** the IR's `renderStyleBlock` for state pseudo-classes emits `&:hover { ... }` form, not `.button:hover { ... }`. The emitter handles this through `toNestedSelector` in `css.ts`.

### Decision 4: Slot-path keys in styles.json disambiguate by dot count

A `styles.json` property key with a `.` in it is treated as a slot-path redefinition; without a dot, it's a CSS property name. CSS properties never contain `.`; slot paths always do.

**Why dot-count disambiguation:** the schema accepts arbitrary string keys via `additionalProperties: { $ref: styleEntry }`. We need a structural rule to tell the codegen whether `background-color` is a CSS property (write `background-color: var(--fsds-...)`) or a slot path (write `--fsds-button-color-background-default: var(--fsds-...)`). Dot count is unambiguous.

**Consequence:** authors who write `background-color` in a variant block get a CSS-property declaration; authors who write `button.color.background.default` get a custom-property redefinition. The two intents are now expressible in the same flat schema.

### Decision 5: Variants in `.css` are reserved for structural variants only

If a variant changes the rendering rule (e.g. `--full-width` adds `width: 100%`), it lives in `.css`. If a variant changes only the values, it lives in `.tokens.css`. Most variants are value-only — colors, padding, sizing — and live in `.tokens.css`. Structural variants are rare but legitimate.

**Why split:** mixing rule-changes and value-changes in one `.css` file would force readers to look in two places for variant behavior. Separating them by what kind of change they are makes each file's purpose load-bearing.

**Consequence:** Button's `--full-width` and `--icon-only` (if they existed) would emit in `.css`; `--small`, `--medium`, `--large`, `--primary`, `--secondary` all emit in `.tokens.css`. The migration script honors this — it doesn't move CSS-property keys from `.css` into `.tokens.css`.

## The pipeline, end to end

```
Author edits:
  components/<Name>/<Name>.tokens.json     (slot declarations + brand-overridable values)
  components/<Name>/<Name>.styles.json     (CSS-property reads + slot redefinitions per scope)
                  ↓ buildComponentIR
                  ↓
IR.cssBlocks                                (flat list of { selector, declarations })
                  ↓ computeCssBlocks
                  ↓   per-block routing:
                  ↓     - CSS-property keys → property declarations
                  ↓     - slot-path keys    → custom-property redefinitions
                  ↓
                  ↓ split by declaration kind (filterGroupedBlock)
                  ↓   - custom-property declarations → tokens.css
                  ↓   - CSS-property declarations    → .css
                  ↓
emitTokensCss → <Name>.tokens.css           (root slot pool + variant scopes)
emitCss       → <Name>.css                  (structural rules, state pseudo-class rules)
```

The two emitters operate on the same IR with different filters; the split is a partition, not a duplication. A regeneration of the same contract always produces the same partition.

## How to author a new color variant

When adding a color variant to a component, the pattern is consistent:

```json
// 1. <Name>.tokens.json — declare default + state slots as siblings
{
  "<name>.color.background.default":  { "resolvesTo": "..." },
  "<name>.color.background.hover":    { "resolvesTo": "..." },
  "<name>.color.background.active":   { "resolvesTo": "..." },
  "<name>.color.background.disabled": { "resolvesTo": "..." }
}
```

```json
// 2. <Name>.styles.json — root reads default; state pseudo-classes read state slots
{
  "root":     { "background-color": { "resolvesTo": "<name>.color.background.default"  } },
  "hover":    { "background-color": { "resolvesTo": "<name>.color.background.hover"    } },
  "active":   { "background-color": { "resolvesTo": "<name>.color.background.active"   } },
  "disabled": { "background-color": { "resolvesTo": "<name>.color.background.disabled" } }
}
```

```json
// 3. <Name>.styles.json — variants redefine ALL state slots at variant scope
{
  "--primary": {
    "<name>.color.background.default":  { "resolvesTo": "semantic...primary.default"  },
    "<name>.color.background.hover":    { "resolvesTo": "semantic...primary.hover"    },
    "<name>.color.background.active":   { "resolvesTo": "semantic...primary.active"   },
    "<name>.color.background.disabled": { "resolvesTo": "semantic...primary.disabled" }
  }
}
```

Run `pnpm run generate -- --target=all <Name>` and the emitter produces both files with the correct partition.

## How to override

### Per-instance, from app code

Set the slot's value at any ancestor scope. The slot is a stable name; the cascade picks the nearest declaration:

```css
.my-tall-button .button {
  --fsds-button-color-background-default: #ff0080;
  --fsds-button-color-background-hover:   #cc0066;
  /* The structural rules in Button.css read these slots; the override resolves there. */
}
```

### Per-brand, globally

Set the semantic token in the brand cascade layer; every component that resolves through that semantic picks it up:

```css
[data-brand="myBrand"] {
  --fsds-semantic-color-action-background-primary-default: #00aa55;
  --fsds-semantic-color-action-background-primary-hover:   #008844;
}
```

Every action component using the primary variant updates without any per-component override.

### Per-density, globally

Same shape as brand — density tokens shift semantic values at `[data-density="..."]` scope:

```css
[data-density="spacious"] {
  --fsds-semantic-action-size-medium-padding-block:  16px;
  --fsds-semantic-action-size-medium-padding-inline: 24px;
}
```

Every action component's box-model padding shifts accordingly.

## Cross-references

- [`docs/architecture/tokens-architecture.md`](./tokens-architecture.md) — the global token graph. Slot resolutions in `.tokens.css` walk up through this graph.
- [`docs/architecture/design/box-model-primitive.md`](./box-model-primitive.md) — the closed slot pool every component inherits. The box-model slots follow the same layering rule as component-local slots.
- [`docs/specifications/states-to-css.md`](./states-to-css.md) — the state→pseudo-class mapping. Defines which `styles.json` selector keys are eligible for the structural-state-rule emission described here.
- [`docs/codegen-authority.md`](./codegen-authority.md) — codegen layer authority. The dot-count disambiguation rule (Decision 4) follows that doc's "rules branch on grammar, not on identity" principle.

## When in doubt

Ask three questions in order:

1. **"Does every instance of this component have this same thing?"** → If yes, it's structural. Goes in `.css`.
2. **"Does this differ by scope (variant, state, density, brand)?"** → If yes, it's a slot resolution. Goes in `.tokens.css`.
3. **"Could a brand author reasonably want to change this without touching the component?"** → If yes, it MUST be a slot — never a hardcoded literal in `.css`.

The system is permissive enough that you can break these rules and still get working CSS. The rules exist so the result composes — through cascade, across variants, under brand and density overrides — instead of fighting itself.
