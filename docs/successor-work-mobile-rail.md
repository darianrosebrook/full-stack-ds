---
doc_id: SCOPE-MOBILE-RAIL-001
authority: roadmap
status: draft
title: Scoping mobile targets (Swift, Jetpack Compose, React Native) to admission-rail parity
owner: "@darianrosebrook"
updated: 2026-06-09
verified_at_commit: 5103447
# Phase 0 has landed. FEAT-MOBILE-IR-001 (typed token facts) and the Phase 0.3
# FEAT-MOBILE-DISCLOSURE-001 (native-disclosure collapse intent) are authored,
# merged, and closed. FEAT-MOBILE-RN-001 (React Native Phase 1) is authored and
# landed: variant style realization + default-rail graduation (registry, CI/
# pre-push drift coverage). SwiftUI and Compose Phase 1 specs remain future
# work and are NOT yet authored. See "Status reconciliation" in the body.
caws_specs:
  - FEAT-MOBILE-IR-001      # Phase 0.2 — typed token facts IR (CLOSED eb933df)
  - FEAT-MOBILE-DISCLOSURE-001 # Phase 0.3 — native-disclosure collapse intent, Details proof (CLOSED f00110c)
  - FEAT-MOBILE-SWIFTUI-001 # Phase 1 — SwiftUI emitter completion + rail admission (FUTURE — not authored)
  - FEAT-MOBILE-RN-001      # Phase 1 — React Native variant-style realization + default-rail graduation (LANDED)
  - FEAT-MOBILE-COMPOSE-001 # Phase 1 — Jetpack Compose emitter completion + rail admission (FUTURE — not authored)
