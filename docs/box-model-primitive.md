---
doc_id: ARCH-BOX-MODEL-PRIMITIVE-001
authority: architecture
status: implemented
title: Box-Model Primitive Slot Pool
owner: "@darianrosebrook"
updated: 2026-05-23
verified_at_commit: 163c3ab
governs:
  - packages/ds-contracts/box-model.primitive.schema.json
  - packages/ds-contracts/primitives/BoxModel.primitive.json
  - packages/ds-codegen/src/box-model.ts
  - packages/ds-codegen/src/cli.ts
  - packages/ds-codegen/src/css.ts
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/validation/styles.ts
---

# Box-Model Primitive Slot Pool

> Companion to [`ARCH-TOKENS-ARCHITECTURE-001`](./tokens-architecture.md) and [`ARCH-CODEGEN-AUTHORITY-001`](./codegen-authority.md). Adds a closed slot surface that every component inherits as a stable, themable substrate for padding, gap, and intrinsic sizing.

This document is the architectural record for the box-model primitive — the closed set of 14 CSS custom properties (`--fsds-box-model-*`) that every generated component declares on its root and reads as default `padding-*`, `gap`, `width/min-width/max-width`, `height/min-height/max-height` values. It exists for the same reason `tokens-architecture.md` exists: a contributor a year from now should be able to read one doc and know **why this surface exists, what guarantees it makes, and which decisions are load-bearing.**

The motivating diagnostic: contract authors were re-declaring `padding-inline-{start,end}`, `min-height`, `max-width`, and similar dimensional slots ad-hoc per component, with no shared vocabulary. Consumers had no reliable slot to override these dimensions short of forking a component or fighting the cascade with class overrides. The box-model primitive resolves both: authors get a default that's always present, consumers get a stable override surface.

## What this proves

The box-model primitive provides:

1. **A closed slot enumeration.** `packages/ds-contracts/box-model.primitive.schema.json` lists exactly 14 legal slot names. New slots can only be added by extending the schema; component sidecars cannot introduce new slot names. The schema's `additionalProperties: false` is the gate.
2. **A constrained literal vocabulary.** Slot literals must match the box-model value pattern — `0`, `auto`, `none`, `min-content`, `max-content`, `fit-content`, a CSS length / percentage / viewport / `fr` / `ch` unit, a `calc(…)` expression, or a `var(--…)` reference. Free-form strings (`"Bananas"`) fail schema validation. The pattern lives in the schema, not in code, so themes that extend the pool must extend the pattern explicitly.
3. **A canonical default per slot.** `packages/ds-contracts/primitives/BoxModel.primitive.json` declares the defaults — padding / gap = `0`, width / height = `auto`, min-* = `0`, max-* = `none`. Every component inherits these without authoring any `box-model.*` keys in its sidecar.
4. **An author-override mechanism.** Component sidecars (`<Name>.tokens.json`) may declare any subset of the slot names; authored entries win over the primitive's defaults at IR-build time via `mergeBoxModelDefaults`. The merge is one-directional: authors override defaults, never the reverse.
5. **Auto-consumption on every component root.** The codegen emits 11 longhand declarations (`padding-block-start: var(--fsds-box-model-padding-block-start)`, etc.) on every `<Name>.css` root selector. The slot is not just declared — it's read. Application overrides at `--fsds-box-model-padding-inline-start: 24px` actually change the rendered padding.
6. **Portal-aware scope discipline.** Components whose contract sets `behavior.portal.enabled` hoist their component slots to `:root` (so portaled content can read them outside the `.<cssPrefix>` ancestor) but keep box-model slots scoped to `.<cssPrefix>`. Two simultaneously-open portal components cannot race for `:root`-defined box-model values.
7. **A validate-time typo gate.** `validateBoxModelTokens` runs at sidecar-load time and at watch-mode reload. A typo (`box-model.padding-inlne-start`) or an out-of-vocabulary literal fails CLI with a JSON-pointer to the failing slot, before any emission happens.

## What this does NOT prove

Per the convention established in `tokens-architecture.md`, the load-bearing absences:

