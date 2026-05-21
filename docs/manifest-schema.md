---
doc_id: SPEC-MANIFEST-SCHEMA-001
authority: spec
status: implemented
title: Emission manifest schema
owner: "@darianrosebrook"
updated: 2026-05-20
verified_at_commit: f8cbecb
governs:
  - packages/ds-codegen/src/validation/types.ts
  - packages/ds-codegen/.emission-manifest.json
---

# Emission manifest schema

> CODEGEN-RAIL-DOCS-MANIFEST-SCHEMA-01

This is the field-by-field reference for the on-disk emission manifest the codegen CLI writes after every successful `generate` run. The conceptual entry point lives in [`docs/admission-rail.md`](./admission-rail.md) — read that first if you're new to the rail. This doc owns the schema's literal structure, its version history, and the rung-specific non-claims that live alongside each schema version.

## Where the manifest lives

`packages/ds-codegen/.emission-manifest.json`. **Gitignored** ([`.gitignore`](../.gitignore)). The manifest is per-machine runtime state, not a source artifact:

- Each generate run rewrites it from scratch. There is no notion of a manifest history; only "what the last generate run produced."
- Schema migrations are regenerate-driven, never data-migration-driven. A manifest stamped under a previous schema version falls through `RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH` and the operator's repair is `pnpm run generate -- --target=all`.
- Two contributors with the same checked-in artifacts but different recent generate runs will see different manifests on disk. The manifest's claim is "what produced these on-disk bytes on this machine at this moment," not a portable cross-machine attestation.

The path is the constant `EMISSION_MANIFEST_RELATIVE_PATH` in [`packages/ds-codegen/src/validation/emission-manifest-path.ts`](../packages/ds-codegen/src/validation/emission-manifest-path.ts). Moving it is a producer-consumer breaking change; both the codegen CLI's writer and `validate-cli.ts`'s reader resolve through the same constant.

## Role in the rail

The manifest is **an attribution record, not a proof** (see admission-rail.md). It records what the producer claims it emitted, the contract bytes that drove each group, the bounded codegen source surface per framework, and the generate-time environment fingerprint. The verifier joins it against on-disk state and emits typed diagnostics on drift.

Three records compose the rail; this doc covers only the first:

1. The manifest (here).
2. Per-framework admission plans ([`packages/ds-codegen/src/validation/frameworks/*.ts`](../packages/ds-codegen/src/validation/frameworks/)).
3. The verifier ([`packages/ds-codegen/src/validation/required-mode.ts`](../packages/ds-codegen/src/validation/required-mode.ts)).

## Schema version history

The manifest carries an explicit `schemaVersion` integer. Bumps happen whenever the shape changes in a way that requires consumer changes (renamed/removed fields, changed semantic meaning). Additive optional fields do NOT bump.

The migration policy at every version boundary is the same: **previous versions fall through `RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH`; the repair is regenerate.** No compatibility bridges, no data-migration shims. The manifest is gitignored runtime state, so the cost of "regenerate the manifest" is bounded to a single command. The cost of carrying compat shims would be unbounded over the schema's lifetime.

### v1 (pre-REQUIRED-CI-01)

Groups carried `paths: readonly string[]` directly. No `schemaVersion` field on disk. The verifier had no notion of structural integrity beyond "the manifest exists and parses."

Removed entirely in v2. v1 manifests on disk now fall through SCHEMA_MISMATCH (foundVersion: `undefined`).

**Rung-specific non-claim:** at v1 the rail made no integrity claim beyond presence. A v1 manifest could not detect file-content drift, contract-bytes drift, emitter-source drift, or environment drift.

### v2 (CODEGEN-RAIL-ARTIFACT-MANIFEST-REQUIRED-CI-01)

```ts
interface EmittedArtifactGroup {
  framework: FrameworkId;
  component: string;
  files: readonly EmittedArtifactFile[]; // path + sha256
}

interface EmittedArtifactFile {
  path: string;
  sha256: string; // lowercase hex 64 chars
}

interface EmissionManifest {
  schemaVersion: 2;
  generatedAt: string;
  groups: readonly EmittedArtifactGroup[];
}
```

