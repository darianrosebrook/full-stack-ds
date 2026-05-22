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

### Gap 1 — Size tokens shipped only for `md` (split: 1a data + 1b emitter)

**Where:** SwiftUI `trackWidth`/`trackHeight` helpers; UIKit
`intrinsicContentSize`; RN `styles.root_{size}`; Compose `when (size)`.
All four targets had to hand-pick `36/18` for `sm` and `60/30` for `lg`
because `contract.tokens.root` only contains `switch.size.md.*` entries.

#### Gap 1a — Contract data — RESOLVED via post-convergence authoring

The contract declares `variants.size = [sm, md, lg]` but only shipped
tokens for `md`. After the convergence dissolved the gating with Gap 1b,
adding the missing slots became pure authoring work.

**Resolution:** `Switch.tokens.json` now declares the full sm/md/lg
slot pool (12 new slots across the two non-default variants):

- `switch.size.sm.{track.width=32px, track.height=16px, track.radius, track.padding, thumb.size=12px, thumb.height=12px}`
- `switch.size.lg.{track.width=64px, track.height=32px, track.radius, track.padding, thumb.size=24px, thumb.height=24px}`

Each backed by the existing `core.spacing.size.*` graph entries
(no new global tokens needed). `Switch.styles.json` consumes them via
two new variant-scoped compound selectors per variant:

```jsonc
".switch--sm .switch__track": { "width": { "resolvesTo": "switch.size.sm.track.width" }, ... },
".switch--sm .switch__thumb": { "width": { "resolvesTo": "switch.size.sm.thumb.size" }, ... }
```

Per the convergence doctrine, the IR has no special-case path for
variant-conditional consumption — the author writes the compound
selector verbatim, `expandComplexSelector` preserves the already-
qualified `.switch--sm` segment, and the cascade applies the override
to the correct variant.

**Evidence (`Switch.swiftui.generated.swift` golden after regen):**

```swift
private var trackWidth: CGFloat {
    switch size {
    case .sm: return 32
    case .md: return 48
    case .lg: return 64
    }
}
```

`findSizeToken(ir, "<variant>", "<dimension>")` now returns distinct
slot values for each variant. Before the slots existed, Swift fell
through to `mdValue` (48/48/48 across all three). After the slots
land, the non-web emitter consumes them transparently — proving the
cross-platform lookup contract held through the contract-data
extension.

#### Gap 1b — Latent CSS emitter bug — RESOLVED via convergence

The CSS emitter (`packages/ds-codegen/src/css.ts`) does not understand
that `tokens.root["switch.size.<variant>.*"]` is *variant-keyed*. When
the contract was edited to ship `sm`/`md`/`lg` token entries, the
emitter flattened all three into the base `.switch` selector — picking
whichever entry came last alphabetically. Concretely:

```diff
 .switch {
-  width: var(--core-spacing-size-09, 48px);    /* md (correct default) */
-  height: var(--core-spacing-size-07, 24px);
+  width: var(--core-spacing-size-10, 64px);    /* lg (regression) */
+  height: var(--core-spacing-size-08, 32px);
 }
```

The base `.switch` selector should reflect the *default* variant
(`md`, per `contract.props.styled.members[name=size].default`), with
`sm` and `lg` scoped to `.switch--sm` / `.switch--lg` modifier
selectors. The bug was latent because Switch was the only contract
shipping per-size tokens *and* only shipped them for one variant.

**Why this is broader than Switch:** Checkbox declares
`variants.size=[sm,md,lg]` but ships *no* per-size tokens at all —
so the bug is latent across the codebase. Any future component that
ships per-variant size tokens would hit it.

**Proposal:** the emitter needs to recognize variant-keyed token names
(pattern: `<componentSlug>.<variantName>.<variantValue>.<rest>`) and
scope them to the corresponding BEM modifier selector. This is a
focused refactor in `css.ts` (the IR already carries enough info via
`contract.variants` + the token key structure to detect this). Out of
scope for round 1; should land as its own PR with regression coverage
for Switch + Checkbox.

