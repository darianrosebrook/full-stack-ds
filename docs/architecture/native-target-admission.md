---
doc_id: ARCH-NATIVE-TARGET-ADMISSION-001
authority: canonical
status: active
title: Native target admission — criteria per codegen output
owner: "@darianrosebrook"
updated: 2026-09-13
governs:
  - packages/ds-codegen/src/frameworks/native-emission-class.ts
  - packages/ds-codegen/src/frameworks/swift/swiftui/component-source.ts
  - packages/ds-codegen/src/frameworks/jetpack-compose
  - fsds.targets.json
  - scripts/compose-parity-diff.mjs
---

# Native target admission — criteria per codegen output

Status: active doctrine. Governs which components a native codegen output
(SwiftUI, Jetpack Compose) may admit, and what "admitted" proves. The
rail-admitted web family (React, Vue, Svelte, Angular, Lit, React Native)
is out of scope here; its admission authority is the admission-descriptor
registry plus the governed rail.

## The shared substrate

A component's durable semantics live in its contract; each native target is
a realization backend. Between the IR and the native emitters sits one
shared substrate module, `packages/ds-codegen/src/frameworks/native-emission-class.ts`
(sibling of `native-token-consumption.ts`), which owns the framework-neutral
**emission-class predicates**: `isProjectedChildrenAction`, `isStaticContent`,
`isBareRuleLeaf`, `isVisualOnlyLeaf`, `isValueChannelControl` (with
`soleInputElement` / `soleValueChannel`), plus the structural atoms
(`countChildrenLeaves`, `hasEssentialComponentInstance`).

Two rules govern what lives there:

1. **Identical predicates are written once.** When two targets implement the
   same class word-for-word (static content, projected-children action,
   bare-rule leaf, value-channel control), the predicate lives in the
   substrate and both emitters import it. A copy is a drift defect waiting
   to happen — this is how `isProjectedChildrenAction` started (exported
   from the swift emitter for the jetpack action path) before it had a
   durable home.
2. **Divergent predicates stay at the target, built from shared atoms.** The
   jetpack prop-text and expandable gates are deliberately broader than
   swift's (they realize shapes swift routes elsewhere). That divergence is
   target-capability information: unifying it would silently change one
   target's admitted set. Divergent predicates compose from the substrate's
   atoms so the difference is visible at the dispatch site.

An emission-class predicate that special-cases a component name is a
missing IR fact — push the fact down, never the name up.

## The admission ladder

A component is admissible for a native target when **all** of the following
hold. Each rung is mechanically checked; none is a judgment call.

| Rung | Criterion | Authority |
|---|---|---|
| C1 Class | The component's structural emission class is realized by the target's emitter, dispatching on a substrate (or explicitly target-local) predicate. Zero component-name checks in the dispatch path. | Code review + `grep` for name literals in dispatch; unit tests pin class routing |
| C2 Registration | The component is on the target's `components` allowlist in `fsds.targets.json`. The allowlist scopes *default* generation only — explicit per-component requests bypass it and must hit the emitter's fail-loud not-implemented throw for unimplemented classes. Admission never silences an emitter gap. | `fsds.targets.json`; CLI allowlist filter |
| C3 Bytes | The target's generated tree is committed and regeneration is byte-identical. | CI generated-tree diff; local `generate` + `git diff --exit-code` |
| C4 Compile | The target's own toolchain compiles the tree. Compose: `gradlew :library:compileKotlin` (plus the CI kotlinc smoke lane and the settings example consumer). SwiftUI: `swift build`/`swift test` over the SwiftPM package (the test target additionally evaluates every admitted component body). | Native compile lanes in CI |
| C5 Token parity | Every token definition the target emits is consumed, every lookup has a definition, shared slot identities agree with React Native, chrome roles are claimed per emitter path, and the composable API keeps `modifier` as the first optional parameter. Compose: `pnpm run parity:compose-tokens`. | `scripts/compose-parity-diff.mjs` (+ self-test) |
| C6 Substrate discipline | Committed substrates are foundation-only (zero `androidx.compose.material` imports) and live in family-named directories (`toggle/`, `rule/`, `controls/`) that never match a component name in any casing — on case-insensitive filesystems a `checkbox/` substrate dir and the generated `Checkbox/` component dir are one physical directory with two owners. | Review + the parity script's per-path detection |
| C7 Divergences ledgered | Every contract fact the realization does not lower (omitted props, binary-only state, unclaimed layout slots) is named as a divergence in the emitter's docstring and here — never silently dropped. | This document |

## Current per-target state