Introduced post-write sha256 digests on every emitted file. The verifier gained `RAIL_REQUIRE_MANIFEST_HASH_MISMATCH`, `RAIL_REQUIRE_MANIFEST_MISSING_PATHS`, `RAIL_REQUIRE_MANIFEST_UNTRACKED_GENERATED_PATHS`, plus the schema-validity codes (MISSING, MALFORMED, SCHEMA_MISMATCH).

**Rung-specific non-claim (artifact attribution):** v2 records what was emitted and lets the verifier detect drift between manifest and on-disk bytes. It does NOT prove the bytes are semantically correct (that's the framework checks' job), it does NOT prove per-file isolation (the framework checks run at package/workspace scope), and it does NOT name where the bytes came from (no contract attribution yet).

### v3 (CODEGEN-RAIL-CONTRACT-PROVENANCE-01)

```ts
interface ContractProvenance {
  path: string;
  sha256: string;
}

interface EmittedArtifactGroup {
  framework: FrameworkId;
  component: string;
  contract: ContractProvenance; // NEW: required
  files: readonly EmittedArtifactFile[];
}

interface EmissionManifest {
  schemaVersion: 3;
  generatedAt: string;
  groups: readonly EmittedArtifactGroup[];
}
```

Every group now records the contract file that produced it. The verifier gained `RAIL_REQUIRE_MANIFEST_CONTRACT_MISSING` and `RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH`. Contract integrity is checked independently of output integrity: a contract edit without regenerate fires `CONTRACT_HASH_MISMATCH` but NOT `HASH_MISMATCH`, because the on-disk output bytes are still what was recorded.

Contract dedupe: the verifier deduplicates contract diagnostics per contract path. The five framework groups for one component share one contract; if that contract drifts, one diagnostic surfaces with one path, not five.

**Rung-specific non-claim (contract provenance):** v3 binds each artifact group to a contract revision, and required mode rejects drift on either side of the source→artifact attribution. It does NOT prove the emitter is deterministic — generated output also depends on emitter source, package versions, runtime, and config, none of which are yet captured. The honest claim is "this group was produced from this contract revision," not "this output is reproducible from this contract alone."

### v4 (CODEGEN-RAIL-EMITTER-PROVENANCE-01)

```ts
interface EmitterSourceFile {
  path: string;
  sha256: string;
}

interface EmitterSourceSet {
  framework: FrameworkId;
  sources: readonly EmitterSourceFile[]; // sorted by path
}

interface EmissionManifest {
  schemaVersion: 4;
  generatedAt: string;
  emitterSourceSets: Record<FrameworkId, EmitterSourceSet>; // NEW
  groups: readonly EmittedArtifactGroup[];
}
```

Top-level `emitterSourceSets` records the per-framework material codegen source bytes. **Deduped at the manifest top level** — each EmittedArtifactGroup references its set by the `framework` key it already carries; the source set is NOT inlined into every group. Inlining 86 sources × 265 groups would have been ~22,000 entries and would have falsely implied per-component emitter divergence; framework-scoped attribution is honest and ~50x smaller.

