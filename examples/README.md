# examples/

Parity harnesses. **Not** demos, **not** documentation, **not** marketing surfaces.

Each subdirectory under `examples/` is one *app shape* (e.g. `settings/`, `product/`, `landing/`). Inside each app directory:

- `spec.md` — framework-agnostic description of the app. Single source of truth for parity.
- `react/`, `vue/`, `svelte/`, `angular/`, `lit/` — one implementation per framework. Each is a minimum-viable consumer of the corresponding `@full-stack-ds/*` package.

## What these prove

1. **Each framework package is consumable as a real npm package.** Each example app imports only from the package's public `exports` map. If the example builds, the public API is intact.
2. **The contract claim is real.** Five implementations of the same spec, all using the same JSON contracts, must produce equivalent apps. If React's `settings` works and Vue's doesn't, parity has been falsified — and you know exactly where to look.
3. **Bugs are localizable.** When `Tooltip` breaks, the example app tells you whether it's the *component* (Tooltip is broken everywhere) or the *consumer* (the showcase is doing something the package doesn't support).

## What these are not

- Not styled. Use only the CSS that ships with the framework package. Don't reach for design polish — the goal is "does it work," not "is it pretty."
- Not tested. Unit tests live with the components in `packages/ds-*/src/components/`. The example apps are integration evidence — they prove the package builds and renders. Playwright e2e against the example apps is the right home for behavioral coverage.
- Not docs. The example apps are runnable artifacts; usage documentation belongs in each package's README.

## Running an example

Each implementation is a standalone Vite (or Angular CLI) app.

```bash
cd examples/settings/react
pnpm install
pnpm dev      # boots a dev server
pnpm build    # produces a production build
```

CI gate (intended):

```bash
pnpm -r --filter "./examples/**" run build
```

A failing build in any example blocks merges.

## Adding a new app shape

1. Create `examples/<app-name>/spec.md` describing the app, the components it must use, and the interactions it must support.
2. Implement `examples/<app-name>/react/` first. Discover and fix consumer-API gaps as you go.
3. Port to the other frameworks one at a time. Each port is a parity test for that framework's package.

Pick app shapes for what they *prove*, not what they look like. Good candidates exercise distinct slices of the contract:

- form-heavy (validates `Input`, `Field`, `Switch`, `Checkbox`, `Button`, `Dialog`)
- overlay-heavy (validates `Tooltip`, `Popover`, `Sheet`, `Toast`, focus trap, dismissal)
- layout-heavy (validates `Stack` composition, `Card`, `AspectRatio`)
- animation-heavy (validates the `Animated*` family in real layouts)

## Adding a new framework to an existing app

1. Read `spec.md`.
2. Implement in the new framework directory.
3. Diff against the existing implementations — if you needed an escape hatch the others didn't, that's a parity bug in the framework package.
