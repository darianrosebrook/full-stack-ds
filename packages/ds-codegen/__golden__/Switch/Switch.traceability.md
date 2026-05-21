# Switch — Round 1 traceability + gap analysis

## Per-target attribution summary

For each target, count of lines by fact-prefix category. "GAP" lines are
flagged below in `## Gaps`.

| Target          | contract.* | ir.* | semantic.* | framework-grammar | framework-a11y | GAP |
| --------------- | ---------- | ---- | ---------- | ----------------- | -------------- | --- |
| SwiftUI         | 18         | 6    | 3          | 6                 | 5              | 5   |
| UIKit           | 21         | 5    | 2          | 8                 | 6              | 5   |
| React Native    | 17         | 6    | 1          | 6                 | 5              | 4   |
| Jetpack Compose | 17         | 5    | 1          | 6                 | 4              | 5   |

(Counts are approximate — they're the human-readable summary, not a
machine-verified attribution. The point is that 80%+ of every file is
attributable, and the remaining ~5 gaps are the same gaps in each target.)

## What this round answered

**The IR projects cleanly to all four non-web targets for a single-channel,
form-participating, accessible toggle.** No line in any of the four files
required "because it's Switch" branching. Every line classifies into
one of the five allowed fact prefixes (or `GAP`).

Particularly load-bearing IR facts that held up under translation:

- `ir.normalizedChannels[0]` — the controlled/uncontrolled/onChange trio
  projected to SwiftUI `@Binding<Bool>? + @State Bool + ((Bool) -> Void)?`,
  UIKit `var _checked + onChange closure + sendActions(.valueChanged)`,
  RN `useState + ref-based onChange`, and Compose
  `Boolean? + remember { mutableStateOf } + ((Boolean) -> Unit)?`. All
  four are the framework-idiomatic shape of the same semantic pattern.
- `contract.anatomy.dom.children[].attrs.role` — projected to
  `.accessibilityValue` (SwiftUI), `accessibilityTraits.button +
  accessibilityValue` (UIKit), `accessibilityRole="switch"` (RN), and
  `Role.Switch + toggleableState` (Compose).
- `contract.a11y.labeling=[aria-label, aria-labelledby, aria-checked]` —
  each ARIA name projected to its target-native equivalent via documented
  platform mappings, not contract-level branching.
- `contract.types.SwitchSize` — projected to four distinct type idioms
  (Swift enum with `String` raw, Kotlin enum, TS union, Swift enum)
  from the same `kind: "union"` declaration.

## Gaps

Each gap is followed by a proposal. The proposals are listed in order
from "smallest change that unblocks round 2" to "larger contract or IR
change."

### Gap 1 — Size tokens shipped only for `md`

**Where:** SwiftUI `trackWidth`/`trackHeight` helpers; UIKit
`intrinsicContentSize`; RN `styles.root_{size}`; Compose `when (size)`.
All four targets had to hand-pick `36/18` for `sm` and `60/30` for `lg`
because `contract.tokens.root` only contains `switch.size.md.*` entries.

**Why it's a gap:** the contract declares `variants.size = [sm, md, lg]`
(line 110-115) but only ships tokens for the middle variant. Round 1
revealed this as a *contract data* gap, not an IR gap — the schema
already supports `switch.size.sm.track.width` / `switch.size.lg.track.width`
keys. They're simply absent.

**Proposal:** populate `switch.size.sm.*` and `switch.size.lg.*` token
entries in `Switch.contract.json` before round 2. No code changes needed.

### Gap 2 — Anatomy collapse on platforms with native Toggle

**Where:** SwiftUI uses `Toggle(.switch)`; RN uses `<RNSwitch>`; Compose
uses `M3Switch`; UIKit reimplements track+thumb because there's no
single native control that matches (`UISwitch` exists but ships its own
look that diverges from the contract's tokens).

**Why it's a gap:** the contract's `anatomy.dom` (label > input + track
span > thumb span) is a web-DOM shape. On three of four non-web targets,
the realization is one native primitive, not a four-part composition.
The emitter for SwiftUI/RN/Compose must *know* it can collapse the
anatomy; the emitter for UIKit must know it can't (because UIKit's
`UISwitch` is uncustomizable enough that we'd lose the contract's
token-driven appearance).

The current `anatomy.parts` list is faithful to web; the IR has no
"platform may collapse this" signal.

**Proposal (smallest):** add `anatomy.collapsibleTo` to the contract
schema — an optional field per part declaring "this part's purpose is
fully served by the target's native primitive if available." For
Switch: `anatomy.parts.track.collapsibleTo = "native-toggle-affordance"`,
`anatomy.parts.thumb.collapsibleTo = "native-toggle-affordance"`. The
IR exposes this as `ir.parts[i].collapsibleTo`. Each emitter consults
its own table mapping collapse-intents to native primitives (SwiftUI
knows `native-toggle-affordance` → `Toggle(.switch)`; UIKit knows it
maps to nothing reusable, so falls back to the multi-part render).