**Combined gating:** gap 1a and 1b must land together — 1a without
1b ships a regression, 1b without 1a is unverifiable because Switch
is the only contract that would exercise the fixed path.

**Resolution (tokens/styles convergence):** the structural premise of
1b — "the emitter must recognize variant-keyed token names and route
them to BEM modifiers" — is gone. Variant-conditional consumption is
now author-explicit in styles.json under `--sm` / `--md` / `--lg`
selector keys. `partitionVariantKeyedRootTokens` and its four
regression tests were deleted in the IR refactor (commit `dc11948`).
The combined gating with 1a is also gone: shipping `sm`/`lg` slots
now just adds entries to tokens.json + per-variant consumers in
styles.json, and the emitter has no special path to break. Gap 1a
remains a component-authoring follow-up (Switch still ships only
`md` size slots).

### Gap 2 — Anatomy collapse on platforms with native Toggle (RESOLVED)

**Where:** SwiftUI uses `Toggle(.switch)`; RN uses `<RNSwitch>`; Compose
uses `M3Switch`; UIKit reimplements track+thumb because there's no
single native control that matches (`UISwitch` exists but ships its own
look that diverges from the contract's tokens).

**Why it was a gap:** the contract's `anatomy.dom` (label > input + track
span > thumb span) is a web-DOM shape. On three of four non-web targets,
the realization is one native primitive, not a four-part composition.
The emitter for SwiftUI/RN/Compose must *know* it can collapse the
anatomy; the emitter for UIKit must know it can't (because UIKit's
`UISwitch` is uncustomizable enough that we'd lose the contract's
token-driven appearance).

**Resolution (commit `7996472`):** added optional per-part
`details.collapsibleTo` field with a closed-enum vocabulary seeded with
`native-toggle-affordance`. `Switch.contract.json` declares the field
on `track` and `thumb`. `collectCollapseIntents(ir)` in
`packages/ds-codegen/src/ir.ts` returns an intent→part-names map that
emitters consult alongside their own intent→primitive table. Web
emitters ignore the field. Per binding-rule doctrine: rules consuming
this field branch on binding kind, not component identity.

**Future work (deferred, larger):** widen the contract to declare
semantic intent ("this is a binary toggle with a visible affordance")
and demote `anatomy.dom` to a *web realization hint*. Not needed for
round 2 — collapse intents alone unblock SwiftUI / RN / Compose.

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
five allowed fact prefixes (or an explicitly-tracked `GAP`). Gap status:

- Gap 1a — contract data fix (sm/lg tokens for Switch). **Deferred** —
  paired with Gap 1b in a focused emitter PR.
- Gap 1b — latent CSS emitter bug discovered while attempting 1a:
  variant-keyed tokens flatten into the base selector. **Deferred.**
- Gap 2 — `anatomy.collapsibleTo` schema/IR addition. **Resolved** in
  commit `7996472`.
- Gap 3 — pure emitter-side framework-grammar rule, no upstream change.
- Gap 4 — documentation-only, no schema/IR change.
- Gap 5 — separable token-emission workstream, no per-component-emitter
  change.

**Round 2 is unblocked.** The remaining gaps (1a/1b on the existing
React/CSS emitter; 3 and 4 absorbed inside the eventual non-web
emitters; 5 as its own workstream) do not block implementing
`generateSwiftUIComponentSource` for Switch.

## Suggested next moves

1. **Begin round 2** — implement `generateSwiftUIComponentSource` for
   Switch only. Use `Switch.swiftui.swift` as the snapshot target.
   The first invocation that produces byte-identical output is the
   round-2 pass condition. Consumes the new `collectCollapseIntents`
   helper from commit `7996472`.
2. **Address Gap 1a + 1b in a focused PR** — separable from round 2,
   needs regression coverage for the CSS emitter against variant-keyed
   tokens (Switch + Checkbox).

---

