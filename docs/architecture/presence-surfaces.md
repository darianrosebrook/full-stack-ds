---
doc_id: ARCH-PRESENCE-SURFACES-001
authority: architecture
status: active
title: Presence Surfaces — the architectural family for tooltips, popovers, dialogs, menus, selects, toasts, coachmarks, and sheets
owner: "@darianrosebrook"
updated: 2026-06-11
governs:
  - packages/ds-contracts/Tooltip.contract.json
  - packages/ds-contracts/Popover.contract.json
  - packages/ds-contracts/Dialog.contract.json
  - packages/ds-contracts/Modal.contract.json
  - packages/ds-contracts/Menu.contract.json
  - packages/ds-contracts/Dropdown.contract.json
  - packages/ds-contracts/Select.contract.json
  - packages/ds-contracts/Toast.contract.json
  - packages/ds-contracts/Coachmark.contract.json
  - packages/ds-contracts/Sheet.contract.json
  - packages/ds-contracts/component.contract.schema.json
  - packages/ds-codegen/src/ir.ts
caws_specs: []
---

# Presence Surfaces

Presence surfaces are UI surfaces that appear, persist, dismiss, block, anchor, or notify in relation to a user task. This document defines the architectural family and rejects "floating" as the family name.

## Definitive stances

> **"Floating" is not the family name.** Floating is a geometric implementation property of *some* anchored presence surfaces, not the architectural identity of the family.

> **A modal is not a component.** Modality is a behavioral property of a surface.

> **A dialog is a semantic surface.** A modal dialog is a dialog with blocking modality. A non-modal dialog is a dialog with non-blocking modality.

> **Consumer export names may remain separate from substrate classification.** The substrate (controller, IR shape, codegen path) is governed by this taxonomy. Public import names like `Dialog`, `Modal`, `ModalDialog`, `Menu`, `Dropdown` are a compatibility layer; they do not need to be consolidated.

## The two axes

Every presence surface occupies one position on each of two orthogonal axes:

1. **Presence**: `ephemeral` vs `persistent`
   - *Ephemeral*: closes when the trigger condition expires or a timing budget elapses (tooltip hover-out, toast timeout).
   - *Persistent*: remains open until explicitly dismissed (escape, close button, outside click, programmatic).

2. **Modality**: `blocking` vs `non-blocking`
   - *Blocking*: interaction with content outside the surface is prevented (focus trap, outside `inert`, overlay scrim).
   - *Non-blocking*: outside interaction remains available; the surface coexists with the page.

These axes are **orthogonal**. All four combinations exist in the real world; the taxonomy does not collapse them.

## Classification

| Kind        | Presence              | Modality                  | Positioning           | Interaction              |
|-------------|-----------------------|---------------------------|-----------------------|--------------------------|
| Tooltip     | Ephemeral             | Non-blocking              | Anchored              | Non-interactive content  |
| Popover     | Persistent            | Non-blocking              | Anchored              | Interactive content      |
| Dialog      | Persistent            | Non-blocking or blocking  | Centered / overlay    | Structured interaction   |
| Menu        | Persistent while open | Non-blocking              | Anchored              | Roving focus / commands  |
| Select      | Persistent while open | Non-blocking              | Anchored              | Form selection           |
| Toast       | Ephemeral             | Non-blocking              | Viewport-edge         | Notification             |
| Coachmark   | Persistent            | Often blocking            | Anchored or overlay   | Guided instruction       |
| Sheet       | Persistent            | Blocking or non-blocking  | Viewport-edge         | Structured interaction   |

The classification governs controller selection, ARIA wiring, and dismissal policy. It does **not** govern public component names.

## Substrate vs surface

The substrate is the runtime machinery: controllers, contexts, registration, lifecycle, positioning. The surface is the consumer's component import. Two surfaces may share a substrate (Dialog + ModalDialog both use `DialogSurfaceController`); one surface may compose multiple substrates (Combobox = Select × Listbox).

**Substrate is governed by this document. Surface naming is governed by ergonomics and compatibility.**

## Controller hierarchy

