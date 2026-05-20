---
doc_id: ARCH-CODEGEN-AUTHORITY-001
authority: architecture
status: draft
title: Codegen Semantic Authority
owner: "@darianrosebrook"
updated: 2026-05-18
governs:
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/test-plan.ts
  - packages/ds-codegen/src/frameworks/react
  - packages/ds-codegen/src/frameworks/vue
  - packages/ds-codegen/src/frameworks/svelte
  - packages/ds-codegen/src/frameworks/lit
  - packages/ds-codegen/src/frameworks/angular
  - packages/ds-codegen/src/validation
---

# Codegen semantic authority

This document defines where generation semantics may live in `@full-stack-ds/codegen` and the per-framework packages.

The project's central claim is not "we can generate a design system." It is:

> A component's durable semantics live in the contract, with each framework acting only as a realization backend.

If the generated system works only because emitters accumulate hand-authored component lore — "if `ShowMore`, do this," "if `Tabs`, do that," "if `Tooltip`, wire this specially" — then the contract is not the source of truth. The emitter has become the actual design-system authoring layer.

This document is the architectural guardrail that prevents that drift.

## The authority split

```
Contract              declares component semantics
Semantic IR           normalizes contract into framework-neutral facts
Framework emitter     lowers IR into idiomatic framework syntax
Admission rail        validates that emitted artifacts pass framework tooling
Behavioral tests      validate that runtime behavior satisfies the contract
```

### Contract owns component intent

The contract should say things like: this part is a trigger; this channel is `open`; this binding controls `aria-expanded`; this node's visible label comes from `summary`; this option has role `option`; this popover content is interactive; this image requires `alt`.

The contract should **not** know that Svelte rejects `textContent={...}` while React accepts it as a prop-like DOM property. That is realization knowledge, not semantic knowledge.

### IR owns normalized semantic facts

The IR should turn contract facts into framework-neutral emission facts:

- "this binding is a text-node child" (not a JSX prop / Svelte attribute / Lit template-property)
- "this attribute is ARIA Booleanish"
- "this event extracts a boolean channel from a checkbox host" (DOM-native `.checked`)
- "this event toggles a boolean channel from a button host" (no native readback)
- "this role requires focusability"
- "this host has an implicit role, so explicit role would be redundant"

These are not React/Svelte/Vue decisions. They are normalized DOM, accessibility, and interaction facts. Every framework emitter consumes the same IR fact and lowers it idiomatically.

### Framework emitter owns realization syntax and idioms

The Svelte emitter is allowed to know:

- a text-child binding becomes `{expr}` child content, not `textContent={expr}`
- a boolean attribute is written in Svelte's accepted form
- a snippet/action split is required for host adoption
- Svelte warnings are admission-relevant and may require `<!-- svelte-ignore -->`

It is **not** allowed to know:

- "`ShowMore` gets special handling"
- "buttons in `Walkthrough` should get aria-label synthesized from part name"
- "the `openness` channel on `Accordion` needs Boolean coercion"

The first three are framework realization. The last three would be hidden product semantics encoded in the wrong place.

### Admission rail owns detection, not generation policy

The admission rail (`pnpm run validate:generated`, see `FRAMEWORK-EMIT-VALIDATE-01`) proves that emitted artifacts are accepted by the framework compiler/parser/language server. It does not become a place where hidden generation policy lives. It can tell us "Svelte rejects this," but it should not silently decide "therefore `ShowMore` should be emitted differently."

## The non-negotiable invariant

> **No durable framework emitter rule may branch on component identity unless the branch is explicitly marked temporary, cites the missing contract/IR semantic fact, and has a removal follow-up.**

Rules are allowed to branch on:

- HTML tag (`button` vs `input` vs `details`)
- ARIA role (`option`, `dialog`, `tablist`)
- Anatomy part role (`trigger`, `content`, `overlay`)
- Channel kind (controlled state, anchor toggle, dismissal trigger)
- Channel value type (`boolean`, `string`, `number`, `Date`, union, array)
- Host capability (form-control with `.checked`/`.value` vs non-form-control)
- Surface kind (`tooltip`, `popover`, `dialog`, `menu`)
- Binding kind (`prop`, `literal`, `channel`, `text_child`)
- Framework grammar / type system / a11y validator constraints

Rules are **not** allowed to branch on:

