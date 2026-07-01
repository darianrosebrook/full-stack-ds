---
doc_id: REF-RAIL-NATIVE-TOOLCHAIN-RECON-001
authority: reference
status: active
title: Admission-rail toolchain-polymorphism recon
owner: "@darianrosebrook"
updated: 2026-06-26
spec: RAIL-NATIVE-TOOLCHAIN-RECON-01
verified_at_commit: 6735f3cc
---

# Admission-rail toolchain-polymorphism recon

## Why this exists

The project thesis is that one contract drives every framework target *idiomatically and provably*. Today that thesis is fully discharged only on the web DOM family (React, Vue, Svelte, Angular, Lit) and partially on React Native. The native targets (Jetpack Compose, SwiftUI) are emitter scaffolds and hand-authored goldens — design intent, not proven realizations. The goal is to bring them to the same frontier bar as web: **compile-admitted and runtime-proven on their own native toolchain**, not left as half-done proofs.

The single thing blocking all of the native targets is the same thing, and it is not emission. The IR is already substrate-aware by design (`tokenFacts`, `tokenScopes`, `BehaviorIR.normalizedChannels`, `SurfaceIR`, the ARIA `RootSemanticsIR` projection were added for SwiftUI/Compose/RN under `FEAT-MOBILE-IR-001`), and React Native has already proven the translation shape (`rnComponentForNode`, `CSS_TO_RN_STYLE`, `tokenScopes`→`StyleSheet`). What blocks the natives is the **admission rail**: it is hardwired to a TypeScript toolchain. Every rail plan verifies a target by shelling out to `pnpm --filter <pkg> run typecheck/test`, which runs `tsc`/`vitest`. Kotlin has no `tsc`; Swift has no `vitest`. A target whose output is `.kt` or `.swift` cannot be admitted by the rail as it stands, no matter how good its emitter is.

So the prerequisite for *all* the native targets is a rail that can verify non-TS output. This recon measures exactly where the rail is TS-only and proposes the shape that makes it toolchain-polymorphic — the same factory/dependency-injection inversion the emitter already uses, applied to admission.

This document specifies the seam. It does **not** cut it. No rail code, no validation plan, no emitter, and no target registration changes in this slice (see `RAIL-NATIVE-TOOLCHAIN-RECON-01` non-claims).

## How the inventory was produced

`scripts/rail-toolchain-coupling-audit.mjs` is a pure read-only function of the repo (filesystem reads only; no clock, no network, no randomness — two runs are byte-identical). It parses the live rail/CI sources — it does not read a hardcoded copy — and classifies every admission site into one of three buckets. Re-run it any time with:

```
node scripts/rail-toolchain-coupling-audit.mjs            # human report
node scripts/rail-toolchain-coupling-audit.mjs --json     # machine output
node scripts/rail-toolchain-coupling-audit.mjs --check     # self-consistency gate
```

The `--check` gate asserts the recon premise still holds: exactly six rail-admitted `FrameworkId`s (react, vue, svelte, lit, angular, react-native), figma generate-admitted but rail-excluded, no native target admitted, and every site classified. If a later slice changes any of those, `--check` exits non-zero — so this recon's premise is itself falsifiable, not a snapshot in prose.

## Measured result

As of `verified_at_commit`, the audit reports **12 TS-toolchain-coupled, 4 language-agnostic, 1 already-polymorphic, 0 unclassified** admission sites.

### TS-toolchain-coupled (12) — what a Kotlin/Swift target cannot satisfy today

| Site | Anchor | Why it blocks a non-TS target |
|---|---|---|
| `FrameworkId` union | `validation/types.ts:90` | Closed string-literal union of 6 members. Every rail surface keyed by `FrameworkId` (`PLANS_BY_ID`, `COMPONENT_TREES`, the manifest `Record`, `FRAMEWORK_RANK`) is invisible to a non-member. figma is deliberately not a member — it is the rail-excluded precedent. |
| `PLANS_BY_ID` registry | `validation/validate-cli.ts:64` | Hardcoded `Record<FrameworkId, plan>`. No data-driven plan discovery; a new target requires a code edit here. |
| Per-framework plan commands ×7 | `validation/frameworks/{react,vue,svelte,lit,angular,react-native,figma}.ts` | Every `command` is `["pnpm","--filter","@full-stack-ds/<pkg>","run","<script>"]` (tsc / vitest / vue-tsc / svelte-check). `scope.extensions` is always a TS-toolchain source/SFC set (`.ts`/`.tsx`/`.vue`/`.svelte`/`.json`). A Kotlin/Swift package has no pnpm script and no such extension — the lane cannot run against it. |
| `FRAMEWORK_RANK` | `validation/markdown-report.ts:301` | `Record<FrameworkId, number>`; a non-member with no rank breaks report ordering. Cosmetic, but another union-gated edit-site. |
| `package.json` `typecheck:all` | `package.json:55` | An `&&`-chain of pnpm TS package typechecks. No slot for `./gradlew compileKotlin`. |
| `package.json` `test:frameworks` | `package.json:46` | An `&&`-chain of pnpm TS package tests. No slot for a JVM/Gradle test run. |

