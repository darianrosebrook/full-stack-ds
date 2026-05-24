---
doc_id: ARCH-SUCCESSOR-WORK-001
authority: reference
status: draft
title: Successor Work Index
owner: "@darianrosebrook"
updated: 2026-05-24
governs:
  - docs/a2ui-projection.md
  - docs/component-evidence-pages.md
  - docs/codegen-target-family-recon.md
  - docs/contract-group-axes.md
  - docs/consumer-projection-doctrine.md
---

# Successor Work Index

This document records follow-on work implied by the current documentation loop. It is not an implementation claim. It exists to prevent draft doctrine from reading as completed machinery.

## A2UI constraint projection

Source doc: [`a2ui-projection.md`](./a2ui-projection.md)

Goal: project `constrained` prop conditions into machine-readable A2UI guidance.

Non-claim today: A2UI does not yet validate `onlyWhen`, `requires`, `excludes`, value dependencies, or slot-backed children constraints.

Useful acceptance shape:

- representative descriptors show constrained props separately from designed props;
- constraints are serializable;
- unsupported prose-only constraints are residualized rather than silently flattened;
- tests lock at least one constrained prop and one unsupported constraint.

## Restricted and passthrough guidance

Source docs: [`a2ui-projection.md`](./a2ui-projection.md), [`contract-group-axes.md`](./contract-group-axes.md)

Goal: define how `restricted` and `passthrough` prop buckets appear to non-renderer consumers.

Non-claim today: A2UI prefers designed/constrained props and falls back to legacy styled props; it does not yet expose negative guidance or passthrough summaries.

Useful acceptance shape:

- `restricted` produces negative guidance or omission with explicit reason;
- passthrough handling is parameterized by consumer type;
- renderer seams remain excluded from agent capability;
- descriptor fixtures prove behavior.

## Contract-axis obligation validator

Source doc: [`contract-group-axes.md`](./contract-group-axes.md)

Goal: validate coherent combinations across contract axes, not just schema shape.

Non-claim today: schema validation proves fields are well-formed; it does not prove cross-axis obligations.

Useful acceptance shape:

- `category: input` without `form`, `channels`, or documented exception is flagged;
- surface+dismissal without focus/Escape/outside-click policy is flagged;
- A2UI children policy without compatible slot/anatomy host is flagged;
- diagnostics are typed and actionable.

## Component evidence pages

Source doc: [`component-evidence-pages.md`](./component-evidence-pages.md)

Goal: implement component documentation pages as derived evidence surfaces.

Non-claim today: the doctrine describes page shape; runtime UI implementation is not included.

Useful acceptance shape:

- page sections derive contract facts rather than hand-authoring prop/event/token tables;
- framework previews use real generated packages;
- A2UI descriptor is shown from derivation;
- evidence/residuals section distinguishes claim from proof.

## Target-family IR recon implementation

Source doc: [`codegen-target-family-recon.md`](./codegen-target-family-recon.md)

Goal: classify existing IR/emitter facts and prepare for targets outside the Web DOM family.

Non-claim today: React, Vue, Svelte, Angular, and Lit prove cross-framework Web DOM realization, not substrate-neutral component semantics.

Useful acceptance shape:

- inventory existing IR facts as semantic / Web DOM / framework-local;
- identify React-origin assumptions;
- choose one hostile thin target;
- implement only enough projection to expose missing facts;
- document promotions and residual web assumptions.

## README component-list generation or removal

Source surface: [`README.md`](../README.md)

Goal: remove hand-maintained count/list drift.

Non-claim today: README states the contract directory is authoritative, but visible lists can still lag.

Useful acceptance shape:

- either generate the component list from `packages/ds-contracts/**/*.contract.json`, or remove the explicit list entirely;
- README count and package table derive from the same source;
- generator is documented or included in an existing docs check.
