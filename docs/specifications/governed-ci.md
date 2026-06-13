---
doc_id: SPEC-GOVERNED-CI-001
authority: spec
status: implemented
title: Governed CI and the rail operator workflow
owner: "@darianrosebrook"
updated: 2026-05-20
verified_at_commit: 6ec2813
governs:
  - package.json
  - .github/workflows/ci.yml
  - packages/ds-codegen/src/validation/validate-cli.ts
---

# Governed CI and the rail operator workflow

> CODEGEN-RAIL-DOCS-GOVERNED-CI-01

This doc is the operator-facing companion to [`docs/specifications/admission-rail.md`](./admission-rail.md) (the rail's concept) and [`docs/specifications/manifest-schema.md`](./manifest-schema.md) (the manifest's reference). Read those first if you haven't — this doc assumes you know what the rail proves and what the manifest carries.

This doc owns: what the operator runs, what CI runs, how the two compose, and how to read the rail's outputs in a way that's citable in closure notes.

## The two commands

The operator surface is two npm scripts.

### `pnpm run governed:rail`

The default invocation. Equivalent to:

```bash
pnpm run generate -- --target=all \
  && node packages/ds-codegen/dist/validation/validate-cli.js \
       --require-artifact-manifest
```

Two phases:

1. **Generate** all five Web DOM frameworks from contracts. Writes the v6 manifest at `packages/ds-codegen/.emission-manifest.json` as the last step.
2. **Validate** in required mode. Refuses to pass unless every integrity invariant holds (see admission-rail.md's diagnostic-code reading guide).

Exit code 0 = the bytes on disk match the manifest's claims across all four evidence rungs (artifact, contract, emitter source, environment). Exit 1 = at least one rung drifted; stderr names the specific diagnostics with their codes and paths.

The output goes to two surfaces:

- **stdout** — the canonical machine-readable JSON `RailReport`. Pipe this to `jq` for programmatic queries; redirect to a file to cite in closure notes.
- **stderr** — human-readable summary table + a "Required-mode diagnostics" block when codes fired. Also writes a markdown projection at `tmp/generated-admission-report.md` (gitignored).

### `pnpm run governed:rail:changed`

Adds a reviewer projection scoped to the git range `origin/main...HEAD`:

```bash
pnpm run generate -- --target=all \
  && node packages/ds-codegen/dist/validation/validate-cli.js \
       --require-artifact-manifest \
       --scope-to-git-range origin/main...HEAD
```

Same two phases. Same exit code semantics. Same JSON canonical output. The addition is a `scopedProjection` field on the report and a "Changed artifact scope" section in the markdown, narrowing the highlighted evidence to the PR-relevant subset.

**The rail still admits the FULL workspace in scoped mode.** This bears repeating in operator documentation: the scoped report is reviewer ergonomic, NOT a reduced gate. Operators tempted to "make CI faster" by scoping are misreading the surface; the rail's overall verdict is independent of the projection.

### `pnpm run governed:rail:react-native`

React Native is part of the default rail, and also has a targeted admission
lane for RN-only iteration:

```bash
pnpm run generate:react-native \
  && node packages/ds-codegen/dist/validation/validate-cli.js \
       --require-artifact-manifest \
       --framework=react-native
```

This admits the generated RN package through package typecheck, focused generated RN render tests, and required-mode manifest integrity scoped to the RN framework id. The render tests use a Vitest-only native host shim and cover host-render archetypes, variant/state style slices, and admitted presence surfaces. The lane does not prove simulator/device runtime behavior, native visual parity, platform accessibility parity, anchored collision handling, or compound-part emission.

`pnpm run governed:rail:react-native:changed` adds the same git-range projection as the web changed rail.

## Anatomy of a rail run

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. pnpm run generate -- --target=all                            │
│    • Build codegen (tsc).                                       │
│    • Read all 53 contracts.                                     │
│    • Build IR per contract.                                     │
│    • For each framework, emit 5 file groups (source, hook,      │
│      tests, css, etc.).                                         │
│    • Write .emission-manifest.json with v6 environment +        │
│      emitterSourceSets + groups + per-file digests.             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. node validate-cli.js --require-artifact-manifest             │
│                                                                 │
│    Read manifest:                                               │
│      • readManifestForVerification() — structural sanity        │
│        + digest grammar + framework key coverage.               │
│      • Returns {absent | schema_mismatch | parse_error | ok}.   │
│      • Non-ok kinds short-circuit framework plans.              │
│                                                                 │
│    Verify integrity (if manifest read = ok):                    │
│      • Output integrity: all manifest files exist + match sha.  │
│      • Untracked generated paths: walk components trees.        │
│      • Contract integrity: each contract still on disk + sha.   │
│      • Emitter integrity: each declared source still on disk.   │
│      • Environment integrity: nodeMajor, pkg version, lockfile. │
│                                                                 │
│    Run framework admission plans (parallel where independent):  │
│      • react: tsc                                               │
│      • vue: vue-tsc                                             │
│      • svelte: svelte-check                                     │
│      • angular: tsc + ngc strictTemplates                       │
│      • lit: tsc + lit-analyzer                                  │
│                                                                 │
│    Join manifest × command scopes → ArtifactAdmissionEntry per  │
│    group. Build per-component admission index.                  │
│                                                                 │
│    Optional: project to git range → scopedProjection.           │
│                                                                 │
│    Emit:                                                        │
│      stdout — RailReport JSON                                   │
│      stderr — summary table + required-mode diagnostics         │
│      tmp/generated-admission-report.md                          │
│                                                                 │
│    Exit 0 iff:                                                  │
│      • All required-mode invariants hold AND                    │
│      • Every framework plan exited 0.                           │
└─────────────────────────────────────────────────────────────────┘
```

Order matters: integrity invariants are checked BEFORE framework plans run. Catastrophic failures (MISSING / MALFORMED / SCHEMA_MISMATCH) short-circuit plan execution — running 20 seconds of tsc/ngc/lit-analyzer when the evidence trail is already broken would only add misleading "pass" lines to a report that's going to fail anyway.

Non-catastrophic integrity diagnostics (HASH_MISMATCH, CONTRACT_HASH_MISMATCH, etc.) let plans run, because plan output is still meaningful evidence even when content has drifted.

## CI integration

The rail is wired into [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) as a two-step proof. The order of these two steps is the load-bearing piece:

```yaml
- name: Governed generated-artifact rail
  run: pnpm run governed:rail

- name: Generated artifacts are committed
  run: |
    git diff --exit-code -- \
      packages/ds-react/src \
      packages/ds-vue/src \
      packages/ds-svelte/src \
      packages/ds-angular/src \
      packages/ds-lit/src
```

### What each step proves

**Step 1 (`governed:rail`)**: the full generated workspace was regenerated from contracts and admitted by required-mode manifest validation. After this step succeeds, the bytes on disk are guaranteed to:

- Match the manifest's recorded digests across all four evidence rungs.
- Pass each framework's compiler/parser/linter.

But — and this is why step 2 exists — the regeneration in step 1 may have changed bytes from what was committed. The manifest now matches disk, but disk may not match the committed tree.

**Step 2 (`git diff --exit-code`)**: the regenerated workspace was already committed. After step 1 wrote fresh bytes to `packages/ds-{framework}/src/`, this step checks that those bytes are identical to what's on the PR branch. If they're not, the contracts changed without their emitted artifacts being updated and committed — the codegen contract is broken.

### Why the order is load-bearing

Reversing would let a stale workspace pass the diff check on the way in:

- If `git diff` ran first against an unchanged stale workspace, it would pass (the committed bytes match themselves).
- Then `governed:rail` would regenerate and the diff check would already be over.
- The PR would land with stale artifacts.

Validating first, then refusing drift, is the only ordering that catches "contract changed but artifacts weren't regenerated."

### Why step 2 is CI-only

`governed:rail` is designed to be local-runnable — operators run it on their machine to verify their work. But `git diff --exit-code` over the framework src trees would block any local invocation where the operator hasn't yet committed (which is most of development). Locally dirty trees are routine; CI-clean trees are mandatory. The split keeps both surfaces honest.

### Failure modes in CI

| Symptom | Cause | Repair |
|---|---|---|
| `governed:rail` step fails with a `RAIL_REQUIRE_MANIFEST_*` diagnostic | Manifest invariant broken (digest drift, missing path, environment mismatch). | Read the diagnostic code and follow the repair in admission-rail.md's reading guide. Usually: `pnpm run generate -- --target=all && git add packages/ds-*/src && git commit`. |
| `governed:rail` step fails on a framework check (tsc/ngc/lit-analyzer/etc.) | Generated code doesn't compile or fails framework lint. | Read the framework diagnostic block in stderr. The fix typically lives in the contract or the emitter — not in the generated file (which is overwritten on regenerate). |
| `governed:rail` passes, `git diff` step fails | Contracts changed but `packages/ds-*/src` weren't regenerated and committed. | Run `pnpm run generate -- --target=all` locally, then commit the resulting diff in `packages/ds-*/src`. |

The most common scenario is the third row: an operator edits a contract, runs tests locally without regenerating, sees them pass against the existing committed artifacts, and pushes. The rail catches this in CI.

## Reading the RailReport JSON

`stdout` of `governed:rail` is the canonical machine-readable record. The full type is `RailReport` in [`packages/ds-codegen/src/validation/types.ts`](../packages/ds-codegen/src/validation/types.ts).

Top-level shape:

```ts
{
  timestamp: string;                          // ISO 8601 of the rail run
  scope: "workspace";                         // Always — see "what the rail is not" in admission-rail.md
  artifactSelection: "by_manifest" | "none";  // "by_manifest" when a manifest was consumed
  artifactManifest: EmissionManifest | null;  // The full manifest the rail attributed against
  requireArtifactManifest: boolean;           // Was --require-artifact-manifest passed?
  requiredModeDiagnostics?: RailDiagnostic[]; // Present when requireArtifactManifest = true
  componentsIndex?: ComponentAdmissionIndex;  // Per-component pivot of per-framework artifacts
  scopedProjection?: ScopedProjection;        // Present when --scope-to-git-range was passed
  frameworks: Record<FrameworkId, FrameworkValidationResult>;
  knownGaps: string[];                        // Declared analyzer-policy boundaries
  overall: "pass" | "fail";
}
```

### Common queries

```bash
# Did the rail pass?
jq '.overall' /tmp/rail.json
# → "pass" or "fail"

# What required-mode diagnostics fired (if any)?
jq '.requiredModeDiagnostics // [] | map(.code)' /tmp/rail.json
# → ["RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH"]

# Which files drifted in a HASH_MISMATCH diagnostic?
jq '.requiredModeDiagnostics | map(select(.code == "RAIL_REQUIRE_MANIFEST_HASH_MISMATCH")) | .[0].paths' /tmp/rail.json

# How many groups did each framework admit?
jq '.frameworks | to_entries | map({key, count: (.value.artifacts // []) | length})' /tmp/rail.json

# What's the component pivot say about Button?
jq '.componentsIndex.Button' /tmp/rail.json
# → {react: {status, coverages, knownRuleNarrowings}, vue: {...}, ...}

# What were the scoped projection counts?
jq '.scopedProjection | {matched: (.matchedGroups | length), changedFiles: (.changedGeneratedPaths | length), changedContracts: (.changedContractPaths | length)}' /tmp/rail.json

# What environment produced this manifest?
jq '.artifactManifest.environment' /tmp/rail.json
# → {nodeMajor: 22, codegenPackageVersion: "1.0.0", lockfile: {...}}
```

### Stable claims

These fields are public API for closure-note tooling; they are not renamed without a deliberate breaking change:

- `overall` — always `"pass"` or `"fail"`.
- `requiredModeDiagnostics[i].code` — one of the documented `RAIL_REQUIRE_MANIFEST_*` codes.
- `frameworks[<id>].status` — `"pass"` or `"fail"`.
- `frameworks[<id>].checks` — the per-check outcome map.
- `componentsIndex[<name>][<framework>].status` — `"pass" | "fail" | "not_admitted"`.
- `scopedProjection.matchedGroups[i]` shape (component, framework, contract, files, admission).

Other fields (timestamps, manifest sub-shapes) follow the schema version in [`docs/specifications/manifest-schema.md`](./manifest-schema.md).

## Reading the markdown report

Written to `tmp/generated-admission-report.md` after every rail run (gitignored, regenerated each time). The markdown is a citation-friendly projection of the same JSON evidence — designed for pasting sections into closure notes, code review comments, or audit logs.

Section layout:

```
> Derived from RailReport at <timestamp>; manifest schemaVersion vN.
> The JSON is canonical.

# Framework admission rail report

- Overall: PASS|FAIL
- Scope: workspace
- Artifact selection: by_manifest | none
- Required-mode invocation: yes | no
- Manifest: <count> group(s), <count> file(s), schema vN, generated <when>

## Per-framework summary
  Table: framework | status | duration | checks | artifact groups

## Environment provenance         (only when manifest present)
  - Node major
  - Codegen package version
  - Lockfile path + short hash

## Per-framework emitter provenance (only when manifest present)
  Table: framework | source files count

## Changed artifact scope          (only when --scope-to-git-range was passed)
  Doctrine sentence: "Reviewer projection over the full admission
  report below. The rail still admitted the full workspace."

  - Counts: matched groups, changed files, changed contracts,
    unmatched generated paths, non-generated changed paths.

  Tables for: matched groups (with contract column),
              unmatched generated paths (with required-mode hand-off note),
              changed contracts (with required-mode hand-off note),
              non-generated changed paths.

## Per-component admission index    (only when manifest present)
  Table: Component | react | vue | svelte | lit | angular
  Cell values: status + coverage abbreviations + (rule narrowings if any).

## Required-mode diagnostics        (only when requiredModeDiagnostics non-empty)
  One subsection per diagnostic code, with message and up to 10 affected paths.

## Known gaps                       (only when knownGaps non-empty)
  Verbatim list of declared analyzer-policy boundaries.
```

The authority footer at the top — "The JSON is canonical." — is deliberate. The markdown is a derived projection; if a closure note quotes the markdown and a reviewer wants to verify against the source-of-truth, they should `jq` the JSON.

## When to use `governed:rail:changed`

The changed-artifact projection is for **reviewer focus, not CI pipeline efficiency.** Two valid use cases:

1. **PR reviewer walk-through.** You're reviewing a PR that touched contracts or codegen. Running `governed:rail:changed` against the PR branch produces a markdown report whose "Changed artifact scope" section names exactly which artifact groups were affected, which contracts changed, and which admission entries covered them. Faster comprehension than reading the full report.

2. **Closure-note citations.** When writing a closure note for a multi-component contract change, scoping makes it easy to enumerate the affected components without manually filtering the full per-component index.

Two invalid use cases:

1. **"Make CI faster."** The scoped report is a projection over the full admission run. It does not reduce verification scope. CI uses `governed:rail` (unscoped); changing it to `governed:rail:changed` would not save time — both run the full generate + full validate pipeline.

2. **"Skip rail for unchanged components."** The scoped report's `unmatchedGeneratedPaths` exists specifically to surface changed generated paths that no manifest group claims (the manifest is stale relative to the PR). Treating a clean projection as "nothing changed" misreads the doctrine — the projection is what changed in the manifest's view, NOT a proof that nothing else needs checking.

## Local vs CI invocation

| Surface | Local | CI |
|---|---|---|
| `pnpm run governed:rail` | yes — verify before commit | yes — runs as a workflow step |
| `pnpm run governed:rail:changed` | yes — for PR reviewer walk-through | possible but not currently wired; the unscoped form is the gate |
| `git diff --exit-code -- packages/ds-*/src` | no — locally dirty trees are routine | yes — load-bearing for catching uncommitted regenerate drift |
| `pnpm test` + `pnpm run test:frameworks` | yes | yes |

The split between local-runnable rail and CI-only drift check is intentional. An operator should be able to run `governed:rail` on a dirty branch and get meaningful evidence; CI's job is to refuse landing dirty branches.

## Closure-note citation recipes

When closing a PR, the closure note should cite specific rail evidence rather than "the rail passed." Patterns:

### Citing a clean run

> Governed rail (`governed:rail`) passes at HEAD. Output integrity verified against 1024 files; contract integrity against 53 contracts; emitter integrity against 86 declared sources; environment under Node 22 + codegen 1.0.0 + lockfile sha256 `c2013f6b…`. No required-mode diagnostics. All five frameworks: status=pass.

### Citing a scoped run

> Scoped rail (`governed:rail:changed`) against `origin/main...HEAD` shows 3 matched artifact groups (Button on react/vue/lit), 0 unmatched generated paths, 1 changed contract (`packages/ds-contracts/Button.contract.json`). Full-workspace admission still passes (overall: pass).

### Citing a drift-and-fix

> Initial run fired `RAIL_REQUIRE_MANIFEST_CONTRACT_HASH_MISMATCH` on `packages/ds-contracts/Button.contract.json` — the contract was edited without a corresponding regenerate. Resolved with `pnpm run generate -- --target=all` and committed the resulting diff in `packages/ds-{react,vue,svelte,lit,angular}/src/components/Button`. Rerun passes.

### Citing a known-gap declaration

> Rail passes with one known gap (verbatim): "Declared analyzer-policy boundary (NOT a generated-output defect, NOT a binding-site type escape): the lit-analyzer rule `no-incompatible-type-binding` is disabled in the `typecheck:templates` script…" — visible in the markdown report's "Known gaps" section.

The point of these recipes is to make closure-note authorship mechanical. The rail's outputs are the inputs to the recipe; the recipe is what gets pasted into the PR description.

## Where to read next

- [`docs/specifications/admission-rail.md`](./admission-rail.md) — the conceptual entry point. What the rail proves, the four evidence rungs, the doctrinal non-claims, the diagnostic-code reading guide.
- [`docs/specifications/manifest-schema.md`](./manifest-schema.md) — the manifest's field-by-field reference and schema version history.
- [`docs/codegen-authority.md`](./codegen-authority.md) — the authority split that frames the rail's "validation evidence, not generation policy" role.