The load-bearing one is the **per-framework plan command**: that is where "is this target admissible?" is actually decided, and it is hardcoded to a pnpm package script. Everything else keyed by `FrameworkId` is downstream of the same union membership.

### Language-agnostic (4) — already work on any byte output

| Site | Anchor | Note |
|---|---|---|
| `COMPONENT_TREES` (untracked-generated walk) | `validation/required-mode.ts:116` | Presence + byte-stability of a generated tree; works on `.kt` as well as `.tsx`. Only the `FrameworkId` *type* on each entry is coupled — the in-code comment already frames it as data "so a future framework addition flows through." |
| `GENERATED_TREE_PREFIXES` (reviewer git-range) | `validation/git-range-scope.ts:37` | Path-prefix projection over a diff range; language-neutral. |
| CI generated-tree `git diff` | `.github/workflows/ci.yml:142` | Byte-stability is language-agnostic. Adding a Compose tree is a one-line edit. figma's generated tree is already absent from this list, so a non-listed generated target is not unprecedented. |
| pre-push generated-tree `git diff` | `.githooks/pre-push:149` | Same as CI. |

These need at most a type widening; the checks themselves transfer unchanged. **Byte-stability is necessary but not sufficient** — it proves "the regenerated bytes did not change," never "the bytes compile." That gap is the core risk (see below).

### Already-polymorphic (1) — the seam to lean on

| Site | Anchor | Note |
|---|---|---|
| `PlanCommand.command` argv tuple | `validation/types.ts:165` | `readonly [string, ...string[]]` — accepts any executable. `["./gradlew","compileKotlin"]` is already type-legal here. The coupling is *convention* (all seven plans fill it with `pnpm`), not type. |

This is the existing structural seam. The polymorphic rail does not invent a new command shape — it lets a target *supply* the argv that already fits this slot.

## The two admission tiers (load-bearing distinction)

The rail has two membership tiers, and figma vs RN sit on opposite sides:

- **Generate-admitted** — the target emits and its output is byte-stable-committed. Crossed by figma *and* RN. Gated by `fsds.targets.json` + registry binding + builtin manifest + `workspaceExists` + (optionally) the CI git-diff tree list. None of these requires a compiler.
- **Rail-admitted** — the rail runs framework tooling against the output. Crossed by RN; **not** by figma. Gated by `FrameworkId` membership + `PLANS_BY_ID`/`DEFAULT_FRAMEWORKS` + a plan whose command actually verifies the output.

figma is the precedent for "generate-admitted but not rail-admitted": its plan file exists (`validation/frameworks/figma.ts`) typed as `Omit<FrameworkValidationPlan,"framework"> & {framework:"figma"}` precisely because `figma` is not a `FrameworkId`, and it is never imported into `PLANS_BY_ID`. Its descriptor validity is pinned by **emitter unit tests** instead of a compiler pass.

This gives the native targets a fallback tier: a Compose target could be *generate-admitted* (byte-stable + emitter unit tests over the emitted Kotlin string) without a Gradle toolchain. But that is the weaker existence proof — it proves the emitter is deterministic, not that the Kotlin compiles. The frontier bar (compile-admitted + runtime-proven) requires crossing the rail tier, which requires a real native compiler in the rail.

## Proposed seam: a target-supplied admission descriptor (factory/DI)

The emitter is already polymorphic by factory/DI: `createReactNativeEmitter()` returns a `FrameworkEmitter`, the registry binds it by id, and `--target=all` discovers it from data (`fsds.targets.json`) rather than a hardcoded switch. The rail should mirror that exactly. Today the rail *is* the hardcoded switch the emitter avoided.

The inversion: instead of the rail enumerating each target's idiosyncrasies, **each target supplies an admission descriptor** that the rail consumes through one stable interface. The target declares *what its admission means*; the rail enforces *the standards we agree are non-negotiable* regardless of toolchain.

### What the target supplies (the injected descriptor)

A shape along these lines (illustrative — not authored in this slice):