- Component name (`if (ir.name === "Tooltip")`)
- Hardcoded prop names that only make sense for one component
- Test name or file path

## Classification fields every durable emitter rule must declare

When adding a new generation rule, document:

```
source fact:    contract | IR | framework grammar | framework type system | framework a11y validator
applies by:     tag | role | binding kind | channel value type | host capability | surface kind
removable when: <upstream change that would invalidate this rule>
```

If you cannot fill in `source fact` and `applies by` without referencing a component name, the rule does not belong in the emitter. Move it upstream (contract or IR), or mark it as a temporary exception with a removal task.

## Temporary exception protocol

Sometimes a rule cannot be promoted upstream immediately because the IR doesn't yet carry the required fact. In that case the emitter exception is allowed, but only under this protocol:

```ts
// TEMPORARY EMITTER EXCEPTION
// Reason: IR does not yet carry `text_child` binding kind; contract
// uses `textContent` as authoring shorthand. Emitter lowers ad hoc
// for Svelte until CODEGEN-IR-TEXT-CHILD-01 lands.
// Removal: CODEGEN-IR-TEXT-CHILD-01.
if (key === "textContent") { ... }
```

The exception **must**:

1. Cite the upstream fact it's standing in for.
2. Name the follow-up task that removes it.
3. Not branch on component identity.

Exceptions without a removal task accumulate into scar tissue. They lose their explanation when the author rotates off the codebase, and future readers cannot tell "is this safe to remove?" That is exactly the failure mode this document exists to prevent.

## Classified inventory of current emitter rules

This inventory was produced as part of CODEGEN-SEMANTIC-AUTHORITY-01. It documents every durable emitter rule as of the audit and its authority classification.

### Healthy (generic, properly placed)

| Rule | Lives in | Source fact | Applies by |
|---|---|---|---|
| `composeRefs` / `composeEventHandlers` | React substrate | React grammar (ref + synthetic event composition) | React language |
| `isInsideSurface(anchor ∪ content)` boundary predicate | React + Vue + Svelte substrates | DOM focus semantics | Surface anatomy |
| `SurfaceDataMarker` template-literal type | Vue + Svelte substrates | Contract `cssPrefix` | Surface emit |
| `AnchoredSurfacePolicy` + `resolveAnchoredSurfacePolicy` | Shared `semantics.ts` | Contract `surface.{kind, dismissal, content}` | Surface kind |
| `isAnchoredPresenceKind` | Shared `semantics.ts` | Contract `surface.kind` | Surface kind |
| `EventValueStrategy` + `resolveEventValueStrategy` | Shared `semantics.ts` | Host capability + channel valueType + callback kind | Event extraction site |
| `channelValuePlaceholder(valueType)` | React test emitter | Channel `valueType` | Channel valueType |
| `requiredProps` + `placeholderForPropType` | Test plan | Contract `prop.required` + `prop.type` + `definedTypes` | Prop type shape |
| `defaultOpen` conditional emission | Svelte hook emitter | Channel `defaultValueProp` presence | Channel shape |

### Healthy but duplicated across substrates

| Rule | Lives in | Duplication source | Should live |
|---|---|---|---|
| Boundary `focusout` listener installation | React + Vue substrates (mirrored hand-write) | Substrate hand-writing per framework | Generated from a single IR spec, or codegen'd substrate |

This is acceptable in the short term because the substrate is small and the duplication is mechanical. If the substrate grows beyond ~3 surface kinds, the substrate itself should be generated from the same IR that drives component emission.

### Smells (generic facts encoded as framework-emitter locals)

These rules are not component-specific, but their authority lives in the wrong place. Each should be promoted upstream.

| Rule | Currently lives in | Authority source | Should live in | Follow-up |
|---|---|---|---|---|
| `textContent` binding rendered as child text | Svelte emitter local | DOM semantics: text-node assignment | IR `binding.kind = "text_child"` | CODEGEN-IR-TEXT-CHILD-01 |
| `ARIA_BOOLEANISH_ATTRS` coercion | Svelte emitter local | DOM/ARIA semantics | Shared DOM/ARIA semantics table OR contract projection (`{ "from": "channel:x.value", "projection": "truthy" }`) | CODEGEN-ARIA-PROJECTION-01 |

**Retired smells (promoted upstream):**

