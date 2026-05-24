---
doc_id: ARCH-CODEGEN-TARGET-FAMILY-RECON-001
authority: architecture
status: draft
title: Codegen Target-Family Recon
owner: "@darianrosebrook"
updated: 2026-05-24
governs:
  - docs/codegen-authority.md
  - docs/normal-form.md
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/frameworks/**
  - packages/ds-codegen/src/registry.ts
---

# Codegen Target-Family Recon

The first five generated targets — React, Vue, Svelte, Angular, and Lit — are a useful falsification surface for web-component realization. They are not enough, by themselves, to prove that the contract has escaped the browser-component ontology.

React was the first proving surface. First surfaces donate assumptions: props, children, callback names, event extraction, package layout, CSS classes, and an implicit definition of what a component is. The current codegen authority doctrine already names the corrective rule: contract semantics belong upstream, IR normalizes shared facts, and framework emitters lower those facts into target idioms without component-name lore.

This recon names the next boundary: framework targets should be grouped by target family, not only by framework id.

## Current target family: Web DOM components

The current five targets differ in syntax and runtime idiom:

- React: function components and hooks.
- Vue: SFCs and composables.
- Svelte: compiler-driven components and runes.
- Angular: standalone components, signals, and dependency injection.
- Lit: custom elements and reactive controllers.

They still share too much to be the whole abstraction test: HTML-ish trees, CSS, ARIA, browser events, children/slots, attributes, and DOM accessibility semantics.

The current claim should therefore be read as: one contract can drive idiomatic web-component realizations across five opposed web frameworks. That is a strong claim, but narrower than substrate-neutral component semantics.

## Target-family split

A future architecture should distinguish:

```
Contract → Semantic Component IR → Target-Family IR → Framework Emitter
```

Where:

- **Semantic Component IR** carries anatomy roles, prop legitimacy, interaction channels, state axes, surface topology, form participation, accessibility intent, content model, slot contracts, and token bindings.
- **Web DOM IR** lowers semantic facts into DOM nodes, attributes, ARIA, CSS selectors, pseudo-classes, event binding strategies, class recipes, and CSS custom-property reads.
- **Native View IR** would lower to host controls, layout containers, state bindings, and style dictionaries for SwiftUI, Jetpack Compose, Flutter, or React Native.
- **Design Tool IR** would lower to component properties, variants, tokens, and authoring controls for Figma-like surfaces.
- **Agent/Schema IR** would lower to A2UI or other machine-consumable descriptions.
- **Docs/Test IR** would lower to prop tables, examples, interaction traces, and evidence pages.

The existing `ir.ts` currently mixes semantic normalization with Web DOM realization facts. That is acceptable for the present targets, but broadening beyond the five should make the web layer explicit instead of universal.

## Classification rule

Every emitter or IR rule should be classified as one of:

- **Semantic.** True of the component independent of target family. Example: controlled `open` channel, trigger/content relationship, dismissible surface.
- **Target-family.** True of a family, not all possible targets. Example: `aria-expanded`, DOM focusout, CSS pseudo-class mapping, CSS custom properties.
- **Framework-local.** True of one target's grammar or runtime idiom. Example: React synthetic event composition, Svelte text-child syntax, Angular bootstrap imports, Lit controller lifecycle.

If a framework-local rule is actually semantic or target-family, promote it upstream. If a semantic rule only exists in one emitter, the contract or IR is missing a fact.

## Hostile thin targets

Do not add only another DOM framework as the sixth target. Add thin targets that force different assumptions to surface:

1. **Non-DOM native view target.** SwiftUI, Jetpack Compose, Flutter, or React Native. Pressures `tag`, CSS, children, and event assumptions.
2. **Non-runtime design/document target.** Figma/component-spec or documentation pages. Pressures whether meaning can be explained without implementation files.
3. **Constrained/non-visual target.** Terminal UI, A2UI registry, or test-plan projection. Pressures whether interaction and state semantics survive without DOM/CSS.

These do not need full parity initially. They should be thin enough to expose missing facts.

## Acceptance shape for future target-family work

A target-family slice should not merely prove that code can be emitted. It should prove where the missing facts belong.

Minimum evidence:

- inventory current IR fields as semantic vs Web DOM vs framework-local;
- identify React-origin assumptions still present;
- choose one hostile target and define a minimal capability surface;
- implement only enough projection to expose missing facts;
- promote those facts to contract, semantic IR, target-family IR, or framework-local lowering with explicit rationale;
- document non-claims and residual web assumptions.

The goal is not maximal target count. The goal is to prevent false portability: a contract that appears portable only because every target has been forced into the first target's shape.