# Round 1-web — `.css` + `.tokens.css` traceability

Companion to round 1 (non-web), added 2026-05-22. Two new golden
files exist for the web targets:

- `Switch.css` — the consumer side: BEM rules that reference
  `var(--fsds-switch-…)` slot variables.
- `Switch.tokens.css` — the indirection side: slot declarations
  that resolve `--fsds-switch-…` to global semantic / core tokens
  with hardcoded fallbacks.

Both files represent what the React / Vue / Svelte / Angular emitters
should produce in `packages/ds-<framework>/src/components/Switch/`,
and what the Lit emitter should inline into `static override styles`.
Each non-trivial line carries `/* SRC: <fact> */`.

## What round 1-web answered

**The IR projects cleanly to the *theming* surface but cannot project
to the *layout* surface yet.** The contract's `tokens` block is rich
enough to derive every color / shape / dimension / motion-duration
variable. But the *structural* CSS — `display: inline-flex`,
`position: relative`, `box-sizing: border-box`, the `:has(input:state)`
selector rewrites that target the right element — has no contract
home today, even though `contract.styles` exists in the schema and
the IR already iterates it.

Particularly load-bearing IR facts that held up under web translation:

- `contract.anatomy.parts` → BEM child selector `.<prefix>__<part>`,
  now emitted as flat sibling rules (post-codegen Nesting fix in
  commit `78fab10`).
- `contract.tokens.<part>` → slot declarations scoped to the part's
  BEM child block, with `--<prefix>-<slot>` indirection consumed by
  the corresponding `.css` property rule.
- `contract.tokens.<state>` → currently emits as a pseudo-class on
  the root (`<prefix>:<state>`), which is incorrect when the root
  is a layout wrapper rather than an interactive element. See Gap 7.

## Web gaps (gap numbering continues from non-web round 1)

### Gap 6 — Layout primitives have no contract home — RESOLVED via convergence

**Where:** `Switch.css` lines for `display: inline-flex` on `.switch`,
`display: inline-block` + `position: relative` + `box-sizing` on
`.switch__track`, `display: block` + `position: absolute` + `top` +
`left` on `.switch__thumb`. Approximately 12 declarations across the
three parts that *cannot* be derived from any token.

**Why these aren't tokens:** they're not theming concerns. There's no
`semantic.layout.display.inline-flex` token, nor should there be —
`display: inline-flex` is a *structural* decision that the component
makes once at authoring time and never re-themes. Same for `position`,
`box-sizing`, `border-style`. Trying to tokenize them would either
inflate the graph with non-themeable entries or hide structural
choices behind theming syntax.

**Current state:** the `contract.styles` field exists in
`component.contract.schema.json` and `computeCssBlocks` already
iterates it (`ir.ts:1235`):

```ts
for (const [key, declarations] of Object.entries(styles)) {
  if (key === "root") continue;
  const selector = expandStylesKey(key, cssPrefix);
  blocks.push({ selector, declarations });
}
```

…but `Switch.contract.json` has no `styles` field. Every other
contract in the repo also has no `styles` field. The plumbing is
ready; the authoring is missing.

**Proposal:**

1. Schema-level: extend `component.contract.schema.json` to support
   part-keyed and state-keyed entries under `styles` (today the
   schema is permissive, but undocumented). Each entry's value is a
   plain `Record<string, string>` of CSS property → value pairs.
2. Switch.contract.json gains a `styles` block with the layout
   primitives the golden requires. Same shape as `tokens`, different
   semantics: no `resolvesTo`, just raw property/value.
