# Full Stack Design System

A design system that generates React, Vue, Svelte, Angular, and Lit packages from a single set of JSON contracts, all built on top of one polymorphic primitive — `Stack` — to validate that **component contracts** can serve as the universal source of truth for code generation, agent-driven UI, and documentation.

## The architectural claim

This repository is not, primarily, a design system. It is a falsifiable claim about compositional systems, with a design system as the existence proof. The constraint of "42 components, 1 primitive, 5 frameworks" exists because five structurally opposed framework paradigms — React hooks, Vue composables, Svelte runes, Angular signals, Lit controllers — are the falsification surface: if the same contract can drive all of them idiomatically without leaking implementation detail into any of them, the contract is at the right level of abstraction. If it cannot, the wrongness shows up as friction in exactly one output. The full claim, seven properties of compositional systems in normal form, and the falsification conditions are written down in [`docs/normal-form.md`](docs/normal-form.md).

## What this is

This project is a **contract testing ground**. Every component is defined by a JSON contract that describes its anatomy, props, variants, states, styles, tokens, accessibility, types, and behavior. From that one contract, the codegen emits framework-idiomatic component sources, behavior primitives, tests, and barrels for five frameworks at once.

| | Components | Tests |
|---|---:|---:|
| **`@full-stack-ds/react`** | 42 | 372 |
| **`@full-stack-ds/vue`** | 42 | 259 |
| **`@full-stack-ds/svelte`** | 42 | 253 |
| **`@full-stack-ds/lit`** | 42 | 161 |
| **`@full-stack-ds/angular`** | 42 | 155 |

Contracts live under [`packages/ds-contracts/`](packages/ds-contracts/) (`*.contract.json`), validated against [`packages/ds-contracts/component.contract.schema.json`](packages/ds-contracts/component.contract.schema.json).

The layout primitive is defined separately as a **primitive contract**: [`packages/ds-contracts/primitives/Stack.primitive.json`](packages/ds-contracts/primitives/Stack.primitive.json) (schema: [`primitive.contract.schema.json`](packages/ds-contracts/primitives/primitive.contract.schema.json)). Per-target import paths live under `implementation.targets.<framework>.relativeFromComponents` so each framework's generated components import the canonical primitive correctly.

## Why one primitive

Every component — from `Button` to `Modal` to `DatePicker` — is composed entirely of `<Stack>`, a polymorphic layout primitive that renders as any HTML element:

```tsx
<Stack as="button" variant="horizontal" className="btn">
<Stack as="nav" aria-label="Main">
<Stack as="input" type="email" />
```

This constraint exists to prove the contract carries enough information to fully describe a component. If 42 components with full interactivity, accessibility, and styling can be built from one primitive across five frameworks, then the contract is sufficient for:

- **Code generation** — scaffold framework-specific sources from contracts
- **Cross-framework portability** — the contract is framework-agnostic; React/Vue/Svelte/Angular/Lit are all render targets
- **Agent-to-UI** — an AI agent can read a contract and produce a working component in any of the supported frameworks
- **Documentation sites** — generate prop tables, anatomy diagrams, a11y specs, and usage examples from the same source
- **Design tool integration** — tokens and variants map directly to design tool properties

## Project structure

```
packages/
  ds-contracts/                # Component + schema JSON (source of truth)
    component.contract.schema.json
    *.contract.json             # 42 component contracts
    primitives/
      primitive.contract.schema.json
      Stack.primitive.json      # Canonical Stack API + per-target import paths

  ds-codegen/                  # TypeScript codegen CLI + IR + framework emitters
    src/
      cli.ts
      ir.ts                     # Framework-neutral intermediate representation
      registry.ts                # Target registry (react/vue/svelte/angular/lit)
      frameworks/
        react/                  # component-source.ts, hook-source.ts, factory.ts, …
        vue/
        svelte/
        angular/
        lit/

  ds-react/                    # Generated React package + behavior primitives
  ds-vue/                      # Generated Vue 3 SFC package + composables
  ds-svelte/                   # Generated Svelte 5 package + .svelte.ts hooks
  ds-angular/                  # Generated Angular standalone package + signals
  ds-lit/                      # Generated Lit web-components package + controllers

src/
  app.tsx                      # React showcase (imports @full-stack-ds/react)

docs/
  hook-wiring-design.md        # Design contract for behavior primitives (B.2a–B.2c)
```

