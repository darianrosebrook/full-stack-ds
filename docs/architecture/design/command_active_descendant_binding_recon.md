---
doc_id: ARCH-COMMAND-ACTIVE-DESCENDANT-RECON-001
authority: working
status: draft
title: Command active-descendant binding — recon
owner: "@darianrosebrook"
updated: 2026-05-26
governs:
  - packages/ds-contracts/components/Command/Command.contract.json
  - packages/ds-{react,vue,svelte,angular,lit}/src/components/Command/**
note: |
  Non-normative until COMMAND-ACTIVE-DESCENDANT-MECHANISM-01 (the named
  successor slice) is authorized. This document captures the inspection
  performed under slice COMMAND-ACTIVE-DESCENDANT-BINDING-01 and the
  reason that slice landed as a doc-only recon, not an implementation.
  Authority is `working` (informal, non-normative); status `draft` is
  the doc-governance fit for "recon-only, not yet acted on." When the
  successor slice activates, this doc should either be superseded by an
  `adr`/`spec` document and marked `superseded` here, or archived.
---

# Command active-descendant binding — recon

Slice **COMMAND-ACTIVE-DESCENDANT-BINDING-01** investigated whether Command's
remaining `role="option"` / `aria-selected` obligation suppression could be
repaid using the V2 grammar (iteration locals, paths, predicates) that
landed across the prior arc. The investigation found that Command lacks
every contract-level surface needed to wire `aria-activedescendant`
truthfully. This document records the inventory, classifies the
suppression, and names the successor slice.

## 1. Current Command inventory

### 1.1 Contract channels present

| Channel | Type | Purpose |
|---|---|---|
| `open` | `boolean` | Whether the command palette is visible |
| `search` | `string` | Current search query |

**Missing**: no `activeIndex`, `activeId`, `highlight`, or any other channel
expressing the keyboard navigation cursor over the option list.

### 1.2 Contract intent (declarative only)

The contract's `relationships` field declares:

```json
{
  "from": "input",
  "to": "item",
  "attribute": "aria-activedescendant",
  "when": "openness=expanded",
  "description": "Points to the currently highlighted item's id."
}
```

This is **documentation of intent**, not a codegen-emittable mechanism.
The relationships field is not currently consumed by any emitter to
produce DOM bindings. It records the design intent for human readers and
future tooling.

The contract's `focus.description` echoes the same:

> Highlighted option is tracked via aria-activedescendant.

Again — descriptive, not productive.

### 1.3 DOM topology

The `anatomy.dom` block places exactly **one** `item` div (with
`role="option"`) statically inside `groupItems`. No `iterate.kind: "array"`
directive, no source prop, no per-item rendering.

### 1.4 No items prop

The contract declares a type definition under `dataModel.entities.CommandItem`
with fields `value`, `label`, optional `description`/`icon`/`disabled`, and
`onSelect` — but **no `items: CommandItem[]` prop** anywhere in
`props.styled.members`. The current model expects consumers to provide
items via children (with `children.allowed: false` in `a2ui` — itself an
inconsistency this slice does not resolve).

### 1.5 No deterministic item identity

Without an items prop, there is no array index or stable key the codegen
could project into an option `id` attribute. Even the static option div
in the current contract carries no `id` binding.

### 1.6 No runtime cursor state

All five generated framework Command hooks (`useCommand` for
React/Vue/Angular, `Command.svelte` for Svelte, `CommandBehavior.ts` for
Lit) expose only:

- `open` / `setOpen` (from `useAnchorToggle`)
- `search` / `setSearch` (from `useControllableState`)
- portal/anchor refs

**None** track an active item, active index, or highlight cursor. Their
`@custom:start` regions are empty across all five frameworks.

### 1.7 No keyboard navigation in hooks

The contract's `a11y.keyboard` block declares `ArrowDown`, `ArrowUp`,
`Enter`, `Escape`, `Tab` semantics, but none of these are wired into any
framework's runtime hook. The `keyboard` field is descriptive — it lists
expected behavior for human readers and future implementation, not
behavior the codegen currently emits.

## 2. Why predicate / memberOf is the wrong mechanism

Select's `aria-selected` suppression (paid in
**BINDING-EXPRESSION-V2-PREDICATE-01**) was a *selected-value comparison*:
"is this option's value present in the channel's selection value?" Closed
binary predicate `predicate:memberOf(iter:item.value, channel:selection.value)`
expressed that truthfully.

Command's `aria-selected` debt is not a value comparison:

1. **Command has no `selection` channel**. There is no persistent
   "selected" state for command items — execution is fire-and-forget via
   `CommandItem.onSelect`. Each item is an action, not a value.

2. **The semantically correct attribute is `aria-activedescendant`**, not
   `aria-selected`. Per the contract's own documentation and WAI-ARIA's
   combobox pattern, the input retains DOM focus while the listbox shows
   results; the *highlighted* item is communicated via
   `aria-activedescendant` on the input, pointing to the option's `id`.
   This is *identity projection*, not value membership.

3. **Active-descendant is a 1-to-1 owner→child reference**, while
   memberOf is a many-to-one set-membership check. Trying to express
   "is this item active?" via memberOf would require a single-element
   array (`predicate:memberOf(iter:item.id, [activeId])`) — which is
   syntactically possible but semantically dishonest: it pretends a
   one-element collection where a single identity reference exists.

   Worse, it would project to **per-item `aria-selected`** when the
   spec-correct attribute is **per-owner `aria-activedescendant`**.

4. **APG mismatch**. WAI-ARIA's combobox APG specifies
   `aria-activedescendant`; emitting `aria-selected` on each option would
   pass the static-role obligation validator without addressing the real
   accessibility surface. The suppression is honest precisely because it
   refuses to fake the obligation.

## 3. Required surfaces (four)

A truthful Command active-descendant repayment requires four contract-
and emitter-level surfaces that do not exist today:

### 3.1 Item source surface

A way to express "a collection of N options" the codegen can iterate over.
Two viable shapes:

| Shape | Pros | Cons |
|---|---|---|
| `items: CommandItem[]` prop with contract default | Mirrors Select's pattern landed in V2-PREDICATE-01; reuses existing iteration grammar | Conflicts with current `children.allowed: false` posture and the slot model declared in `slots` |
| Slot-children identity model with per-child id | Preserves consumer-provided child composition | Requires a new "stable child id" mechanism that does not exist today; no other component uses it |

The first shape is the lower-cost extension because the iteration
grammar (`iterate.kind: "array"`), object-path projection
(`iter:item.value`), and array defaults are all already part of V2 +
PRODUCTION-OBJECT-ARRAY-CONSUMER-01.

### 3.2 Active cursor surface

A new channel (or governed state surface) expressing the keyboard
navigation cursor. Two viable shapes:

| Channel name | Value type | Notes |
|---|---|---|
| `channel:activeIndex` | `number` | Mirrors Walkthrough's `step` channel; simplest to compare against `iter:index` |
| `channel:activeId` | `string` | More flexible if items have stable ids independent of position; requires id derivation to be settled first |

Both require the corresponding runtime hook surface — a piece of state
that ArrowUp/ArrowDown handlers mutate. That runtime surface is **not in
this recon's scope**; it belongs to the successor slice.

### 3.3 Deterministic id surface

A binding form that derives a stable option `id` reproducible across
frameworks. Three candidate shapes (closed grammar — not arbitrary
expressions):

| Form | Example | Notes |
|---|---|---|
| `iter:id` | `id="${iter:id}"` | New `iterationLocal`-kind that resolves to a per-iteration unique string |
| Literal template + iter | `id="fsds-command-item-${iter:index}"` | Requires a new literal-with-interpolation form; not currently in the grammar |
| Contract-level id-prefix + `iter:index` projection | Contract declares `idPrefix: "fsds-command-item"`, codegen emits `\`${idPrefix}-${index}\`` | Closest to existing patterns (`cssPrefix`); no new binding kind needed |

The third option is the most economical because it reuses contract-level
naming conventions and existing iteration semantics; no new grammar atom.

### 3.4 Owner projection surface

A binding form that points `aria-activedescendant` on the owning input
(or root) to the *current* item's id. This is the heart of the mechanism:
mapping `channel:activeIndex.value` (or equivalent) to the matching
item's id.

Candidate closed binding forms (none currently exist):

| Form | Semantics | Notes |
|---|---|---|
| `activeDescendant:channel:activeIndex.value` | Owner-side: resolve cursor channel to an item id via the id derivation | New top-level binding kind; the most explicit |
| `predicate:activeIs(iter:index, channel:activeIndex.value)` | Per-item: boolean "am I the active item?" emitted as a class or data attribute (NOT `aria-selected`) | Per-item boolean is useful for `data-active` styling hooks but does NOT solve `aria-activedescendant` (which is per-owner) |

The two are complementary, not equivalent: `activeDescendant:` projects
the **owner** attribute; `predicate:activeIs` projects a **per-item**
boolean useful for CSS state styling. A complete successor likely needs
both.

## 4. Suppression classification

Command's `a11y.obligations.suppress[0]` (`role="option"`,
`attr="aria-selected"`) is hereby reclassified:

- **Not "paid"** — no emitted DOM binding has landed for `aria-selected`
  or `aria-activedescendant` on Command since the suppression was
  written.
- **Not "permanent"** — the WAI-ARIA combobox APG defines the truthful
  mechanism; Command's authors intend to support it; the obstruction is
  contract/codegen plumbing, not architectural impossibility.
- **Reclassified as "blocked pending active-descendant mechanism"** —
  the suppression remains in place, with a refreshed reason whose
  authority comes from this recon document.

`aria-selected` must **not** be emitted on Command's option element
unless Command develops a selected-value or selected-item semantic
distinct from active-cursor. Today it has neither. Faking `aria-selected`
via `predicate:memberOf` or any other mechanism would pass the static-role
obligation validator while silently misleading assistive technology
about the actual interaction model.

## 5. Successor proposal

The named successor is **COMMAND-ACTIVE-DESCENDANT-MECHANISM-01**.

### 5.1 In-scope (for the successor)

1. Add `items: CommandItem[]` prop with contract default seeding (mirrors
   Select / Walkthrough seeding patterns landed in V2 arc).
2. Add `channel:activeIndex` with `valueType: "number"` and a hook
   surface (`setActiveIndex` setter).
3. Add a deterministic id mechanism — preference for contract-level
   `idPrefix` + `iter:index` projection (Section 3.3 option 3), no new
   grammar atom.
4. Add an `activeDescendant:` binding form OR a richer literal-template
   mechanism sufficient to express
   `aria-activedescendant="${idPrefix}-${activeIndex}"` (Section 3.4
   option 1). Authority for this addition: the mechanism is closed
   (single channel-value resolution), not a general expression language.
5. Wire `iterate.kind: "array"` on the option node, mirroring Select.
6. Emit `id` and `aria-activedescendant` on the appropriate elements.
7. Update suppression: drop the `aria-selected` entry; the static-role
   obligation validator will pass because the option's selection state
   is communicated through the input's `aria-activedescendant` and a
   per-item `data-active` (not `aria-selected`).
8. Runtime rail facts: Command renders N options, exactly one has
   `data-active="true"` (or equivalent), the input's
   `aria-activedescendant` equals that option's id.

### 5.2 Out of scope (for the successor, unless separately authorized)

1. **Full keyboard navigation behavior**. ArrowUp/ArrowDown mutating
   `setActiveIndex` is a runtime behavior question. The successor may
   land the *state surface* (`activeIndex` + `setActiveIndex`) without
   wiring keyboard handlers; consumers (or a follow-up slice) can drive
   the cursor.
2. **APG completion**. Command's `apgPattern: "dialog-modal"` and its
   embedded combobox pattern have many other obligations
   (`aria-controls`, `aria-expanded`, focus management, dismissal) that
   are partially in place but not fully validated. The successor
   addresses the active-descendant obligation only.
3. **Arbitrary expression grammar**. No `&&`, `||`, `!`, function calls,
   optional chaining, transforms, etc. The `activeDescendant:` form (or
   literal template) must be closed and single-purpose.
4. **Predicate grammar changes**. V2 predicates remain unchanged.
   `predicate:activeIs` is a *future* atom; landing it is not a
   prerequisite for the active-descendant mechanism.
5. **Slot-children identity model**. If the items array shape (Section
   3.1, option 1) is chosen, the slot model stays as-is. A slot-based
   alternative would require a separate slice.
6. **CommandGroup composition**. The current contract has `group` and
   `groupHeading` parts. The successor migrates only the flat
   `groupItems` → `item` path. Multi-group iteration is held.
7. **Filter behavior**. `shouldFilter` and `filter` props remain
   declarative; the successor does not implement filtering.

### 5.3 Cross-framework parity

If the successor lands the four surfaces, then:

- React: `aria-activedescendant={`${idPrefix}-${activeIndex}`}` on the
  input.
- Vue: `:aria-activedescendant="`${idPrefix}-${behavior.activeIndex.value}`"`
  (subject to Vue's first-render reactivity fix already landed in
  **VUE-FIRST-RENDER-CONTROLLABLE-DEFAULT-01** — the `activeIndex`
  channel's `Number`-typed default needs no special handling because
  Vue's coercion quirk only applies to Boolean props).
- Svelte: `aria-activedescendant={`${idPrefix}-${hookVar.activeIndex}`}`.
- Angular: `[attr.aria-activedescendant]="idPrefix + '-' + behavior.activeIndex()"`.
- Lit: `aria-activedescendant=${`${idPrefix}-${this.behavior.activeIndex}`}`.

The template-string form is the cleanest cross-framework idiom because
all five frameworks natively support `${}` interpolation in their value
positions — no new template-language work needed.

## 6. Non-claims (this recon)

- **Does NOT implement active descendant.** No DOM binding lands; no
  contract surface lands; no emitter rule lands. The suppression remains
  in place with its existing reason (the refreshed reason that landed
  in **BINDING-EXPRESSION-V2-PREDICATE-01** Command suppression edit
  already accurately reflects the blockers; this recon expands the
  detail for the successor slice's benefit but does not edit the
  contract).
- **Does NOT repay Command's `aria-selected` suppression.** Repayment
  requires the successor mechanism slice.
- **Does NOT define final Command public API.** The four surfaces in
  Section 3 are candidates, not commitments. The successor slice makes
  the binding decisions.
- **Does NOT alter V2 grammar.** Iteration locals, paths, predicates,
  and CSS-var bindings are unchanged.
- **Does NOT touch Figma generated determinism or token graph work.**
  Those holds remain held.
- **Does NOT obligate the successor to land in the next slice slot.**
  Command active-descendant is a real piece of work (four surfaces
  plus emitter wiring across five frameworks plus runtime rail). The
  user may legitimately prioritize Figma determinism or token graph
  audit before activating
  **COMMAND-ACTIVE-DESCENDANT-MECHANISM-01**.

## 7. Authority and removability

This document is **non-normative** until the successor slice activates.
Its authority is:

- **Descriptive** of the current Command implementation state
  (verifiable by reading the contract and the framework hooks).
- **Prescriptive** about what the successor slice must address
  (Sections 3, 4, 5), but the prescriptions are recommendations, not
  guarantees — the successor slice may revise them if implementation
  reveals a better shape.

Removable when the successor slice **COMMAND-ACTIVE-DESCENDANT-MECHANISM-01**
lands; this doc should be either updated in place to "historical / paid"
or archived alongside the implementation PR.