- **It does not prove that every component is visually correct after adoption.** Adding `padding-block-start: 0` etc. to every root makes the rule explicit where previously no rule existed. For components that relied on inherited padding from an ancestor, this would visually regress. A visual audit of all 47 components in the showcase has not been performed at this doc's writing — the false-confidence risk is documented in the commit (`163c3ab`).
- **It does not prove consumer override behavior in practice.** The cascade is sound by construction: app sets `--fsds-box-model-padding-inline-start: 24px` on `.button` or an ancestor → the slot's resolved value changes → the consumer declaration on `.button` reads the new value → padding changes. But this chain is not exercised by an end-to-end browser test in the current suite; it is verified by inspection of emitted CSS plus unit tests against the emitter's output string.
- **It does not prove that box-model defaults are correct for every component.** `width: auto` and `padding: 0` are conservative defaults for inline-flex / inline-block components. A block-level component that visually expects `width: 100%` will need to either (a) author `box-model.width = "100%"` in its tokens.json or (b) override `width` in its `styles.root`. The doc lists this as a known authoring concern, not a system bug.
- **It does not prove cross-portal-component isolation under contrived layering.** The portal-split keeps box-model slots on `.<cssPrefix>`, which means a portaled descendant of `document.body` will not inherit box-model values from the trigger's `.<cssPrefix>` ancestor. Components that need custom sizing on the portaled content node must declare it via the existing `[data-<prefix>-content]` selector in styles.json. The system surface this implies — that "box-model slots are only reachable on the visual surface where the component renders" — is documented; it is not enforced by a separate validator.
- **It does not prove that `gap`, `width`, and `height` work identically across HTML elements.** Auto-consumption on the root means `<table>`-tagged compound parts also gain `gap: var(--fsds-box-model-gap)`. CSS `gap` on a native `<table>` is not supported (use `border-spacing`). The current contract surface does not declare any component that maps a root to `<table>`, so the bug-shape is latent; if one is added, the emitter rule will need a tag-keyed branch (see `docs/codegen-authority.md` for the binding rule about emitter branches).

## The authority split

```
Schema (ds-contracts/                declares which slot names exist
  box-model.primitive.schema.json)   and what literal values are legal
Primitive (ds-contracts/             declares the canonical defaults per slot
  primitives/BoxModel.primitive.json)
Loader (ds-codegen/box-model.ts)     loads + validates the primitive once
                                     per process; exposes slot enumeration
                                     and the default resolution map
Sidecar merge (cli.ts)               at sidecar load, splits `box-model.*`
                                     from component slots, validates the
                                     box-model partition against the schema,
                                     and merges defaults UNDER author entries
IR (ir.ts)                           treats box-model slots and component
                                     slots identically — both flow through
                                     `renderTokenSlots` → root selector
Emitter (css.ts)                     adds the 11 longhand consumer declarations
                                     on every root, ahead of styles.root author
                                     rules; portal-splits box-model from
                                     component slots when emitting
Styles validator                     recognizes `box-model.*` as a first-class
  (validation/styles.ts)             namespace (alongside cssPrefix-local and
                                     global-graph paths) so styles.json may
                                     `resolvesTo: "box-model.padding-..."`
                                     without tripping the unknown-token check
```

### Schema owns the slot vocabulary

The schema is the source of truth for *what slot names exist* and *what shapes of value are legal*. Adding a new slot (`box-model.outline-width`, say) is a one-line addition to `properties` plus the matching default in `BoxModel.primitive.json`. The loader picks both up automatically — there is no separate TypeScript enumeration to update. New literal-vocabulary entries (a new unit, say `dvh`) require editing the regex in `box-model.primitive.schema.json`'s `boxModelResolution` pattern.

### Primitive owns the defaults

`BoxModel.primitive.json` is a flat JSON map keyed by slot name with `tokenResolution` values. Defaults today are all literals (`0`, `auto`, `none`). They are deliberately not token-graph-backed — the primitive should not pin every consumer to one specific spacing scale. A theme or brand that wants `box-model.padding` to default to `core.spacing.size.02` can override at the **brand layer** of the global token graph by declaring `--fsds-box-model-padding: var(--fsds-core-spacing-size-02, 8px);` under `[data-brand="…"]`. The primitive itself stays minimal.