```
SurfaceController                  abstract; lifecycle, modality, focus, dismissal
  ├── AnchoredSurfaceController    Tooltip, Popover, Menu, Select — adds trigger/content geometry
  ├── DialogSurfaceController      Dialog, ModalDialog — centered overlay; trap; outside inert
  ├── ToastSurfaceController       Toast — viewport-edge; timing-based auto-dismiss
  └── CoachmarkSurfaceController   Coachmark — guided sequence; anchored or overlay
```

Naming convention: **`SurfaceController` at the abstract layer; subclasses suffixed with the surface family.** The name `FloatingController` is explicitly rejected — geometry does not name the family.

## Canonical consumer API

All presence surfaces share a compound API:

```tsx
<Surface>
  <Surface.Trigger asChild>
    <button>Open</button>
  </Surface.Trigger>
  <Surface.Content>
    {/* surface body */}
  </Surface.Content>
</Surface>
```

- `Surface.Trigger` registers the invoking DOM element with the root.
- `Surface.Content` registers the rendered surface element with the root.
- `Surface` (root) coordinates registration, owns the open channel, governs dismissal and focus per the surface's modality.

Surfaces without a trigger (e.g. Toast) omit `Surface.Trigger`. Surfaces without an anchored content placement (e.g. ModalDialog centered) still use `Surface.Content` but their controller's positioning strategy is `centered`, not `anchored`.

### `asChild` strategy

Each framework's `asChild` mechanism differs:

| Framework | Mechanism |
|---|---|
| React | `cloneElement(child, { ref: mergedRef, ...handlerProps })` |
| Vue | Slot with `useTemplateRef` for ref forwarding |
| Svelte 5 | Element snippet + action-based registration |
| Angular | Content projection with `@ContentChild` + a structural directive |
| Lit | `<slot @slotchange>` with first-assigned-element adoption |

**Default for Phase F implementations**: each part renders its own host element (`<button>` for trigger, `<div>` for content). `asChild` is an opt-in escape hatch on frameworks where it stabilizes first (React, Vue, Svelte). Lit and Angular may ship `asChild` later.

## The `surface` contract block — paper sketch

The `surface` block is the **semantic classifier and controller-selection descriptor**. It does **not** duplicate the existing `portal`, `dismissal`, and `focus` blocks — those remain the detailed policy knobs.

### Responsibilities split

| Block | Owns |
|---|---|
| `surface` | Family classification (`kind`), behavioral axes (`presence`, `modality`), part participation (`anchor.part`, `content.part`), placement strategy, semantic dismissal list, semantic timing. |
| `portal` (existing) | Portal target, layering, backdrop. |
| `dismissal` (existing) | Per-trigger `enabledBy` prop wiring (e.g. `closeOnEscape`). |
| `focus` (existing) | Trap, return focus, initial focus, scroll lock, wrap. |

The codegen consults `surface.kind` to select the controller. It consults the existing `portal`/`dismissal`/`focus` blocks for the controller's configuration knobs. There is no `surface.focus`, no `surface.portal` — those would create contradiction surfaces.

### Sketch

```json
"surface": {
  "kind": "tooltip | popover | dialog | menu | select | toast | coachmark | sheet",
  "presence": "ephemeral | persistent",
  "modality": "blocking | non-blocking",
  "anchor": {
    "part": "<anatomy part name with details.role === 'trigger'>",
    "relation": "describedby | controls-expanded | labelledby | activedescendant | none"
  },
  "content": {
    "part": "<anatomy part name with details.role of 'content' | 'region' | 'overlay'>",
    "interactive": true | false
  },
  "positioning": {
    "strategy": "anchored | centered | viewport-edge | inline",
    "placementProp": "<consumer-facing prop name>",
    "collision": "none | flip | shift | flip-shift"
  },
  "dismissal": ["escape" | "outside-click" | "blur" | "pointer-leave" | "close-button" | "timeout"],
  "timing": {
    "openDelayProp": "<prop name>",
    "closeDelayProp": "<prop name>",
    "autoDismissProp": "<prop name>"
  }
}
```

**`surface.dismissal` is the semantic list** — which dismissal modes this surface supports conceptually. The existing top-level `dismissal.triggers[].enabledBy` carries the prop-gated implementation policy (e.g. `closeOnEscape: boolean`). The two compose; they do not replace each other.

**`surface.timing` names the props**, not the values. Prop default values live in the existing `props.styled.members[].default` field, as today.

