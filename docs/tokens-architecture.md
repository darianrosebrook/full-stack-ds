---
doc_id: ARCH-TOKENS-ARCHITECTURE-001
authority: architecture
status: implemented
title: Design Token Architecture
owner: "@darianrosebrook"
updated: 2026-05-21
verified_at_commit: c02cfc0
governs:
  - packages/ds-tokens/src/**/*.tokens.json
  - packages/ds-tokens/build/**
  - packages/ds-tokens/generated/tokens.css
  - packages/ds-codegen/src/validation/tokens.ts
  - vite-plugin-fsds-data.ts
---

# Design Token Architecture

> TOKENS-WORKSTREAM-STEP-07

This document is the architectural record for the design-token graph. It exists for the same reason `codegen-authority.md` exists: a contributor a year from now should be able to read one doc and know **where token authority lives, what guarantees are real, and which decisions are load-bearing.** Without that, the workstream's decisions decay into folklore that gets re-litigated every time someone adds a token.

The workstream that produced this surface (`TOKENS-WORKSTREAM-STEP-02` through `STEP-06C`, commits `7c0e4f1` → `c02cfc0`) replaced a single hand-authored 2,948-line `designTokens.css` with a DTCG-1.0-validated graph that composes 161 shards into a cascade-layered output. This doc is the entry point.

## What this proves

The design-token graph in `packages/ds-tokens` provides:

1. **A DTCG-1.0-valid source.** Every leaf token is a W3C Design Tokens Community Group spec object (`$type`, `$value`, optional `$description` / `$extensions`). The strict schema in `build/w3c/w3c-schema-strict.json` is the gate; `pnpm -F @full-stack-ds/tokens validate` fails loud on any non-spec input.
2. **A single CSS surface for consumers** at `packages/ds-tokens/generated/tokens.css`. One file. Cascade-layered: `@layer core, semantic, theme, brand, density;`. Read by `vite-plugin-fsds-data.ts` and shipped to framework preview iframes.
3. **A namespace-prefixed CSS variable surface.** Every emitted custom property is prefixed `--fsds-` (e.g. `--fsds-core-color-palette-neutral-500`). Project-namespaced so two design systems can coexist in the same DOM without collision.
4. **A brand cascade.** Brand identity overrides land at `@layer brand` keyed by `[data-brand="<id>"]` attribute selectors. Adding a brand is one file (`src/brands/<id>.tokens.json`) and a re-build.
5. **A density cascade.** Content-density overrides land at `@layer density` keyed by `[data-density="<id>"]`. The four canonical modes (`tight`, `compact`, `default`, `spacious`) live as siblings under `src/density/`.
6. **A contract→token-graph drift gate.** `validateContractTokens` in `packages/ds-codegen/src/validation/tokens.ts` runs on every `pnpm run generate:check` and refuses to pass if a contract references a `resolvesTo` path that doesn't exist in the composed graph.

## What this does NOT prove

The same way the admission rail makes its non-claims explicit, this graph's load-bearing absences matter:

- **It does not prove value correctness.** That `semantic.color.foreground.primary` resolves to `#141414` is a design decision, not a system invariant. Color contrast and visual coherence are reviewed separately.
- **It does not prove cross-shard reference resolution succeeds at validate time.** A `{x.y.z}` interpolation that fails to resolve at the resolver pass becomes a `var(--fsds-x-y-z)` call in the CSS output, which fails at *runtime* via fallback to the inline value, not at *build time*. The composer logs `[tokens] Reference validation warnings` but the build still emits.
- **It does not prove componenticity scope.** `tokens.css` is global by design. Per-component fallback isolation (`[data-fsds-component="X"]`) is the job of `TOKENS-WORKSTREAM-STEP-06A`'s tokens emitter (still pending at the time this doc lands).
- **It does not prove `$type` correctness across composite alias chains.** A `dimension`-typed token may reference a `string`-typed primitive via `{x.y.z}` and produce a syntactically valid but semantically wrong CSS value. The W3C validator catches direct shape violations; chained type drift would need its own pass.
- **It does not prove that the old token surface and the new one produced byte-identical CSS.** They do not. The new surface drops legacy variants the contracts didn't depend on (verified by the byte-compare gate; see "Cutover provenance" below) and uses different composite-flattening conventions (e.g. `0px 1px 3px #0000001f` vs. `0 1px 3px rgba(0, 0, 0, 0.12)` — semantically equivalent, lexically different).

## The authority split

```
Token graph (src/)         declares design intent — primitives, aliases, cascade rules
Build pipeline (build/)     normalizes the graph → CSS surface + composed JSON
Generated surface           consumed by vite plugin → preview iframes
Contracts (ds-contracts/)   reference token paths via `resolvesTo`
Validator (ds-codegen/      proves contracts ↔ graph stay in sync
  validation/tokens.ts)
```

### Token graph owns design intent

The graph should say things like: this color is named `palette.neutral.500` and has the value `#717171`; this dimension is `shape.radius.04 = 16px`; this semantic alias is `color.foreground.primary` and resolves to `core.color.mode.dark`; this composite shadow is `elevation.level.1 = {offsetX: 0, offsetY: 1px, blur: 3px, color: rgba(0,0,0,0.12)}`.

The graph should **not** know: what CSS property a token will be written to (that's contract); which component instances will reference it (that's the contract → component CSS join); how to flatten a composite (that's emission).

### Build pipeline owns normalization + emission

`compose.ts` walks every `src/<category>/<tier>/<subtree>.tokens.json` shard, deep-merges them into one tree, writes `generated/composed.tokens.json` (gitignored intermediate). `global.ts` walks the composed tree and emits cascade-layered CSS via `--fsds-` prefix.

The pipeline is **not** allowed to know: that `Switch.background` needs blue; that `Dialog.scrim` is `color.overlay.scrim`. That mapping is the contract's job. Pipeline emits the graph as-is; contract picks tokens by path.

### Contracts own per-component token selection

A contract declares `tokens.<part>.<key> = { resolvesTo: "<dot.path>", fallback: "<css-value>", property: "<css-prop>", layer: "<tier>" }`. The contract is naming the token it wants by graph path, declaring what CSS property it binds to, and offering a hardcoded fallback for when the global stylesheet is missing.

Contracts are **not** allowed to: invent token names that don't exist in the graph. The validator catches this at `pnpm run generate:check`. Contracts are also **not** allowed to: embed raw CSS values in component CSS (that bypasses the graph). The emitter writes `var(--fsds-<resolved>, <fallback>)` — the graph value first, the contract's hardcoded fallback second.

### Validator owns the contracts ↔ graph invariant, not generation policy

`validateContractTokens` (`packages/ds-codegen/src/validation/tokens.ts`) loads the composed tree, projects every `$value`-bearing leaf to a dot-path, walks every contract's `tokens.*` tree, and reports DRIFT for any `resolvesTo` that isn't in the projected set. It does **not** decide what tokens should exist, which `fallback` is correct, or what `property` a token binds to. It only proves the path the contract names is a path the graph defines.

## The non-negotiable invariant

> **Every `resolvesTo` path in every contract must correspond to a `$value`-bearing leaf in the composed token graph.**

The graph may add, alias, or rename tokens freely. Contracts may reference any path that exists. But the moment a contract names a path the graph doesn't provide, `pnpm run generate:check` fails. Future regressions of the kind that motivated this workstream — `[object Object]` in tokens.css, 6 contract paths the new graph didn't satisfy, brand-emitted vars without canonical resolution — become impossible to ship silently.

The invariant is enforced by:

- `pnpm -F @full-stack-ds/tokens validate` → DTCG strict W3C schema validation on every shard (161/161 must pass)
- `pnpm -F @full-stack-ds/tokens build` → composer normalizes; emitter flattens composites; emission is regenerable
- `pnpm run generate:check` → `validateContractTokens` per contract, fail-loud per missing path

The diagnostic-code shape mirrors the admission rail: every issue is a JSON-pointer to the failing field and a sentence describing what's wrong. No silent passes, no warnings-that-are-errors-elsewhere.

## Load-bearing decisions

These choices are not arbitrary. Changing any of them invalidates load-bearing assumptions elsewhere — call out the breakage if you propose to.

### Decision 1: One emitter, not five

The four non-React frameworks each have their own emitter under `packages/ds-codegen/src/frameworks/<framework>/`. The token graph does **not** follow the same pattern. There is one emitter at `packages/ds-tokens/build/generators/global.ts` that produces CSS, and every framework imports the same generated file.

**Why:** tokens are framework-neutral. A `--fsds-core-color-palette-neutral-500` custom property resolves the same in every consumer (React, Vue, Svelte, Angular, Lit). Per-framework emission would invent five places where the same value could drift; the property-2 / property-5 doctrine in `docs/normal-form.md` exists exactly to prevent that.

**Consequence:** if a framework ever needs framework-specific token wiring (e.g. styled-components theme, CSS-in-JS), it imports `@full-stack-ds/tokens` and projects the CSS surface into its own substrate. The token graph itself is never per-framework.

### Decision 2: `--fsds-` namespace prefix

Every emitted CSS custom property has the prefix `--fsds-`. The default is set in `packages/ds-tokens/build/core/index.ts:tokenPathToCSSVar`. Brand and density overrides preserve the prefix.

**Why:** consumer applications may run alongside other design systems (a portfolio site, a host shell, a sibling app). `--color-primary` is too generic; `--fsds-semantic-color-foreground-primary` cannot collide.

**Consequence:** contracts always reference the unprefixed dot-path (`semantic.color.foreground.primary`); the prefix is appended at emission. Don't put `--fsds-` in `resolvesTo`. If you ever need to change the prefix, edit one line in `tokenPathToCSSVar` — every emitter call site picks it up.

### Decision 3: Cascade layer order — `core, semantic, theme, brand, density`

`@layer core, semantic, theme, brand, density;` at the top of every emitted `tokens.css`. The order is the precedence order: later layers win.

**Why:** brand tokens are identity overrides — they should beat semantic defaults for the same path. Density tokens are content-density overrides — they should beat brand for spacing because density is a viewer preference, brand is a producer identity. Theme is reserved between semantic and brand for light/dark variants where a brand wants to opt out (none currently use it, but the slot exists).

**Consequence:** if you introduce a new layer (e.g. `motion-reduce`, `high-contrast`), think about where it belongs in this stack and update both the `@layer` declaration in `global.ts` and this doc. Layer order is not configurable — it is part of the system's stance.

### Decision 4: Brand selector — `[data-brand="<id>"]`, not class

Brand overrides apply via `[data-brand="<id>"] { ... }` attribute selectors, not `.brand-default { ... }` class selectors.

**Why:** data attributes carry one value per attribute. A consumer can `<html data-brand="default">` and not worry about class-list management. A class would invite multi-class composition (`.brand-default .brand-corporate`) which conflicts with cascade-layer semantics. Attribute selectors also pair naturally with `[data-density="<id>"]` and any future `[data-mode]` / `[data-theme]` dimensions — same selector pattern, same shape.

**Consequence:** consumers wire `data-brand` on the document root or a section root. Don't write `.brand-default` CSS rules anywhere. The convention is enforced by the emitter, not the consumer — you can't ship a class-based brand layer through `loadBrandTokens`.

### Decision 5: $extensions theme keys use `fsds.{light,dark}`, not `design.paths.{light,dark}`

The portfolio source files this graph descended from used `$extensions["design.paths.light"]` / `["design.paths.dark"]` for theme variants. Our graph rewrote those to `$extensions["fsds.light"]` / `["fsds.dark"]` to match the prefix.

**Why:** the project-namespaced prefix should apply everywhere — including extension keys. `design.paths` is a portfolio-internal namespace; `fsds.` is ours.

**Consequence:** if you import a token file from another source, rewrite `design.paths.*` → `fsds.*` before landing it. There's no automatic migration path; both keys are valid DTCG extension names, but only `fsds.*` is read by `global.ts:processTokenValue`.

### Decision 6: composed.tokens.json is gitignored

The intermediate `packages/ds-tokens/generated/composed.tokens.json` is a 164-KB merged tree that compose.ts writes and global.ts reads. It is **not** committed; `.gitignore` excludes it.

**Why:** it's a build artifact. Every shard change re-emits it; tracking it would churn on every PR. The CSS surface (`tokens.css`) IS committed because consumers need it on fresh clone without running the build first.

**Consequence:** `validateContractTokens` (the gate) needs the composed JSON to run. If it's missing — fresh clone, deleted by accident — the validator returns one instructional issue per contract pointing at `pnpm -F @full-stack-ds/tokens build`. CI must run the token build before the codegen validate step. The top-level `pnpm run generate:check` does NOT yet auto-invoke the token build; that's a separate ordering concern that lands when CI sees the validator's "missing" path.

### Decision 7: Reconcile via aliases in the graph, not contract rewrites

When the byte-compare gate in `STEP-05` surfaced 6 contract paths the new graph didn't satisfy, the resolution path was to **add aliases in the graph** (e.g. `core.shape.radius.small` as alias for `{shape.radius.02}`), not to rewrite contracts to use new names.

**Why:** contract changes cascade through 5 frameworks' generated component CSS. Graph changes don't. For a one-time naming-drift reconciliation, "add 6 alias tokens" is cheaper than "rewrite 6 contract paths and regenerate 30+ component CSS files." The graph can carry both canonical names and aliases without ambiguity.

**Consequence:** if a contract is wrong and the graph is right, fix the contract. If the graph is wrong and the contract is right, fix the graph. If both are defensible, prefer the change that doesn't ripple through consumers. Don't add aliases reflexively — only when keeping a path is the lower-cost option.

## The pipeline, end to end

```
src/<category>/{core,semantic}/*.tokens.json     ← author here (DTCG strict)
                  ↓ compose.ts
                  ↓   - deep-merge 156 shards
                  ↓   - apply core. / semantic. prefix transform on cross-refs
                  ↓   - resolver fallback (no resolver.json present)
                  ↓
generated/composed.tokens.json                    ← gitignored intermediate
                  ↓ global.ts
                  ↓   - walk every leaf
                  ↓   - flatten composites (color, dimension, shadow)
                  ↓   - classify into @layer core / @layer semantic
                  ↓   - loadBrandTokens → @layer brand
                  ↓   - loadDensityTokens → @layer density
                  ↓
generated/tokens.css                              ← committed, consumed
                  ↓ vite-plugin-fsds-data.ts
                  ↓
preview iframe <style data-fsds="tokens">         ← runtime consumer

Independently:

contracts/*.contract.json                         ← tokens.<part>.<key>.resolvesTo
                  ↓ ds-codegen / cli.ts --validate --check-semantics
                  ↓   validateContractTokens(contract)
                  ↓     - read composed.tokens.json
                  ↓     - project to set of valid dot-paths
                  ↓     - walk contract.tokens, validate each resolvesTo
                  ↓
DRIFT report or VALID                              ← the gate
```

## Cutover provenance

Before this workstream, `packages/ds-contracts/tokens/designTokens.css` (2,948 lines, hand-authored, regenerated occasionally from a separate pipeline) was the consumed token surface. The cutover happened at commit `f322b4c` (`STEP-05`):

- Deleted `packages/ds-contracts/tokens/designTokens.css` (replaced by `packages/ds-tokens/generated/tokens.css`)
- Deleted `packages/ds-contracts/tokens/globals.scss` (no consumers)
- Kept `packages/ds-contracts/tokens/vars.css` (scroll-driven animation primitives + Next.js font CSS-var bridges — NOT design tokens; the vite plugin concatenates it onto the token surface for runtime consumption)
- Repointed `vite-plugin-fsds-data.ts` from the old path to the new one

Byte-compare diagnostic at `packages/ds-tokens/build/_oneshot/byte-compare-tokens.ts` reports coverage:

- **Section A** (contract refs satisfied by OLD surface): **100%** (123 / 123). Baseline integrity confirmed before cutover.
- **Section B** (OLD vars present in NEW surface): **81.70%** (144 / 787 missing). Most gaps are name-drift in tokens no contract or component consumed; some are intentional drops (legacy variants, unused scale points).
- **Section C** (contract refs satisfied by NEW surface): **100%** (123 / 123). The cutover-critical check.

Section C 100% is the load-bearing claim. Section B's 81.70% is informational — vars that nothing consumed went away, which is the expected outcome of a clean cutover. If Section C were ever less than 100%, the cutover would be unsafe.

The byte-compare script remains in the tree for re-running if the graph or contracts change substantially. It will be retired when the doctrinal record (this doc + the validator) is judged sufficient.

## Classified inventory of layered overrides

| Layer | Source | Selector | When to use |
|---|---|---|---|
| `@layer core` | `src/*/core/*.tokens.json` | `:root` | Primitives — palette, raw scales, font weights, shape primitives. Should not reference anything; should be referenced. |
| `@layer semantic` | `src/*/semantic/*.tokens.json` | `:root` | Named aliases of core primitives — `foreground.primary`, `radius.medium`, `gap.grid`. References core via `{path}`. This is what contracts almost always cite. |
| `@layer theme` | `$extensions.fsds.{light,dark}` on any token | `.light`, `.dark`, `@media (prefers-color-scheme: dark) :root` | Light/dark variants. Currently empty for our tokens (no contract uses theme extensions); reserved for future dark-mode support. |
| `@layer brand` | `src/brands/<id>.tokens.json` | `[data-brand="<id>"]` | Brand-identity overrides. Each brand redeclares the semantic tokens it wants to differ. Currently 1 brand (`default`, 47 overrides). |
| `@layer density` | `src/density/<id>.tokens.json` | `[data-density="<id>"]` | Content-density overrides. Each density redeclares the semantic spacing tokens it wants to differ. Currently 4 densities (`tight`, `compact`, `default`, `spacious`, 14 overrides each). |

### Adjacent: per-component slot pools

Component-scoped CSS custom properties live alongside the global graph but are not part of it. Two pools exist:

| Pool | Source | Selector | Authority |
|---|---|---|---|
| **Component-local slots** | `<Name>.tokens.json` | `.<cssPrefix>` | Per-component themable surface. Slot names are cssPrefix-namespaced (e.g. `--fsds-button-color-background-default`). Authors declare what slots exist per component; consumers override per instance. |
| **Box-model primitive slots** | `box-model.primitive.schema.json` + `primitives/BoxModel.primitive.json` | `.<cssPrefix>` (every component) | Closed slot pool of 14 unscoped names (`--fsds-box-model-padding-inline-start`, etc.) automatically declared on every component's root with literal defaults. See [`ARCH-BOX-MODEL-PRIMITIVE-001`](./box-model-primitive.md). |

Both pools may `resolvesTo` paths in the global graph above — they extend the cascade with per-component override surfaces rather than competing with it. The box-model pool is the universal floor (every component gets it); component-local slots are the per-component vocabulary.

## How to add a new token

1. Pick the tier — `core` (primitive) or `semantic` (named alias of a primitive).
2. Pick the category — `color`, `dimension`, `shape`, `motion`, `spacing`, `typography`, etc. (mirrors `src/` subdirs).
3. Pick the subtree — the file under `src/<category>/<tier>/<subtree>.tokens.json`. Create a new file if no subtree fits; the composer will pick it up.
4. Author the leaf in strict DTCG 1.0 shape — `$type` MUST be one of the spec types; `$value` MUST conform; dimensions MUST use `px` or `rem`.
5. Run `pnpm -F @full-stack-ds/tokens validate` to confirm DTCG-strict pass.
6. Run `pnpm -F @full-stack-ds/tokens build` to regenerate `tokens.css`.
7. If a contract should reference the new token, add `resolvesTo: "<tier>.<category>.<...>"` to the relevant `tokens.<part>.<key>` entry. `pnpm run generate:check` will fail at validate-time if you misspell the path — that's the gate working.

## How to add a new brand

1. Author `packages/ds-tokens/src/brands/<id>.tokens.json` with a `$brand` metadata block and a set of token overrides under semantic paths.
2. Use `$extensions.fsds.{light,dark}` for theme variants if needed.
3. Run `pnpm -F @full-stack-ds/tokens build`. `loadBrandTokens` auto-detects new brand files.
4. Consumer wires `<html data-brand="<id>">` to activate.

## How to add a new density mode

Same shape as a brand, but the file lands at `src/density/<id>.tokens.json` with a `$density` metadata block. Consumer wires `<html data-density="<id>">`.

## Cross-references

- [`docs/codegen-authority.md`](./codegen-authority.md) — codegen layer authority; tokens are framework-neutral and live outside the per-framework emitters, in line with that doc's "one emitter, not five" principle as applied to design tokens.
- [`docs/box-model-primitive.md`](./box-model-primitive.md) — box-model slot pool. The 14-slot `--fsds-box-model-*` surface that every component inherits as a stable substrate for padding / gap / sizing. Sits adjacent to this doc: it defines a slot pool, not new global tokens, and its slots may `resolvesTo` paths in the graph this doc governs.
- [`docs/normal-form.md`](./normal-form.md) — property-2 (framework-neutral IR) and property-5 (fail-loud linters) are realized here as the single-emitter pipeline and the `validateContractTokens` gate.
- [`docs/admission-rail.md`](./admission-rail.md) — the rail's philosophy of "evidence is inspectable, claims are bounded" is the same philosophy this doc uses for the cutover provenance and the byte-compare gate.

## When in doubt

Ask: "If I delete this token from the graph, does anything break?" If the answer is "no contract references it and no committed component CSS references it," it's safe to remove. If "yes, contract X references it," the validator will tell you exactly which contract — don't guess. If "yes, hand-authored component CSS references it," that's a sign the contract is incomplete; the component CSS should pass through the contract, not bypass it.

When adding a new token, ask: "Does this belong at core (primitive) or semantic (alias)?" If you'd cite it directly from a contract, it's probably semantic. If it's something semantic tokens would reference but contracts wouldn't, it's core. When in doubt, put it under semantic — moving down a tier is cheaper than moving up because semantic→core requires adding a primitive AND aliasing it.