Verifier gained `RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_MISSING` and `RAIL_REQUIRE_MANIFEST_EMITTER_SOURCE_HASH_MISMATCH`. Cross-set dedupe applies the same way as contract dedupe: `frameworks/react/hook-source.ts` is in four framework sets (it's imported by vue/svelte/angular), but a drift on that file surfaces once with one path.

Hardening follow-up (CODEGEN-RAIL-EMITTER-PROVENANCE-SCHEMA-HARDEN-01) tightened the v4 reader: all five FrameworkId keys must be present, each set's `framework` field must equal its key, `sources[]` must be non-empty, every item must have `{ path: string; sha256: string }`, and the sha256 must match the digest grammar. v4-stamped manifests violating these surface as MALFORMED, not as a silent skip.

**Rung-specific non-claim (emitter source attribution):** v4 binds each artifact group to a bounded codegen source set, and required mode rejects drift on those bytes. It does NOT prove the source set is **complete by construction** — the set is a static declaration in [`packages/ds-codegen/src/cli.ts`](../packages/ds-codegen/src/cli.ts) (`SHARED_EMITTER_SOURCES` + `FRAMEWORK_EMITTER_SOURCES`), not a runtime import-graph scan. If a contributor adds a new emitter helper and forgets to declare it, the manifest silently under-claims coverage and a drift on the un-declared file would not fire EMITTER_SOURCE_HASH_MISMATCH. The completeness invariant is contributor-enforced via code review, not mechanically enforced.

### v5 (CODEGEN-RAIL-ENVIRONMENT-PROVENANCE-01)

```ts
interface EnvironmentProvenance {
  nodeMajor: number;
  codegenPackageVersion: string;
  lockfile: {
    path: string;
    sha256: string;
  };
}

interface EmissionManifest {
  schemaVersion: 5;
  generatedAt: string;
  environment: EnvironmentProvenance; // NEW
  emitterSourceSets: Record<FrameworkId, EmitterSourceSet>;
  groups: readonly EmittedArtifactGroup[];
}
```

Top-level `environment` records the generate-time runtime/dependency fingerprint. Verifier gained `RAIL_REQUIRE_MANIFEST_NODE_MAJOR_MISMATCH`, `RAIL_REQUIRE_MANIFEST_CODEGEN_VERSION_MISMATCH`, `RAIL_REQUIRE_MANIFEST_CODEGEN_PACKAGE_MISSING_OR_MALFORMED`, `RAIL_REQUIRE_MANIFEST_LOCKFILE_MISSING`, `RAIL_REQUIRE_MANIFEST_LOCKFILE_HASH_MISMATCH`.

Two doctrine decisions recorded in the slice commit body, preserved here:

1. **Node major treated as hard MALFORMED**, consistent with other content-drift codes. Operator-facing Node version drift gets the same treatment as committed-artifact drift; the manifest's attribution is equally stale either way.

2. **Package version drift split into two codes:** lockfile sha256 covers transitive + dep + pnpm version + registry resolution through a single digest; codegen package.json version covers the producer's own bump. Both recorded with separate diagnostic codes so a closure note can cite "codegen bumped" vs "a dep moved."

Hardening follow-up (CODEGEN-RAIL-ENVIRONMENT-PROVENANCE-SCHEMA-HARDEN-01) added `RAIL_REQUIRE_MANIFEST_CODEGEN_PACKAGE_MISSING_OR_MALFORMED` (separate from `CODEGEN_VERSION_MISMATCH`) for the case where the verifier cannot establish equality at all — file absent, unreadable, parse failure, no string `version`. Same patch centralized digest comparisons through `safeSha256OfRegularFile` so directory/symlink edge cases route into the matching MISSING code rather than crashing the verifier.

**Rung-specific non-claim (environment attribution):** v5 binds each manifest to a runtime/dependency fingerprint and required mode rejects drift on Node major, codegen package version, and lockfile bytes. It does NOT model OS, architecture, container image, registry mirror state, network conditions, or the resolver's transitive behavior at install time. The honest claim is bounded to those three fields. Closing the determinism gap requires a future "environment attestation" rung that captures container digest, OS, arch — none of which exists today.

## v5 reference

This section is the structural reference for the current schema. Type declarations live in [`packages/ds-codegen/src/validation/types.ts`](../packages/ds-codegen/src/validation/types.ts); this doc summarizes them with semantic guidance the type docstrings do not repeat.

### Top-level

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | `5` (literal) | yes | Must equal `EMISSION_MANIFEST_SCHEMA_VERSION`. Any other value → `RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH`. |
| `generatedAt` | ISO 8601 string | yes | When the producer wrote the manifest. Informational only — not used in verification logic. |
| `environment` | `EnvironmentProvenance` | yes | Generate-time runtime/dependency fingerprint. |
| `emitterSourceSets` | `Record<FrameworkId, EmitterSourceSet>` | yes | Per-framework material source set. ALL five FrameworkId keys must be present with non-empty `sources`. |
| `groups` | `readonly EmittedArtifactGroup[]` | yes | One entry per (framework, component) pair emitted in this run. |

### `EmittedArtifactGroup`

```ts
{
  framework: FrameworkId;
  component: string;
  contract: ContractProvenance;
  files: readonly EmittedArtifactFile[];
}
```

| Field | Required | Notes |
|---|---|---|
| `framework` | yes | One of `"react" \| "vue" \| "svelte" \| "lit" \| "angular"`. |
| `component` | yes | Contract name (e.g. `"Button"`, `"Popover"`). |
| `contract` | yes | The contract file that produced this group. Multiple groups (one per framework) share one contract; the verifier dedupes contract diagnostics per path. |
| `files` | yes | Every file written for this component on this framework, in emission order. Each carries the post-write sha256 of on-disk bytes. |

### `EmittedArtifactFile`

```ts
{ path: string; sha256: string; }
```

- `path` — workspace-root-relative POSIX path. The verifier joins it with `workspaceRoot` to locate the on-disk file.
- `sha256` — lowercase hex 64-char digest of the EXACT on-disk bytes at write time (NOT the in-memory generated string). This captures any newline/formatter effects between the generator's `writeFileSync` and the verifier's re-read.

### `ContractProvenance`

```ts
{ path: string; sha256: string; }
```

- `path` — workspace-root-relative POSIX path of the contract file.
- `sha256` — lowercase hex 64-char digest of on-disk contract bytes at generate time. The verifier re-reads from disk and compares; the read intentionally hashes raw bytes (not parsed-then-stringified JSON) so the digest survives whitespace and key-order changes.

### `EmitterSourceSet`

```ts
{ framework: FrameworkId; sources: readonly EmitterSourceFile[]; }
```

- `framework` — must equal the key under which this set lives in `emitterSourceSets`. The verifier rejects mismatches as MALFORMED.
- `sources` — sorted by path for stable manifest diffs. Must be non-empty (the static declaration in `cli.ts` always emits at least the shared set).

### `EmitterSourceFile`

```ts
{ path: string; sha256: string; }
```

Same shape as `EmittedArtifactFile` but the bytes are codegen source, not generated output. The verifier hashes on-disk bytes and rejects drift via `EMITTER_SOURCE_HASH_MISMATCH`.

### `EnvironmentProvenance`

```ts
{
  nodeMajor: number;
  codegenPackageVersion: string;
  lockfile: { path: string; sha256: string; };
}
```

| Field | Source | Compare semantics |
|---|---|---|
| `nodeMajor` | `process.versions.node` at generate time, parsed to integer major | Verifier reads the live `process.versions.node`, parses major, compares integer equality. |
| `codegenPackageVersion` | `packages/ds-codegen/package.json` `version` field at generate time | Verifier reads the on-disk package.json `version`, compares string equality. Three failure modes: file absent → `CODEGEN_PACKAGE_MISSING_OR_MALFORMED`; both parsed but disagree → `CODEGEN_VERSION_MISMATCH`. |
| `lockfile.path` | Constant `LOCKFILE_RELATIVE_PATH` in cli.ts (currently `"pnpm-lock.yaml"`) | Verifier resolves relative to `workspaceRoot`. Missing or non-regular file → `LOCKFILE_MISSING`. |
| `lockfile.sha256` | Digest of on-disk lockfile bytes at generate time | Verifier re-reads, compares. Drift → `LOCKFILE_HASH_MISMATCH`. |

## The digest grammar

Every `sha256` field in the manifest must match `/^[0-9a-f]{64}$/`:

- Lowercase only. Node's `crypto.createHash("sha256").digest("hex")` always emits lowercase; uppercase indicates hand-edit.
- Exactly 64 hex characters. Truncated, padded, or any other length indicates hand-edit.
- Empty string is rejected (string-typed but grammar-invalid).

The grammar is enforced at `readManifestForVerification`, not at the verifier's hash-compare step. A grammar violation surfaces as `RAIL_REQUIRE_MANIFEST_MALFORMED` with a message naming the exact field (`group[i].files[j].sha256`, `group[i].contract.sha256`, `emitterSourceSets["lit"].sources[i].sha256`, `environment.lockfile.sha256`). This is doctrine: structurally malformed digests should be MALFORMED, not later integrity mismatches that look like content drift. An operator hand-editing a digest is fundamentally different from a real drift, and the diagnostic must tell them which.

## The bounded material source set doctrine

`emitterSourceSets[framework].sources` is the load-bearing concept of the emitter-attribution rung. Two doctrine words:

- **Bounded** — every file is named explicitly in the static declaration. The set is not a runtime import-graph scan; the manifest cannot silently grow or shrink based on what the codegen happens to import at the moment.
- **Material** — inclusion means "this file's bytes can change what THIS framework emits." Validation, reporting, and other non-emit codegen modules are deliberately excluded. The doctrine is "bounded material source set," not "all `src/` except validation."

### Authority table

Single source of truth: [`packages/ds-codegen/src/cli.ts`](../packages/ds-codegen/src/cli.ts), constants `SHARED_EMITTER_SOURCES` (cross-framework) + `FRAMEWORK_EMITTER_SOURCES[<id>]` (framework-specific or cross-framework-borrowed). Reviewers diffing cli.ts see the source set change in the same patch as the helper that motivated it.

Adding a new emitter helper requires explicitly extending the set. If you don't:
- The manifest will silently under-claim emitter coverage.
- A contributor could edit the new helper without `EMITTER_SOURCE_HASH_MISMATCH` firing.
- The rail's emitter-attribution claim becomes technically true but operationally misleading.

The completeness invariant is contributor-enforced through code review, not mechanically enforced. This is acknowledged as the v4 rung's primary non-claim.

### Cross-framework borrowing

Some files are imported by multiple framework emitters:

- `packages/ds-codegen/src/non-react-types.ts` — used by vue/svelte/lit/angular component-source emitters.
- `packages/ds-codegen/src/frameworks/react/hook-source.ts` — imported by vue/svelte/angular as a shared hook substrate.

These files appear in EVERY framework set that depends on their bytes (a drift in `react/hook-source.ts` affects vue/svelte/angular generated output, so all three framework sets must declare it). The verifier deduplicates diagnostics across sets sharing a path — a single drift surfaces as one diagnostic with one path, not N.

## Structural invariants enforced by the reader

These are the conditions `readManifestForVerification` checks before returning `kind: "ok"`. Violating any of them surfaces as `RAIL_REQUIRE_MANIFEST_MALFORMED` with a message naming the exact location.

### Top-level

- `schemaVersion === EMISSION_MANIFEST_SCHEMA_VERSION`. Any other value short-circuits to `SCHEMA_MISMATCH`.
- `groups` is an array.
- `environment` is an object.
- `emitterSourceSets` is an object.
- All five `FrameworkId` keys exist under `emitterSourceSets`.

### `groups[i]`

- `contract` exists and has string `path` + string `sha256`.
- `contract.sha256` matches the digest grammar.
- `files` is an array.
- Every `files[j]` has string `path` + string `sha256`.
- Every `files[j].sha256` matches the digest grammar.

### `emitterSourceSets[framework]`

- The set's `framework` field equals its key (self-identifier check).
- `sources` is a non-empty array.
- Every `sources[i]` has string `path` + string `sha256`.
- Every `sources[i].sha256` matches the digest grammar.

### `environment`

- `nodeMajor` is a non-negative integer.
- `codegenPackageVersion` is a non-empty string.
- `lockfile.path` is a non-empty string.
- `lockfile.sha256` is a string AND matches the digest grammar.

## Schema migration policy

Recap of the policy applied at every v→v+1 boundary so far:

1. The current `EMISSION_MANIFEST_SCHEMA_VERSION` constant is bumped.
2. The producer (codegen CLI) writes only the new shape.
3. The reader compares against the constant. Previous-version manifests on disk surface as `RAIL_REQUIRE_MANIFEST_SCHEMA_MISMATCH` with `foundVersion: <old>`.
4. No data-migration code paths. No compatibility shims. No "read both v4 and v5" branches.
5. Operator repair is always the same single command: `pnpm run generate -- --target=all`.

This works because the manifest is gitignored runtime state, not committed artifact. The cost of "regenerate" is bounded. The cost of carrying compat shims across N future versions would be unbounded.

The same policy will apply at the v5→v6 boundary if a future slice (e.g. environment attestation with container digest) bumps the schema. The producer writes only v6; the reader rejects v5 with SCHEMA_MISMATCH; the operator regenerates.

## Where to read next

- [`docs/admission-rail.md`](./admission-rail.md) — the conceptual entry point. Read this if you're new to the rail or want the doctrinal non-claims before encountering the schema.
- [`docs/governed-ci.md`](./governed-ci.md) — the operator workflow. How `governed:rail` and `governed:rail:changed` are invoked, how to read a JSON/markdown report, what to cite in closure notes.
- [`docs/codegen-authority.md`](./codegen-authority.md) — the authority split this rail's "validation evidence, not generation policy" line refers to.
