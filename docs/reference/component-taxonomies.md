---
doc_id: REF-COMPONENT-TAXONOMIES-001
authority: reference
status: draft
title: Component Taxonomies and Catalog
owner: "@darianrosebrook"
updated: 2026-05-23
---

# Component Taxonomies and Catalog

Reference material for thinking about UI components along multiple axes. These are taxonomies for *naming and grouping* components — not a contract over `packages/ds-contracts/`, and not authoritative over what the codegen emits. Use them when discussing scope, prioritizing component work, or onboarding someone to how a component family fits into the broader UI vocabulary.

Three CSVs live alongside this doc:

## Files

| File | Shape | What it is |
|---|---|---|
| [`component-groupings-by-intent.csv`](./component-groupings-by-intent.csv) | `taxonomy, category, purpose, examples` | Seven cross-cutting lenses: user intent, content density, state awareness, frequency of use, information hierarchy, brand consistency, device-specific interaction. A single component appears under multiple lenses. |
| [`component-groupings-by-pattern.csv`](./component-groupings-by-pattern.csv) | `category, subcategory, purpose, examples` | Seven pattern-based groupings: inputs, actions, display, system messaging/feedback, overlay/focus, structural/layout, navigation/guidance. Closer to how component libraries typically partition their inventory. |
| [`component-catalog.csv`](./component-catalog.csv) | `component, other_names, description, accessibility_considerations, related_components` | Per-component reference: canonical name, alternate names, one-line description, a11y notes, related components. |

## How to read the two grouping CSVs

The two grouping files are deliberately *different lenses*, not competing taxonomies. A `Button` shows up in both — under "Simple, Single Function" in one and "Action Components → Buttons" in the other — because the question "what is this for the user?" has a different answer than "what kind of widget is this?"

- Use **by-intent** when reasoning about UX role, density, or when a component should appear. Example: deciding whether a new notification surface belongs alongside `Alert` (primary information) or `Tooltip` (supporting information).
- Use **by-pattern** when reasoning about implementation family or library shape. Example: deciding whether a new control belongs in the input family or the action family.

## Relationship to the codegen

These taxonomies do **not** drive code generation. The authoritative inventory of generated components is `packages/ds-contracts/**/*.contract.json`, and the authoritative behaviors are encoded in the contracts and IR — not in this catalog. The catalog may name components that have no contract yet (`Wizard`, `Hero Banner`, `Filter Sidebar`, etc.); those are design-vocabulary references, not promises about what the codegen emits.

When a component listed here gains a contract, the contract becomes the source of truth for its anatomy, props, states, and a11y. The catalog row may still be useful for vocabulary (other names, related components), but the codegen reads the contract.

## Caveats in the source material

- `Tooltip` appeared twice in the source notes with slightly different descriptions. The catalog merges them into a single row that combines the related-components lists and includes both descriptions' intent (hover/focus/tap trigger, keyboard dismissal).
- "Component density" examples like `Wizard`, `Grid`, `Hero Banner`, `Filter Sidebar`, `Drawer`, `Panel`, `Chart`, `Tag`, `Notification`, `Link`, `Hamburger Menu`, `Header`, `Footer`, `Image`, `Video`, `Sidebar`, `Navigation Bar`, `Input`, `Help Button`, and `Filter` are referenced in the groupings but have no row in the catalog. That is intentional: the grouping CSVs use them as *vocabulary*, not as a claim that they are first-class components in this design system.