## Worked examples

### Tooltip

```json
"surface": {
  "kind": "tooltip",
  "presence": "ephemeral",
  "modality": "non-blocking",
  "anchor": { "part": "trigger", "relation": "describedby" },
  "content": { "part": "content", "interactive": false },
  "positioning": {
    "strategy": "anchored",
    "placementProp": "placement",
    "collision": "flip-shift"
  },
  "dismissal": ["escape", "blur", "pointer-leave"],
  "timing": {
    "openDelayProp": "openDelay",
    "closeDelayProp": "closeDelay"
  }
}
```

### Popover

```json
"surface": {
  "kind": "popover",
  "presence": "persistent",
  "modality": "non-blocking",
  "anchor": { "part": "trigger", "relation": "controls-expanded" },
  "content": { "part": "content", "interactive": true },
  "positioning": {
    "strategy": "anchored",
    "placementProp": "placement",
    "collision": "flip-shift"
  },
  "dismissal": ["escape", "outside-click"]
}
```

### Dialog (non-modal)

```json
"surface": {
  "kind": "dialog",
  "presence": "persistent",
  "modality": "non-blocking",
  "content": { "part": "content", "interactive": true },
  "positioning": { "strategy": "centered" },
  "dismissal": ["escape", "close-button"]
}
```

### Modal Dialog (Dialog with blocking modality)

```json
"surface": {
  "kind": "dialog",
  "presence": "persistent",
  "modality": "blocking",
  "content": { "part": "content", "interactive": true },
  "positioning": { "strategy": "centered" },
  "dismissal": ["escape", "close-button", "outside-click"]
}
```

The existing top-level `focus` block on the same contract carries `trap: true`, `outsideInert: true`, `returnFocus: true`. The codegen reads `surface.modality === "blocking"` to know it should consult those `focus` fields; it does not duplicate them.

### Toast

```json
"surface": {
  "kind": "toast",
  "presence": "ephemeral",
  "modality": "non-blocking",
  "content": { "part": "content", "interactive": false },
  "positioning": { "strategy": "viewport-edge" },
  "dismissal": ["timeout", "close-button"],
  "timing": { "autoDismissProp": "duration" }
}
```

## `SurfaceIR` sketch (paper)

Analogous to `BehaviorIR` and the planned `FloatingIR` it replaces. Lives in `packages/ds-codegen/src/ir.ts` once the schema lands:

```ts
export interface SurfaceIR {
  kind: "tooltip" | "popover" | "dialog" | "menu" | "select" | "toast" | "coachmark" | "sheet";
  presence: "ephemeral" | "persistent";
  modality: "blocking" | "non-blocking";
  anchor?: { partName: string; relation: SurfaceAnchorRelation };
  content?: { partName: string; interactive: boolean };
  positioning?: {
    strategy: "anchored" | "centered" | "viewport-edge" | "inline";
    placementProp?: string;
    collision?: "none" | "flip" | "shift" | "flip-shift";
  };
  dismissal: SurfaceDismissalMode[];
  timing?: {
    openDelayProp?: string;
    closeDelayProp?: string;
    autoDismissProp?: string;
  };
}

export type SurfaceAnchorRelation =
  | "describedby"
  | "controls-expanded"
  | "labelledby"
  | "activedescendant"
  | "none";

export type SurfaceDismissalMode =
  | "escape"
  | "outside-click"
  | "blur"
  | "pointer-leave"
  | "close-button"
  | "timeout";
```

