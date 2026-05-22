---
doc_id: ARCH-NON-WEB-GENERATION-001
authority: architecture
status: draft
title: Non-web codegen — findings and principles
owner: "@darianrosebrook"
updated: 2026-05-21
governs:
  - packages/ds-codegen/src/frameworks/swift
  - packages/ds-codegen/src/frameworks/react-native
  - packages/ds-codegen/src/frameworks/jetpack-compose
  - packages/ds-codegen/__golden__
---

# Non-web codegen — findings and principles

> This document captures the structural findings from the ongoing
> non-web codegen investigation (Swift, React Native, Jetpack Compose,
> UIKit) so the conclusions don't have to be re-derived. The evidence
> base is intentionally narrow at this stage — one component (Switch)
> on one target (SwiftUI) has reached emitter implementation. The
> principles documented here are drawn from that evidence and should
> be revisited when the evidence base grows. `status: draft` reflects
> that maturity.

## What this investigation is testing

The project's central claim is that a component's durable semantics
live in the contract, and each framework is a realization backend
(see `docs/codegen-authority.md`). Five web frameworks (React, Vue,
Svelte, Angular, Lit) have proven this for browser DOM. The question
this investigation answers:

> Does the contract → IR pipeline carry enough framework-neutral
> information to express a meaningful component on a non-web target,
> without leaking web assumptions?

If the answer is yes, the constraint that motivates the whole
project ("45 components, 1 primitive, 5 frameworks") generalizes
beyond the browser. If the answer is no, the contract or IR has
web-shape baked in that needs to be excised.

## Method

The investigation uses three sequential rounds, each gating the
next, each designed to be cheap enough to throw away if it fails:

1. **Round 1 — paper exercise on one component, no codegen.** Pick a
   component (Switch), hand-write what the generated output *should*
   look like on each non-web target, then walk every line back to a
   fact in the contract or IR. If any line requires "because it's
   Switch" branching, the IR is leaking a web assumption.
2. **Round 2 — one emitter, one component, smoke-only.** Pick the
   target with the lowest workspace overhead (SwiftUI), implement
   just `generateXxxComponentSource` for the chosen component. The
   first invocation that produces byte-identical output to the
   round-1 golden is the pass condition.
3. **Round 3 — add a surface component** (Tooltip on SwiftUI). This
   is where host adoption gets weird because Compose, RN, and UIKit
   all reject the slot model. Tests whether the `SurfaceIR` shape
   generalizes.

Round 1 and round 2 have completed for Switch on SwiftUI. Round 3
has not started.

## Round 1: paper exercise (PASSED)

Per-target attribution summary from
`packages/ds-codegen/__golden__/Switch/Switch.traceability.md`:

| Target          | contract.\* | ir.\* | semantic.\* | framework-grammar | framework-a11y | GAP |
| --------------- | ----------- | ----- | ----------- | ----------------- | -------------- | --- |
| SwiftUI         | 18          | 6     | 3           | 6                 | 5              | 5   |
| UIKit           | 21          | 5     | 2           | 8                 | 6              | 5   |
| React Native    | 17          | 6     | 1           | 6                 | 5              | 4   |
| Jetpack Compose | 17          | 5     | 1           | 6                 | 4              | 5   |

Counts are approximate; the point is that 80%+ of every hand-written
output is attributable to a contract or IR fact, and the remaining
~5 gaps are the same gaps in each target. **No line in any of the
four files required "because it's Switch" branching.**

### Load-bearing IR facts

The facts that held up cleanly under translation to all four targets:

- **`ir.behavior.normalizedChannels`** — the controlled / uncontrolled
  / `onChange` trio projects to:
  - SwiftUI: `Binding<Bool>? + @State Bool + ((Bool) -> Void)?`
  - UIKit: `var _checked + onChange closure + sendActions(.valueChanged)`
  - React Native: `useState + ref-based onChange`
  - Jetpack Compose: `Boolean? + remember { mutableStateOf } + ((Boolean) -> Unit)?`

  All four are the framework-idiomatic shape of the same semantic
  pattern (`useControllableState`).

- **`contract.anatomy.dom.children[].attrs.role`** projects to:
  - SwiftUI: `.accessibilityValue("on"|"off")` + `Toggle(.switch)`
  - UIKit: `accessibilityTraits.button + accessibilityValue`
  - React Native: `accessibilityRole="switch"`
  - Jetpack Compose: `Role.Switch + toggleableState`

  Each is a documented platform mapping — no contract-level branching.

- **`contract.a11y.labeling`** — every ARIA name projects to its
  target-native equivalent (`aria-label` → `.accessibilityLabel` /
  `accessibilityLabel` / `contentDescription`).

