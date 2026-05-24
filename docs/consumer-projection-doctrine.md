---
doc_id: ARCH-CONSUMER-PROJECTION-001
authority: architecture
status: draft
title: Consumer Projection Doctrine
owner: "@darianrosebrook"
updated: 2026-05-24
governs:
  - docs/normal-form.md
  - docs/component-layering.md
  - docs/tokens-architecture.md
  - docs/preview-pipeline-architecture.md
  - packages/ds-contracts/a2ui/derive.ts
---

# Consumer Projection Doctrine

FSDS is governed, not prescriptive. Its internal artifacts are strict so its external surfaces can remain boring, stable, and permissive.

A design system should get out of the way of creators. It should not ask consumers to admire its machinery, learn its generator internals, or treat its components as finished product expression. A single brick is intentionally unremarkable; its value is tolerance, repeatability, interoperability, and the ability to disappear into larger compositions.

The system therefore has two different obligations:

1. **Internal discipline.** Contracts validate, token paths resolve, generated CSS partitions structure from resolution, emitters lower semantic IR without component-name lore, and preview/admission surfaces make failures visible.
2. **External permissiveness.** Consumers compose, configure, override, and adapt through admitted surfaces without depending on generated-file internals or forking the system.

The useful boundary is not rigid versus flexible. The useful boundary is **invariant versus degree of freedom**.

## Boring at the point of use

FSDS may be sophisticated internally, but its consumer experience should be ordinary. A consumer should be able to choose a component, pass designed props, compose children through documented slots, override stable CSS custom properties, select brand or density context, and move on.

A consumer should not need to know:

- which framework first proved the component,
- which emitter generated the file,
- how token shards compose,
- how preview middleware boots the framework,
- where generated and custom regions are preserved,
- or which internal primitive realizes the DOM tree.

Those details are architecture, not application authoring surface.

## Rigid invariants, explicit degrees of freedom

The system must guard itself through rigid discipline. That discipline protects the promises FSDS makes:

- a contract is the semantic authority for a component;
- framework output is realization, not a second source of truth;
- `.css` owns structure and consumer sites;
- `.tokens.css` owns value resolution by scope;
- token `resolvesTo` paths correspond to graph leaves;
- A2UI exposes consumer-facing capability without renderer internals.

But rigidity at the invariant layer must not become rigidity at the consumer layer. Consumers need admitted degrees of freedom:

- designed props for intentional API variation;
- constrained props when a variation is valid only under conditions;
- passthrough attributes where the substrate surface is deliberately forwarded;
- slots and children policies for composition;
- component-local custom properties for per-instance material changes;
- semantic tokens for brand, theme, and density changes;
- app-level CSS when the product must intentionally leave the system's default lane.

A design system that cannot be overridden is too brittle. A design system that can be reshaped anywhere has no contract. FSDS aims for the middle: rigid invariants, explicit degrees of freedom.

## Mold and material

The generated CSS split is the clearest instance of this doctrine.

`<Name>.css` is the mold: durable structure, layout, affordance rules, state reaction sites, and one consumer site per CSS property.

`<Name>.tokens.css` is the material map: root slot declarations, variant/state slot resolution, and scoped values that flow through brand, density, theme, and component-local overrides.

The mold is not wet clay. Consumers should not need to carve new internal selectors for ordinary variation. But the mold is also not a sealed appliance. It exposes governed channels into which different material can be injected.

More precisely: `.css` defines the admissible degrees of freedom; `.tokens.css` supplies values for those degrees of freedom.

If a desired customization requires adding a new selector, the component may be missing an admitted degree of freedom. If it can be achieved by changing a slot, semantic token, density, or brand value, the mold is sufficiently expressive.

## Documentation and A2UI are projections, not new authorities

Documentation is the human-facing projection of the contract. A2UI is the agent-facing projection of the contract. Framework previews are realization-facing projections of generated artifacts.

None of these should become a second source of truth.

Documentation may add guidance, caveats, examples, and composition advice. It should not hand-author prop tables, event surfaces, slot inventories, or token claims that can drift from contracts.

A2UI should expose only the surface an agent is allowed to depend on: designed props, valid value kinds, enum domains, events/channels, form participation, usage hints, and children policy. Renderer seams such as `className`, `style`, refs, raw HTML attributes, and function-valued callbacks are not agent capability; they are implementation detail.

Framework previews should boot the real generated packages, not examples that merely resemble them. The preview is evidence that realization still works; it is not product documentation by assertion.

## Review test

When adding or changing a surface, ask four questions:

1. **What invariant is protected?** If none, the rule may be bureaucracy.
2. **What degree of freedom is exposed?** If none, the rule may trap consumers.
3. **Can consumers use it without learning internals?** If not, the system is leaking.
4. **Can the system validate or observe drift?** If not, the promise should be documented as a non-claim.

The goal is not maximal control. The goal is reliable composition: keep the system boring enough to use, strict enough to trust, and permissive enough to stay out of the creator's way.
