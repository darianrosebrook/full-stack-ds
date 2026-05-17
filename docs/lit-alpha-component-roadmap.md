---
doc_id: ROADMAP-LIT-ALPHA-001
authority: roadmap
status: draft
title: Lit alpha-component roadmap — Tabs and Tooltip
owner: "@darianrosebrook"
updated: 2026-05-17
caws_specs: []
# No CAWS specs yet — this project doesn't have .caws/ scaffolding. When CAWS
# is adopted here, replace this list with the spec IDs that track each
# roadmap item (e.g., LIT-TABS-01 for Gap 3, LIT-TOOLTIP-01 for Gap 4).
---

# Lit alpha-component roadmap: Tabs (Gap 3) and Tooltip (Gap 4)

This doc scopes the work needed to bring two component families to functional completeness across the design system.

**Status as of 2026-05-17**:

- **Gap 3 (Tabs): CLOSED.** Implemented across all 5 frameworks via the `compound-state-container` codegen path (see Phase A through Phase D commits below). The pattern is detected from contract `anatomy.details` and emits compound parts that wire `activeTab` reactively, register tabs in DOM order, host keyboard navigation, and surface ARIA correctly. 118 new behavioral tests added across the 5 frameworks. The pattern generalizes to Accordion / RadioGroup / Menu (future).
- **Gap 4 (Tooltip): OPEN.** Outline below remains valid; floating-component infrastructure is the next priority.

The original problem statements (preserved for context):

- **Tabs**: renders exactly one `<button role="tab">` regardless of how many tabs the consumer wants — the contract has no iteration primitive, and the compound parts (`TabsList`, `TabsTab`, `TabsPanel`) are stateless wrappers that don't read or write `activeTab`.
- **Tooltip**: only opens when the consumer calls `el.behavior.setOpen(true)` programmatically. The `behavior.trigger: "hover"` declaration in the contract has no codegen translation — there are no `mouseenter`/`focusin` listeners, no positioning math, no delay handling.

## Gap 3 closure — commit trail

| Phase | Commit | Scope |
|---|---|---|
| A | `7369621` | Plumb `anatomy.details` through `PartIR`; populate Tabs contract `details` block |
| B | `c948063` | React reference: `createCompoundContext` wiring + 18 behavioral tests |
| C-Lit | `7ed962c` | Lit Tabs + DOM-event-based reactivity fix to `CompoundContext` primitive; 26 tests (incl. controller isolation) |
| C-Vue | `faea8b5` | Vue Tabs via `provide`/`inject` + getter-accessor reactivity; 18 tests |
| C-Svelte | `a10478e` | Svelte 5 Tabs via `setContext`/`getContext` + `$state` runes; 18 tests |
| C-Angular | `f61a74d` | Angular Tabs via `InjectionToken` + `WritableSignal`; 38 tests |

The codegen seam (`isCompoundStateContainer`, `getInteractiveItemPart`, `getRegionPart`, `getGroupHostPart`) is defined once in `react/hook-source.ts` and imported by the other four framework emitters. Adding Accordion or RadioGroup will require adding their contracts with the same `anatomy.details` shape (interactive `multiple` item + `region` panel) — no further codegen changes.

---

---

## Gap 3: Tabs iteration (compound-part wiring) — CLOSED

### Original state (preserved for context)

`packages/ds-react/src/components/Tabs/Tabs.tsx` already emits the compound parts as separate exports:

```tsx
export function TabsList({ children, className, "data-testid": testId }) { ... }
export function TabsTab({ children, className, "data-testid": testId }) { ... }
export function TabsPanel({ children, className, "data-testid": testId }) { ... }
```

The main `Tabs` function calls `useTabs({ value, defaultValue, onValueChange })` and gets `{ activeTab, setActiveTab }`. **Neither value flows down to the compound parts.** `TabsTab` doesn't accept a `value` prop, doesn't emit a click handler, doesn't compute `aria-selected`. The consumer pattern that would actually work is unreachable.

Lit has the same shape: `TabsTabElement`, `TabsPanelElement` are stateless `<fsds-stack>` wrappers. Same in Vue, Svelte, Angular.

### What functional-complete looks like