### Component sidecars own per-component overrides

A component's `<Name>.tokens.json` may declare any subset of the 14 slot names alongside its normal `<cssPrefix>.*` keys. Authoring `box-model.padding-inline-start` with `{ resolvesTo: "core.spacing.size.05", fallback: "12px" }` causes the merge to drop the default literal and emit `var(--fsds-core-spacing-size-05, 12px)` instead. The override is opt-in per slot — a Button can override `padding-inline-{start,end}` without touching `width` or `gap`.

Component sidecars are **not** allowed to: declare slot names outside the 14-slot enum, or write literals outside the constrained vocabulary. Both fail at `validateBoxModelTokens` time.

### Emitter owns realization, not policy

The codegen's contribution is mechanical:
- `renderTokenSlots` walks every slot (box-model and component, indistinguishable at this layer) and emits `--<slug>: <value>;` on the root selector.
- `renderBoxModelConsumers` returns a fixed 11-entry map (`padding-block-start: var(--fsds-box-model-padding-block-start)`, etc.) which merges into the root block ahead of any author-supplied `styles.root` entries.
- `emitTokensCss` splits box-model from component slots on portal-enabled components: component slots → `:root`, box-model slots → `.<cssPrefix>`.

The emitter does not decide which slots exist, what their defaults are, or which CSS properties consume them. Those are facts the schema, the primitive, and the consumer block carry. The emitter only realizes those facts in framework-neutral CSS.

## The non-negotiable invariant

> **Every component root selector declares all 14 `--fsds-box-model-*` slots and consumes the 11 longhand slots, regardless of whether the component's sidecar overrides any of them.**

The pool is always available. Consumers can always reach `var(--fsds-box-model-padding-inline-start)` from app CSS and have a defined value to override. Authors can always reach the slot via `resolvesTo: "box-model.<slot>"` in `styles.json`. The "is it set?" question never has to be asked.

The invariant is enforced by:

- `mergeBoxModelDefaults` at sidecar load — every component gets the full slot pool merged in, even when the sidecar is absent entirely.
- `renderBoxModelConsumers` in `computeCssBlocks` — every root block gets the 11 longhand consumers, unconditionally.
- The styles-validator `box-model` branch — `styles.json` references to `box-model.<slot>` resolve against the schema's slot enumeration, not against the component's local sidecar (because the slot is guaranteed to exist on the root regardless of authoring).

## The injection pattern

This primitive realizes the **injection mold** pattern: a closed slot pool, defined once at the contract layer, is automatically present on every component's root selector. The pattern's properties:

1. **Stable surface.** The 14 slot names are a public API. Consumer apps and brand authors can rely on `--fsds-box-model-padding-inline-start` existing on every component's root forever (or until the next major version moves the enum). No "does Button declare this?" lookup.
2. **No retroactive authoring.** When a component is added, its box-model surface exists from the first emission. Authors do not have to remember to add a `min-height` slot, or copy a `padding` declaration from another component.
3. **Override transparency.** A consumer setting `--fsds-box-model-max-width: 480px` on `.dialog` sees the change at the `.dialog` root; the consumer block reads the slot directly, so the rendered value updates without specificity wars.
4. **Schema-bounded extension.** Adding a slot to the pool is an explicit schema edit. Schemas are reviewed; ad-hoc proliferation in sidecars is not. The closed enum is the load-bearing part — without it, the pool would erode into the same per-component drift that motivated the primitive.

Contrast this with the "ad-hoc per-contract" pattern that preceded it: Button authored `--fsds-button-size-padding-block-{small,medium,large}`, `--fsds-button-size-minHeight-{small,medium,large}`, etc. — six padding slots and three min-height slots, all variant-keyed. Switch authored `--fsds-switch-size-{sm,md,lg}-track-padding`, `--fsds-switch-size-{sm,md,lg}-track-width`, etc. — different naming, different granularity, same conceptual surface. The box-model primitive does not replace those variant-keyed slots — they remain for variant-driven sizing — but it adds a unified default-and-override surface that exists on every component regardless of whether variants are in play.

## Load-bearing decisions