| Rule | Was | Now lives in | Promoted by |
|---|---|---|---|
| `eventValueStrategy` (button-host toggle vs input-host `.checked`) | Svelte emitter local (`isFormControlHost`) | `resolveEventValueStrategy` in shared `semantics.ts` | CODEGEN-SEMANTIC-AUTHORITY-01 (df45fb8) |
| `SUPPORTED_ANCHORED_KINDS` allowlist | React + Vue surface emitter locals | `isAnchoredPresenceKind` + `AnchoredSurfacePolicy` in shared `semantics.ts` | CODEGEN-SURFACE-KIND-POLICY-01 (this atom) |
| `DISMISSAL_PROP_SPECS` map (React) + identical map in Vue | React + Vue surface emitter locals | `AnchoredSurfacePolicy.publicDismissalProps` (from `DISMISSAL_PROP_TABLE` in shared `semantics.ts`) | CODEGEN-SURFACE-KIND-POLICY-01 (this atom) |
| Default content role per surface kind | React + Vue surface emitter locals | `AnchoredSurfacePolicy.defaultContentRole` in shared `semantics.ts` | CODEGEN-SURFACE-KIND-POLICY-01 (this atom) |

The Lit/Angular surface emitters still gate locally on `kind === "tooltip"` because their Popover ports haven't landed yet. After F-3B-3/4 ship, those guards should also be replaced with `isAnchoredPresenceKind`. Svelte was migrated in F-3B-2-B and now consumes `AnchoredSurfacePolicy` (no kind allowlist, no hardcoded content role, no hardcoded `closeOnX` props).

### Reverted as fabricated semantics

These working-tree changes from `SVELTE-ADMISSION-A11Y-WARNINGS-01` were reverted as part of CODEGEN-SEMANTIC-AUTHORITY-01 because they encode product semantics inside a framework emitter.

| Reverted rule | Why |
|---|---|
| `isImplicitRoleForSvelteElement` (Svelte-only second implicit-role table) | Duplicates `IMPLICIT_ROLES_BY_ELEMENT` from `semantics.ts`. Future readers asking "is this safe to remove?" have two authorities in disagreement. Promote to the central table (CODEGEN-IMPLICIT-ROLES-EXTEND-01) instead. |
| `humanizeForAriaLabel` + auto `aria-label` synthesis on empty buttons | Fabricates accessible names from part names. The contract should declare the label source (`"aria-label": "literal:Skip"` or `"aria-label": "prop:skipLabel"`) or declare that children must provide one. The emitter has no authority to invent accessible names. |
| Auto `aria-selected="false"` on `role="option"` | "Role X requires attribute Y" is generic, but hardcoding `="false"` and locating it in Svelte alone makes it both wrong and parochial. Should be a shared ARIA-required-props table with the value sourced from a channel binding. |
| Overlay-click `<!-- svelte-ignore -->` directives | The product semantics (backdrop has no keyboard equivalent because Escape lives on document) should be derivable from `surface.dismissal: ["outside-click"]` in the contract — and was emitter-local without that derivation. Restore only when the contract derivation is explicit. |
| Tablist `<!-- svelte-ignore -->` directive | Same shape: a Svelte-local suppression for a generic ARIA rule. Should be expressed as "role X is exempt from interactive-focus rule" in a shared a11y table consumed by all framework emitters that have a similar checker. |

The hard-error fixes from `SVELTE-ADMISSION-TYPECHECK-ERRORS-01` (commit `c559f1a`) **remain in place** — they are real framework realization law (Svelte grammar rejects `textContent` as attribute) plus generic facts (host capability for event extraction, Booleanish coercion) that will be promoted upstream over the follow-up atoms listed above. They are not reverted; they are documented as standing in for not-yet-promoted IR facts under the temporary-exception protocol.

## How to use this document

When adding a new emitter rule, fill in the classification fields. If the rule branches on component identity, do not commit; promote upstream first or mark as a temporary exception with a removal task.

When reviewing emitter code, look for: hardcoded component names, hardcoded prop names that only make sense for one component, framework-local tables that duplicate semantic facts, and silent generation policy inside the admission rail.

When in doubt, ask: "If I rename `Tooltip` to `Hovercard` in the contract, does this rule still apply?" If the answer is "no" or "I don't know," the rule is component-specific and needs to move upstream.
