---
doc_id: SCOPE-RESIDUAL-ADMISSION-001
authority: roadmap
status: draft
title: Residual admission — Tabs (RN compound path), Accordion (web-first repair), Walkthrough (taxonomy + real anchoring)
owner: "@darianrosebrook"
updated: 2026-06-10
verified_at_commit: 67caf50f
caws_specs:
  - FEAT-COMPOUND-RN-001     # Tabs compound-state path on React Native (FUTURE — not authored)
  - FEAT-ACCORDION-WEB-001   # Accordion disclosure-list realization + behavioral proof on web (FUTURE — not authored)
  - FEAT-ACCORDION-RN-001    # Accordion on RN as a list of disclosures (FUTURE — blocked on ACCORDION-WEB-001)
  - FEAT-WALKTHROUGH-TAX-001 # Walkthrough taxonomy extensions + real web anchoring (FUTURE — not authored)
  - FEAT-WALKTHROUGH-RN-001  # Walkthrough on RN (FUTURE — blocked on WALKTHROUGH-TAX-001)
governs:
  - packages/ds-codegen/src/frameworks/react-native/component-source.ts
  - packages/ds-codegen/src/frameworks/react-native/tests.ts
  - packages/ds-codegen/src/frameworks/react-native/surface-emit.ts
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/semantics.ts
  - packages/ds-contracts/component.contract.schema.json
  - packages/ds-contracts/components/Accordion/Accordion.contract.json
  - packages/ds-contracts/components/Walkthrough/Walkthrough.contract.json
  - packages/ds-react-native/src/primitives/**
---

# Residual admission — what Tabs, Accordion, and Walkthrough need to be admitted correctly

**Bar:** the same admission shape the recent surface/dwell slices established —
contract facts → IR → per-target emitter lowering → generated behavioral
tests → governed rail, with platform divergences owned by emitters (never the
contract) and every remaining gap a named non-claim.

This doc records *requirements*, not implementation. The five `caws_specs`
above are reserved FUTURE ids. Facts below were verified at the
`verified_at_commit`; re-verify file:line citations if the cited modules
change before a slice starts.

## Framing corrections (read first)

Two of the three components are **mis-admitted on web today** — they pass
typecheck and the rail's artifact binding, but their behavioral claims are
unproven or false:

- **Accordion (all five web targets):** the generated subcomponents
  (`AccordionItem/Trigger/Header/Content`) are stateless `<Stack>` wrappers —
  no context, no `aria-expanded` toggling, no click wiring — and the react
  custom behavioral test block is **empty**. The component renders structure
  and nothing else. Root cause: the contract's anatomy is *correct*
  (`item` is `multiple`, `trigger` is `interactive`, `content` is `region`),
  but `isCompoundStateContainer` requires a **single** part that is both
  `multiple` and `interactive` (Tabs' `tab` is; Accordion has no such part),
  so the emitters fall through to the dumb `compoundParts` path.
- **Walkthrough (web):** silently broken, not merely unmigrated. The
  generated `Walkthrough.tsx` never reads `steps[].anchor` selectors, never
  positions anything (the only placement artifact is a CSS class
  `walkthrough--${placement}`), and `useWalkthrough`'s `renderInPortal`
  result is returned by the hook but **never wired into the JSX**. The panel
  renders as a static in-tree `<div role="status">`.

Tabs is the inverse: **web is healthy** (full compound-state-container path
with context, roving tabindex, keyboard nav, and a rich handwritten
behavioral suite) and only the RN realization is missing.

## Ordering

| Order | Spec | Component | Targets | Depends on |
|---|---|---|---|---|
| 1 | FEAT-COMPOUND-RN-001 | Tabs | react-native | — |
| 1 (parallel) | FEAT-ACCORDION-WEB-001 | Accordion | react, vue, svelte, angular, lit | — |
| 2 | FEAT-ACCORDION-RN-001 | Accordion | react-native | ACCORDION-WEB-001 |
| 3 | FEAT-WALKTHROUGH-TAX-001 | Walkthrough | schema/IR + web | — |
| 4 | FEAT-WALKTHROUGH-RN-001 | Walkthrough | react-native | WALKTHROUGH-TAX-001 |

Slices 1 and the Accordion web slice share no files and can run in parallel
worktrees.

---

## Slice 1 — FEAT-COMPOUND-RN-001: Tabs compound path on React Native

**No contract change.** The contract and IR already carry every fact; the RN
emitter simply has no compound branch — the generic dom-walk produces a dead
monolith (`packages/ds-react-native/src/components/Tabs/Tabs.tsx`):
`useState` with no setter, one static `Pressable` with no `onPress`, and
`orientation/activationMode/loop/unmountInactive/onValueChange/idBase` all
declared but never destructured.

**Requirements:**

1. **Port `createCompoundContext` into RN primitives**
   (`packages/ds-react-native/src/primitives/hooks/createCompoundContext.ts`).
   The react implementation
   (`packages/ds-react/src/primitives/hooks/createCompoundContext.ts`) is
   pure `createContext`/`useContext` and ports verbatim — RN *is* React.
   Do NOT import across packages (`ds-react-native` must not depend on
   `ds-react`). The new file must join the RN emitter-source set so the
   emission manifest does not under-claim provenance.
2. **New `emitCompoundStateContainer` branch** in
   `packages/ds-codegen/src/frameworks/react-native/component-source.ts`,
   parallel to the existing anchored-surface / native-toggle / field-layout /
   checkbox branches, gated by the **same** `isCompoundStateContainer` fact
   the web emitters use (a part with `details.multiple && details.interactive`
   plus a part with `details.role === "region"`). Emits:
   - a context value carrying `activeTab`, `setActiveTab`,
     `registerTab`/`unregisterTab`, `idBase`, `orientation`,
     `activationMode`, `loop`, `unmountInactive` (mirroring the web shape);
   - root `Tabs` wrapping children in the provider, channel state via the
     existing `emitChannelState` machinery (setter required);
   - `TabsList` as a `View` (no RN analog for `tablist` role);
   - `TabsTab` as a `Pressable` with `value: string`,
     `onPress={() => setActiveTab(value)}`, `accessibilityRole="tab"`,
     `accessibilityState={{ selected: activeTab === value }}`;
   - `TabsPanel` with `value: string`, rendering `null` when inactive and
     `unmountInactive` (default) is truthy.
3. **`unmountInactive` lowering:** RN has no `hidden` attribute and no
   `display:none` keyword in the token-driven styles; when
   `unmountInactive === false`, render inactive panels with
   `accessible={false}` and a collapsed style, and record the "visually
   suppressed, not DOM-hidden" semantics as a knownGap.
4. **Platform divergences (emitter-owned, documented):** no keyboard
   navigation / roving tabindex on touch (web's ArrowKey/Home/End handler is
   not emitted); the `indicator` ornament part emits as a static `View`
   (no position animation); `orientation` has no layout effect until
   part-scoped variant styling lands.
5. **Generated proof** (react-test-renderer, extending
   `packages/ds-codegen/src/frameworks/react-native/tests.ts`): pressing a
   tab fires `onValueChange` with its value and flips
   `accessibilityState.selected`; the inactive panel is absent from the tree
   under default `unmountInactive`; controlled `value` overrides internal
   state; `TabsTab` outside `Tabs` throws the compound-context error.

**Acceptance sketch:** generated RN package exports
`Tabs/TabsList/TabsTab/TabsPanel`; interaction tests above pass; RN
typecheck/test/rail green; manifest includes the new primitive.

**Non-claims:** keyboard navigation on touch; indicator animation;
orientation layout; true hidden-but-mounted panels.

---

## Slice 2 — FEAT-ACCORDION-WEB-001: Accordion disclosure-list realization + proof (web)

**No contract change.** The anatomy already models per-item disclosure
correctly; the defect is detection + realization + missing proof.

**Requirements:**

1. **New IR detection `isCompoundDisclosureList`** (in
   `packages/ds-codegen/src/semantics.ts` beside `isCompoundStateContainer`,
   consumed via `packages/ds-codegen/src/ir.ts`): a `multiple` item-role part
   containing an `interactive` trigger-role part and a `multiple` region
   part. Do NOT bend `isCompoundStateContainer` (Tabs' single-active model)
   and do NOT mark Accordion's `trigger` as `multiple` — the repeating unit
   is `item`. The disclosure-list context shape differs structurally from
   Tabs: multi-value `openness: string | string[]` lowers to
   `isOpen(value): boolean` + `toggle(value): void`, with `type=single`
   (replace) vs `type=multiple` (set-toggle) and `collapsible` handled in
   the generated hook, not the contract.
2. **All five web emitters realize the pattern:** `AccordionItem` takes
   `value` and provides item identity through the compound context;
   `AccordionTrigger` wires click → `toggle(value)` and renders
   `aria-expanded={isOpen(value)}` (host-aware channel lowering from
   FIX-CHANNEL-EVENT-LOWERING-001 already guarantees button-host toggles);
   `AccordionContent` renders by `isOpen(value)`; `AccordionHeader` and
   `chevron` remain structural/decorative.
3. **Behavioral tests to the Tabs bar** (currently the custom block is
   empty on every target): toggle on click; `aria-expanded` truth;
   `type=single` closes siblings; `type=multiple` allows parallel open;
   `collapsible` re-closes in single mode; controlled mode; `onValueChange`
   payloads (string vs string[]).

**Acceptance sketch:** generated subcomponents are context-wired (no Stack
passthroughs); the seven behavioral cases pass on react with the other four
targets covered by their generated/behavior suites; rail green; web trees
for all *other* components byte-identical.

**Non-claims:** expand/collapse animation; nested accordions; persistence.

---

## Slice 3 — FEAT-ACCORDION-RN-001: Accordion on RN as a list of disclosures

**Depends on Slice 2** (the IR fact and the behavioral bar). The prior
mobile triage (docs/successor-work-mobile-collapse-triage.md) classified
Accordion C3 with the note that once `native-disclosure` existed (landed,
FEAT-MOBILE-DISCLOSURE-001), "Accordion is a list of disclosures."

**Requirements:**

1. RN realization of `isCompoundDisclosureList` through the ported compound
   context (Slice 1's primitive): per-item `Pressable` trigger with
   `accessibilityState={{ expanded: isOpen(value) }}` and `onPress` →
   `toggle(value)`; conditional content `View`; `type`/`collapsible`
   honored.
2. **No `collapsibleTo` on the Accordion contract** — whole-component
   collapse would be an overclaim (triage doc); the per-item disclosure is
   realized structurally, composing the spirit of the Details C1 proof, not
   its contract intent.
3. Replaces the current dead RN output (no setter; `children` rendered
   twice — once inside the trigger and once in `contentInner`).
4. Generated interaction tests mirroring Slice 2's seven cases.

**Non-claims:** height animation; `collapsible=false` nuance may defer to a
knownGap if the first cut lands set-toggle only.

---

## Slice 4 — FEAT-WALKTHROUGH-TAX-001: taxonomy extensions + real web anchoring

**Root framing:** Walkthrough is not "an anchored surface with a trigger
part." It is a **sequenced controller overlay whose anchors are external
page elements carried as step data** (`steps: WalkthroughStepSpec[]`, each
`{ anchor: string; title; description? }` where `anchor` is a CSS selector).
The surface taxonomy was designed for surfaces that own their anchor
(Tooltip's trigger is part of Tooltip); Walkthrough breaks that assumption
structurally. Four verified blockers, each fixed at its own layer:

1. **Programmatic opening (schema + contract.ts + IR).** `buildSurfaceIR`
   (`packages/ds-codegen/src/ir.ts:2296`) throws when
   `positioning.strategy === "anchored"` with empty `openTriggers`, and the
   schema enum is `hover|focus|click` with `minItems: 1` — there is no way
   to declare state-driven opening. Add `"programmatic"` to the enum
   (schema + `ContractSurfaceOpenTrigger`); the IR accepts anchored surfaces
   whose only trigger is programmatic; emitters that lower open gestures
   (e.g. `rnAnchoredSurface`'s press/long-press selection) emit **no**
   anchor gesture handler for programmatic-only surfaces.
2. **External anchoring (schema + IR).** `surface.anchor.part` must
   reference a trigger-role anatomy part (`ir.ts:2254`); Walkthrough's
   trigger-role parts (`skip/prev/next/dot`) are panel nav buttons, and the
   real anchors are not anatomy at all. Add a zero-field anchor variant
   `{ "kind": "external" }`: it satisfies "anchored surfaces declare their
   anchor model" without dragging per-step data into the surface block. The
   selector strings stay in the `steps[]` prop (styledProps layer); how a
   target resolves them (web `querySelector` vs RN nativeID/ref registry)
   is an emitter concern — the contract stays platform-neutral.
3. **Visibility (IR only — no contract change).** The only channel is
   `step: number`; do NOT add an `open: boolean` channel (it would compete
   with `step` for the same truth). Add a derived IR fact
   (`derivedVisibility`: visible iff the step channel holds a valid
   non-negative index) that surface substrates consume; extend
   `rnAnchoredSurface`'s boolean-channel requirement to accept it. This
   keeps "the step channel is the durable semantic" intact and avoids
   per-component lore in emitters.
4. **Real web anchoring lands IN THIS SPEC** (sequencing rule: taxonomy
   without implementation = contract over-claim). Add `coachmark` to
   `ANCHORED_PRESENCE_KINDS` (`packages/ds-codegen/src/semantics.ts:307`)
   and make the web output true: resolve `steps[step].anchor` via
   `querySelector`, position with the existing
   `useAnchoredSurface`/`useAnchoredPosition` primitives
   (`packages/ds-react/src/primitives/surfaces/`), honor the declared
   `flip-shift` collision, and wire `renderInPortal` into the JSX (today it
   is returned by `useWalkthrough` and dropped).

**Generated proof (web):** next/prev/dot navigation drives the `step`
channel + `onStepChange`; skip fires `onSkip`; escape dismisses; the panel
is positioned relative to the resolved step target (jsdom-level: the
position hook is invoked with the resolved element; geometric correctness
stays a non-claim).

**Non-claims:** `storageKey` persistence (prop binding only); per-step
collision geometry; cross-document/iframe anchor resolution.

---

## Slice 5 — FEAT-WALKTHROUGH-RN-001: Walkthrough on React Native

**Depends on Slice 4** (taxonomy + IR + web proof). Current RN output
renders the panel structure but drops `index/defaultIndex/onStepChange/
onComplete/onSkip/placement/autoStart/closeOnOutsideClick` entirely and has
no setter.

**Requirements:**

1. The `step` channel gains its setter through the existing channel
   machinery; `next`/`prev`/`skip`/`dot` parts gain `onPress` handlers
   (`step + 1`, `step - 1`, dismiss, `dotIndex`); `onComplete` fires when
   advancing past the final step.
2. Panel hosts in a transparent `Modal` with
   `visible={derivedVisibility}` (step ≥ 0), reusing the anchored-substrate
   pattern (escape → `onRequestClose`; outside-click → backdrop press gated
   by `closeOnOutsideClick`).
3. **Documented divergence:** CSS selectors do not exist on RN. The
   `anchor` string is interpreted as a `nativeID`/ref-registry key; without
   consumer-side target registration the panel renders centered. This is an
   emitter-layer interpretation of contract-neutral step data, recorded in
   the emitter source and `reactNativeValidationPlan.knownGaps`.
4. Generated tests: dot/next/prev presses drive `onStepChange`; skip fires
   `onSkip`; Modal visibility tracks step validity.

**Non-claims:** per-step anchor positioning without a consumer ref
registry; collision handling (existing anchored knownGap); `storageKey`.

---

## What admission means here (checklist per slice)

Every slice closes only when: contract/IR facts are sufficient (no emitter
lore), all in-scope targets regenerate with behavior wired, generated tests
prove the interactions (not just structure — the Accordion lesson),
`governed:rail` passes in required mode, untouched generated trees are
byte-identical, and knownGaps/snapshot rows state exactly what is and is not
claimed.