These choices are not arbitrary. Changing any of them invalidates load-bearing assumptions elsewhere — call out the breakage if you propose to.

### Decision 1: Closed slot enum, not pattern-match

The schema enumerates each of the 14 slot names explicitly, with `additionalProperties: false`. Alternatives considered: pattern-matched keys (`^box-model\\.[a-z-]+$`) with the validator policing names externally; open `additionalProperties` with a documented convention.

**Why closed enum:** the slot pool IS the public API. A pattern would invite undocumented slot names that "look right" but no consumer knows to read. The closed enum forces every new slot through schema review, where someone has to decide whether it belongs in the primitive (every component) or in component-local tokens (one component's vocabulary).

**Consequence:** adding a slot is a schema edit + a primitive default + every framework's emission picks it up automatically. There is no "register a new slot" code path; the schema is the registration.

### Decision 2: Drop margin

The pool covers padding, gap, width, height. It does **not** cover margin.

**Why:** margin-based component layout fights consumers. A component that declares `margin-top: 8px` on its root cannot be cleanly placed at the top of a section, and the override path (`margin-top: 0 !important` from the app) is exactly the cascade fight the slot pool is supposed to prevent. Spacing between siblings is the parent layout's responsibility — `Stack`'s `gap` prop, the parent component's flex/grid wiring, or the document author's margin choice. The component's box-model is its internal box; the gap between components is the surrounding layout's box.

**Consequence:** if a contract author needs a "margin-from-self" behavior, they should compose with `Stack` and rely on its `gap`, or document the spacing requirement at the consumption site. Adding `margin` to the pool would re-open the fight this decision exists to close.

### Decision 3: Drop border

The pool covers padding, gap, width, height. It does **not** cover border-width / border-style / border-color.

**Why:** not every component renders a border. Text, Icon, Label, Spinner, and other glyph-like components have no border in their default rendering; auto-declaring `--fsds-box-model-border-width: 0` on every root pollutes the slot surface with a fourteenth-of-the-pool that doesn't apply to most consumers. Border, when used, is typically variant- or state-keyed (focus ring, disabled outline, kind=outline) and lives naturally in the component's local token surface.

**Consequence:** a component that wants a themable border declares it in its own `<cssPrefix>.color.border.*` / `<cssPrefix>.size.border` slots, as Button and Card already do. The primitive deliberately does not subsume that surface.

### Decision 4: Logical-axis padding only

The padding slots use CSS Logical Properties — `padding-block-{start,end}`, `padding-inline-{start,end}` — not physical (`padding-top/right/bottom/left`).

**Why:** RTL support is non-negotiable for an internationalizing design system. Physical naming would force every RTL consumer to either fight the cascade or commit to a logical-mode subclass. Logical axes are the modern CSS default; the slot vocabulary should mirror that.

**Consequence:** authors who want per-side overrides in physical terms must convert mentally — `padding-left` in LTR = `padding-inline-start`. Documentation should make this conversion clear at the consumption site. We do not provide physical aliases (e.g. `box-model.padding-left → box-model.padding-inline-start`) because aliasing would double the slot surface for no semantic gain.

### Decision 5: Auto-consume longhands only, not shorthands

The pool declares 14 slots (3 shorthand: `padding`, `padding-block`, `padding-inline`; 11 longhand: the four `padding-*-start/end` plus gap/width/min-width/max-width/height/min-height/max-height). Auto-consumption emits property declarations for **only the 11 longhands**.

**Why:** if the codegen auto-emitted both `padding: var(--fsds-box-model-padding)` AND `padding-inline-start: var(--fsds-box-model-padding-inline-start)` on the same rule, the cascade between them would depend on declaration order — surprising to authors and brittle under future emitter changes. Choosing longhand consumption gives authors one consistent override granularity.

**Consequence:** the shorthand slots (`box-model.padding`, `box-model.padding-block`, `box-model.padding-inline`) are present in the slot pool but no consumer reads them automatically. They exist for authors who want to reference them explicitly from `styles.json` (`padding: { resolvesTo: "box-model.padding" }`) when a one-line all-sides declaration is appropriate. App-level overrides that set the shorthand without also setting the longhands have **no effect** on the rendered padding — the longhand consumers read their own slots, not the shorthand. This is a documented limitation, not a bug; auto-connecting shorthand to longhand via nested `var()` fallback is described under [Future work](#future-work).

### Decision 6: Author overrides win over defaults; styles.root wins over auto-consumers

Two precedence rules in the root block:

```
slotDeclarations (defaults + author overrides, author wins)
  ⊕ boxModelConsumers (the 11 longhand var() lines)
  ⊕ rootStyleDeclarations (styles.root author rules, author wins)
```

The object-spread order in `computeCssBlocks` realizes this: defaults merge first, then box-model consumers, then `styles.root` author rules. Later spreads overwrite earlier same-key entries.

**Why:** authors writing `styles.root.padding-inline-start: { ... }` already expect that declaration to be authoritative for that component. The box-model consumer block should fill in only where no explicit author rule exists. Defaults losing to overrides on the slot side (and consumers losing to `styles.root` on the property side) is the only precedence that respects author intent at both layers.

**Consequence:** a component that wants to disable box-model auto-consumption for a specific property declares it explicitly in `styles.root`. Example: Button's `gap` value comes from `--fsds-button-size-gap-default` via `styles.root.gap`, not from `--fsds-box-model-gap`, because the author rule wins via the spread order. The box-model `gap` slot is still declared and still available for app-level override — but the consumer site for `gap` reads the component-local slot, not the box-model slot.

### Decision 7: Portal-aware split, not unscoped `:root` hoist

When a component's contract sets `behavior.portal.enabled = true`, `emitTokensCss` splits the root block: component slots hoist to `:root`, box-model slots stay on `.<cssPrefix>`.

**Why:** box-model slot names are unscoped (`--fsds-box-model-padding-inline-start`, not `--fsds-modal-box-model-padding-inline-start`). If two portal components both hoisted box-model to `:root`, they would race — last-loaded `:root` wins, and an open Dialog could affect Drawer's padding. Keeping box-model on `.<cssPrefix>` preserves per-component override discipline even for portaled surfaces. The portaled content node, when it needs box-model values, reads them from the wrapping element's `.<cssPrefix>` ancestor (true for Dialog's `.dialog__modal`, which is a descendant of `.dialog`).

**Consequence:** a portaled surface that genuinely needs box-model values on a node that escapes `.<cssPrefix>` must declare its own slot set on the data-attribute selector (`[data-modal-content]`). The system does not provide an automatic escape for this case because the case is rare and the cost of universal `:root` hoist (cross-component leak) is unacceptable.

## The pipeline, end to end

```
box-model.primitive.schema.json   ← schema (closed enum + literal vocabulary)
                  ↓ Ajv compile (createContractValidator.validateBoxModelTokens)
                  ↓
primitives/BoxModel.primitive.json ← canonical defaults
                  ↓ loadBoxModelPrimitive (cached per process)
                  ↓   - parses + validates the primitive against the schema
                  ↓   - exposes { slotNames, defaults }
                  ↓
components/<Name>/<Name>.tokens.json    ← author overrides (optional)
                  ↓ cli.ts sidecar load
                  ↓   - validateTokens (component schema)
                  ↓   - partitionBoxModelTokens → { boxModel, component }
                  ↓   - validateBoxModelTokens(boxModel) — typo gate
                  ↓   - mergeBoxModelDefaults — author wins over defaults
                  ↓
buildComponentIR(contract).cssBlocks   ← IR carries the full slot pool
                  ↓ computeCssBlocks
                  ↓   - renderTokenSlots → root declarations
                  ↓   - renderBoxModelConsumers → 11 longhand consumers
                  ↓   - rootStyleDeclarations → styles.root author rules
                  ↓
emitTokensCss / emitCss               ← <Name>.tokens.css + <Name>.css
                  ↓
                  - .tokens.css: --fsds-box-model-* slot declarations on
                    .<cssPrefix> (or :root for component slots, .<cssPrefix>
                    for box-model slots, on portal-enabled components)
                  - .css: 11 longhand `var(--fsds-box-model-*)` consumer
                    lines on the .<cssPrefix> root, ahead of author rules
```

## Classified inventory of the slot pool

| Slot | Type | Default | Auto-consumed | Notes |
|---|---|---|---|---|
| `box-model.padding` | shorthand | `0` | no | Available for explicit `styles.json` reference. |
| `box-model.padding-block` | shorthand | `0` | no | Authors may reference; does not auto-bind to longhands. |
| `box-model.padding-block-start` | longhand | `0` | **yes** | Emitted on every root. |
| `box-model.padding-block-end` | longhand | `0` | **yes** | Emitted on every root. |
| `box-model.padding-inline` | shorthand | `0` | no | Authors may reference; does not auto-bind to longhands. |
| `box-model.padding-inline-start` | longhand | `0` | **yes** | Emitted on every root. RTL-aware. |
| `box-model.padding-inline-end` | longhand | `0` | **yes** | Emitted on every root. RTL-aware. |
| `box-model.gap` | longhand | `0` | **yes** | For flex/grid containers; harmless on non-container roots. |
| `box-model.width` | longhand | `auto` | **yes** | Intrinsic; consumer override expected for fluid layouts. |
| `box-model.min-width` | longhand | `0` | **yes** | Lower bound. |
| `box-model.max-width` | longhand | `none` | **yes** | Upper bound. |
| `box-model.height` | longhand | `auto` | **yes** | Intrinsic. |
| `box-model.min-height` | longhand | `0` | **yes** | Lower bound; common override target (Button min-height). |
| `box-model.max-height` | longhand | `none` | **yes** | Upper bound. |

## How to override a box-model slot per component

In the component's `<Name>.tokens.json`:

```json
{
  "box-model.padding-inline-start": {
    "resolvesTo": "core.spacing.size.05",
    "fallback": "12px",
    "layer": "core"
  },
  "box-model.min-height": {
    "resolvesTo": "core.dimension.actionMinHeight",
    "fallback": "36px",
    "layer": "core"
  }
}
```

Run `pnpm run generate -- --target=all <Name>` and the emitted `.tokens.css` reflects the override:

```css
.button {
  /* ... other slots ... */
  --fsds-box-model-padding-inline-start: var(--fsds-core-spacing-size-05, 12px);
  --fsds-box-model-min-height: var(--fsds-core-dimension-actionMinHeight, 36px);
  /* ... unchanged slots stay at literal defaults ... */
}
```

Validation:
- The `resolvesTo` path must exist in the global token graph (gated by `validateContractTokens`).
- The slot name must be one of the 14 in the schema (gated by `validateBoxModelTokens`).
- The fallback must match the box-model literal vocabulary (gated by the schema's pattern).

## How to override a box-model slot from app code

Set the CSS custom property on `.<cssPrefix>` or any ancestor:

```css
/* App-level: override min-height for one button instance. */
.my-tall-button .button {
  --fsds-box-model-min-height: 64px;
}

/* App-level: override max-width on every Dialog globally. */
.dialog {
  --fsds-box-model-max-width: 720px;
}
```

The consumer block on `.button` reads `min-height: var(--fsds-box-model-min-height)`, so the override changes the rendered min-height. No `!important`, no specificity fight — the slot is the single read site, and the cascade resolves it at the most specific declaration.

## How to add a new slot to the pool

Adding a slot is a deliberate schema change with primitive defaults and (usually) a new consumer line. Steps:

1. Add the slot name to `box-model.primitive.schema.json`'s `properties` block.
2. Add a default in `primitives/BoxModel.primitive.json`.
3. If the slot is a longhand that should auto-consume, add the corresponding entry to `renderBoxModelConsumers()` in `packages/ds-codegen/src/ir.ts`.
4. Update the inventory table in this document.
5. Regen all 5 frameworks: `pnpm run generate -- --target=all`.
6. Run the suite: `pnpm exec vitest run packages/ds-codegen/src` and `pnpm run test:frameworks`.

The schema is the public API; do not add slots in code without the schema edit.

## How to add a new literal-vocabulary entry

If a future slot wants a value form the current regex rejects (e.g. `dvh` viewport units, CSS functions like `clamp(…)`), edit the `pattern` field on `boxModelResolution.properties.{literal,fallback}` in `box-model.primitive.schema.json`. Re-run the validator (`pnpm exec vitest run packages/ds-codegen/src/box-model.test.ts`) to confirm:

- The new pattern accepts the intended new form.
- The new pattern still rejects free-form strings (the negative-case test should still pass).

## Cross-references

- [`docs/component-layering.md`](./component-layering.md) — the `.css` (structure) vs `.tokens.css` (resolution) layering rule and the variant-redirection pattern. Box-model slots participate in this rule: their declarations land in `.tokens.css` while the longhand consumer reads (`padding-block-start: var(...)`) land in `.css` as part of every component's structural surface.
- [`docs/tokens-architecture.md`](./tokens-architecture.md) — design-token graph architecture. The box-model primitive sits adjacent: it defines a slot pool, not new global tokens. Box-model slots may `resolvesTo` paths in the token graph, and the graph's `--fsds-` prefix convention applies (the box-model slots are `--fsds-box-model-*`).
- [`docs/codegen-authority.md`](./codegen-authority.md) — codegen layer authority. Box-model auto-consumption is a universal emitter rule (applies to every component regardless of identity) and therefore does not violate the binding rule about component-name branches.
- [`docs/admission-rail.md`](./admission-rail.md) — the rail's "evidence is inspectable, claims are bounded" philosophy applies here too. Box-model emission is byte-stable; the convergence validator (`validateContractEmittedCss`) catches drift between contract authoring and emitted artifact on the slot side.
- [`docs/normal-form.md`](./normal-form.md) — the box-model primitive is one slot pool, not five. Property-2 (framework-neutral IR) is realized by handling box-model in `ir.ts` once; every framework picks it up via the existing CSS emit path.

## Future work

These are scoped, removable extensions of the current surface. Each is gated on a real demand — do not implement preemptively.

- **Shorthand → longhand fallback chain.** Today, `--fsds-box-model-padding: 16px` set by an app has no effect because no longhand reads it. A future emitter pass could rewrite each longhand consumer's `var()` to chain through the shorthand: `padding-block-start: var(--fsds-box-model-padding-block-start, var(--fsds-box-model-padding-block, var(--fsds-box-model-padding, 0)))`. Doable but adds 4 levels of `var()` nesting per longhand and increases generated CSS volume by ~10%. Defer until an app integration actually requests shorthand-only overrides.
- **Per-component opt-out.** A contract could declare `boxModel: { enabled: false }` to suppress the slot pool entirely (useful for components where the entire surface is irrelevant — Text, Label, Icon). The auto-consumer block would skip on those roots. Defer until the slot pool causes a concrete visual regression that an author cannot override via `styles.root`.
- **Density-driven defaults.** The defaults are currently all literals (`0`, `auto`, `none`). A future revision could pin them to density-graph entries (`--fsds-box-model-padding-inline-start` defaults to `var(--fsds-density-padding-control, 0)`) so density changes (`[data-density="spacious"]`) automatically resize every component's padding. Defer until density tokens for sizing exist (currently density covers spacing only, not control sizing).
- **Box-model on portaled descendants.** A portaled surface that wants box-model on a node escaping `.<cssPrefix>` could declare a sidecar selector (e.g. `[data-modal-content]`) where box-model slots also emit. Defer until a real component needs it.

## When in doubt

Ask: "Does this dimensional concern belong to every component, or only this one?"

- **Every component** (a new padding axis, a new size bound): extend the box-model schema. Slot enters the universal pool.
- **Only this component** (variant-keyed padding for Button sizes, track-width for Switch): keep it in the component's local token surface (`<cssPrefix>.size.padding-block.small`). The box-model primitive is the floor, not the ceiling — local slots layer on top.

Ask: "Will an app consumer reasonably want to override this?"

- **Yes**: belongs in box-model (consumer-visible slot, stable name).
- **Sometimes, but only as a brand-level identity choice**: belongs in the global token graph at the brand layer, not in the box-model pool.
- **No, it's an internal mechanism**: keep it in component-local tokens, hidden from the consumer surface.

The slot pool is closed for a reason. Adding slots should be a deliberate act of expanding the public API, not a reaction to one component's authoring need.