governs:
  - packages/ds-codegen/src/frameworks/swift/**
  - packages/ds-codegen/src/frameworks/jetpack-compose/**
  - packages/ds-codegen/src/frameworks/react-native/**
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/validation/**
---

# Scope: mobile targets to admission-rail parity

**Bar:** full admission-rail parity — the same four evidence rungs
(artifact↔contract↔codegen↔env), required-mode verifier, `RAIL_*`
diagnostics, CI git-diff drift check, and per-framework admission plan that
the five web targets have. Not a lighter "generate + typecheck" bar.

**In scope:** SwiftUI, Jetpack Compose, React Native. (Swift's UIKit
sub-target is out — see "Decisions needed".)

**Out of scope:** Figma descriptor target (acceptable as-is).

## Status reconciliation (2026-06-02)

This doc scoped the work; Phase 0 has since landed. Read it as the precursor,
not as a statement that the work is unstarted:

- **Phase 0.1 (role elision):** the survey's headline blocker was **refuted** —
  true role loss is 0/47 (`MOBILE-IR-FACT-PARITY-SWEEP-01`,
  `docs/successor-work-mobile-rail-sweep.md`). Reframed from "repair elision"
  to "lock the explicit-role invariant."
- **Phase 0.2 (typed token facts):** **landed** — `FEAT-MOBILE-IR-001`
  (closed `eb933df`). The IR now exposes typed token facts for non-DOM
  consumers; the universal Phase 0.2 gap is closed.
- **Phase 0.3 (collapse intents):** **landed** — `FEAT-MOBILE-DISCLOSURE-001`
  (closed `f00110c`) proved a second collapse-intent vocabulary member
  (`native-disclosure`) on Details; the collector required zero change.
- **Phase 1, React Native (`FEAT-MOBILE-RN-001`):** **landed.** RN realizes
  variant styling from IR facts (cssBlocks × token-scope join, synthesized
  axis props) and graduated into the default rail: registered in
  `fsds.targets.json`, covered by `governed:rail` and the CI/pre-push
  six-tree drift check. Residuals (surfaces, compound parts, state styling,
  part-scoped variants) are recorded as validation-plan knownGaps.
- **Phase 1, SwiftUI/Compose:** still **future** and **not authored**. The
  parity matrix `REF-MOBILE-PARITY-MATRIX-001`
  (`docs/successor-work-mobile-parity-matrix.md`,
  `MOBILE-PARITY-QUALITY-RECON-01` closed `2788873`) now records the updated
  asymmetry: web five + react-native admitted; swiftui/jetpack-compose
  callable emitter code with zero admission infrastructure. The lane decision
  (SwiftUI package/admission vs. Native View IR recon) is open.

This is not primarily a plumbing exercise. The web targets are admitted
because the IR exposes every fact they need. The honest finding from the
survey is that **the IR does not yet expose every fact a non-DOM target
needs** — and that gap is exactly the falsification condition #3 that
`normal-form.md` names ("a substrate that requires per-target *semantic*
interpretation, not just syntactic translation"). Mobile is the first real
test of the IR's framework-neutrality, and it currently fails one specific
test. That work is sequenced *first* below, because the plumbing is
worthless if the emitters have to special-case to fill the fact gap.

---

## Current state (verified at commit 5103447)

### Emitter maturity

| Capability | Web ref (Svelte) | SwiftUI | Jetpack Compose | React Native |
|---|---|---|---|---|
| component-source | ✅ 1590 ln | ⚠️ Switch-only collapse path (277 ln) | ❌ throws (62 ln) | ❌ throws (64 ln) |
| hook-source (6 behavior primitives) | ✅ 479 ln | ❌ throws | ❌ throws | ❌ throws |
| surface-emit | ✅ 434 ln | ❌ throws | ❌ throws | ❌ throws |
| tests / surface-tests | ✅ | ❌ | ❌ | ❌ |
| barrel | ✅ | ❌ | ❌ | ❌ |
| style layer | ✅ (`emitCss`) | ❌ tokens baked inline as `CGFloat` | ❌ planned `Theme.kt` | ❌ planned `StyleSheet.create` |
| output package | ✅ `ds-svelte/` | ❌ none | ❌ none | ❌ none |
| golden test | ✅ | ✅ Switch only | ❌ | ❌ |

**Two facts that materially shrink and shape the work:**

1. **No raw-contract reads, no component-name lore.** All three mobile
   emitters already consume the IR correctly — no `contract.behavior`
   reads, no `=== "Dialog"` guards. The authority boundary the May 27
   hardening commit (`0af49e1`) enforced holds for mobile too. So this is
   *not* a "rip out the special-casing" job; the emitters are honest
   scaffolds.

2. **SwiftUI is the only mobile emitter with any real output**, and it
   handles exactly one shape: the `native-toggle-affordance` collapse
   intent (Switch). Everything else throws. Compose and React Native are
   100% scaffold.

### The IR fact gap (the load-bearing problem)

The IR is a flat struct mixing substrate-neutral facts with DOM-realization
facts. Non-DOM emitters can *ignore* the DOM fields (`dom`, `cssBlocks`,
`classRecipe`, `keyframes`) — adjacency is fine. The problem is the facts
they *need* that the IR doesn't cleanly expose:

- **`root.effectiveRole` elides implicit roles (the critical one).** For a
  contract whose root element is `<button>` with no explicit `a11y.role`,
  `implicitRole = "button"` and `effectiveRole = undefined` — the role is
  elided because it's implicit *on the HTML element*. A SwiftUI/Compose
  emitter has no DOM to imply the role from, so the semantic fact ("this is
  a button → `.accessibilityAddTraits(.isButton)`") is destroyed before it
  reaches the IR surface. This is the falsification-#3 leak made concrete.

- **Token values are buried in CSS strings.** SwiftUI's `findSizeToken`
  (`swift/swiftui/component-source.ts:265`) regexes pixel fallbacks out of
  `var(--fsds-…, 48px)` declaration strings in `ir.cssBlocks`. There is no
  typed numeric token fact. Marked "gap 1a still pending" in-code. Every
  non-DOM target needs typed token values, not CSS strings.

- **`root.element` / `root.polymorphicTagProp` are HTML tag names** with no
  IR-level tag→native-primitive abstraction. Each non-web emitter would
  need its own table; today only the single-entry `collectCollapseIntents`
  escape hatch exists.

- **`validateDomBindings` only runs on the DOM path.** Non-DOM emitters get
  *no* binding-validation guarantee — a parity gap in correctness checks,
  not just output.

`resolveCallbackKind` is **fine** — it's contract-declared and substrate
neutral by design (proven by `callback-kind.test.ts`). The doc's "lives or
dies here" worry is resolved on the callback-kind axis; it's the *role
elision* axis that was thought unresolved.

> **UPDATE (MOBILE-IR-FACT-PARITY-SWEEP-01, commit 5103447):** the corpus
> sweep **refuted the role-elision blocker** — true role loss is **0/47**.
> All 7 components whose element implies a role also declare it explicitly,
> so `explicitRole` retains the fact. The real universal IR gap is **typed
> token facts** (every one of 47 mines token values out of CSS strings).
> See [`successor-work-mobile-rail-sweep.md`](./successor-work-mobile-rail-sweep.md)
> for the full classification (A=21 IR-sufficient, C=17 native-layout,
> D=9 controller, B=0, E=0). The Phase 0 breakdown below is superseded by
> the sweep's revised sizing; it is kept for the original reasoning trail.

---

## Work breakdown (sequenced)

### Phase 0 — IR fact parity (prerequisite; blocks everything)

The IR must expose the semantic facts non-DOM targets need, without
breaking the web targets' byte output. Recommended approach: add
substrate-neutral facts alongside the existing ones (additive, so web
emitters are unaffected and the git-diff drift check stays green).

0.1 **Resolved semantic role.** Add a non-elided role fact to
`RootSemanticsIR` (e.g. `semanticRole`) that carries the effective role
*including* roles implicit on the HTML element. Web emitters keep using
`effectiveRole` (which correctly elides for HTML); non-web emitters read
`semanticRole`. Update `ir.ts` role computation + tests. **This is the one
change that proves or breaks the framework-neutrality claim for mobile** —
do it first and write the test that a `<button>` contract yields
`semanticRole = "button"`.

0.2 **Typed token facts.** Expose size/spacing/color token *values* as
typed facts (number + unit, or token ref + resolved value) rather than
requiring emitters to mine `cssBlocks` strings. Removes the `findSizeToken`
hack. Likely a new `tokenBindings` IR field populated from the same source
`cssBlocks` draws from.

0.3 **Tag→primitive intent coverage.** Decide whether to extend
`collectCollapseIntents` (contract-declared `collapsibleTo`) to cover the
component shapes beyond Switch, or add a neutral primitive-kind fact. This
is the scaling question: today one intent (`native-toggle-affordance`)
covers one component. Quantify how many of the 47 contracts need new
intents vs. fall out of existing facts.

0.4 **Non-DOM binding validation.** Provide a `validateNativeBindings`
equivalent (or generalize `validateDomBindings`) so non-DOM emitters get
the same channel/prop reference-integrity guarantee.

**Exit criterion for Phase 0:** a non-DOM emitter can render a non-Switch
component (pick one with a real role + tokens, e.g. Button) reading *only*
IR facts, no DOM-string mining, no thrown "not implemented".

### Phase 1 — Per-target emitter completion (one target at a time)

Sequence: **SwiftUI → React Native → Jetpack Compose.** SwiftUI is furthest
along (has a working path + golden); React Native shares TS/React idioms
with the existing react emitter (lowest new-idiom cost); Compose last
(entirely greenfield Kotlin). Each target needs, mirroring Svelte's ~3.7k
lines:

- `component-source.ts` — full component emission for all admitted shapes
  (not just collapse path)
- `hook-source.ts` — the 6 behavior primitives
  (controllable-state, focus-trap, scroll-lock, portal, anchor-toggle,
  dismissal) in target idiom
- `surface-emit.ts` + `surface-tests.ts` — anchored-presence surfaces
- `tests.ts` — generated behavioral tests
- `barrel.ts` — working barrel
- style/token layer — `Theme.kt` (Compose) / `StyleSheet`/tokens module (RN)
  / typed token constants (SwiftUI)
- `@generated:start` markers in every emitted file (required for the rail's
  `isGeneratedFile` walk to see them)

### Phase 2 — Output packages

Create `packages/ds-swiftui/`, `packages/ds-react-native/`,
`packages/ds-jetpack-compose/`, each with `package.json` (presence gates
`workspaceExists()` in `registry.ts`) and a `typecheck`/build script the
admission plan can spawn. **Open question:** Swift and Kotlin don't have a
pnpm-native typecheck. The rail's per-framework command spawns
`pnpm --filter … run typecheck`; for native targets that script must shell
to `swiftc`/`xcodebuild`/`gradle`, which requires those toolchains in CI.
See "Decisions needed".

### Phase 3 — Rail registration (the 13-point plumbing checklist)

Per the rail survey, each target must be added at every one of these points
(omitting any one creates a silent integrity gap):

| # | File | Symbol |
|---|---|---|
| 1 | `validation/types.ts` | `FrameworkId` union |
| 2 | `emitter.ts` | `BuiltinTargetId` union |
| 3 | `emitter.ts` | `KNOWN_TARGETS` array |
| 4 | `registry.ts` | `TargetBinding` in `createDefaultRegistry()` **with `railFrameworkId`** |
| 5 | `target-packs/builtin.ts` | `BUILTIN_TARGET_PACKS` entry |
| 6 | `cli.ts` | `FRAMEWORK_EMITTER_SOURCES[<id>]` (non-empty; list borrowed helpers) |
| 7 | `validation/required-mode.ts` | `COMPONENT_TREES` entry (also gates the all-keys-present manifest check) |
| 8 | `validation/frameworks/<id>.ts` | `FrameworkValidationPlan` export |
| 9 | `validation/validate-cli.ts` | `PLANS_BY_ID` map |
| 10 | `validation/validate-cli.ts` | `PLANS` array |
| 11 | `.github/workflows/ci.yml` | `git diff --exit-code` tree list |
| 12 | `packages/ds-<id>/package.json` | presence + `typecheck` script |
| 13 | emitter output | `@generated:start` marker |

`railFrameworkId` (point 4) is the one that's silent if missed: without it,
the target's groups never enter the manifest and the rail never verifies
it — generation succeeds, admission is a no-op.

### Phase 4 — Runtime fact rail (deferred, flagged not silent)

The web runtime rail (Playwright) proves narrow runtime defaults for
React/Vue/Svelte/Lit. Angular runtime preview is *already* skipped. A
mobile runtime rail would need simulators/emulators in CI (iOS Simulator,
Android emulator, RN Metro). **This is out of the chosen "full admission
rail parity" bar** (which is the artifact↔contract↔codegen↔env rail, not
the runtime rail) — but it must be stated as a non-claim, exactly as
Angular's runtime gap is, so we don't over-claim mobile is at full web
parity when it lacks runtime proof.

---

## Decisions needed (blockers I can't resolve from the code)

1. **UIKit:** Swift has a parallel `swift/uikit/` scaffold (all throwing).
   Drop it, or admit SwiftUI + UIKit as two targets? Recommend: **drop
   UIKit** for this push — SwiftUI is the modern surface and doubles the
   work for marginal coverage.

2. **Native toolchains in CI:** the rail's admission command spawns a
   per-package typecheck. Swift/Kotlin need `swiftc`/`xcodebuild` and
   `gradle`/`kotlinc` on the CI runner (macOS runner for Swift; JDK for
   Kotlin). Is adding those to CI acceptable, or do we admit native targets
   with a *declared `knownGaps`* that the compile check runs locally only?
   The `FrameworkValidationPlan.knownGaps` field exists for exactly this.

3. **Scaling the collapse-intent model:** how many of the 47 contracts can
   a non-DOM emitter render from existing IR facts + the single
   `native-toggle-affordance` intent, vs. needing new intents/facts? This
   determines whether Phase 0.3 is small (add a few intents) or large
   (rethink the tag→primitive abstraction). Needs a corpus sweep before
   committing Phase 1 estimates.

4. **Parity definition for non-DOM a11y:** web parity includes ARIA
   obligations (`unresolvedA11yObligations`). The native equivalent
   (accessibility traits/labels) is a different vocabulary. Is "the
   accessibility fact survives projection" enough, or do we need a native
   a11y obligation check too?

## What this scope does NOT claim

- It does not claim the IR is already framework-neutral for non-DOM
  targets — Phase 0 exists precisely because it isn't (role elision).
- It does not claim runtime behavior parity — Phase 4 is deferred and
  flagged as a non-claim.
- It does not estimate effort until decision #3 (corpus sweep) is answered;
  Phase 1's size is unknown until then.