**Proposal (larger):** widen the contract to declare semantic intent
("this is a binary toggle with a visible affordance") and demote
`anatomy.dom` to a *web realization hint*. This is a bigger redesign
and shouldn't block round 2 — round 2 can succeed with
`collapsibleTo` annotations alone.

### Gap 3 — Disabled prop polarity mismatch

**Where:** Compose `enabled: Boolean = true` instead of `disabled: Boolean = false`.

**Why it's a gap:** Compose convention is positive-polarity (`enabled`)
where the contract uses negative-polarity (`disabled`). The mapping is
trivial (`enabled = !disabled`), but it's an inversion the emitter has
to perform. UIKit also uses positive polarity (`isEnabled`) but the
contract value can pass through unchanged because UIView already
exposes a `disabled` adapter via convention. RN and SwiftUI accept
both.

**Why this is benign:** no IR widening needed. The Compose emitter
knows its target prefers positive polarity and inverts at the binding
site. This is a `framework-grammar` rule by the binding-rule doctrine.

**Proposal:** none. Log as a known emitter-side inversion, document in
the Compose emitter's eventual `factory.ts` doc-comment.

### Gap 4 — `form.serialization.valueSource` has no non-web realization

**Where:** All four targets accept `name` and `value` props but none of
them participate in a native form-submission flow — none of the four
platforms have a `<form>` analogue.

**Why it's a gap:** `contract.form.participates = true` projects to
"render a hidden checkbox" on web, but on Apple/Android/RN it's
purely informational — the consumer is responsible for collecting the
value into whatever form layer they use. The contract's
`form.serialization.*` fields produce no executable output on three
targets.

**Why this is benign:** the field is *retained* in each emitter's
public API as `name` / `value` props, so consumers in form contexts
can wire them. We just don't emit submission logic. This is the
correct answer; the contract's form data is informational on these
targets, not operational.

**Proposal:** add an emitter doc-comment noting "form.* fields are
passed through to consumer props on non-web targets but not wired into
any platform-native submission flow." No IR change.

### Gap 5 — Color tokens require a separate theme module on Compose / Jetpack

**Where:** Compose `colors = SwitchDefaults.colors()` falls back to
Material 3 defaults rather than mapping `contract.tokens.checked` /
`contract.tokens.disabled` to a `SwitchColors` instance.

**Why it's a gap:** the contract's tokens encode `resolvesTo` paths
into a semantic layer (e.g. `semantic.color.foreground.accent`). On web,
these become CSS custom properties. On Compose, they need to compile
to a Kotlin `Color` value, which means the *codegen pipeline* needs a
phase that emits a `Theme.kt` module before the per-component emitter
runs. That phase doesn't exist yet for any non-web target.

**Why this is benign for round 1:** the contract has all the
information needed (`resolvesTo` + `fallback` per token). Token emission
is a separable codegen concern that doesn't affect the IR's
framework-neutrality.

**Proposal:** scope a "token emission for non-web targets" workstream
*after* round 2 confirms the per-component emitter works. The
`docs/internal/tokens-workstream-plan.md` (open in the IDE) is probably
the right home for that.

## Pass/fail verdict for round 1

**Pass.** Every line in every golden file classifies into one of the
five allowed fact prefixes (or an explicitly-tracked `GAP`). The four
gaps are:

- Gap 1 — fixable in contract data alone, no schema change.
- Gap 2 — needs an optional `anatomy.collapsibleTo` schema/IR addition.
- Gap 3 — pure emitter-side framework-grammar rule, no upstream change.
- Gap 4 — documentation-only, no schema/IR change.
- Gap 5 — separable token-emission workstream, no per-component-emitter
  change.

Of those, only Gap 2 requires upstream work before round 2. Round 2
(implement one emitter for Switch on one target — proposal: SwiftUI)
is justified.

## Suggested next moves

1. **Resolve Gap 1** in `Switch.contract.json` — add `sm` and `lg` size
   tokens.
2. **Decide on Gap 2** — either implement `anatomy.collapsibleTo` now
   (small, ~30 lines in schema + ir.ts + a per-target lookup table),
   or accept that UIKit will look anomalous because it can't collapse.
3. **Begin round 2** — implement `generateSwiftUIComponentSource` for
   Switch only. Use `Switch.swiftui.swift` as the snapshot target.
   The first invocation that produces byte-identical output is the
   round-2 pass condition.