Consumer-facing API (all frameworks):

```tsx
<Tabs value="x" onValueChange={setX}>
  <TabsList>
    <TabsTab value="x">X</TabsTab>
    <TabsTab value="y">Y</TabsTab>
  </TabsList>
  <TabsPanel value="x">Content for X</TabsPanel>
  <TabsPanel value="y">Content for Y</TabsPanel>
</Tabs>
```

What that requires:

1. **Parent → child context.** `Tabs` (the root) provides `{ activeTab, setActiveTab, orientation, activationMode }` via a compound context. `TabsTab` and `TabsPanel` read it.
   - React: `createCompoundContext` already exists at `packages/ds-react/src/primitives/hooks/createCompoundContext.ts`. Use it.
   - Vue: `provide` / `inject` with a typed key. Vue's primitives barrel should export a `createCompoundContext` analog.
   - Svelte: `setContext` / `getContext` with a typed key.
   - Angular: `Injector` or `inject(parent component)`.
   - Lit: a `provideContext` primitive exists at `packages/ds-lit/src/primitives/` (it's re-exported from the package barrel — see existing primitives index). Use it.

2. **TabsTab props.** `value: string` (required), `disabled?: boolean`, `children: ReactNode`. The component reads the context, computes `aria-selected={activeTab === value}`, emits `onClick={() => setActiveTab(value)}`, sets `role="tab"`, `id="${idBase}-tab-${value}"`, `aria-controls="${idBase}-panel-${value}"`, `tabindex={activeTab === value ? 0 : -1}` (single-tabbable roving focus).

3. **TabsPanel props.** `value: string` (required), `children: ReactNode`. Renders only when `activeTab === value` (or always renders with `hidden` attribute when `unmountInactive` is false). Sets `role="tabpanel"`, `id="${idBase}-panel-${value}"`, `aria-labelledby="${idBase}-tab-${value}"`, `tabindex={0}`.

4. **Keyboard navigation.** Hosted on `TabsList` (the container). Listens for keydown:
   - `ArrowRight`/`ArrowLeft` (horizontal) or `ArrowUp`/`ArrowDown` (vertical): move focus to next/previous tab.
   - `Home`/`End`: focus first/last.
   - `Enter`/`Space` in manual activation mode: activate the focused tab.
   - `Tab`: move focus to the active panel.

   `useTabs` (the behavior hook) needs to track which tab values exist. The simplest pattern is for each `TabsTab` to register its value on mount and unregister on unmount, giving the context an ordered list of values.

### Contract surface

The current `Tabs.contract.json` declares the rendered DOM with one static `<button role="tab">`. To support iteration, the contract needs to either:

**Option A — declare the rendered tree as compound, not iterative.** The contract's `anatomy.dom` describes the wrapper layout only (`<div class="tabs"><div class="tabs__list"></div><div class="tabs__panel"></div></div>`). The codegen separately knows about `TabsList`, `TabsTab`, `TabsPanel` as compound parts, and the wrapper layout uses `<slot>` / `{children}` placement. The contract gains no new DSL features; it just stops trying to render a single tab. **Recommended.**

**Option B — extend the contract DSL with iteration.** Add a `repeat` node kind with `for: "prop:tabs"` and per-iteration bindings. This is more powerful but adds a contract feature that ripples through every framework emitter, and would only have one consumer (Tabs) for the foreseeable future. **Not recommended unless 3+ components need iteration.**

Option A leaves the iteration entirely to consumer code — they write `<TabsTab value="x">X</TabsTab>` themselves. The codegen's responsibility is the wiring within each part, not the iteration loop.

Contract diff (Option A):

```json
{
  "anatomy": {
    "parts": ["root", "list", "tab", "indicator", "panel"],
    "dom": {
      "tag": "div",
      "part": "root",
      "children": [
        { "tag": "slot", "name": "list" },
        { "tag": "slot", "name": "panel" }
      ]
    }
  },
  ...
}
```

Per-part contract additions (extends the existing `parts` array with metadata each compound part needs):

```json
{
  "anatomy": {
    "parts": ["root", "list", "tab", "indicator", "panel"],
    "details": {
      "list": {
        "description": "Container for tab buttons. Hosts keyboard navigation.",
        "role": "group",
        "aria": { "role": "tablist" }
      },
      "tab": {
        "description": "Single tab button.",
        "role": "item",
        "interactive": true,
        "focusable": "roving",
        "aria": { "role": "tab", "attributes": ["aria-selected", "aria-controls", "tabindex"] }
      },
      "panel": {
        "description": "Content panel for a tab.",
        "role": "region",
        "aria": { "role": "tabpanel", "attributes": ["aria-labelledby", "tabindex"] }
      }
    }
  }
}
```

The `details` block already exists in the contract schema (see `src/types/data.ts:PartDetails` in the showcase). The codegen currently uses it for documentation purposes only; this work would extend the IR builder to read `details[partName].interactive`, `.focusable`, `.aria` and synthesize the right wiring on each compound-part class.

### Codegen surface to extend

`packages/ds-codegen/src/frameworks/{react,vue,svelte,angular,lit}/`:

- **factory.ts**: no change.
- **component-source.ts**: `generateCompoundPartClass()` currently emits a stateless `<fsds-stack>` wrapper. Extend it to:
  - Read the compound part's `details.aria` and emit `role` + ARIA attribute bindings.
  - If `details.interactive` is true, accept a `value` prop and emit `onClick`/`@click` that calls `context.setActiveTab(value)`.
  - If `details.focusable === "roving"`, register the part with the context's `register(value)` call on mount/unmount.
- **hook-source.ts**: `useTabs` (and equivalents) gains `register(value: string)` / `unregister(value: string)` methods that maintain a sorted list of tab values for keyboard navigation. The keyboard handler reads this list, finds the current index, computes next/prev.

### Test surface to extend

The behavioral tests added in Gap 2 cover the boolean channels (none for Tabs — its channel is `activeTab` typed `string`). New tests:

- Render `<Tabs>` with N `<TabsTab>` children (programmatically constructed in the test). Click each, assert `activeTab` flips and exactly one tab has `aria-selected="true"`.
- Press ArrowRight when first tab is focused, assert second tab is focused.
- Press Home when nth tab is focused, assert first tab is focused.

These tests would need to render multiple children, which the current `renderElement` helper doesn't support. Extend the helper to accept a `children` parameter (string of HTML or array of elements).

### Effort estimate

- React TabsTab/TabsPanel wiring + context: 2-3h
- Same for Vue, Svelte, Angular, Lit: 4-6h
- Keyboard navigation hook: 2-3h (shared logic, per-framework adapters thin)
- Contract `details` extensions to the IR + part-emitter: 2-3h
- Tests across 5 frameworks: 3-4h

**Total: 1.5-2 days for a complete and tested Tabs.** Confidence high — the patterns are well-known (Radix, React Aria) and the codegen infrastructure exists; this is mostly wiring, not invention.

### Risks

- **Cross-framework context shapes.** Each framework's context API has different ergonomics. The Lit `provideContext` primitive needs to integrate with the reactive update cycle so `setActiveTab` triggers a re-render in `TabsTab`. Existing `provideContext` (in `packages/ds-lit/src/primitives/`) is used elsewhere; verify it triggers `requestUpdate` on consumers.
- **Roving tabindex.** Implementing this without focus jumping is fiddly. Reference React Aria's `useFocusManager` and Radix's pattern. The simplest implementation: `TabsList` listens for keydown, computes target tab element, calls `.focus()` directly. The consumer doesn't need to know.
- **Manual vs automatic activation.** In automatic mode, focus alone activates the tab. In manual mode, focus moves but the active tab stays put until Enter/Space. Behavior controller needs both code paths.

---

## Gap 4: Tooltip (floating components family)

### Current state

`packages/ds-lit/src/components/Tooltip/Tooltip.ts` renders a single `<div role="tooltip">` that only appears when `el.behavior.setOpen(true)` is called manually. The contract declares `behavior.trigger: "hover" | "focus" | "click" | "manual"` with default `"hover"`, but the codegen ignores this field. No `mouseenter`/`mouseleave`/`focusin`/`focusout` listeners are emitted.

React's `Tooltip.tsx` is the same — it uses `useTooltip({ open, defaultOpen, ... })` for state management but doesn't wire automatic open/close from trigger events. The only working use case in any framework is programmatic state control.

This is the simpler subset of a broader family — every "floating" component shares the same three open problems:

| Component | Status |
|---|---|
| Tooltip | Generated, alpha. No hover/focus listeners; no positioning. |
| Popover | Generated, alpha. No click-outside positioning; opens programmatically only. |
| Menu | Not yet declared as a separate contract. |
| Dropdown | Not yet declared. |
| Combobox (Select, Command) | Generated. Open state works (manual); selection/listbox positioning is stub. |

So this work isn't just about Tooltip; it's about establishing a **floating-element pattern** that the next four components reuse.

### Three problems to solve

#### 1. Trigger-to-floating-element wiring

The tooltip element needs to know which element it describes. Two API patterns:

**Pattern A — wrapper** (Radix-style):
```html
<Tooltip content="Hello">
  <button>Hover me</button>
</Tooltip>
```
The tooltip wraps the trigger. It listens on its first slotted child for mouseenter/focusin. Pros: consumer-friendly, single component to use. Cons: requires the trigger to be the first child; awkward when the trigger is deeper in the DOM.

**Pattern B — explicit reference** (Aria-style):
```html
<button id="my-btn">Hover me</button>
<Tooltip for="my-btn" content="Hello">…</Tooltip>
```
The tooltip takes a `for` (or `anchor`) prop pointing at the trigger's ID. The tooltip element queries for the element on connect, attaches listeners. Pros: works at any nesting depth, mirrors `<label for>`. Cons: requires consumer to manage IDs.

**Pattern C — render prop / slot prop** (Floating UI style):
```html
<Tooltip>
  {(triggerProps) => <button {...triggerProps}>Hover me</button>}
</Tooltip>
```
The tooltip provides props (event handlers, ARIA attrs) that the consumer spreads onto their trigger. Most flexible, but verbose, and doesn't translate cleanly to template-based frameworks (Vue/Lit/Svelte).

**Recommendation: Pattern A (wrapper) as default, Pattern B (`anchor` prop) as override.** A and B together cover ~all real-world tooltip placements. Wrapper is the default consumer pattern; the `anchor` prop is escape-hatch when the trigger is deeper in the DOM tree.

#### 2. Positioning

A real tooltip needs to position itself relative to the trigger:
- Default placement (top/bottom/left/right/auto).
- Edge avoidance (flip when there's no room).
- Arrow alignment.
- Updates on scroll/resize.

This is a solved problem. Three viable approaches:

**A. Vendor `@floating-ui/dom`** (~10kb, framework-agnostic):
- Pros: battle-tested, handles all edge cases (Radix, Headless UI, Aria use it), framework-agnostic core, ~10kb.
- Cons: external dependency; bundle size; one more thing to track for updates.

**B. Hand-rolled positioning:**
- Pros: zero dependencies; full control.
- Cons: edge cases (RTL, scrollable parents, transformed ancestors, viewport overflow) take weeks to get right. Likely buggy in real use.

**C. CSS-anchor-positioning** (the new native primitive):
- Pros: zero JS, browser-native, future-proof.
- Cons: Chromium-only as of late 2025, Safari/Firefox not yet shipping. Not viable as the sole strategy for a production design system today.

**Recommendation: vendor `@floating-ui/dom`** for now, with a hand-rolled fallback that just does basic placement (no flip) when the dep isn't installed. Migrate to CSS anchor positioning when browser support reaches >90%.

#### 3. Hover/focus state machine

A tooltip that only opens on hover is a worse tooltip than one that:
- Opens on hover OR focus.
- Has a delay before opening (so flying-the-mouse-over-the-UI doesn't trigger every tooltip).
- Keeps the tooltip open while the cursor is over the tooltip itself (hover bridge).
- Closes on Escape.
- Closes on outside click (relevant for click-triggered popovers).
- Has different behavior for keyboard users vs mouse users.

This is non-trivial. Radix and Floating UI ship state machines (often using XState or hand-coded) to handle this. Re-implementing well takes care.

**Recommendation: a single TS class `FloatingTriggerController`** that:
- Takes a config: `{ trigger: "hover" | "focus" | "click" | "manual", delay?: number, closeOnEscape?: boolean, closeOnOutsideClick?: boolean }`.
- Exposes `bind(triggerEl: HTMLElement, floatingEl: HTMLElement): () => void` (returns unbind).
- Lives in a shared `@full-stack-ds/floating` package, or inlined into each framework's primitives (Lit, React, etc.).

Per-framework adapter:
- **Lit**: a `FloatingTriggerController` ReactiveController that hooks into `hostConnected`/`hostDisconnected`.
- **React**: `useFloatingTrigger({ trigger, delay, ... })` returning `triggerProps` and `floatingProps`.
- **Vue/Svelte/Angular**: similar shape, framework-idiomatic.

### Contract surface

The `Tooltip.contract.json` already has the right shape:

```json
"behavior": {
  "channels": { "open": { ... } },
  "triggers": ["hover", "focus"],  // multi-trigger spec
  "dismissalTriggers": ["escape"],
  "focus": { ... },
  "portal": { ... }
}
```

The codegen needs to read `behavior.triggers` and `behavior.dismissalTriggers` (these already exist in the schema!) and translate them into `FloatingTriggerController` config. Today, the codegen has half of this wired (escape + overlay-click for modal-style components) but not the hover/focus side.

Per-part contract extensions (if Pattern A is chosen):
```json
"anatomy": {
  "parts": ["root", "trigger", "content"],
  "details": {
    "trigger": {
      "description": "Element that activates the tooltip on hover/focus.",
      "role": "trigger",
      "interactive": true
    },
    "content": {
      "description": "Floating panel positioned relative to the trigger.",
      "role": "content",
      "aria": { "role": "tooltip" }
    }
  }
}
```

The codegen reads `details.role === "trigger"` and `details.role === "content"` to know which compound part holds listeners and which holds the floating panel.

### Effort estimate

- Choose API pattern (A vs B vs A+B): 0.5 day of design discussion.
- Vendor `@floating-ui/dom`: 0.5 day (add dep, wire one component).
- Write `FloatingTriggerController` (shared TS): 1-1.5 days.
- Per-framework adapter: 0.5-1 day each × 5 frameworks = 2.5-5 days.
- Contract extensions + codegen wiring: 1-2 days.
- Tests (interaction simulations, hover/focus polarity, delay timing): 1-2 days.

**Total: 6-12 days for a complete and tested floating-component family.** Confidence medium-high — the parts are known but the integration is real work.

### Components that benefit

Closing this gap unlocks:
- **Tooltip** — directly.
- **Popover** — same trigger pattern, click-triggered, also a floating panel.
- **Dropdown / Menu** — same pattern + keyboard navigation (overlap with Tabs work).
- **Select / Combobox** — already partially wired; positioning would replace the current "open in-flow" rendering.

The shared infrastructure pays back across these 4-6 components.

### Risks

- **Floating UI version churn.** `@floating-ui/dom` has had API changes; pinning a version and tracking updates is a small ongoing cost.
- **Wrapper pattern + slot composition.** Lit's `<slot>` lets the wrapper find the first slotted element, but querying it requires waiting for `slotchange`. Race conditions on mount need care.
- **Keyboard-only users vs mouse-only users.** Different open/close semantics. Get this wrong and screen readers will announce tooltips at the wrong times.

---

## Recommended sequencing

If you decide to tackle these, the cleanest order is:

1. **Tabs (Gap 3) first.** Smaller scope, well-known patterns, single component, lays the groundwork for compound-part wiring via `details` block. ~2 days.

2. **`FloatingTriggerController` infrastructure.** Pick API pattern, vendor floating-ui, write the shared controller. ~2-3 days.

3. **Tooltip on top of the new infrastructure.** ~1 day.

4. **Popover, then Menu/Dropdown** as follow-up components, each reusing the same primitives. ~1-2 days each.

Total: 1.5-2 weeks for Tabs + Tooltip + Popover, with infrastructure that supports the rest of the floating family.

Until then, the README should flag these as alpha. They generate, compile, and pass their auto-generated tests, but their interactive behavior isn't production-ready.