The IR builder copies `contract.surface` into `SurfaceIR`, resolving the `anchor.part` and `content.part` strings to the actual `PartIR` references (so emitters don't re-resolve). Emitters key on `surface.kind` to select the controller; they read `surface.modality` to decide whether to consult `focus.trap`, etc.

## What this rejects

- ❌ `floating` as the family name.
- ❌ `FloatingController` (and `FloatingRoot`, `FloatingTrigger`, `FloatingContent`) as architectural primitives. Geometry is subordinate.
- ❌ `surface.focus` and `surface.portal` sub-blocks. The existing top-level `focus` and `portal` remain canonical.
- ❌ Consolidating `Dialog.contract.json` and `Modal.contract.json` as part of Gap 4. The substrate consolidation is the goal; consumer-facing export names are out of scope.
- ❌ Consolidating `Menu.contract.json` and `Dropdown.contract.json` similarly.
- ❌ Hook-only / "headless" as the canonical public API. Compound consumer components remain the primary surface.

## What this enables

- **One controller per surface family**, configured by contract policy. The same `AnchoredSurfaceController` underlies Tooltip, Popover, Menu, and Select; only `surface.kind` and the policy knobs differ.
- **Consistent codegen seams** across React, Vue, Svelte, Angular, and Lit. The `surface` block is framework-neutral.
- **A taxonomy consumers can reason about.** "Is this surface ephemeral or persistent? Blocking or non-blocking?" answers most behavior questions without reading source.
- **Forward compatibility.** New surface kinds (e.g. a `command-palette` surface, an `inline-edit` surface) are added by extending the `kind` enum and the controller hierarchy — not by reshaping the family.

## Implementation phasing (forward-looking, not part of this commit)

This document is the architecture lock. It does **not** change any generated component output and does **not** wire any codegen. Subsequent phases:

- **Phase F-1 — Schema landing**: Add the `surface` schema to `component.contract.schema.json` with validation only. No IR builder consumes it yet.
- **Phase F-2 — Tooltip migration**: Move `Tooltip.contract.json` to compound anatomy (`trigger`, `content`, `arrow`). Add `surface` block. Build `SurfaceController` + `AnchoredSurfaceController`. React reference implementation; then 4 framework agents serially (post-Tabs lessons learned).
- **Phase F-3 — Popover, Dialog/ModalDialog, Menu/Dropdown, Select, Toast, Coachmark, Sheet**: Each is a contract addition/migration + controller wiring on top of F-2's substrate.

Estimated total for F-1 through F-3: 10-12 days. This document does not commit to that timeline; it commits to the architecture.

### Status reconciliation (2026-06-10, FEAT-MOBILE-RN-SURFACE-001)

- F-1 (schema) and F-2 (Tooltip + Popover anchored substrate on web) landed
  earlier. The positioning-strategy vocabulary now includes `fullscreen`
  (full-screen takeover; reserved, unused by the corpus).
- **Dialog, Sheet, and Toast now declare `surface` blocks** (taxonomy
  fact-tracking; their web emission is unchanged — react/vue gates are
  kind-aware like svelte/angular/lit). Their close-button parts are wired
  through dom-tree channel events on every target.
- **React Native consumes the taxonomy as its surface substrate**
  (`rnSurfaceLowering`): blocking → `Modal` (escape → onRequestClose,
  outside-click → overlay Pressable, both enabledBy-gated); non-blocking →
  in-tree live region. Anchored kinds on RN remain future work.
- **Auto-dismiss timing landed (FEAT-SURFACE-DWELL-ANCHOR-001):** Toast
  declares `timing.autoDismissProp: "duration"` + timeout dismissal; the
  budget flows from `toast.timing.auto-dismiss` →
  `semantic.motion.dwell.notification` (the `motion.dwell.*` presence-budget
  token subfamily) into the `autoDismiss` behavior primitive, mirrored in
  all five web packages + RN, with hover/focus pausing (WCAG 2.2.1) and
  remaining-budget bookkeeping. Web resolves the token default at
  generation time (not runtime-themeable); RN reads it theme-reactively
  from the typed token scope.
- **RN anchored substrate landed:** Tooltip/Popover lower to a trigger
  Pressable + transparent Modal positioned via measureInWindow, with a
  synthesized `content` slot prop. Emitter-level divergences (contracts
  neutral): outside inert while open, hover/focus → long-press,
  pointer-leave → backdrop press; collision (flip/shift) unimplemented.
- Menu/Dropdown, Select, Command, Coachmark/Walkthrough migrations remain.

## References

- `docs/normal-form.md` — the compositional-system architecture that this family slots into.
- `docs/lit-alpha-component-roadmap.md` — historical Gap 3 (Tabs, closed) and the original Gap 4 (Tooltip) scoping.
- `packages/ds-contracts/component.contract.schema.json` — existing schema; presence-surface contracts will add the `surface` block alongside existing `portal`, `dismissal`, `focus` blocks.
