---
doc_id: ARCH-FIGMA-PLUGIN-001
authority: architecture
status: draft
title: Contract-to-Figma Plugin Scaffold
owner: "@darianrosebrook"
updated: 2026-05-24
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

## Current claim

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

Repository-level CI is currently known to be red outside this Figma slice. This document does not claim global CI recovery. Acceptance for this slice should be evaluated with targeted Figma tests plus a no-new-known-failures comparison against the existing baseline.

The Figma validation plan is declared in `packages/ds-codegen/src/validation/frameworks/figma.ts`. Full generated-artifact rail parity still requires widening the existing rail `FrameworkId` vocabulary and manifest source-set machinery to include `figma` as a first-class framework rather than a declared adjunct plan.

## Non-claims

- Does not yet produce production-ready Figma component sets.
- Does not yet map all contract prop types to Figma component properties.
- Does not yet prove regeneration/update idempotence in a live Figma file.
- Does not yet prove live Figma MCP tool availability or live canvas mutation.
- Does not yet publish a Figma library or change team/file permissions.
- Does not yet restore unrelated failing repository CI.
- Does not yet complete first-class generated-artifact rail parity for `figma`; the Figma admission plan is declared, but the broader rail vocabulary/source-set migration remains a follow-up.

## Next admissible moves

1. Widen the generated-artifact rail `FrameworkId` vocabulary and bounded emitter source set to include `figma` as first-class rail input.
2. Generate descriptors for all contracts with `pnpm run generate -- --target=figma` once the rail vocabulary/source set is widened.
3. Replace placeholder frames with real Figma component/component-set APIs.
4. Add update/idempotence behavior keyed by stable plugin data.
5. Validate the agent skill docs against the concrete MCP client/tool names in the user's target environment before live library setup.
