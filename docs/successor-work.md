---
doc_id: ARCH-SUCCESSOR-WORK-001
authority: reference
status: active
title: Successor Work Index
owner: "@darianrosebrook"
updated: 2026-05-26
governs:
  - docs/current-implementation-snapshot.md
  - docs/a2ui-projection.md
  - docs/component-evidence-pages.md
  - docs/codegen-target-family-recon.md
  - docs/contract-group-axes.md
  - docs/consumer-projection-doctrine.md
  - docs/architecture/design/target-pack-registry.md
---

# Successor Work Index

This document records remaining work after the current implementation snapshot. It is not the primary current-state authority. For current claim strength, read [`current-implementation-snapshot.md`](./current-implementation-snapshot.md) first.

Older versions of this file treated several surfaces as entirely future work. That is no longer accurate. Some surfaces have landed as foundations, some are partial implementations, and some remain open. This file now separates those states so successor language does not under-claim the codebase.

Status vocabulary:

- **open** — no meaningful implementation surface has landed yet.
- **partial** — implementation exists, but does not satisfy the full doctrine or proof shape.
- **promoted** — the listed successor item has landed enough that remaining work should be tracked as narrower follow-up slices.
- **resolved-by-docs** — the stale documentation surface was repaired without adding runtime machinery.

## Reconciled work ledger

| Work item | Status | What changed | Remaining work |
|---|---|---|---|
| A2UI constraint projection | open | A2UI derivation exists, but this item was specifically about constrained prop conditions. | Project `onlyWhen`, `requires`, `excludes`, value dependencies, and slot-backed children constraints into machine-readable guidance with fixtures. |
| Restricted and passthrough guidance | open | No current snapshot claim says negative guidance or passthrough summaries are complete. | Emit restricted-prop omissions/reasons and consumer-parameterized passthrough summaries without exposing renderer seams. |
| Contract-axis obligation validator | partial | `generate:check` now runs semantic validation beyond schema shape, and CI depends on it. | Add the specific cross-axis obligation families listed below: input/form/channel coherence, surface+dismissal focus policy, and A2UI children/anatomy compatibility. |
| Component evidence pages | partial | The showcase now derives Design and Developer views from component bundles: usage examples, anatomy, variants, states, props, a11y, tokens, previews, source, and trace regions. | Add explicit Evidence/Residuals sections, A2UI descriptor display, rail/runtime status binding, and per-framework readiness reporting. |
| Target-family IR recon implementation | partial | Target-pack manifest/config/local-loader foundation exists, and Figma is a built-in design-tool descriptor target. | Execute local target packs only after manifest validation, add target-pack provenance to the emission manifest, and promote one hostile non-Web-DOM target through residual extraction. |
| README component-list generation or removal | resolved-by-docs | README no longer maintains the five-framework component-count table as an authority surface; it routes readers to loader-discovered contracts. | Optional: add a generated corpus count/check if the project wants visible counts again. |
| Runtime proof rail | promoted | `e2e/runtime-rail.spec.ts` and CI runtime-rail job now assert selected contract facts in Chromium for React, Vue, Svelte, and Lit. | Add non-default prop harnessing, decide Angular runtime posture, and avoid treating screenshots as CI proof until OS-specific baselines are admitted. |
| Target-pack executable loading | open | Local target packs can be declared, loaded, validated, fingerprinted, and described as metadata. | Import and execute local emitters under policy while keeping file writing, manifests, and admission centralized in core codegen. |

## A2UI constraint projection

Source doc: [`a2ui-projection.md`](./a2ui-projection.md)

Goal: project `constrained` prop conditions into machine-readable A2UI guidance.

Current status: **open** for this specific constraint-projection goal.

Useful acceptance shape:

- representative descriptors show constrained props separately from designed props;
- constraints are serializable;
- unsupported prose-only constraints are residualized rather than silently flattened;
- tests lock at least one constrained prop and one unsupported constraint.

## Restricted and passthrough guidance

Source docs: [`a2ui-projection.md`](./a2ui-projection.md), [`contract-group-axes.md`](./contract-group-axes.md)

Goal: define how `restricted` and `passthrough` prop buckets appear to non-renderer consumers.

Current status: **open**. A2UI projection exists as a surface, but this item requires negative guidance and passthrough summaries, not just positive designed-prop guidance.

Useful acceptance shape:

- `restricted` produces negative guidance or omission with explicit reason;
- passthrough handling is parameterized by consumer type;
- renderer seams remain excluded from agent capability;
- descriptor fixtures prove behavior.

## Contract-axis obligation validator

Source doc: [`contract-group-axes.md`](./contract-group-axes.md)

