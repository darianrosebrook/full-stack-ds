---
doc_id: ARCH-A2UI-PROJECTION-001
authority: architecture
status: draft
title: A2UI Projection
owner: "@darianrosebrook"
updated: 2026-05-24
governs:
  - packages/ds-contracts/a2ui/derive.ts
  - packages/ds-contracts/a2ui/types.ts
  - packages/ds-contracts/component.contract.schema.json
  - packages/ds-contracts/components/**/*.contract.json
---

# A2UI Projection

A2UI is the agent-facing projection of a component contract. It is not a renderer-facing API, not a replacement for the contract, and not a second source of truth.

The purpose of A2UI is to expose what an agent or other non-renderer consumer may safely depend on without inheriting framework seams. It should be boring, constrained, and derived.

## Authority model

The authored A2UI block should stay slim:

```ts
contract.a2ui = {
  category,
  usageHints?,
  children?,
}
```

Everything else should derive from existing contract authority:

- prop legitimacy buckets;
- type strings and named union/enum aliases;
- enum domains;
- required flags;
- channels;
- events;
- form participation;
- children policy;
- usage hints.

A2UI should not ask authors to duplicate facts the contract already owns.

## What A2UI exposes

A2UI may expose:

- designed props an agent may set intentionally;
- constrained props when their conditions are explicit enough to explain;
- accepted value kinds (`string`, `number`, `boolean`, `enum`, `node-ref`, `icon-ref`);
- enum value domains;
- required props;
- controlled channels as stateful affordances;
- emitted events as notifications;
- form participation;
- children policy and accepted child categories;
- short usage hints.

This is an operation surface, not a rendering surface.

## What A2UI excludes

A2UI should strip renderer seams:

- `className`;
- raw `style` objects;
- refs;
- `aria-*` and `data-*` passthrough unless promoted to a named contract fact;
- raw HTML attribute bags;
- function-valued renderer callbacks;
- framework-specific event objects;
- generated class names or internal anatomy selectors.

A prop can exist in generated framework output without being agent capability. Generated output has to interoperate with a host framework; A2UI has to preserve the stable authoring surface.

## Prop bucket interpretation

A2UI should project from API legitimacy, not implementation shape.

- `designed` is primary: these are intentional consumer-facing controls.
- `constrained` may be exposed when the constraint can be explained or validated.
- `passthrough` should be omitted, summarized, or exposed only as a bounded host affordance depending on consumer.
- `restricted` should become negative guidance, not an available operation.
- legacy `styled` may be used as fallback for unmigrated contracts, but should not remain the long-term source of A2UI authority.

The current implementation already prefers `designed` + `constrained` and falls back to `styled` for legacy compatibility.

## Channels and events

A channel is stateful control. An event is notification.

A2UI may group them together for compact transport, but it should preserve the source distinction. An agent that sets or changes state needs different semantics than an agent that reacts to an emitted notification.

Future schemas may split these into separate `channels` and `events` objects if consumers need stronger planning affordances.

## Children policy

A2UI children policy should eventually be validated against slots, anatomy, and relationships.

If A2UI says children are allowed, the component should have a compatible semantic host. If A2UI says a child category is accepted, the contract should identify where that category lands and what relationship it establishes.

For now, `contract.a2ui.children` is an authored bridge. It should remain small and should not become an independent content model.

## Current residuals

A2UI currently exposes shallow capability. It does not yet prove:

- full composition planning;
- machine-checkable prop constraints;
- negative guidance from `restricted` props;
- passthrough summarization;
- slot-backed children validation;
- target-family-specific affordance differences;
- accessibility adequacy of generated compositions.

Those are successor surfaces, not current claims.

## Successor work

Useful follow-on slices:

1. Add machine-readable constraint projection for `constrained` props.
2. Add restricted-prop negative guidance.
3. Decide whether passthrough props are omitted, summarized, or exposed by consumer type.
4. Validate A2UI children policy against slots/anatomy/relationships.
5. Split stateful channels from notification events if downstream agents require stronger planning semantics.
6. Add fixture snapshots for representative component descriptors so derivation drift is reviewable.