## Generator

Codegen is **`@full-stack-ds/codegen`** ([`packages/ds-codegen`](packages/ds-codegen)). The IR (`ir.ts`) is framework-neutral; each framework under `src/frameworks/` translates the IR into idiomatic source for that framework.

Default target is React. Pass `--target=<framework>` or `--target=all` to emit other frameworks.

```bash
npm run generate                                # React only (default)
npm run generate -- --target=all                # All five frameworks
npm run generate -- --target=vue,svelte         # A subset
npm run generate -- Switch                      # Single component
npm run generate -- --target=all Switch Modal   # Subset of components × all frameworks
npm run generate:watch                          # Re-emit on contract changes
npm run generate:validate                       # Validate primitive + component contracts
npm run generate:dry-run                        # Preview output paths without writing
```

CLI flags (after `--`):

| Flag | Purpose |
|---|---|
| `--target=<list>` | Comma-separated target ids: `react`, `vue`, `svelte`, `angular`, `lit`, or `all` |
| `--validate` | Schema-validate contracts and exit |
| `--dry-run` | Resolve and report planned output paths without writing |
| `--watch` | Watch `packages/ds-contracts` and re-emit on change |
| `--force` | Overwrite hand-edited TSX files (otherwise preserved when interactive logic is detected) |
| `--strict-types` | Fail on type-resolution warnings |

### What it emits per contract

| Contract field | Generated output (per framework) |
|---|---|
| `anatomy.parts` / `anatomy.dom` | DOM tree built from `<Stack>` (or framework-equivalent) with BEM classes |
| `props.styled.members` | TypeScript props interface or component @Input/@property declarations |
| `types` | Exported union/enum types |
| `variants` | CSS modifier classes + class computation logic |
| `states` | CSS state modifier classes |
| `styles` | CSS declarations per selector |
| `tokens` | CSS custom property placeholders |
| `a11y.role` / `labeling` / `keyboard` | ARIA attributes on the DOM tree, plus role-aware behavior wiring |
| `behavior.channels` | Controllable state hooks (`useControllableState` / `createControllableState` / etc.) |
| `behavior.dismissalTriggers` | Escape + outside-click dismissal via `useDismissal` (or framework equivalent) |
| `behavior.focus` / `behavior.portal` | Focus trap, scroll lock, portal target wiring |

### Behavior primitives

Each framework package ships an equivalent set of behavior primitives. They share an API contract (codified in [`docs/hook-wiring-design.md`](docs/hook-wiring-design.md)) so the codegen can dispatch to the right one based on the IR:

| Primitive | React | Vue | Svelte | Angular | Lit |
|---|---|---|---|---|---|
| Controllable state | `useControllableState` | `useControllableState` | `createControllableState` | `createControllableState` | `ControllableStateController` |
| Dismissal (Escape / outside-click) | `useDismissal` | `useDismissal` | `createDismissal` | `createDismissal` | `DismissalController` |
| Focus trap | `useFocusTrap` | `useFocusTrap` | `createFocusTrap` | `createFocusTrap` | `FocusTrapController` |
| Scroll lock | `useScrollLock` | `useScrollLock` | `createScrollLock` | `createScrollLock` | `ScrollLockController` |
| Portal | `usePortal` | `usePortal` | `createPortal` | `createPortal` | `PortalController` |
| Anchor toggle (Popover/Menu) | `useAnchorToggle` | `useAnchorToggle` | `createAnchorToggle` | `createAnchorToggle` | `AnchorToggleController` |

### Safety + section preservation

