---
doc_id: ARCH-COMPONENT-EVIDENCE-PAGES-001
authority: architecture
status: active
title: Component Evidence Pages
owner: "@darianrosebrook"
updated: 2026-06-11
governs:
  - src/runtime/FrameworkPreview.tsx
  - src/runtime/FrameworkPreview.tsx
  - packages/ds-contracts/a2ui/derive.ts
  - packages/ds-contracts/components/**/*.contract.json
---

# Component Evidence Pages

Documentation is not a second source of truth. It is a human-facing projection of contract authority and generation evidence.

A component page should not sell the system. It should make the component inspectable: what the contract says, what each realization emits, what consumers may depend on, and what evidence backs the generated artifact.

## Purpose

A component evidence page should answer five questions:

1. What does the component mean?
2. What can a consumer configure, compose, or override?
3. What do the generated framework realizations do natively?
4. What agent-facing surface does A2UI expose?
5. What evidence says this page is not hand-authored drift?

This makes documentation part of the governance loop rather than a marketing surface.

## Derived facts, authored guidance

A component page should derive facts wherever the contract already owns authority.

Generated or derived sections should include:

- prop tables;
- events and channels;
- children policy;
- slots and anatomy;
- token and slot references;
- A2UI descriptor snippets;
- framework preview status;
- evidence and residual metadata.

Hand-authored copy is still useful, but it should stay in the right lane: guidance, caveats, examples, migration notes, product judgment, and non-claims. A hand-authored paragraph may explain a prop, but it should not duplicate the prop's name, type, enum domain, or required status as an independent fact.

Any hand-authored claim that duplicates a contract fact is drift-prone. If it cannot be derived, the page should either mark it as guidance or identify the missing contract field.

## Recommended page sections

### Semantic contract

Derived from the component contract:

- name, layer, category, description;
- anatomy parts;
- relationships;
- a11y role, labeling, and keyboard requirements;
- behavior channels and events;
- form participation;
- state axes.

Authored prose may add guidance and caveats, but contract-derived facts should not be duplicated manually.

### Authoring surface

Derived from prop buckets and children policy:

- designed props;
- constrained props and their conditions;
- passthrough summary, if exposed;
- restricted props as negative guidance;
- slots and children policy;
- supported composition patterns.

This section should make the boring-brick stance visible: the component is ordinary at the point of use, but its degrees of freedom are explicit.

### Material surface

Derived from component-local slots and token bindings:

- component slot names;
- semantic token references;
- state slot families;
- brand and density override behavior;
- whether a customization should target component slot, semantic token, density, brand, or app-level CSS.

This is the mold/material view of the component.

### Native realizations

Rendered through the real generated packages, not synthetic examples:

- React preview;
- Vue preview;
- Svelte preview;
- Angular preview;
- Lit preview.

The preview should report ready/error status per framework. A failed preview is evidence, not cosmetic breakage.

### A2UI descriptor

Derived from `deriveA2UIDescriptor`:

- agent-facing category;
- usage hints;
- accepted prop value kinds;
- enum domains;
- required props;
- events/channels;
- form participation;
- children policy.

Renderer seams such as `className`, raw style objects, refs, and function-valued callback internals should not be exposed as agent capability.

### Evidence and residuals

A component page should distinguish evidence from claim:

- contract hash or source reference;
- generation timestamp or commit;
- emitter/package version where available;
- preview sweep status;
- admission-rail state where available;
- known framework-specific residuals;
- non-claims.

A page that cannot say what evidence backs a claim should not present that claim as fact.

## Non-goals

Component evidence pages do not prove visual quality, accessibility adequacy, or product suitability by themselves. They prove that the system can project the same contract into inspectable human, framework, and agent-facing surfaces.

Visual review, accessibility audit, and product judgment remain separate passes.