3. `computeCssBlocks` already handles this for `styles.root`; verify
   the loop at `ir.ts:1235` correctly merges `styles.<part>` into the
   part block's declarations (it should — adjacent to the `for (const
   part of parts)` loop a few lines below).

**Impact across the codebase:** every component-emitter today depends
on Stack-primitive composition for layout, so most components don't
need a `styles` block. The components that DO need it are the ones
with anatomies that can't be assembled purely from Stack (Switch's
track/thumb being absolutely positioned is the canonical example).
Estimated <10 contracts will gain a `styles` block; the other 35+
keep `styles: null`.

**Resolution (2026-05-22, commit `85cdf56` — initial; superseded by the convergence):**

The first fix added an inline `styles` field to the contract and a
Gap-6 merge pass to `computeCssBlocks`. That approach was correct for
unblocking Switch but smuggled web-only semantics (`var(...)`, CSS
keyword literals like `display: inline-flex`) into a structure the
Swift / Compose / RN emitters also consume.

**Resolution (2026-05-22, tokens/styles convergence,
PLAN-TOKENS-STYLES-CONVERGENCE-001):**

- `<Name>.tokens.json` flattened to a slot pool — every entry declares
  a single CSS custom property on the component's root selector via
  `var(--<global>, <fallback>)`. The flat shape matches the
  hand-authored `[data-qds-component="…"]` pattern in qualtrics's
  styled/ implementation verbatim.
- `<Name>.styles.json` (new sidecar) carries consumer-side declarations
  keyed by selector → property → `styleEntry`. `styleEntry` is either
  `{ resolvesTo: <slot-or-global> }` (slot reference; the cascade
  delivers the var()) or `{ literal: <css-value>, platforms: [...] }`
  (target-filtered hardcoded value). Layout literals are now first-class
  and explicitly scoped to platforms (`display: inline-flex` lives
  under `platforms: ["web"]`; `position: relative` ships to all three).
- `computeCssBlocks` rewritten end-to-end: root block = slot declarations
  + `styles.root` consumers; every other selector key in styles.json
  becomes its own block via `expandStylesKey`. The Gap-6 merge pass
  and the inline `contract.styles` field are both gone.
- Switch's contract authored: 16 slots in tokens.json + 6 selectors in
  styles.json (root, track, thumb, input, and three compound `:has()`
  state-on-part selectors that resolve Gap 7 simultaneously).
- New validators (`validateContractStyles`,
  `validateStylesSelectorCollisions`) prevent regression — every
  `resolvesTo` must name a real slot or a real graph entry, and no
  two styles.json keys may alias to the same CSS selector.
- Visual verification: Switch renders byte-identical in React + Lit
  previews. The Swift `findSizeToken(ir, "md", "width")` lookup still
  works without code changes because `--fsds-switch-size-md-track-width`
  is on the root selector — exactly where it was before, but no longer
  duplicated across part blocks.

### Gap 7 — State-on-part transformation — RESOLVED via convergence

**Where:** `Switch.css` lines that read `.switch:has(.switch__input:checked)
.switch__track { background-color: var(...) }`. The current emitter
produces `.switch:checked { background-color: var(...) }`, which never
matches because the label has no `:checked` pseudo-class. Same for
`:disabled`, `:focus-visible`.

**Why this is broader than Switch:** any component whose root element
is a layout wrapper rather than the interactive control hits this.
Examples: Switch (root=label, control=input), Checkbox (same),
ToggleSwitch (same), Field (root=fieldset / div, control=child input).

**Current state:** `ir.ts:1264` maps state keys to pseudo-classes on
the root via `DERIVABLE_STATE_TO_PSEUDO`:

```ts
for (const state of flatStates) {
  if (state === "default") continue;
  const pseudo = DERIVABLE_STATE_TO_PSEUDO[state];
  const sel = pseudo
    ? `.${cssPrefix}${pseudo}`
    : `.${cssPrefix}--${state}`;
  // …
}
```

It always builds `.<prefix><pseudo>`, never `.<prefix>:has(<inner>:<pseudo>)`.

**Proposal:**

1. Inspect the contract's `anatomy.dom` tree at IR build time. If
   the root element is NOT itself a form control (i.e., the
   `formControl` part exists *inside* the root), state pseudo-classes
   should be rewritten:
   - `<prefix>:checked`  → `<prefix>:has(.<prefix>__<formControlPart>:checked)`
   - `<prefix>:disabled` → `<prefix>:has(.<prefix>__<formControlPart>:disabled)`
   - `<prefix>:focus-visible` → `<prefix>:has(.<prefix>__<formControlPart>:focus-visible)`
2. State-block tokens additionally need a `"part"` field to indicate
   which BEM child the slot applies to (e.g., the `track` background
   color when checked applies to `.switch__track`, not to the label).
   Adds an optional `part` key to each tokenResolution under state
   blocks. When present, the IR emits the rule on
   `<wrapperSelector> .<prefix>__<part>`.
3. Add a contract field hint: `anatomy.formControl?: string` to make
   the form-control part explicit rather than inferred. Switch
   declares `formControl: "input"`. Components whose root IS the
   control (e.g., a `<button>` Card) leave it null and keep the
   current `<prefix>:<state>` shape.

**Impact:** unblocks correct state styling for ~6 components today
(Switch, Checkbox, ToggleSwitch, Field, TextField, OTP). Same shape
applies to Darian's doctrine — they hand-author this pattern
in styled/ today; we'd be encoding it structurally.

**Resolution (tokens/styles convergence):**

The proposal's "magic IR rewrite" (proposal 1: infer `:has(formControl:state)`
selectors from anatomy.dom) is replaced by *explicit authoring*. Under
the new shape, the author writes the compound selector verbatim as a
top-level key in styles.json:

```jsonc
{
  ":has(.switch__input:checked) .switch__track": {
    "background-color": { "resolvesTo": "switch.color.track.background.checked" }
  }
}
```

`expandComplexSelector` (`ir.ts:1239`) was updated to preserve segments
that start with `.`, `:`, `[`, `#`, `*` verbatim, so the `:has()` pseudo
passes through untouched. The contract no longer has to declare
`anatomy.formControl`, and the IR no longer infers DOM relationships.
The trade-off: more authoring verbosity (one selector key per
state-on-part combination), less IR magic. We chose verbosity — the
contract is the source of truth, and the IR shouldn't be guessing DOM
structure from anatomy names.

Switch authored three such compound selectors in styles.json:
`:has(.switch__input:checked) .switch__track`,
`:has(.switch__input:checked) .switch__thumb`,
`:has(.switch__input:disabled) .switch__track`. All three emit
correctly into Switch.css.

### Gap 8 — Visually-hidden input pattern — RESOLVED via convergence

**Where:** `Switch.css` `.switch__input { position: absolute; width: 1px;
height: 1px; clip: rect(0,0,0,0); … }`. This is the canonical
sr-only/visually-hidden pattern, required because the `<input>` must
remain focusable (for keyboard access) and submittable (for form
participation) but invisible (because the rendered control is the
label+track+thumb).

**Why it isn't tokenizable:** the entire declaration set is a fixed
WCAG-blessed recipe; varying any property breaks the technique.

**Proposal:** treat this as a contract-authoring concern that
specializes Gap 6. Either:

1. Author it as `styles.input` on the Switch contract directly —
   verbose but explicit, ~8 declarations.
2. Introduce a `styles.<part>` value `"sr-only"` (string) that the
   IR expands to the canonical 8-declaration recipe at emit time.
   Smaller authoring surface, but the IR now embeds a CSS recipe
   (string-keyed shortcut).

Recommend (1) for now; revisit (2) once Checkbox and OTP also need it.

**Resolution (tokens/styles convergence):** option (1) chosen and shipped.
Switch's styles.json authors the 8-declaration recipe verbatim under
the `input` key, each declaration as a `literal` styleEntry with
`platforms: ["web"]` so non-web emitters skip it natively. No IR-side
recipe needed; the doctrine is "declarative authoring, dumb IR."

### Gap 9 — Per-state property override (translate.off → translate.on) — RESOLVED via convergence

**Where:** `Switch.css` `.switch__thumb { translate: var(--fsds-switch-size-md-thumb-translate-off) }`
in the resting state and `.switch:has(.switch__input:checked) .switch__thumb
{ translate: var(--fsds-switch-size-md-thumb-translate-on) }` when
checked. Both slot variables live in the thumb's slot block, but
they're consumed under two different selectors.

**Current state:** `ir.ts:1505` emits one slot declaration per token
and one property reference per token's `property` field. If two slots
share the same `property` value (`translate` in this case), they
collide via last-writer-wins.

**Proposal:** allow a token's `property` field to be a tuple of
`[property, stateQualifier?]`. The slot is always declared; the
property reference is emitted under the qualifier selector. Adjacent
to Gap 7 — would benefit from sharing the same `:has(input:state)`
rewrite path.

**Resolution (tokens/styles convergence):** the proposal's "tuple
property field" became unnecessary. After the convergence, slots
declare CSS custom properties without binding to any property; the
consumer side decides which selector consumes which slot. So:

- `Switch.tokens.json` declares six new literal slots:
  `switch.size.{sm,md,lg}.thumb.translate.{off,on}` with values
  `{0, 16px, 24px, 36px}` (off=0 always; on=track.width − thumb.size −
  2·padding per variant).
- `Switch.styles.json` consumes them under two selector keys per
  variant: `.switch__thumb` (default md.off), `.switch--sm .switch__thumb`
  (sm.off), `.switch--lg .switch__thumb` (lg.off). Plus three
  compound selectors for the checked state:
  `:has(.switch__input:checked) .switch__thumb` (md.on),
  `.switch--sm:has(.switch__input:checked) .switch__thumb` (sm.on),
  `.switch--lg:has(.switch__input:checked) .switch__thumb` (lg.on).

**Evidence (runtime computed style after a click in React preview):**

```
input.checked === true
.switch__thumb { translate: 16px }  // .switch--sm:has(.switch__input:checked) .switch__thumb wins
.switch__thumb { background-color: rgb(255, 255, 255) }  // thumb.background.checked
.switch__track { background-color: rgb(217, 41, 43) }   // track.background.checked (#d9292b)
```

The cascade resolves the variant-modifier × `:has()` compound to the
correct slot for the current size. No IR change required.

### Gap 10 — Transition shorthand combining a tokenized duration with a property list — RESOLVED via convergence

**Where:** `Switch.css` `.switch__track { transition: background-color
var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing); }`
and `.switch__thumb { transition: translate ..., background-color ...; }`.

**Why the current shape doesn't fit:** `renderTokens` emits one
property per slot. The slot for `motion.duration` has property
`transition-duration`, not `transition`. To produce the shorthand
the emitter would need to know which properties to apply the
transition to, which is per-component knowledge.

**Proposal:** introduce a `motion` contract section listing
`{ properties: ["background-color", "translate"], duration: <slot>,
easing: <slot> }` per part. The emitter builds the shorthand from
the listed properties + the resolved slot values. Smaller than
Gap 9 if implemented after it (state-aware transitions become a
follow-up).

**Resolution (tokens/styles convergence):** the proposal's "motion
contract section" became unnecessary. Under the convergence:

- `Switch.tokens.json` keeps the existing slots `switch.motion.duration`
  and `switch.motion.easing` (backed by `semantic.motion.interaction.press.*`).
  No new graph entries needed.
- The transition shorthand is authored as a `literal` styleEntry whose
  value contains `var()` references to those slots. The literal lives
  in two selector blocks:

  ```jsonc
  "track": {
    "transition": {
      "literal": "background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing)",
      "platforms": ["web"]
    }, ...
  },
  "thumb": {
    "transition": {
      "literal": "translate var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing), background-color var(--fsds-switch-motion-duration) var(--fsds-switch-motion-easing)",
      "platforms": ["web"]
    }, ...
  }
  ```

  The literal-with-var pattern is what makes per-property-list timing
  authorable without an IR-level concept. The literal value can contain
  `var()` because slots are CSS custom properties already.

- The old `transition-duration` + `transition-timing-function` consumers
  on `.switch` root were removed — separate properties without a
  `transition-property` had no useful effect.

**Evidence (runtime computed style):**

```
.switch__thumb { transition: translate 0.1s cubic-bezier(0.4, 0, 0.2, 1),
                              background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1) }
.switch__track { transition: background-color 0.1s cubic-bezier(0.4, 0, 0.2, 1) }
```

Both properties animate with the same tokenized duration/easing.
`semantic.motion.interaction.press.duration` resolves to 100ms and
easing to the standard cubic-bezier — confirming the cascade chain
slot→consumer→shorthand works end-to-end.

## Pass/fail verdict for round 1-web

**Pass-with-caveats.** Every line classifies. Five new gaps numbered
6–10. None of them require a fundamental redesign — they're all
extensions of existing IR shapes (`contract.styles`, state-key
expansion in `computeCssBlocks`, additional fields on tokenResolution).

## Suggested next moves for round 1-web

1. ~~**Resolve Gap 6 first.**~~ **Done** via the tokens/styles
   convergence — initial fix in commit `85cdf56` was structurally
   superseded by the convergence work.
2. ~~**Then Gap 7.**~~ **Done** via the convergence — compound
   `:has(.switch__input:state) .switch__part` selectors are
   author-explicit in styles.json; no IR rewrite needed.
3. ~~**Gap 8** (sr-only recipe).~~ **Done** via the convergence —
   authored as 8 `literal` styleEntries with `platforms: ["web"]`
   under styles.json's `input` key.
4. ~~**Gaps 1a, 9, 10.**~~ **Done** via post-convergence authoring.
   Each was contract-authoring work the convergence enabled but did
   not strictly include: Gap 1a added 12 sm/lg slots + 2 variant-
   scoped compound selectors per variant; Gap 9 added 6 translate
   literal slots + 6 variant×state compound selectors; Gap 10
   replaced two unused timing properties with two `transition`
   shorthand literals containing slot `var()` references. None
   required IR changes — the convergence's "contract is the source
   of truth" doctrine held through all three.
5. **All Switch gaps are closed.** Switch is now a fully-authored
   reference component for the convergence shape.
6. **Round 2-web** — author Checkbox + Dialog goldens to surface gaps
   that Switch alone can't reveal (indeterminate state; backdrop +
   portal; multi-part header/body/footer). Repeat the gap-driven
   widening loop.