Generated files use `@generated:start`/`@generated:end` and `@custom:start`/`@custom:end` markers so framework outputs can carry hand-authored sections (additional tests, custom logic) across regenerations without being clobbered. CSS and pure component scaffolding are always regenerated.

## Contract format

```jsonc
{
  "name": "Switch",
  "layer": "primitive",
  "cssPrefix": "switch",
  "anatomy": { "parts": ["root", "field", "track", "thumb", "label"] },
  "props": {
    "styled": {
      "members": [
        { "name": "checked", "type": "boolean" },
        { "name": "defaultChecked", "type": "boolean" },
        { "name": "onChange", "type": "(checked: boolean) => void" },
        { "name": "disabled", "type": "boolean" }
      ]
    }
  },
  "variants": { "size": ["small", "medium", "large"] },
  "states": ["default", "hover", "focus", "disabled", "checked"],
  "behavior": {
    "channels": {
      "checked": {
        "value": "checked",
        "defaultValue": "defaultChecked",
        "onChange": "onChange",
        "valueType": "boolean"
      }
    }
  },
  "styles": {
    "root": { "display": "inline-flex", "cursor": "pointer" },
    "--checked": { "background": "var(--switch-on-bg)" }
  },
  "a11y": {
    "role": "switch",
    "labeling": ["aria-label", "aria-labelledby"],
    "keyboard": ["Space", "Enter"]
  }
}
```

The full schema is [`packages/ds-contracts/component.contract.schema.json`](packages/ds-contracts/component.contract.schema.json). Compound components (Modal, Card, Banner) declare additional `compoundParts` that emit sibling components — `ModalHeader`, `ModalBody`, `ModalFooter`.

## Downstream consumers

| Consumer | What it reads |
|---|---|
| **Code generators** | `packages/ds-codegen` — full contract + per-target paths in `Stack.primitive.json` |
| **AI agents** | Full contract + `Stack.primitive.json` + `docs/hook-wiring-design.md` for capabilities |
| **Documentation sites** | `props`, `types`, `a11y`, `usage` to render prop tables, examples, a11y guidelines |
| **Design tools** | `tokens`, `variants`, `anatomy` to create component instances with correct properties |
| **Test generators** | `props`, `variants`, `a11y`, `behavior` to scaffold runtime + a11y tests |
| **Linters / validators** | Schema + contracts under `packages/ds-contracts` |

## Commands

```bash
# Showcase app
npm run dev                  # Vite dev server (React showcase)
npm run build                # Production build (showcase app)

# Codegen
npm run generate             # Regenerate React from contracts (default target)
npm run generate -- --target=all
npm run generate:validate    # Validate contracts only
npm run generate:dry-run     # Preview output paths
npm run generate:watch       # Watch contracts and re-emit on change

# Testing
npm test                     # Vitest at root (showcase + ds-react + ds-codegen)
npm run test:vue             # @full-stack-ds/vue
npm run test:svelte          # @full-stack-ds/svelte
npm run test:angular         # @full-stack-ds/angular (Jest)
npm run test:lit             # @full-stack-ds/lit
npm run test:frameworks      # All four non-React framework workspaces in sequence
npm run test:all             # Root + all framework workspaces

# Type checking
npm run typecheck            # tsc --noEmit + codegen
npm run typecheck:vue        # vue-tsc
npm run typecheck:svelte     # svelte-check
npm run typecheck:angular    # tsc -p
npm run typecheck:lit        # tsc -p
npm run typecheck:all        # All five
```

## 42 components

Accordion, ActionFooter, Banner, BreakpointSwitch, Button, ButtonGroup, Card, Checkbox, ColorPicker, Combobox, ConfigPane, DatePicker, Dropdown, FilePicker, FilterAnchor, FormField, Icon, IconButton, Indicator, InlineInput, Input, InputGroup, Label, Link, ListItem, LoadingSpinner, LogicEditor, Menu, Modal, NumberStepper, Pagination, Popover, QuickSearch, Radio, SearchInput, SelectMenu, SidebarNav, Slider, Switch, Table, Tabs, Tooltip