SwiftUI admits the full corpus: `<!-- target-component-count:swiftui -->52`
of `<!-- component-count -->52` contracts. Jetpack Compose admits
`<!-- target-component-count:jetpack-compose -->38`, realized through the
emitter paths below (each dispatches on the substrate or its documented
local twin):

| Compose emitter path | Substrate predicate | Corpus consumers |
|---|---|---|
| native-toggle collapse | `collapseIntents: native-toggle-affordance` | Switch, ToggleSwitch |
| projected-children action | `isProjectedChildrenAction` (substrate) | Button, Links, NavList |
| boolean control | `isValueChannelControl` + boolean channel (substrate) | Checkbox |
| text control | `isValueChannelControl` + string channel (substrate) | Input |
| native-disclosure collapse | `collapseIntents: native-disclosure` | Details |
| radio collection | `radioGroupFacts` (substrate) | RadioGroup |
| array-iterated list | `isArrayIteratedList` (substrate) | Shuttle |
| interactive composite | `isInteractiveComposite` (substrate) | Accordion, Tabs |
| count-iterated field group | `isCountIteratedFieldGroup` (substrate) | OTP |
| labeled text control | `isLabeledTextControl` (substrate) | TextField |
| selection control | `isSelectionControl` (substrate) | Select |
| bare-rule leaf | `isBareRuleLeaf` (substrate) | Divider |
| glyph host | `isGlyphHost` (substrate) | Icon |
| icon-decorated content | `isIconDecoratedContent` (substrate) | Alert, AlertNotice, Badge |
| prop-text leaf | target-local (broader than swift) | CodeBlock, CodeSnippet, Markdown, Text-leaf family |
| expandable content | target-local (broader than swift) | ShowMore, Truncate |
| progress indicator | target-local role+shape gate | Progress, Spinner |
| static content | `isStaticContent` (substrate) | the passive chrome family |

Dispatch precedence mirrors the swift dispatcher: a declared collapse
intent owns the realization before any structural class is consulted.

## Remaining components — required class and blocker

The contracts still outside the compose allowlist (14 after Select), each with the class
that would carry it, whether that class needs a shared-substrate move
(the predicate is currently swift-local) or is target-local, and the
concrete blocker or decision that gates the slice. Measured from
`packages/ds-swiftui` emission classes and the IR probes recorded in the
specs `FEAT-COMPOSE-*`.

| Component | Required class | Substrate move | Blocker / decision |
|---|---|---|---|
| Card | compound-part composer | no (target-local composer) | compound-part projection; five declared part carriers currently unrealized on web too |
| Field | named-slot composer | no (target-local composer) | multi-slot projection (5 slots); label/description/error regions |
| Chip | dual-action composite | no (target-local) | two `componentRef` buttons (primary + dismiss) lower as component instances |
| Calendar | date-grid surface | yes (`isDateGridSurface`) | Date-array channel; month grid rendering |
| NavTree | none of the above | no | no channel, `li` root with heading/list parts: needs a passive-tree class (or a glyph-host admission with its documented icon-only degradation, rejected so far) |
| Image | media leaf | yes (`isMediaLeaf`) | foundation-only image loading does not exist; needs a painter/loader decision (degradation or a committed loader substrate) |
| Avatar | src-or-fallback | yes (`resolveSrcFallbackRef`) | same loader decision as Image; falls back to initials |
| Dialog | centered-modal surface | no | `androidx.compose.ui.window.Dialog` host + dismissal channels |
| Sheet | centered-modal surface | no | same host, sheet presentation axis |
| Command | centered-modal surface | no | same host, command-palette list anatomy |
| Popover | anchored surface | no | `Popup` + position provider; anchor adoption via `onGloballyPositioned` |
| Tooltip | anchored surface | no | `TooltipBox`-equivalent on foundation; hover/focus triggers |
| Toast | toast surface | no | overlay presenter + dwell-token auto-dismiss (`.task`/delay) |
| Walkthrough | coachmark surface | no | selector-sourced anchor positioning + step channel |

Measured vs. inferred: every class named above is read from the generated swift tree's own emission-class comment except **Card**, **Field**, and **NavTree**, which carry none — their required class is inferred from their anatomy and is confirmed at slice time, not asserted here.

Shared-substrate ordering: the four predicates marked "yes" move into
`native-emission-class.ts` exactly once, as `isProjectedChildrenAction`
and the seven predicates already there did; each such move must leave the
SwiftUI regeneration byte-identical (the drift gate is the proof). The
surface family (7 contracts) is the largest single unlock and needs no
predicate move — it needs `surface-emit.ts` filled in from its scaffold.

