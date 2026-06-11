---
doc_id: SPEC-STATES-TO-CSS-001
authority: spec
status: active
title: "Contract states → CSS selectors"
owner: "@darianrosebrook"
updated: 2026-05-14
governs:
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/css.ts
  - packages/ds-codegen/src/states-to-css.test.ts
---

# Contract `states` → CSS selectors

A contract's `states` array declares **author intent**: the visual or interaction states the component supports. The CSS emitter (`packages/ds-codegen/src/ir.ts`) decides how to express each state in idiomatic CSS, so designers and integrators get the selector shape they expect for free.

## Mapping

| Contract state | Emitted selector | Notes |
|---|---|---|
| `hover` | `.<prefix>:hover` | Pseudo-class |
| `focus`, `focus-visible` | `.<prefix>:focus-visible` | Both map to `:focus-visible`; we never emit raw `:focus` |
| `focus-within` | `.<prefix>:focus-within` | Pseudo-class |
| `active` | `.<prefix>:active` | Pseudo-class |
| `disabled` | `.<prefix>:disabled` | Pseudo-class |
| `checked` | `.<prefix>:checked` | Pseudo-class |
| `expanded` | `.<prefix>[aria-expanded="true"]` | ARIA attribute selector |
| `pressed` | `.<prefix>[aria-pressed="true"]` | ARIA attribute selector |
| `selected` | `.<prefix>[aria-selected="true"]` | ARIA attribute selector |
| anything else (e.g. `entering`, `leaving`, `loading`, `error`) | `.<prefix>--<state>` | BEM modifier class — toggle via JS / hook |

The mapping table lives at `DERIVABLE_STATE_TO_PSEUDO` in `packages/ds-codegen/src/ir.ts`. Add entries there when introducing new derivable states (e.g. `invalid` → `[aria-invalid="true"]`).

## Why split into derivable vs. modifier?

- **Derivable states** are observable by the browser (`:hover`, `:focus-visible`, `aria-*` attributes set by the component). No JS is needed to apply them, and pseudo-class selectors are what designers expect when writing component CSS.
- **Modifier states** describe intent the browser can't infer (`entering`, `loading`, `error`). They need a runtime — a hook, a class toggle from a parent — to apply. Authors wire those up in their component's `@custom` block, or via a behavior primitive when one exists.

## Tokens per state

`tokens.<stateName>` populates declarations on the resulting selector. For example, given:

```json
{
  "states": ["default", "hover"],
  "tokens": {
    "root": { "x.color.fg": { "resolvesTo": "semantic.color.fg", "fallback": "black", "property": "color" } },
    "hover": { "x.color.fg-hover": { "resolvesTo": "semantic.color.fg-hover", "fallback": "blue", "property": "color" } }
  }
}
```

the emitter produces:

```css
.x { color: var(--semantic-color-fg, black); }
.x:hover { color: var(--semantic-color-fg-hover, blue); }
```

## Contract authoring guidance

- Always include `"default"` in `states`. The emitter skips it (no selector emitted) but downstream tooling expects it.
- Don't add `"focus"` **and** `"focus-visible"` — they map to the same selector. Prefer `"focus-visible"`.
- ARIA-derived states (`expanded`, `pressed`, `selected`) require the component to set the corresponding `aria-*` attribute on the root element. The dom-tree emitter handles this when `attrs.aria-expanded` is bound to a channel; otherwise you need to set it yourself in `@custom`.
- Don't declare `"role": "generic"` in `a11y.role` — `generic` is the implicit role of every element and emitting it explicitly is an axe violation. Omit `a11y.role` entirely when the component has no specific role.

## See also

- [`docs/architecture/component-layering.md`](./component-layering.md) — defines WHERE state pseudo-class rules land (in `.css`, nested under the component root, reading state-specific slots) and how variant scopes compose with them via slot redirection.
