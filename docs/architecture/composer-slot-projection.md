---
doc_id: ARCH-COMPOSER-SLOT-PROJECTION-001
authority: architecture
status: draft
title: Composer Slot Projection — named slots own region content, disjoint from props
owner: "@darianrosebrook"
updated: 2026-06-25
governs:
  - packages/ds-codegen/src/ir.ts
  - packages/ds-contracts/components/**/*.contract.json
---

# Composer Slot Projection

> Companion to [`component-layering.md`](./component-layering.md) and
> [`codegen-authority.md`](./codegen-authority.md). Names the canonical rule for how a
> compound or composer projects content into named regions, and why content props and
> content slots for the same region may not coexist.

## What this proves

A composer (or compound) that hosts content in more than one named region routes each
region through a **named slot** (`{"tag": "slot", "name": "<part>"}`), not through the
single default-children hole and not through a content-carrying prop. The named-slot
machinery is already admitted in all five emitters — React `{slots?.X}`, Vue
`<slot name="X">`, Svelte `Snippet`, Angular `<ng-content select="[slot=X]">`, Lit
`<slot name="X">` — and proven by Dialog, Sheet, and Walkthrough.

The rule has one non-negotiable invariant that the rest of this doc exists to justify:

> **A region's content is owned by exactly one surface: a named slot OR a prop, never
> both. A named slot's name must not equal any designed prop name.**

## Why: the lowest-common-denominator framework is Svelte

React, Vue, Lit, and Angular expose slots in a namespace *separate* from props — React
nests them under a `slots` object, Vue/Lit under the template `<slot>` registry, Angular
under content projection. So a `label` prop and a `label` slot coexist without conflict in
those four.

Svelte does not. Svelte projects both designed props and named-slot snippets into a single
`$props()` destructure and a single `Props` interface:

```svelte
interface Props {
  label?: unknown;                       // the designed prop
  label?: import('svelte').Snippet;      // the named slot  ← duplicate identifier
}
let { ..., label, ..., label }: Props = $props();   // ← cannot redeclare
```

`svelte-check` rejects this (`Duplicate identifier 'label'`,
`Cannot redeclare block-scoped variable`). Because the contract is the single source of
truth for all five targets, **a shape that only one target can express is a contract
defect, not a Svelte bug.** Svelte is the canary: it fails loud where the other four mask
the ambiguity. The durable contract shape is the one all five can express, which means
slot names and prop names occupy disjoint namespaces.

## The pattern: unguarded named slots, no redundant content prop

The canonical multi-slot composer in this corpus is **Dialog**. It is the pattern to copy:

- Each region (`title`, `body`, `footer`, …) is an **unguarded** `{"tag": "slot",
  "name": "<part>"}`. The wrapper element renders unconditionally; an unfilled `<slot>`
  collapses harmlessly across all five frameworks. No `if:` guard, so no guard prop.
- Dialog declares **no content props** — the slot *is* the API for that region. There is
  nothing to collide with.

Two anti-patterns this replaces, both legacy single-children idioms leaking into a
slot-based composer:

1. **Guarding a slot region on a content prop** — `{"part": "label", "if": "label",
   children: [{"tag": "children"}]}`. The `if:` guard forces a prop named `label` to
   exist; the slot also wants to be named `label`; collision. Worse, the same default
   `{children}` hole gets reused in two regions (e.g. `label` and `control`), so one set
   of children renders twice.
2. **A content prop and a content slot for the same region** — `label?: node` (prop)
   alongside `slots.label`. Redundant dual API; Svelte rejects it.

### What stays a prop, what becomes a slot

| Prop role | Example | Belongs in |
| --- | --- | --- |
| Rendered content for a region | `label`, `helpText`, an `error` *message string* | **a named slot** for that region |
| Behavioral state / identity / callbacks | `name`, `id`, `required`, `disabled`, `value`, `onChange`, `validate`, `status` | **a prop** |
| A boolean that gates a region's *presence* | (none needed) | nothing — the empty slot collapses |

Region presence does **not** need a guard prop. An unfilled named slot renders nothing;
the wrapper is cheap and inert. If a region must be *structurally absent* (not just
empty) under some state, model that as a state variant on the root
(`.field--no-error`), not as an `if:`-on-content-prop on the slot.

## The invariant, stated for enforcement

> For every component: the set of designed prop names and the set of named-slot names are
> disjoint. No `{"tag": "slot", "name": N}` may exist where `N` is also a designed prop.

This is enforced at IR-build time (alongside the existing `if:`-guard resolution check),
so a future composer cannot reintroduce the Svelte collision. A contract that needs a
region's content **moves** the content prop to a slot; it does not keep both.

## Applying it (the migration shape)

1. In `anatomy.dom`, replace each region's `{"tag": "children"}` (or unbound empty part)
   with `{"tag": "slot", "name": "<part>"}`. Remove the `if:` guard on that region.
2. In `slots`, declare every projected region.
3. In `props.designed`, **remove** the content-carrying prop that the slot now owns
   (`label`, `helpText`, an `error` message). Keep behavioral props.
4. Update consumers (usage sidecars, showcase demos) to pass `slots={{ … }}` hosting the
   real primitive (`control: <Input/>`, `label: <Label/>`), not raw children.
5. Regenerate all five targets; verify each renders distinct regions and Svelte typechecks.

The win compounds: the region now hosts a **real primitive component** by reference
(an `<Input>` with its own border, states, and a11y), so the composer stops re-drawing
primitive DOM — the `if (component === "X")` anti-pattern from `codegen-authority.md`,
resolved at the contract layer.