- **`contract.types.<TypeName>`** with `kind: "union"` projects to
  four idiomatic type shapes (Swift `enum`, Kotlin `enum`, TS union)
  from one declaration.

### Gaps surfaced

Five gaps from round 1; status as of 2026-05-21:

| #   | Gap                                                                                                       | Status                                   |
| --- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1a  | Switch contract ships size tokens only for `md`                                                           | Deferred (paired with 1b)                |
| 1b  | CSS emitter flattens variant-keyed `tokens.root` keys into the base selector                              | Landing in-progress (separate workstream) |
| 2   | Anatomy collapse on platforms with native Toggle — contract `anatomy.dom` is web-shaped                   | **Resolved** in `7996472`                |
| 3   | Disabled prop polarity on Compose (`enabled` vs `disabled`)                                               | Benign emitter-side inversion             |
| 4   | `form.serialization.*` has no non-web realization                                                         | Documentation-only                       |
| 5   | Color tokens need a separate `Theme` module on Compose / SwiftUI                                          | Separable workstream                     |

Only Gap 2 required upstream work before round 2 could proceed.

## Round 2: SwiftUI emitter for Switch (PASSED)

Pass condition: byte-identical output to a stripped golden file. Hit
on first real attempt after a single fix (section joiner: `\n\n`
between `@generated` blocks, not `\n`).

The emitter (`packages/ds-codegen/src/frameworks/swift/swiftui/component-source.ts`)
dispatches on `collectCollapseIntents(ir)` (the gap-2 helper from
`7996472`). When the IR carries `native-toggle-affordance` on any
anatomy part, the body collapses to SwiftUI's `Toggle(.switch)` —
which natively renders the track + thumb affordance the multi-part
contract anatomy describes.

Channel projection follows the controllable-state pattern:

```swift
private let controlledChecked: Binding<Bool>?
@State private var uncontrolledChecked: Bool
private let onChange: ((Bool) -> Void)?

private var checked: Bool {
    controlledChecked?.wrappedValue ?? uncontrolledChecked
}

private func setChecked(_ next: Bool) {
    if let binding = controlledChecked {
        binding.wrappedValue = next
    } else {
        uncontrolledChecked = next
    }
    onChange?(next)
}
```

These six declarations are produced directly from
`ir.behavior.normalizedChannels[0]` (value=`checked`,
defaultValue=`defaultChecked`, onChange=`onChange`, valueType=`boolean`).
No knowledge of "this is Switch" is required.

The pass condition is enforced by a focused unit test
(`component-source.test.ts`) that loads the real `Switch.contract.json`,
builds the IR, runs the emitter, and asserts byte-identity to
`Switch.swiftui.generated.swift`. A second test asserts the emitter
throws an explicit error when called on a component without the
collapse intent (currently exercised against `Button.contract.json`).

## Principles emerging from rounds 1 and 2

These are provisional. Each is supported by evidence in the rounds
above, but the evidence base is one component on one target.

### 1. The framework-neutral IR is sufficient for native-primitive collapse

For components whose web anatomy maps to a single native primitive
on the target platform, the contract → IR → emitter pipeline carries
enough information to emit idiomatic native code. The signal that
licenses the collapse is an explicit per-part contract field
(`anatomy.details[part].collapsibleTo`); the emitter resolves it
through its own intent → primitive table.

What this validates:
- The contract is *not* irreducibly web-shaped, but its anatomy
  reflects a web realization. The collapse intent is the mechanism
  for declaring "this anatomy is one platform-native primitive on
  targets that have one."
- Each emitter owns its intent → primitive table. The contract owns
  the intent vocabulary (closed enum in the schema). The IR carries
  the intent verbatim; it doesn't resolve.

### 2. Anatomy as web realization hint, not semantic primitive

The current `anatomy.parts` + `anatomy.dom` shape is faithful to web
but is the realization layer's authoritative description only for
web. For non-web targets, the load-bearing facts are:

- `contract.channels` — observable state surface
- `contract.types` — public API types
- `contract.props` — non-state props
- `contract.a11y` — accessibility contract
- `contract.anatomy.details[part].role` — semantic role per part
- `contract.anatomy.details[part].collapsibleTo` — collapse signal

The `anatomy.dom` tree is consulted by *web* emitters to produce
templates with attribute/event bindings. Non-web emitters can ignore
it entirely when the collapse intent is present. When the intent is
absent (and the multi-part fallback is implemented), non-web emitters
will need to consume `anatomy.dom` — but as a *layout* description
to translate, not as the source of truth for what the component
"is."