Goal: validate coherent combinations across contract axes, not just schema shape.

Current status: **partial**. `generate:check` is now the CI-facing semantic validation command, and the workflow runs it before codegen/typecheck/test gates. That should not be overstated: semantic validation exists, but this successor item names specific obligation families that are not fully claimed by the snapshot.

Useful acceptance shape:

- `category: input` without `form`, `channels`, or documented exception is flagged;
- surface+dismissal without focus/Escape/outside-click policy is flagged;
- A2UI children policy without compatible slot/anatomy host is flagged;
- diagnostics are typed and actionable.

## Component evidence pages

Source doc: [`component-evidence-pages.md`](./component-evidence-pages.md)

Goal: implement component documentation pages as derived evidence surfaces.

Current status: **partial**. The runtime UI is no longer absent. Design view derives visible sections from component bundles, and Developer view exposes framework previews, source, and trace regions. Curated usage JSONL can render as live React examples.

Remaining non-claims:

- evidence/residual sections are not complete;
- A2UI descriptor display is not yet a first-class page section;
- preview readiness is not yet bound to rail/runtime status per component;
- component pages do not prove visual quality, accessibility adequacy, or product suitability.

Useful acceptance shape:

- page sections derive contract facts rather than hand-authoring prop/event/token tables;
- framework previews use real generated packages;
- A2UI descriptor is shown from derivation;
- evidence/residuals section distinguishes claim from proof;
- rail/runtime results are surfaced without converting them into broader product claims.

## Target-family IR recon implementation

Source docs: [`codegen-target-family-recon.md`](./codegen-target-family-recon.md), [`architecture/design/target-pack-registry.md`](./architecture/design/target-pack-registry.md)

Goal: classify existing IR/emitter facts and prepare for targets outside the Web DOM family.

Current status: **partial**. The target-pack registry foundation has landed. Built-in targets now have target-pack manifests, local target packs can be declared and validated as metadata, and Figma is a built-in design-tool descriptor target.

Remaining non-claims:

- local target-pack emitters are not executed;
- npm/package-source target packs are not loaded;
- emission manifests do not yet bind generated artifacts to target-pack package provenance;
- Figma descriptors do not prove live Figma canvas mutation or library publication;
- React, Vue, Svelte, Angular, and Lit still prove Web DOM realization, not substrate-neutral UI semantics.

Useful acceptance shape:

- inventory existing IR facts as semantic / Web DOM / framework-local;
- identify React-origin assumptions;
- choose one hostile thin target;
- implement only enough projection to expose missing facts;
- document promotions and residual web assumptions;
- keep target-pack execution behind manifest validation and centralized file-writing policy.

## README component-list generation or removal

Source surface: [`README.md`](../README.md)

Goal: remove hand-maintained count/list drift.

Current status: **resolved-by-docs** in this documentation PR. README no longer maintains a visible five-framework component-count table. It names `packages/ds-codegen/src/contracts-fs.ts` and `packages/ds-contracts/components/*/*.contract.json` as the authority surfaces.

Optional future acceptance shape if visible counts return:

- generate the component list from `packages/ds-contracts/components/*/*.contract.json`;
- README count and package table derive from the same source;
- generator is documented or included in an existing docs check.

## Runtime proof rail follow-ups

Source surfaces: [`e2e/runtime-rail.spec.ts`](../e2e/runtime-rail.spec.ts), [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

Goal: extend the runtime rail beyond its first admitted fact surface.

Current status: **promoted**. The first runtime proof rail has landed and is CI-wired. It asserts contract facts for Progress, Truncate, ShowMore, OTP, and Calendar across React, Vue, Svelte, and Lit. Screenshot baselines remain local/darwin-only and are skipped under `CI=true`.

Useful acceptance shape for follow-up work:

- add a harness route or message protocol for non-default runtime props;
- decide whether Angular preview should become executable or remain a documented placeholder;
- keep screenshots separate from OS-agnostic fact assertions unless Linux baselines are admitted;
- bind runtime rail outcomes into component evidence pages without claiming visual quality.

## Target-pack executable loading

Source doc: [`architecture/design/target-pack-registry.md`](./architecture/design/target-pack-registry.md)

Goal: execute local target-pack emitters after manifest validation.

Current status: **open**. Local target packs are metadata-only. The current loader proves the manifest can be resolved, validated, fingerprinted, and described under repository-boundary checks; it does not import the declared emitter entrypoint.

Useful acceptance shape:

- local emitter import happens only after manifest validation;
- file writing remains centralized in core codegen;
- target-pack provenance appears in the emission manifest;
- permission posture remains no-network/no-postinstall by default;
- local pack failures are typed separately from built-in target failures.