## Convergence doctrine (2026-05-22)

The tokens/styles convergence (PLAN-TOKENS-STYLES-CONVERGENCE-001)
inverted the qualtrics-vs-ours authoring model. They author
`<Name>.tokens.css` and `<Name>.css` by hand and use a contract.json
only when one exists; we author `<Name>.tokens.json` and
`<Name>.styles.json` and emit the CSS. The destination converges
because the destination is what's *structurally honest* about
component-scoped theming on the web — slots declared once on the root
selector, consumers reading them via the cascade, layout literals
filtered by platform.

Implications visible in this golden:

- **Slots are pure indirection.** A slot doesn't know which property
  consumes it (that's styles.json's concern), only which global token
  it backs. Brands can override the slot OR the global; either way
  the consumer doesn't have to know.
- **Consumers are property-keyed.** Two declarations for the same
  property under the same selector are structurally impossible
  (JSON-object semantics reject duplicate keys). Last-writer-wins via
  the cascade no longer exists at the contract layer.
- **No emitter magic for state-on-part or compound selectors.** The
  author writes them verbatim. The IR's only job is to pass them
  through `expandStylesKey` (which qualifies bare identifiers with
  the BEM prefix) and emit them as flat selector blocks.
- **`platforms` array gates literals.** Web-only CSS keywords
  (`display: inline-flex`, `cursor: pointer`) stay scoped to the web
  target; portable concepts (color slots, sizes) reach all platforms.
  This is the structural seam non-web emitters need.