A future widening — promoting semantic intent to its own contract
field and demoting `anatomy.dom` to an explicit web realization
hint — was raised in round 1 (Gap 2's "larger proposal"). Not
needed for round 2; revisit when the evidence base grows.

### 3. Binding-rule doctrine carries over directly

The binding-rule doctrine from `docs/codegen-authority.md` applies
unchanged to non-web emitters:

- Rules are allowed to branch on: tag, ARIA role, anatomy part role,
  channel kind, channel value type, host capability, surface kind,
  binding kind, framework grammar/type-system/a11y validator
  constraints.
- Rules are NOT allowed to branch on: component name, hardcoded prop
  names that only make sense for one component, test name, file path.

The round-2 SwiftUI emitter is keyed on collapse intent (a
binding-kind fact derived from anatomy), not on component identity.
When invoked on a component without the intent, it throws explicitly
rather than silently falling back to something incorrect — the
right failure mode while the multi-part path is unimplemented.

### 4. "Byte-identical to a stripped golden" is a workable pass condition

The round-1 annotated golden (`Switch.swiftui.swift`) is documentation:
every line has a `// SRC:` comment naming its source fact. The
round-2 stripped golden (`Switch.swiftui.generated.swift`) is the
snapshot target: only the code lines an emitter could honestly
produce, no annotations, no `// GAP` markers for unmet contract data.

This separation works because:
- The annotated golden is a contract between the round-1 reviewer
  and reality. Each `// SRC:` is auditable.
- The stripped golden is a contract between the emitter and reality.
  Each line can be regenerated.
- Drift between the two surfaces when the emitter implementation
  reveals something the round-1 author got wrong, or when a deferred
  gap (1a/1b) lands and lets the emitter produce a more honest
  output. Both are catches we want.

The two-file pattern is a candidate for adoption beyond round 2.

## Hook shape divergences across targets

The scaffolds for the four non-web targets each chose a hook/behavior
shape appropriate to their framework. Documenting the seven we've
landed across web and non-web:

| Framework       | Behavior shape                                     | Lives in                                |
| --------------- | -------------------------------------------------- | --------------------------------------- |
| React           | `use${Name}` composition function                  | `${Name}/use${Name}.ts`                 |
| Vue             | `use${Name}` composition function                  | `${Name}/use${Name}.ts`                 |
| Svelte          | `create${Name}` factory                            | `${Name}/use${Name}.ts`                 |
| Angular         | Service / injectable                               | `${Name}/use${Name}.ts`                 |
| Lit             | `${Name}Behavior` ReactiveController class         | `${Name}/${Name}Behavior.ts`            |
| SwiftUI         | `ObservableObject` + `@StateObject` (when needed)  | `${Name}/${Name}Behavior.swift`         |
| UIKit           | Plain controller class with delegate/closure       | `${Name}/${Name}Behavior.swift`         |
| React Native    | Identical to React with DOM primitives swapped     | `${Name}/use${Name}.ts`                 |
| Jetpack Compose | `${Name}State` + `remember${Name}State()` factory  | `${Name}/${Name}State.kt`               |

All nine dispatch on the same IR fields
(`behavior.normalizedChannels`, `behavior.focus`, `behavior.portal`,
`behavior.normalizedDismissalTriggers`). The differences are purely
syntactic realization. If we ever find a behavior primitive that one
target can't express from the existing IR fields, that's a signal to
widen the IR — not to leak a target-specific concept into the
contract.

For Switch on SwiftUI specifically, the round-2 emitter ships *no*
behavior file. The controllable-state pattern fits entirely inside
the View struct (Binding + @State + the read/write helpers). When
round 3 reaches a component with focus trap / scroll lock / portal,
SwiftUI's behavior file becomes meaningful.

## What's still unknown

Round 2 validated one shape: a single-channel, form-participating,
accessible primitive on a target with a native equivalent. The
following remain unvalidated:

1. **Multi-part anatomy fallback.** Components without
   `collapsibleTo` (Card, Field, Table) require the non-web emitter
   to consume `anatomy.dom` and produce a multi-part layout. Not
   implemented in any non-web emitter.

2. **Surface family** (Tooltip, Popover, Dialog). `SurfaceIR` exists
   and is wired through the web emitters. Round 3 is the test.
   Concretely worrying: host adoption. React's `asChild` / Vue's
   slot-props / Svelte's split binding / Lit's slot-assignment are
   four distinct realizations of the same web-side primitive. None
   of them translate to SwiftUI's `@ViewBuilder` + `PreferenceKey`,
   Compose's `Modifier.onGloballyPositioned`, or UIKit's
   `sourceView`. The contract has no "host adoption" field; each
   emitter improvises.

3. **Token resolution to non-web theme modules.** Gap 5. Tokens
   currently emit as CSS custom properties. On SwiftUI / Compose /
   UIKit, they need to compile to Swift `Color` / `CGFloat` / Kotlin
   `Color` / `Dp` constants in a generated `Theme` module. This is
   a separable codegen workstream that doesn't change the IR.

4. **Compound components** (Dialog with `DialogHeader` / `DialogBody`
   / `DialogFooter`). The `compoundParts` IR field exists. No non-web
   emitter consumes it yet.

5. **Workspace + barrel emission.** Non-web targets don't fit the
   pnpm-workspace pattern the web targets use. SwiftUI/UIKit live in
   Swift packages with `Package.swift`; Compose lives in a Gradle
   module. `createDefaultRegistry` needs to handle non-pnpm output
   roots before any of these emitters can run from the CLI.

6. **Hand-edit preservation.** Web emitters use `@custom:start` /
   `@custom:end` blocks to preserve hand-written code across regen
   (`packages/ds-codegen/src/preserve.ts`). Round 2's SwiftUI emitter
   emits `@generated:start` / `@generated:end` only — no `@custom`
   slots yet. When non-web components grow beyond what the
   emitter alone can express, the preserve machinery needs to extend
   to Swift / Kotlin syntax.

## Suggested next moves

Ordered from "smallest investment unlocks the most signal" to
"larger commitments."

1. **Begin round 3 (Tooltip on SwiftUI).** Cheapest way to learn
   whether the surface family generalizes. Use the same two-file
   golden pattern (annotated + stripped). Tooltip's `SurfaceIR`
   carries anchor + content + positioning facts; the round-3
   question is whether SwiftUI's `@ViewBuilder` + `PreferenceKey`
   pattern can be derived from those facts without component-identity
   branching.

2. **Land gap 1a + 1b** (CSS emitter variant-keyed token routing).
   In-progress in the working tree. When this lands, the round-2
   SwiftUI emitter's size accessor goes from "fall through to `md`"
   to honoring `sm` / `lg` automatically — no SwiftUI emitter change
   required. That's evidence the IR did its job.

3. **Pick the second component for SwiftUI** (Button or Card).
   Multi-part anatomy fallback gets exercised. The collapse-intent
   approach was sufficient for Switch because Switch has a native
   equivalent; Button + Card do not.

4. **Decide on `anatomy.collapsibleTo` vocabulary growth.** The
   schema enum is currently `["native-toggle-affordance"]`. Each new
   primitive on a non-web target potentially adds an intent. Decide
   the cadence: per-PR additions, or batched when a target family is
   ready to consume them.

5. **Defer:** workspace setup, CLI wiring, full token-emission
   workstream, surface-family completion for the other three non-web
   targets. None of these block round 3.

## Decision log

- **2026-05-21 — round 1 design.** Three-round investigation pattern
  chosen: paper / one emitter / surface family. Each round gates the
  next.
- **2026-05-21 — round 1 method.** Hand-written outputs with per-line
  `// SRC:` annotations, allowed prefixes `contract.*` / `ir.*` /
  `semantic.*` / `framework-grammar` / `framework-a11y` or explicit
  `GAP`. Drove the "no component-identity branching" claim into a
  reviewable form.
- **2026-05-21 — gap 2 resolution shape.** Closed-enum vocabulary
  (`anatomy.details[part].collapsibleTo`), per-part. Alternative
  considered: top-level `anatomy.collapse` block grouping parts by
  intent. Per-part won because it matches how the rest of `details`
  works (`role`, `focusable`, `interactive` are all per-part).
- **2026-05-21 — round 2 pass condition.** Byte-identical to a
  stripped golden, not functional equivalence. The discipline pays
  off; the byte-identity assertion catches drift the unit test would
  otherwise miss.
- **2026-05-21 — round 2 CLI wiring.** Not done. Emitter is
  standalone, exercised only by its unit test. Wiring to `TargetId`
  / `registry.ts` / `pnpm run generate -- --target=swiftui` is a
  separate decision gated on more components proving the path.

## References

- `docs/codegen-authority.md` — binding-rule doctrine, applies
  unchanged to non-web emitters.
- `packages/ds-codegen/__golden__/Switch/Switch.traceability.md` —
  the round-1 traceability and gap analysis (authoritative).
- `packages/ds-codegen/__golden__/Switch/Switch.swiftui.swift` —
  annotated golden (documentation).
- `packages/ds-codegen/__golden__/Switch/Switch.swiftui.generated.swift` —
  stripped golden (round-2 snapshot target).
- `packages/ds-codegen/src/frameworks/swift/swiftui/component-source.ts` —
  round-2 emitter implementation.
- Commits: `db53644` (round-1 goldens), `7996472` (gap 2 —
  `collapsibleTo`), `2c62a14` (traceability gap-2 resolved),
  `5fed3bb` (round-2 SwiftUI Switch emitter).
