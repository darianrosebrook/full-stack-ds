---
doc_id: ARCH-CODEGEN-TARGET-PACK-REGISTRY-001
authority: architecture
status: draft
title: Governed Target-Pack Registry
owner: "@darianrosebrook"
updated: 2026-05-25
governs:
  - packages/ds-codegen/src/emitter.ts
  - packages/ds-codegen/src/registry.ts
  - packages/ds-codegen/src/target-packs/**
---

# Governed Target-Pack Registry

Full Stack DS currently generates framework packages through built-in emitters. That path is useful, but hardcoding framework names in core codegen is the wrong long-term extension model. A target should become available because an admitted target pack declares what it can emit and what evidence admits that output, not because core codegen imports a new factory by name.

This document defines the target-pack seam landed by this slice.

## Authority split

Core codegen owns:

- component contract validation
- `ComponentIR` construction
- registry resolution
- file writing
- preservation and generated/custom region handling
- artifact hashing
- emission manifest writing
- rail/admission orchestration

A target pack owns:

- lowering governed IR into target-specific generated file declarations
- declaring output roots and file kinds
- declaring capabilities and non-capabilities
- declaring admission commands and known gaps
- declaring the execution permissions it requires

A target pack must not become a second contract interpreter. It should consume governed IR and emit declared artifacts.

## Current implementation

This slice introduces `TargetPackManifestV1` under `packages/ds-codegen/src/target-packs/manifest.ts` and binds every current built-in target to a manifest in `packages/ds-codegen/src/target-packs/builtin.ts`.

`registry.ts` now attaches a `targetPack` manifest to each `TargetBinding` and validates the manifest before registering the target. The emitter path is otherwise unchanged: React, Vue, Svelte, Angular, Lit, and Figma are still built-in in-process emitters.

That means this slice is a foundation slice, not the full external package loader.

## Manifest contract

A V1 target-pack manifest declares:

- `target`: id, family, label, maturity
- `compatibility`: codegen protocol, component IR version, optional target-family IR version
- `entrypoints`: emitter module reference
- `outputs`: component root, barrel file, emitted file kinds
- `capabilities`: components, tests, behavior, compound parts, surface, token strategy, custom regions
- `permissions`: filesystem, network, postinstall posture
- `admission`: optional command plan and known gaps

Target IDs identify registry entries. Target families are the closed vocabulary:

- `web-dom`
- `native-view`
- `design-tool`
- `agent-schema`
- `docs`
- `test-plan`

This distinction matters. Framework IDs should become registry data. Target-family categories remain architectural vocabulary.

## Safety posture

The manifest validator rejects:

- absolute paths
- relative path escapes
- missing required blocks
- unknown target families
- unsafe network/postinstall execution permissions
- malformed admission commands

Current V1 keeps the filesystem permission vocabulary deliberately narrow: `package-output-only` or `none`.

## Non-claims

This slice does not yet:

- load target packs from npm packages
- load target packs from arbitrary local paths
- execute target packs in a sandboxed child process
- migrate the emission manifest from emitter-source-set provenance to target-pack package provenance
- move admission plans entirely out of core rail code
- split `ComponentIR` into semantic IR plus target-family IR
- prove any non-web target beyond the existing Figma descriptor target

## Next admissible slices

1. Replace framework ID closure in `emitter.ts` with registry-validated target IDs while keeping built-ins as compatibility declarations.
2. Add a registry config file such as `fsds.targets.json` to map target IDs to package/local sources and expected digests.
3. Add a local-path target-pack loader that validates manifest + entrypoint while keeping file writing centralized in core codegen.
4. Bump the emission manifest to bind generated artifacts to target-pack provenance rather than only local emitter source files.
5. Move admission-plan declarations onto target-pack manifests and have the rail consume them through a governed policy layer.
6. Extract one target, preferably Figma or A2UI, into the target-pack shape before attempting SwiftUI or React Native.
