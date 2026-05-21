# @full-stack-ds/tokens

Design-token source and build pipeline for the Full Stack Design System.

## What this package owns

- **DTCG 1.0 token sources** under `core/`, `brands/`, `density/` — the authored input.
- **Build pipeline** under `build/` — validates, composes, and emits cascade-layered CSS, brand/density variants, and TypeScript types.
- **Generated artifacts** under `generated/` — `tokens.css` (the monolithic output consumers import), per-brand CSS, and `token-types.ts`. Regenerated; never edited.
- **Component-scoped token files** under `components/<Component>.tokens.css` — emitted by `@full-stack-ds/codegen`'s tokens emitter target, **not** by this package's build. They live here so consumers import from one place.

## Build

```bash
pnpm -F @full-stack-ds/tokens build
```

Equivalent: `tsx build/build.ts --prefix=fsds`.

CSS variable prefix is `--fsds-*` (e.g. `--fsds-color-action-primary-background`).

## Cascade layers

The emitted `generated/tokens.css` declares cascade layers in this order:

```css
@layer base, core, semantic, brand, density;
```

Brand variants are emitted as `@layer brand [data-brand="<name>"] { ... }`. Density variants as `@layer density [data-density="<name>"] { ... }`. Brand-add cost is O(1): one file in `brands/`, nothing else changes.

## Plan

The full-stack architectural stance, the seven-step rollout, and the falsification conditions are in `docs/internal/tokens-workstream-plan.md` (working) and will land at `docs/tokens-architecture.md` (architecture, doctrinal) when step 7 completes.

## Relationship to other packages

- `@full-stack-ds/contracts` declares per-component `resolvesTo` + `fallback` pairs; this package owns the global token graph those pairs resolve against.
- `@full-stack-ds/codegen` has a `tokens` emitter target (step 6a) that consumes the IR's `tokens` block and writes one `<Component>.tokens.css` per contract into this package's `components/` directory. Framework emitters (React/Vue/Svelte/Angular/Lit) import that file; they do not re-emit token CSS.
- The `contract-tokens` validator inside codegen (step 6c) checks that every contract's declared tokens have a matching `.tokens.css` here with consistent `resolvesTo`, `fallback`, `property`, and `layer` — fail-loud at build time.
