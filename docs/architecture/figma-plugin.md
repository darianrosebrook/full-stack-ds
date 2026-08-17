---
doc_id: ARCH-FIGMA-PLUGIN-001
authority: architecture
status: active
title: Contract-to-Figma Plugin Scaffold
owner: "@darianrosebrook"
updated: 2026-06-11
governs:
  - packages/ds-codegen/src/frameworks/figma/**
  - packages/ds-codegen/src/validation/frameworks/figma.ts
  - packages/ds-figma-plugin/**
  - agent-skills/figma-library-setup/**
---

# Contract-to-Figma Plugin Scaffold

The Figma lane treats Figma as another realization target of the component contract pipeline. It is not a parallel importer and not a hand-authored component catalog.

## Authority

- Source of truth: component contracts under `packages/ds-contracts`.
- Semantic normalization: `ComponentIR` in `packages/ds-codegen/src/ir.ts`.
- Figma transfer format: `packages/ds-codegen/src/frameworks/figma/descriptor.ts` defines `FigmaComponentDescriptorV1` and the V1 assertion function.
- Figma descriptor emission: `packages/ds-codegen/src/frameworks/figma/factory.ts` emits `*.figma.json` descriptors from governed `ComponentIR`.
- Runtime materialization: `packages/ds-figma-plugin/src/plugin.ts` consumes the generated descriptor registry.
- Agent workflow guidance: `agent-skills/figma-library-setup/**` instructs agents how to use available Figma MCP tools; it does not add MCP capabilities.

## Scope of this document — read this first

> **This document describes the ORIGINAL descriptor-scaffold slice only. It is not a current-state
> summary, and its "Current claim" and non-claims below have been overtaken by later work.**
>
> Eight FIGMA-* specs have since closed, adding a dimensional-state planner, a component-property
> materializer, style/variable projection, live materialization with idempotency auditing, state-effect
> descriptor enrichment and corpus completion, a ported Svelte plugin UI with Dev Mode codegen, and a
> stale-dist guard. Source files that postdate this document — `planner.ts`, `materialize-state.ts`,
> `live-materialize.ts`, `live-audit.ts`, `live-style.ts`, `live-token-resolve.ts`, `live-run.ts`,
> `FigmaPluginApp.svelte` — are not described anywhere below.
>
> Treat the "Current claim" and non-claims below as **historical**, not as current limits.

### What the Figma lane actually proves (verified 2026-08-18)

A verification pass over the eight closed specs found that **shipped** and **proven** come apart
sharply here. Both halves matter:

**Durably evidenced.** `packages/ds-figma-plugin/src` carries five test files — `planner.test.ts`,
`materialize-state.test.ts`, `live-materialize.test.ts`, `live-style.test.ts`, `plugin.test.ts` —
totalling **59 tests, all passing** (`pnpm exec vitest run packages/ds-figma-plugin/src`). These
exercise the descriptor → plan → materialize boundary, the state surface, style projection, and the
plugin's UI/codegen wiring against a mocked Figma API. This is real, re-runnable proof of the
plan-and-materialize logic.

**NOT durably evidenced — read carefully.** All eight FIGMA-* specs closed with **zero acceptance-criterion
evidence recorded between them — 61 criteria in total** (`caws specs show <ID>` reports the gap on each).
Under this repo's own doctrine the evidence block is the closure authority, so *a closed figma spec
establishes only that someone closed it.* In particular:

- **Live canvas mutation and rerun idempotency were demonstrated, not durably proven.** A real run
  against a live Figma document did happen, but its artifact is `tmp/figma-live-batch-evidence.json` —
  **gitignored**, machine-local, dated 2026-05-27. It will not survive a clean checkout, no gate
  re-derives it, and `FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01`'s nine criteria (including A8, digest
  equality across two runs, and A9, "exact evidence is captured") carry no recorded evidence.
- That spec's own **A6** bounds the slice regardless: "no token-style resolution, paint binding, or
  final visual-parity claim lands — component properties and metadata only."

So: do not cite a closed FIGMA spec as proof. Cite the test suite for the mocked path, and treat the
live-canvas work as a demonstration awaiting a durable evidence chain. Re-establishing that chain
(re-run, capture a tracked artifact, record the ACs) is the outstanding work.

> **Correction.** An earlier revision of this banner said two of the non-claims below were "known to be
> falsified by `FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01`." That overstated it: the spec's closure is
> not evidence, so the honest status is *demonstrated once, not durably proven*.

## Current claim (as of the original slice)

This slice establishes the package boundary, first descriptor path, descriptor schema assertion, mocked plugin materialization test, and agent skill documentation for setting up a Figma library from generated descriptors.

The plugin can scaffold documentation and component-placeholder frames from generated descriptors. The descriptor schema and emitter fixture tests pin the current transfer-artifact shape. The mocked plugin test pins the current placeholder materialization behavior without requiring Figma, MCP, or a live file.

## MCP posture

- Remote Figma MCP is the preferred Figma MCP surface when available.
- Remote MCP may be used for read/inspection and write-to-canvas setup when the connected client/server exposes the needed tools and the user requested bounded mutation.
- Desktop/local Figma MCP is fallback or organization-specific, not the default mutation lane.
- Agent skills do not add MCP capabilities; they encode sequencing, guardrails, evidence, and verification instructions for tools that are already available.

## Test surface

The slice-level governance surface is:

- `packages/ds-codegen/src/frameworks/figma/descriptor.ts`: descriptor version/source constants, V1 type, and runtime assertion.
- `packages/ds-codegen/src/frameworks/figma/factory.test.ts`: descriptor schema acceptance/rejection, deterministic emitted files, README transfer-artifact claim, JSON registry barrel, and descriptor-based discovery.
- `packages/ds-figma-plugin/src/plugin.test.ts`: mocked Figma API materialization of documentation/component-placeholder pages, auto-layout defaults, text content, plugin data provenance, notification, and close message.
- `packages/ds-codegen/src/validation/frameworks/figma.ts`: declared Figma admission plan for package-level typecheck of the plugin/generated-registry surface.
- `packages/ds-codegen/src/validation/frameworks/figma.test.ts`: pins the Figma admission plan and its non-claims.

## CI baseline note

At the time of the original slice, repository-level CI was known to be red outside it (the specific causes are long since changed; do not read this as a statement about CI today). This document does not claim global CI recovery. Acceptance for this slice should be evaluated with targeted Figma tests plus a no-new-known-failures comparison against the existing baseline.

The Figma validation plan is declared in `packages/ds-codegen/src/validation/frameworks/figma.ts`. Full generated-artifact rail parity still requires widening the existing rail `FrameworkId` vocabulary and manifest source-set machinery to include `figma` as a first-class framework rather than a declared adjunct plan.

## Non-claims

- Does not yet produce production-ready Figma component sets.
- Does not yet map all contract prop types to Figma component properties.
- ~~Does not yet prove regeneration/update idempotence in a live Figma file.~~ **Attempted, not durably proven.** `FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01` built the adapter and ran it, but closed with none of its nine criteria evidenced — including A8 (run-1 and run-2 digests must match) and A9 (capture exact evidence). The one recorded run lives in gitignored scratch. Idempotency is *implemented and mock-tested* (`live-materialize.test.ts`); it is not *proven on a live file* by anything a clean checkout can re-derive.
- ~~Does not yet prove live Figma MCP tool availability or live canvas mutation.~~ **Split into two, with different answers.** *Live canvas mutation:* demonstrated once via a `LiveFigmaLike` adapter driven through chrome-devtools (not the Figma MCP server), with the same gitignored-artifact caveat above. *Figma MCP tool availability:* still entirely unproven — nothing in this repo exercises it.
- Does not yet publish a Figma library or change team/file permissions.
- Does not yet restore unrelated failing repository CI.
- Does not yet complete first-class generated-artifact rail parity for `figma`; the Figma admission plan is declared, but the broader rail vocabulary/source-set migration remains a follow-up.

## Next admissible moves

1. Widen the generated-artifact rail `FrameworkId` vocabulary and bounded emitter source set to include `figma` as first-class rail input.
2. Generate descriptors for all contracts with `pnpm run generate -- --target=figma` once the rail vocabulary/source set is widened.
3. ~~Replace placeholder frames with real Figma component/component-set APIs.~~ **Done** — see `FIGMA-COMPONENT-PROPERTY-MATERIALIZER-01` and `FIGMA-LIVE-MATERIALIZATION-IDEMPOTENCY-01` (both closed).
4. Add update/idempotence behavior keyed by stable plugin data.
5. Validate the agent skill docs against the concrete MCP client/tool names in the user's target environment before live library setup.
