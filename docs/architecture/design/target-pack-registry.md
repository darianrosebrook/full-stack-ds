---
doc_id: ARCH-CODEGEN-TARGET-PACK-REGISTRY-001
authority: architecture
status: active
title: Governed Target-Pack Registry
owner: "@darianrosebrook"
updated: 2026-06-11
governs:
  - fsds.targets.json
  - packages/ds-codegen/src/emitter.ts
  - packages/ds-codegen/src/registry.ts
  - packages/ds-codegen/src/target-packs/**
---

# Governed Target-Pack Registry

Full Stack DS currently generates framework packages through built-in emitters. That path is useful, but hardcoding framework names in core codegen is the wrong long-term extension model. A target should become available because an admitted target pack declares what it can emit and what evidence admits that output, not because core codegen imports a new factory by name.

This document defines the target-pack seam.

## Authority split

Core codegen owns contract validation, `ComponentIR` construction, registry resolution, file writing, preservation handling, artifact hashing, emission manifest writing, and rail/admission orchestration.

A target pack owns target-specific lowering, declared output roots and file kinds, capabilities and non-capabilities, admission commands and known gaps, and its requested permission posture.

A target pack must not become a second contract interpreter. It should consume governed IR and emit declared artifacts.

## Current implementation

This slice introduces `TargetPackManifestV1` under `packages/ds-codegen/src/target-packs/manifest.ts` and binds every current built-in target to a manifest in `packages/ds-codegen/src/target-packs/builtin.ts`.

`registry.ts` attaches a `targetPack` manifest to each executable `TargetBinding` and validates the manifest before registering the target. It also records declared target-pack metadata separately from executable availability. The root `fsds.targets.json` file declares admitted built-in targets and local target-pack declarations. If the file is missing, codegen falls back to the same built-in target set for compatibility.

`emitter.ts` separates `BuiltinTargetId` from `TargetId`: built-ins remain a closed compatibility declaration, while `TargetId` is registry-admitted string identity. `parseTargetArg` validates target-id syntax and then checks the requested id against the registry's executable targets.

`packages/ds-codegen/src/target-packs/local.ts` resolves and validates local target-pack manifests without importing their entrypoints. Local packs can be declared, loaded, fingerprinted, and described. They are metadata-only in this slice: `registry.declared()` includes them, `registry.describeDeclaration()` exposes their manifest and load metadata, while `registry.available()` omits them and `registry.get()` refuses them as non-executable.

That means this slice is a governed registry/config/local-manifest foundation, not the full external package loader.

## Manifest contract

A V1 target-pack manifest declares:

- `target`: id, family, label, maturity
- `compatibility`: codegen protocol, component IR version, optional target-family IR version
- `entrypoints`: emitter module reference
- `outputs`: component root, barrel file, emitted file kinds
- `capabilities`: components, tests, behavior, compound parts, surface, token strategy, custom regions
- `permissions`: filesystem, network, postinstall posture
- `admission`: optional command plan and known gaps

Target IDs identify registry entries. Target families are the closed vocabulary: `web-dom`, `native-view`, `design-tool`, `agent-schema`, `docs`, and `test-plan`.

## Registry config contract

The root `fsds.targets.json` file uses schema version `fsds.target-registry.v1` and declares a target list. Each entry has an `id` and a `source`:

- `builtin`: admits one of the in-repo built-in targets.
- `local`: declares a workspace-local target-pack package root and manifest path.

The config validator rejects duplicate ids, malformed target ids, absolute paths, and path escapes. Built-in materialization admits only known built-ins. Local materialization resolves the package root under the workspace, resolves the manifest under the package root, validates the manifest with `TargetPackManifestV1`, verifies the manifest target id matches the registry target id, verifies the declared emitter entrypoint exists under the package root, and records the manifest SHA-256 digest.

## Local target-pack loading posture

Local loading is metadata-only in this slice. The loader proves that the declaration can be resolved and validated under the repository boundary, but does not import the declared entrypoint.

The execution status is explicit:

- `status`: `metadata-only`
- `reason`: `local_emitter_execution_not_implemented`

This distinguishes undeclared targets, declared local targets, and executable targets.

## Rail boundary

The emission manifest and admission rail use the `FrameworkId` vocabulary: react, vue, svelte, lit, angular, and react-native (manifest schema v6).

`TargetBinding` carries an optional `railFrameworkId`. Targets that participate in the framework-admission rail set this field. Descriptor targets such as Figma generate artifacts without joining the framework rail.

## Safety posture

The manifest validator rejects absolute paths, relative path escapes, missing required blocks, unknown target families, disallowed network/postinstall posture, and malformed admission commands.

The registry config validator rejects wrong schema versions, empty target lists, duplicate target ids, malformed target ids, and local package/manifest path escapes.

The local loader additionally rejects non-local source kinds, missing package roots, missing manifests, manifest id mismatches, missing emitter entrypoints, entrypoint path escapes, and disallowed permission posture through the shared manifest validator.

## Tests and evidence surface

The target-pack test surface covers built-in manifest validation, closed vocabulary enforcement, registry config loading, duplicate id refusal, local partitioning, path escape refusal, registry-admitted CLI target parsing, default target selection, local manifest loading, SHA-256 fingerprinting, metadata-only status, id mismatch refusal, missing entrypoint refusal, disallowed permission refusal, and registry behavior where local packs are declared/describable but not executable.

The intended targeted validation is:

```sh
pnpm --filter @full-stack-ds/codegen test -- target-packs registry
pnpm --filter @full-stack-ds/codegen typecheck
```

## Non-claims

This slice does not yet load target packs from npm packages, run local target-pack emitters, migrate the emission manifest from emitter-source-set provenance to target-pack package provenance, move admission plans entirely out of core rail code, split `ComponentIR` into semantic IR plus target-family IR, or prove any non-web target beyond the existing Figma descriptor target.

## Next admissible slices

1. Add an executable local target-pack adapter that imports only after manifest validation and keeps file writing centralized in core codegen.
2. Bump the emission manifest to bind generated artifacts to target-pack provenance rather than only local emitter source files.
3. Move admission-plan declarations onto target-pack manifests and have the rail consume them through a governed policy layer.
4. Extract one target, preferably Figma or A2UI, into the target-pack shape before attempting SwiftUI or React Native.
5. Add package-source loading with explicit digests only after the local loader and provenance surface are admitted.
