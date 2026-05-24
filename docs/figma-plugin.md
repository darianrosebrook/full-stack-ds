---
doc_id: ARCH-FIGMA-PLUGIN-001
authority: architecture
status: draft
title: Contract-to-Figma Plugin Scaffold
owner: "@darianrosebrook"
updated: 2026-05-24
governs:
  - packages/ds-codegen/src/frameworks/figma/**
  - packages/ds-figma-plugin/**
---

# Contract-to-Figma Plugin Scaffold

The Figma lane treats Figma as another realization target of the component contract pipeline. It is not a parallel importer and not a hand-authored component catalog.

## Authority

- Source of truth: component contracts under `packages/ds-contracts`.
- Semantic normalization: `ComponentIR` in `packages/ds-codegen/src/ir.ts`.
- Figma transfer format: `packages/ds-codegen/src/frameworks/figma/factory.ts` emits `*.figma.json` descriptors.
- Runtime materialization: `packages/ds-figma-plugin/src/plugin.ts` consumes the generated descriptor registry.

## Current claim

This slice establishes the package boundary and first descriptor path. It can scaffold documentation and component-placeholder frames from generated descriptors. It does not yet claim complete Figma component-set, variant, or component-property materialization.

## Non-claims

- Does not yet produce production-ready Figma component sets.
- Does not yet map all contract prop types to Figma component properties.
- Does not yet prove regeneration/update idempotence in a live Figma file.
- Does not yet add a Figma admission plan to the generated-artifact rail.
- Does not yet define a formal JSON schema for `*.figma.json` descriptors.

## Next admissible moves

1. Add descriptor schema and fixture tests.
2. Add `figma` to the rail framework vocabulary and bounded emitter source set.
3. Generate descriptors for all contracts with `pnpm run generate -- --target=figma`.
4. Replace placeholder frames with real Figma component/component-set APIs.
5. Add update/idempotence behavior keyed by stable plugin data.