## Ledgered divergences (compose)

- **Checkbox** — `indeterminate` is not lowered (the substrate is binary,
  matching the SwiftUI boolean-control twin); `name`/`value`/
  `ariaLabelledby` form-wiring props are omitted v1; `ariaLabel` lowers to
  the semantics `contentDescription`; checked-state colors fall back to
  ledgered constants until the token graph carries checked-scope slots;
  visual box geometry comes from the emitter's framework-grammar table
  because no `checkbox.size.*` token exists.
- **Divider** — the `thickness`/`title` string props are omitted v1 (the
  token slot drives thickness); `divider.spacing.margin` is unread (this
  class realizes the rule, not the surrounding layout rhythm).
- **Details (native disclosure)** — hover-scoped and focus-ring slots are
  unclaimed (the header keeps no hover interaction state v1); `details.
  typography.*` and `details.spacing.*` are unclaimed (default summary
  typography; content is a consumer composable). Accordion does NOT carry
  the disclosure intent (its `string | string[]` value channel is a
  multi-item shape for a later class).
- **Select (selection control)** — `searchable`, `filterFn`, `triggerLabel`, `size` and `empty` are not lowered v1; the trigger shows the selected label (placeholder fallback); single-select closes the popup after choosing, multi-select stays open, and a controlled `open` always wins.
- **TextField (labeled text control)** — `type`, `name`, `required` and `ariaDescribedby` form-wiring props are not lowered v1; `invalid` gates the error region, which renders only when the consumer supplies it.
- **OTP (count-iterated field group)** — `onComplete`, the `mode` axis, and `readOnly` are not lowered v1 (value changes ride the channel); `label`/`fieldLabel`/`ariaDescribedby` lower to a single group contentDescription.
- **Accordion / Tabs (interactive composite)** — part-scoped typography (`accordion.text.sizeContent`) is unclaimed; group-level `disabled` is not lowered v1; a subcomponent used outside its root throws at CompositionLocal access (the swift @EnvironmentObject / RN compound-context trap).
- **Shuttle (array-iterated list)** — item removal is the swift twin's documented write (filter the item out); hover/active-scoped slots are unclaimed (no interaction state v1).
- **RadioGroup (radio collection)** — the option alias's `title`/help
  member is carried on the lowered data class but not rendered v1 (the
  SwiftUI twin lowers it to `.help`); the option rows use the content
  color for indicator and label (the contracts declare no radio-part
  color slots — RN consumes only the shared box-model family).
- **Input (text control)** — `input.opacity.disabled` is unclaimed (a
  unitless numeric with no toFsds converter; disabled styling rides the
  bg/border color slots); form-wiring props (`name`/`id`/`ariaLabelledby`)
  are omitted v1; `ariaLabel` lowers to the semantics contentDescription.
- **Icon (glyph host)** — NavTree also matches `isGlyphHost` (its item
  icons carry the fact) but stays **unadmitted** on compose: its best
  class is array-iterated list, not yet landed; admission is the
  allowlist's decision, not the dispatch's. SwiftUI admits NavTree as a
  glyph-host v1 (icon-only rendering) — its own ledgered degradation.
  Icon's unknown-name fallback paints a dashed placeholder rather than
  nothing; glyph stroke inherits the content color (the `currentColor`
  analog).
- **Icon-decorated content (Alert/AlertNotice/Badge)** — part-scoped text
  typography (`*.text.size`/`*.text.weight`) is unclaimed: the content
  region is a consumer composable, not styled text (RN styles it); border
  width is 1.dp when a border color slot exists (no width slot in these
  contracts); a variant member whose semantic slot name differs
  (`error`↔`danger`) binds through the sole-unassigned-family-slot
  closure — deterministic from the scope facts, never a name table.
- **All control paths** — `box-model.gap` is unclaimed chrome: a lone
  control lays out no children; label/gap realization belongs to composer
  classes.

Adding a component is therefore not an emitter edit: land the class (or
confirm the existing class covers the shape), extend the parity script's
path/role table if the path is new, add the allowlist entry, regenerate,
and run C3–C5. Growing the corpus grows the ladder, not the criteria.

## Non-claims

Admission proves emit → drift-gate → compile → token-parity binding. It
does not prove visual parity with the web family, accessibility adequacy,
Android SDK/device or iOS simulator behavior, or component correctness
beyond what the SwiftUI test target's bounded facts cover. The Compose
lane has no UI-runtime lane; the SwiftUI PressProof harness is a
separately-invoked macOS witness, not a CI step.
