# @full-stack-ds/tokens

Design-token source and build pipeline for the Full Stack Design System.

## What this package owns

- **DTCG 1.0 token sources** under `src/` — semantic-domain shards (`color/`, `motion/`, `spacing/`, …) plus `brands/` and `density/` variant sources. The authored input.
- **Build pipeline** under `build/` — validates the shards against the W3C DTCG schema, composes the graph, and emits CSS.
- **Generated artifacts** under `generated/` — `tokens.css` (the monolithic output consumers import; brand and density variants are inlined as layered `[data-brand]` / `[data-density]` blocks) and `resolved.tokens.json`. Both are committed and drift-gated by `tokens:build:check`; `composed.tokens.json` beside them is gitignored regenerable scratch. Regenerated; never edited.

This package emits no component-scoped CSS. Component token files are emitted by `@full-stack-ds/codegen` into each web framework package (see "Relationship to other packages").

## Build

```bash
pnpm -F @full-stack-ds/tokens build
```

Equivalent: `tsx build/build.ts --prefix=fsds`.

CSS variable prefix is `--fsds-*` (e.g. `--fsds-color-action-primary-background`).

## Cascade layers

The emitted `generated/tokens.css` declares cascade layers in this order:

```css
@layer core, semantic, components, theme, brand, density;
```

Brand variants are emitted as `@layer brand [data-brand="<name>"] { ... }`. Density variants as `@layer density [data-density="<name>"] { ... }`. Brand-add cost is O(1): one file in `brands/`, nothing else changes.

## Plan

The doctrinal architecture stance lives at [`docs/architecture/tokens-architecture.md`](../../docs/architecture/tokens-architecture.md).

The original seven-step rollout plan and its falsification conditions are in `docs/internal/tokens-workstream-plan.md` — **machine-local** (`docs/internal/` is gitignored, per-contributor), so that path is absent in a fresh clone and is not a substitute for the architecture doc above.

## Relationship to other packages

- `@full-stack-ds/contracts` declares per-component `resolvesTo` + `fallback` pairs; this package owns the global token graph those pairs resolve against.
- `@full-stack-ds/codegen` emits each component's token CSS as a sibling file inside every web framework package: `packages/ds-{react,vue,svelte,angular,lit}/src/components/<Component>/<Component>.tokens.css`. The bytes are identical across those packages, and each generated `<Component>.css` `@import`s its sibling. Lit additionally inlines the resolved CSS into each element's `static styles` block at codegen time (shadow DOM cannot resolve sibling `@import`s); the shipped sibling files are the audit and documentation surface there.
- The `contract-tokens` validator inside codegen byte-compares each web framework package's emitted `<Component>.tokens.css` against a fresh emit from the contract and fails on cross-framework asymmetry — fail-loud at build time.
