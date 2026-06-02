---
doc_id: REF-MOBILE-PARITY-MATRIX-001
authority: reference
status: draft
title: Mobile-vs-web target parity quality matrix
owner: "@darianrosebrook"
updated: 2026-06-02
---

# Mobile-vs-web target parity — measured quality matrix

Produced by the measurement slice `MOBILE-PARITY-QUALITY-RECON-01`. This is a
**reference** artifact — a measured, reproducible lookup surface — not a
roadmap: it states what is true now and recommends no future work.

> **Measurement only.** This document reports what
> [`scripts/mobile-parity-matrix.mjs`](../scripts/mobile-parity-matrix.mjs)
> derives from the repository, plus evidence-anchored notes for cells the
> script cannot honestly derive. It draws **no parity claim** and recommends
> **no execution lane** — the SwiftUI-package-vs-Native-View-IR decision is
> deferred to a separate later slice (see *Out of scope* at the end).
>
> Numbers here are reproducible: `node scripts/mobile-parity-matrix.mjs`
> (human), `--json` (machine), `--check` (self-consistency). The script is a
> pure read-only function of the repo — no clock, no network, no randomness —
> so two runs on an unchanged tree are byte-identical. Where this doc and the
> script disagree, the script wins; re-run it.

## How to read the cells

| Cell value | Meaning |
|---|---|
| a concrete value (`full (generated)`, `admitted`, `plan present`) | **machine-derived** from the codebase |
| `unmeasured` | this script **does not measure** this dimension — it is **not** a claim of absence. The accompanying evidence anchor says where to look. |
| `n/a (no generated output)` | the dimension is structurally inapplicable because no generated artifact exists for it to apply to |

The distinction between `unmeasured` and absence is load-bearing: the three
native emitters are **callable emitter code with zero admission
infrastructure** — emitter source files exist, but registry admission, rail
plans, and generated package roots do not. "Unsupported" / "missing" / "not
implemented" would all misstate that.

## The matrix

Eight targets — five web, three native — across eight dimensions. Run at the
spec commit; `--check` exits 0 (47 components via the contracts-fs walk, 8
targets, 8 dimensions, derivations consistent).

`figma` is the repo's sixth admitted `BuiltinTargetId` but is excluded from this
parity comparison: it is a descriptor target, not a web-or-native UI framework.

| Dimension | react | vue | svelte | angular | lit | swiftui | react-native | jetpack-compose | Derived? |
|---|---|---|---|---|---|---|---|---|---|
| **Component coverage** | full | full | full | full | full | none | none | none | ✅ |
| **Emitter completeness** | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | `unmeasured`¹ | ❌ (file presence ✅) |
| **Compile / admission** | admitted | admitted | admitted | admitted | admitted | not-admitted | not-admitted | not-admitted | ✅ |
| **Token realization** | `unmeasured`² | `unmeasured`² | `unmeasured`² | `unmeasured`² | `unmeasured`² | `unmeasured`³ | `unmeasured`³ | `unmeasured`³ | ❌ |
| **Behavior / controller** | `unmeasured`⁴ | `unmeasured`⁴ | `unmeasured`⁴ | `unmeasured`⁴ | `unmeasured`⁴ | `unmeasured`⁵ | `unmeasured`⁵ | `unmeasured`⁵ | ❌ |
| **Surface support** | `unmeasured`⁶ | `unmeasured`⁶ | `unmeasured`⁶ | `unmeasured`⁶ | `unmeasured`⁶ | `unmeasured`⁷ | `unmeasured`⁷ | `unmeasured`⁷ | ❌ |
| **Preservation** | yes | yes | yes | yes | yes | n/a | n/a | n/a | ✅ |
| **Rail provenance** | plan | plan | plan | plan | plan | no plan | no plan | no plan | ✅ |

### Derivable facts behind the cells

- **Component coverage** = does a generated package root (`packages/ds-<target>/src`) hold generated output? Web: all five present. Native: none exist.
- **Compile / admission** = is the target in the `BuiltinTargetId` union (`packages/ds-codegen/src/emitter.ts`) **and** has a rail plan **and** a package root? The script reports the triple. Native targets fail all three: `{admittedTarget:false, railPlan:false, packageRoot:false}`.
- **Rail provenance** = does `packages/ds-codegen/src/validation/frameworks/<target>.ts` exist? Web: five plans (+ `figma.ts`). Native: none (probed both the sub-target id and the `swift` family id).
- **Preservation** = `packages/ds-codegen/src/preserve.ts` is a shared, target-neutral module; a target has preserved output only where a generated package root exists. So this tracks package-root presence; it is **not** a per-target preservation engine.

