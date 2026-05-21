# Full Stack Design System

A design system that generates React, Vue, Svelte, Angular, and Lit packages from a single set of JSON contracts, all built on top of one polymorphic primitive — `Stack` — to validate that **component contracts** can serve as the universal source of truth for code generation, agent-driven UI, and documentation.

## The architectural claim

This repository is not, primarily, a design system. It is a falsifiable claim about compositional systems, with a design system as the existence proof. The constraint of "53 components, 1 primitive, 5 frameworks" exists because five structurally opposed framework paradigms — React hooks, Vue composables, Svelte runes, Angular signals, Lit controllers — are the falsification surface: if the same contract can drive all of them idiomatically without leaking implementation detail into any of them, the contract is at the right level of abstraction. If it cannot, the wrongness shows up as friction in exactly one output. The full claim, seven properties of compositional systems in normal form, and the falsification conditions are written down in [`docs/normal-form.md`](docs/normal-form.md).

## What this is

This project is a **contract testing ground**. Every component is defined by a JSON contract that describes its anatomy, props, variants, states, styles, tokens, accessibility, types, and behavior. From that one contract, the codegen emits framework-idiomatic component sources, behavior primitives, tests, and barrels for five frameworks at once.

| Package | Components |
|---|---:|
| **`@full-stack-ds/react`** | 53 |
| **`@full-stack-ds/vue`** | 53 |
| **`@full-stack-ds/svelte`** | 53 |
| **`@full-stack-ds/lit`** | 53 |
| **`@full-stack-ds/angular`** | 53 |

Test counts vary as the suites evolve; run `pnpm run test:all` for the current numbers.

Contracts live under [`packages/ds-contracts/`](packages/ds-contracts/) (`*.contract.json`), validated against [`packages/ds-contracts/component.contract.schema.json`](packages/ds-contracts/component.contract.schema.json).

The layout primitive is defined separately as a **primitive contract**: [`packages/ds-contracts/primitives/Stack.primitive.json`](packages/ds-contracts/primitives/Stack.primitive.json) (schema: [`primitive.contract.schema.json`](packages/ds-contracts/primitives/primitive.contract.schema.json)). Per-target import paths live under `implementation.targets.<framework>.relativeFromComponents` so each framework's generated components import the canonical primitive correctly.

## Why one primitive

Every component — from `Button` to `Dialog` to `Calendar` — is composed entirely of `<Stack>`, a polymorphic layout primitive that renders as any HTML element:

```tsx
<Stack as="button" variant="horizontal" className="btn">
<Stack as="nav" aria-label="Main">
<Stack as="input" type="email" />
```

This constraint exists to prove the contract carries enough information to fully describe a component. If 53 components with full interactivity, accessibility, and styling can be built from one primitive across five frameworks, then the contract is sufficient for:

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
    *.contract.json             # 53 component contracts
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
npm run generate -- --target=all Switch Dialog   # Subset of components × all frameworks
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

### Generated artifact integrity

Generated output gets a separate inspection surface called the **admission rail**. It answers "what evidence backs the bytes checked into this repo?" by binding every emitted artifact to four independent attribution rungs: the framework checks that admitted it, the contract bytes that produced it, the codegen source bytes that could affect it, and the bounded environment (Node major, codegen package version, lockfile sha256) under which the manifest was written. Required mode (`pnpm run governed:rail`) refuses to pass when any of those bindings drift from the on-disk state.

The rail makes the trust claim inspectable rather than making generated output trustworthy by assertion. For what it proves, what it deliberately does NOT prove (no determinism, no full environment attestation, no per-file proof, no semantic correctness), and the diagnostic-code reading guide, see [`docs/admission-rail.md`](docs/admission-rail.md).

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

The full schema is [`packages/ds-contracts/component.contract.schema.json`](packages/ds-contracts/component.contract.schema.json). Compound components (e.g. Dialog, Card, Sheet) declare additional `compoundParts` that emit sibling components — `DialogHeader`, `DialogBody`, `DialogFooter`.

## Making edits

The repo is contract-driven, so the editing path depends on **what** you're changing.

### Editing an existing component

1. Edit `packages/ds-contracts/<Name>.contract.json`.
2. Validate: `pnpm run generate:validate`.
3. Regenerate that component for every framework:
   ```bash
   pnpm run generate -- --target=all <Name>
   ```
4. Run the relevant tests: `pnpm test` (root + React + codegen) and `pnpm run test:frameworks` for the others.