- `outputTree` — the workspace-relative generated-tree root (replaces the target's hardcoded entry in `COMPONENT_TREES` / `GENERATED_TREE_PREFIXES` / the CI diff list).
- `sourceExtensions` — the file extensions this target emits (`.tsx` / `.kt` / `.swift`), so the artifact-join scope is target-declared, not assumed `.ts`.
- `compileCommand` — argv for the compile/typecheck pass (`["pnpm","--filter",…,"run","typecheck"]` *or* `["./gradlew",":ds-compose:compileKotlin"]` *or* `["xcodebuild",…]`). Slots into the existing `PlanCommand.command` tuple, which already accepts it.
- `testCommand` — argv for the behavioral/runtime pass (vitest, or `./gradlew test` with Robolectric/`androidx.compose.ui.test`, or `xcodebuild test`).
- `provenanceSourceSet` — the emitter source files whose hashes bind generated bytes to codegen (replaces the per-target entry in `cli.ts` `CODEGEN_SOURCE_FILES`).

This descriptor is the rail analogue of the `FrameworkEmitter` object. A target that has one is rail-admissible; the rail no longer needs to know it exists at type-definition time.

### What the rail enforces centrally (non-negotiable, toolchain-independent)

These stay owned by the rail and apply to every target regardless of what `compileCommand` runs:

- **Byte-stability** — regenerate, then `git diff --exit-code` over `outputTree`. Already language-agnostic; only the tree list needs to become descriptor-driven.
- **Codegen-source provenance binding** — generated bytes hash-bound to the emitter source set, so output cannot drift from the codegen that claims to produce it. The mechanism is hashing; it does not care whether the bytes are Kotlin.
- **Contract↔artifact binding** — every admitted artifact traces to a contract. Substrate-neutral; it operates on the manifest, not on `tsc` output.
- **The compile/test commands actually ran and passed** — the rail owns *that the descriptor's commands were executed and their exit codes checked*; the target owns *what those commands are*. This is the crux of the inversion: the rail guarantees the standard was applied; the target declares how its toolchain satisfies it.

The split maps cleanly onto the measured buckets: the **language-agnostic** sites become the rail's central enforcement (parameterized by `outputTree`); the **TS-coupled** plan-command sites become target-supplied `compileCommand`/`testCommand`; the **already-polymorphic** argv tuple is the slot the injected command fills.

## Ordered follow-on slices (NOT started here)

1. **Extract the rail admission-descriptor interface from the six existing plans, no behavior change.** Refactor `PLANS_BY_ID` + `COMPONENT_TREES` + `GENERATED_TREE_PREFIXES` + `FRAMEWORK_RANK` so each is derived from a per-target descriptor, with the six current TS targets producing byte-identical rail behavior. Pure refactor; the `--check` audit and the existing rail tests are the regression oracle. This is where the `FrameworkId` union loosens from a closed literal to a descriptor-keyed registry.
2. **Move each target to a self-declared descriptor.** Each of the six TS targets ships its own descriptor (still pnpm-shaped). Proves the interface carries the existing behavior before any new toolchain depends on it.
3. **Add the first non-TS toolchain lane — Compose / Gradle — as the first new descriptor consumer.** Stand up a `packages/ds-jetpack-compose` Gradle module, a `compileCommand` of `./gradlew compileKotlin`, a `testCommand` on Robolectric or `androidx.compose.ui.test`, and a CI native-build job (JDK + Compose SDK). This is the slice that actually requires new infrastructure. SwiftUI follows as the second consumer and is what reveals whether the interface generalized or merely accommodated Compose.

Order matters: slices 1–2 are zero-risk refactors that make slice 3 a *consumer* of a proven interface rather than a special case. Doing Compose end-to-end first would bake Compose-specific assumptions into "the native rail" — the same mistake the emitter avoided by being factory/DI from the start.

## Load-bearing risk

**A non-TS target can emit byte-stable, deterministic, provenance-bound source that does not compile.** Byte-stability and emitter unit tests (the figma tier) prove the emitter is a deterministic function of the contract — they prove nothing about whether the emitted Kotlin/Swift is *valid*. Only a real compiler in the rail closes that gap.

Concrete evidence this is not hypothetical: the hand-authored golden `packages/ds-codegen/__golden__/Switch/Switch.compose.kt` line 67 reads `val resolvedChecked = checked ?? uncontrolledChecked`. `??` is C#/Swift null-coalescing; **Kotlin's operator is `?:`**. The golden — written by hand, reviewed, committed — is invalid Kotlin. An LLM- or template-emitted Kotlin corpus will contain the same class of error at scale, and every TS-tier gate (byte-stability, provenance, emitter unit tests) would pass it. This is the whole argument for crossing the rail tier rather than settling for the figma tier: without `./gradlew` in the rail, "the Compose target is admitted" would mean "the bytes are stable," not "the components compile." For a project whose claim is *provable* realization, that is not admission.

## Non-claims

- This recon specifies the polymorphic-rail seam; it does not refactor the rail, extract any interface, or change any validation plan.
- It registers no native target, widens no `FrameworkId` union, adds no rail plan.
- It stands up no Gradle/JVM or Xcode toolchain and compiles no emitted Kotlin/Swift.
- It alters no emitter (Compose, Swift, RN, or web).
- It does not assert which native target ships first; it establishes the toolchain-agnostic rail as the shared prerequisite for all of them.