### Evidence anchors for the `unmeasured` cells

1. **Emitter completeness** — emitter *files* are present for all eight: react/vue/svelte 8 `.ts`, angular/lit 7, **swiftui 8, react-native 7, jetpack-compose 7** (`packages/ds-codegen/src/frameworks/<target>/`). The script reports the count; it does **not** judge whether the emitter produces correct/complete output. That is the "callable emitter code" fact — present for native, completeness unscored.
2. **Token realization (web)** — web token output is exercised by the `tokens:*` gates and the rail diff; this script does not score depth.
3. **Token realization (native)** — typed token *facts* are available in the IR (`FEAT-MOBILE-IR-001`, closed). Native *realization* — Swift `Color`/`CGFloat`, Kotlin `Color`/`Dp`, RN style surfaces — is not built and not measured here. Typed facts solved availability, not realization.
4. **Behavior/controller (web)** — behavior primitives are mirrored across the five web frameworks (`useFocusTrap`/`createFocusTrap`/…); depth unscored.
5. **Behavior/controller (native)** — `docs/successor-work-mobile-rail-sweep.md @ 8c19a4d` categorizes **D=9** runtime/controller components; native controller support is not measured here.
6. **Surface support (web)** — DOM gives slots/events/document-focus/positioning; depth unscored.
7. **Surface support (native)** — `surface-emit.ts` exists under each native emitter dir, but `SurfaceIR` substrate-neutrality is **unproven** for native host-adoption (Tooltip/Popover/Dialog/Menu, focus, dismissal, portal/anchor, geometry). Not measured here; named as the real future parity test.

## Prior-sweep reconciliation (cited, not re-derived)

The corpus split below is **cited** from prior measurement slices; this script
does not recompute it (it only asserts the counts partition the 47-component
corpus, which `--check` verifies):

- `docs/successor-work-mobile-rail-sweep.md @ 8c19a4d`: role-loss **0/47**; **A=21** IR-sufficient single shapes, **C=17** composite/collapse, **D=9** runtime/surface.
- `docs/successor-work-mobile-collapse-triage.md @ 7fee739`: **C1**=Details (proven via `FEAT-MOBILE-DISCLOSURE-001`), **C2**=ShowMore/Truncate/TextField, **C3**=11, **C4**=Badge.

Reconciled with the live emitter-surface inventory: the **swift** family has
two sub-targets (`swiftui/` + `uikit/`); **swiftui** carries the native-primitive
proof (Switch → `native-toggle-affordance`, Details → `native-disclosure`).
**jetpack-compose** and **react-native** each have an 8-file-shape emitter
directory (7 `.ts` each here) but **no registered target, no package root, no
rail plan** — callable code, zero admission infrastructure.

## The measured asymmetry

- **Web** (react, vue, svelte, angular, lit): a **governed generated system**. All five are admitted targets with generated package roots, rail plans, preservation-bearing output, and the manifest/diff discipline. Not "done" in a product sense, but governed end-to-end.
- **Native** (swiftui, react-native, jetpack-compose): **callable emitter code, zero admission infrastructure.** Emitter source exists for all three; zero generated package roots, zero registered targets, zero rail plans. SwiftUI carries narrow high-quality semantic proofs (native-primitive collapse, typed-token availability); React Native and Jetpack Compose have emitter scaffolding only.

The two sides are **not comparable as generated systems**. The architectural
wins on the native side (role-elision blocker refuted 0/47, typed-token gap
closed, collapse-intent vocabulary generalized by value not by component name)
are real and sit at the **contract/IR** level — they are **not** the same thing
as generated framework parity, which requires the Native View IR / layout layer,
native token realization, target-pack admission, broad component output, and
surface/runtime proofs that this matrix shows are absent.

## Out of scope (explicitly not decided here)

This slice measures; it does not choose. The following are **named, not
recommended** — the lane decision is a separate later conversation:

- **Lane A** — SwiftUI package + admission for the 21 IR-sufficient (sweep category A) components.
- **Lane B** — Native View IR recon for the 17 composite-layout (category C) components.
- React Native / Jetpack Compose elevation, native token realization, and `SurfaceIR` substrate-neutrality for overlays remain unsized future work.

No parity claim is made. No "next best work" is asserted. The matrix is a
diagnostic surface only.