Do **not** hand-edit `packages/ds-{framework}/src/components/<Name>/*` files. They will be overwritten on the next `generate` run unless they're inside a `@custom:start` / `@custom:end` block (see below).

### Adding a new component

1. Create `packages/ds-contracts/<Name>.contract.json` following the [contract format](#contract-format) and the schema in `component.contract.schema.json`.
2. `pnpm run generate:validate` — catches structural issues before codegen runs.
3. `pnpm run generate -- --target=all <Name>` — emits sources, tests, and barrel entries for all five frameworks.
4. Add the component to the showcase in `src/app.tsx` if you want it rendered in the dev server (`pnpm run dev`).
5. Update the component list in this README (or trust the disclaimer that the contracts directory is authoritative).

Compound components declare `compoundParts` in the contract; the codegen emits sibling components automatically — no extra contracts needed.

### Editing generated code directly

Generated files use markers:

```tsx
// @generated:start(imports)
// …regenerated every run; edits here are lost
// @generated:end(imports)

// @custom:start(extras)
// …preserved across regenerations
// @custom:end(extras)
```

Use `@custom` blocks for hand-authored additions (extra tests, app-specific logic). Anything outside a `@custom` block in a generated file is fair game for the next `generate` run.

Two exceptions to "don't hand-edit generated files":

- **CSS and pure scaffolding** are always regenerated, regardless of markers.
- **Interactive TSX with custom logic** is preserved on regeneration by default. Pass `--force` to overwrite it.

Historically, React's `Switch.tsx` and `Modal.tsx` (now `Dialog.tsx`) were hand-authored as the canonical reference behavior while the non-React frameworks were brought up to parity through generated code. All five frameworks now share the same generated path; see [`docs/hook-wiring-design.md`](docs/hook-wiring-design.md) for the rationale that drove the parity work.

### Changing the contract schema or IR

The IR (`packages/ds-codegen/src/ir.ts`) is the contract between contracts and emitters. If you add or rename a contract field:

1. Update `packages/ds-contracts/component.contract.schema.json`.
2. Update `ir.ts` so the new field is reflected in the framework-neutral IR.
3. Update each affected framework emitter under `packages/ds-codegen/src/frameworks/<framework>/`.
4. `pnpm run generate -- --target=all` and verify diffs across all five framework packages.
5. `pnpm test` + `pnpm run test:frameworks`.

Emitters should never re-parse raw contract fields — if you find yourself doing that, push the logic into the IR instead.

### Adding a new framework target

1. Implement `createXxxEmitter` under `packages/ds-codegen/src/frameworks/<xxx>/` with the same surface as the existing four: `factory.ts`, `component-source.ts`, `hook-source.ts`, `tests.ts`.
2. Register it in `createDefaultRegistry` (`packages/ds-codegen/src/registry.ts`) and point it at a workspace output root.
3. Create the corresponding `packages/ds-<xxx>/` workspace package and the matching behavior primitives.
4. Add a `targets.<xxx>.relativeFromComponents` entry to `packages/ds-contracts/primitives/Stack.primitive.json`.
5. `--target=<xxx>` becomes available automatically.

### Commit conventions

Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `perf:`. Commit after each logical unit of work — a contract change + its regenerated output is one commit; a codegen change spanning multiple frameworks is another.

## Consuming the packages

The `@full-stack-ds/*` packages are **workspace-only** today — they are not yet published to npm. The `package.json` references them via `workspace:*`. To consume them outside this monorepo you would need to publish (or link) them yourself, or vendor the generated output into your own project.

Inside the monorepo, the showcase app (`src/app.tsx`) imports from `@full-stack-ds/react` directly via the pnpm workspace.

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

## 53 components

Accordion, Alert, AlertNotice, AnimatedCard, AnimatedSection, AnimatedText, AspectRatio, Avatar, Badge, Blockquote, BrandSwitcher, Breadcrumbs, Button, Calendar, Card, Checkbox, Chip, Command, Details, Dialog, Divider, Field, Icon, Image, Input, Label, Links, List, OTP, PageTransition, Popover, Postcard, ProfileFlag, Progress, Select, Sheet, ShowMore, Shuttle, Skeleton, SlinkyCursor, Spinner, Status, Switch, Table, Tabs, Text, TextField, Toast, ToggleSwitch, Tooltip, Truncate, VisuallyHidden, Walkthrough

The authoritative list is whatever `*.contract.json` files exist under [`packages/ds-contracts/`](packages/ds-contracts/); this README list is regenerated by hand and may briefly lag.
