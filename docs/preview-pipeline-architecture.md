---
doc_id: ADR-PREVIEW-PIPELINE-001
authority: adr
status: proven
verified_at_commit: ebbfb79
title: Preview pipeline architecture — Vite middleware per framework
owner: "@darianrosebrook"
updated: 2026-05-21
governs:
  - src/runtime/shells/angular.ts
  - src/runtime/angular-compiler/vite-plugin.ts
  - src/runtime/react-preview/vite-plugin.ts
  - src/runtime/vue-preview/vite-plugin.ts
  - src/runtime/svelte-preview/vite-plugin.ts
  - src/runtime/lit-preview/vite-plugin.ts
  - src/runtime/preview-shell-common.ts
  - src/runtime/FrameworkPreview.tsx
---

# ADR — Preview pipeline architecture

## Status

**Accepted. Steps 1-6 shipped and verified.** Final sweep (v3) shows 223/225 components render across all five frameworks; the two remaining failures (`Input.react`, `Checkbox.react`) are a separate `buildReactDemo` bug — `<input>` is a void HTML element and the demo emits `<Input>Input</Input>` — tracked outside this ADR. **Zero regressions vs. v2.** See "Implementation outcome" at the bottom for the per-step commit map and the v2→v3 sweep diff.

## Context

The showcase renders live previews of each generated component in an iframe — one tab per framework. Today there are two architectures in play:

1. **Angular (working).** `src/runtime/angular-compiler/vite-plugin.ts` AOT-compiles `packages/ds-angular/src/**` server-side via `@angular/compiler-cli`, serves the output under `/preview/angular/...`, and the iframe shell loads the synthesized host via importmap. Verified end-to-end on **45/45 components**.
2. **React / Vue / Svelte / Lit (partial).** Each shell takes a single root component source string, transpiles it with Babel-in-iframe, and mounts via a `srcdoc` iframe. **20/45 components render** for React/Vue/Svelte; **37/45 for Lit** (after a recent importmap fix). The remaining failures are all the same shape: the root source imports a sibling file (`./useFoo`, `../../primitives`, etc.) and the iframe has no way to resolve it because only the root source was shipped in.

The component sweep (`docs/internal/preview-sweep-results-v2.json`) catalogued **133/225 broken combinations**, falling into four crisp patterns:

| Pattern | Affected | Root cause |
|---|---|---|
| `./use<Name>` sibling hook unresolved | ~23 components × 4 frameworks | Babel-in-iframe ships only the root file, can't fetch siblings |
| `../../primitives` Stack import unresolved | 5 components × 4 frameworks | Same — Stack is a separate file |
| `useAnchoredSurface` undefined | 2 components × 2 frameworks | Same — re-exported from `primitives/surfaces/` |
| `lit/directives/*` missing in importmap | 8 components × Lit | **Fixed.** Lit importmap now includes the three directives in use |

The first three patterns are not solvable by patching imports; they need either an in-iframe bundler or a server-side module graph that can resolve transitive deps.

## Decision

**Adopt the Vite-middleware preview pattern that the community has converged on** (whyframe, Storybook 8 Vite builder, Ladle, Histoire). For each non-Angular framework, register a Vite plugin that:

1. Exposes a `GET /preview/<fw>/<Component>` HTML route via `configureServer`.
2. Returns an HTML shell whose `<script type="module" src="/preview/<fw>/<Component>/entry.js">` points at a virtual module.
3. The virtual entry imports the component from the **real workspace path** (e.g., `packages/ds-<fw>/src/components/<Name>/<root>`) — a real route in Vite's module graph.
4. Vite's existing transform pipeline (`@vitejs/plugin-vue`, `@sveltejs/vite-plugin-svelte`, etc.) handles JSX/SFC/decorators/transitive deps natively. **No in-iframe Babel.** **No relative-import rewriter.** **No primitives bundle plumbing.** It's all upstream of the iframe.

The iframe `srcDoc` attribute is replaced with `src="/preview/<fw>/<Component>"` so the iframe shares the showcase's origin and ESM module resolution works correctly.

This mirrors the design already proven by `src/runtime/angular-compiler/vite-plugin.ts`. The Angular plugin uses `performCompilation` instead of Vite's transform because Angular ships partial-linker output and esm.sh can't satisfy its JIT injectables — but the *shape* is identical: middleware route + cache directory + URL-prefix serving + `importmap` for runtime libs.

### Why we chose this over the alternatives

- **In-iframe bundler.** Doable but reinvents Vite. The Stack primitive has nested subdirs (`hooks/`, `surfaces/`), siblings have their own deps, the rewriter has to handle arbitrary relative paths. Each shell would need its own mini-Vite. Considered and rejected in the session of 2026-05-21 after the second iteration of the bundle gathering hit "primitive subdir transitive dep" complexity.
- **`browser-vite` / `Sandpack`.** Runs Vite or a custom bundler entirely in the browser. Solves portability (works in static-hosted environments) but adds significant runtime weight and known quirks (Service Worker requirements, Strict Privacy Mode failures). Not warranted for a local-study artifact.
- **Pre-bundling at showcase build time** (rollup pass per component). Lower runtime overhead but loses HMR — every contract change requires a rebuild before the iframe updates. Worse DX than the current "save → see it" loop.

## Architecture

```
┌────────────────────── Vite dev server (showcase) ──────────────────────┐
│                                                                        │
│  HTTP routes the React showcase serves:                                │
│    /                              → React app (showcase UI)            │
│    /preview/react/<Name>          → HTML shell with module entry       │
│    /preview/vue/<Name>            → HTML shell with module entry       │
│    /preview/svelte/<Name>         → HTML shell with module entry       │
│    /preview/lit/<Name>            → HTML shell with module entry       │
│    /preview/angular/<path>.js     → AOT-compiled cache (existing)      │
│                                                                        │
│  Plugins (loaded in vite.config.ts):                                   │
│    @vitejs/plugin-react           → transforms .tsx for React + showcase│
│    @vitejs/plugin-vue             → transforms .vue (NEW dep)          │
│    @sveltejs/vite-plugin-svelte   → transforms .svelte (NEW dep)       │
│    fsds-react-preview             → middleware: serves /preview/react/*│
│    fsds-vue-preview               → middleware: serves /preview/vue/*  │
│    fsds-svelte-preview            → middleware: serves /preview/svelte*│
│    fsds-lit-preview               → middleware: serves /preview/lit/*  │
│    fsds-angular-preview           → existing AOT plugin (no change)    │
└────────────────────────────────────────────────────────────────────────┘

Iframe load flow (post-migration), example for Vue:

  1. FrameworkPreview sets <iframe src="/preview/vue/Accordion">
  2. fsds-vue-preview middleware responds with HTML shell:
       <html>
         <head><style>{combined-css}</style></head>
         <body>
           <div id="root"></div>
           <script type="module" src="/preview/vue/Accordion/entry.js"></script>
         </body>
       </html>
  3. Browser fetches /preview/vue/Accordion/entry.js
  4. Plugin's resolveId/load hooks return a virtual module:
       import { createApp } from "vue";
       import Demo from "/preview/vue/Accordion/demo.vue";
       createApp(Demo).mount("#root");
  5. Browser fetches /preview/vue/Accordion/demo.vue
  6. Virtual module: small Vue SFC that imports the real Accordion + renders it
  7. Browser fetches /packages/ds-vue/src/components/Accordion/Accordion.vue
  8. @vitejs/plugin-vue transforms it — including ALL sibling imports
     (./useAccordion, AccordionHeader.vue, ../../primitives, etc.) which
     resolve naturally through the same Vite graph.
  9. Component renders. fsds:ready posted to parent.
```

## Step-by-step implementation order

Recommended execution order — each step is independently shippable and increases the working surface incrementally.

### Step 0 — preconditions

- [x] Bundle plugin gathers `siblings: SourceFile[]` per component (already landed in this session).
- [x] `ComponentSources.siblings` type added to `src/types/data.ts` (already landed).
- [x] Lit importmap fix (already landed).
- [x] Showcase root deps include `@full-stack-ds/angular` (already landed). Confirm `@full-stack-ds/{vue,svelte,lit}` also need to be added when those plugins go in.

### Step 1 — install framework Vite plugins in the showcase

Add as `devDependencies` to the showcase root `package.json`:

- `@vitejs/plugin-vue` (Vue 3 SFC transform)
- `@sveltejs/vite-plugin-svelte` (Svelte 5 SFC transform)
- (Lit needs no plugin — it's plain TS with decorators; the existing TS pipeline plus Lit's runtime imports handle it.)
- (React: already present.)

Wire them into `vite.config.ts`. Verify the showcase still builds and the existing React showcase code still works.

### Step 2 — implement `fsds-react-preview` plugin (simplest first)

Mirror the structure of `src/runtime/angular-compiler/vite-plugin.ts`:

- `configureServer` middleware on `/preview/react/<Name>` returns an HTML shell.
- `resolveId` + `load` hooks expose `virtual:fsds-preview-react/<hash>` for the entry script.
- Entry script imports the component from `@full-stack-ds/react/components/<Name>` (or the equivalent workspace path).

React is the right starting point because (a) the showcase is already a React app so the plugin already exists, (b) JSX transform via `@vitejs/plugin-react` already works, (c) the React preview's pre-existing `./useAccordion` failure is exactly the case the new design fixes.

### Step 3 — refactor `FrameworkPreview.tsx`

Change the iframe rendering:

```diff
-<iframe srcDoc={html} sandbox="allow-scripts" />
+<iframe src={`/preview/${framework}/${componentName}`} sandbox="allow-scripts allow-same-origin" />
```

Critical: `allow-same-origin` is **required** — without it, the iframe gets an opaque origin and module fetches break (the exact pitfall the research surfaced).

The shell builders (`react.ts`, `vue.ts`, `svelte.ts`, `lit.ts`) **move server-side**, becoming the body of the plugin's middleware response. `buildReactShell({ componentName, ... })` becomes part of `react-preview.ts`'s middleware handler.

### Step 4 — implement Vue, Svelte, Lit plugins

One plugin per framework, copy the React shape, swap the entry script's mount logic.

For each: install the relevant framework workspace as a root dep so its source is resolvable from the showcase node_modules.

### Step 5 — delete Babel-in-iframe shell code

After all five frameworks are on the new pipeline, the shells become trivial HTML emitters that the plugins call. Delete:

- `src/runtime/rewriteImports.ts` (Babel-driven import patching).
- The `@babel/standalone` dependency.
- The `srcDoc`-rendering branch of `FrameworkPreview.tsx`.

Keep:

- `src/runtime/demos.ts` (still needed to produce demo-source per framework — it's just consumed server-side instead of in-iframe now).
- Shell tests (rewrite to assert the new HTML structure).

### Step 6 — re-sweep, verify 225/225

Run `docs/internal/aggregate-sweep.mjs` against a fresh sweep. Expected outcome: all 225 combos at `ready`. Document any holdouts.

## Pitfalls (from research)

These are known traps from the community's experience with this pattern. Hit them once at the design table, not at 2am during implementation:

1. **`srcdoc` iframes cannot use bare ESM `import()`.** Their origin is `null`, so module fetches are cross-origin and CORS-blocked. The iframe `src` must point at a real URL on the Vite origin. Already learned the hard way for the Angular plugin.
2. **`sandbox="allow-scripts"` alone is not enough.** You need `allow-same-origin` for cross-document fetches to resolve. The compromise: the iframe gets the showcase's origin, so any XSS in the iframe could touch the showcase. Acceptable for a local-study dev artifact; would need rethinking for hosted prod.
3. **Vite re-orders `<link rel="modulepreload">` ahead of `<script type="importmap">` in `transformIndexHtml`.** This breaks importmap if used. Mitigation: serve the iframe HTML directly via the middleware (skipping `transformIndexHtml`), or minimize importmap reliance.
4. **HMR WebSocket scope.** Vite's HMR WS is at the server root. If the iframe is cross-origin (e.g., a sub-domain for sandboxing), HMR breaks. With same-origin iframes (the recommended path), HMR works for free.
5. **Multi-framework plugin ordering.** `@vitejs/plugin-react` and `@vitejs/plugin-vue` both transform `.tsx`/`.ts` files. With both present, shared utility files in `src/` could accidentally be processed by the wrong transform. Mitigation: confine each framework plugin's `include` pattern to its workspace (e.g., `packages/ds-vue/**` only) via `transformFilter` or include arrays.
6. **Re-exported behavior helpers** (like `useAnchoredSurface` from `primitives/index.ts`). These resolve naturally once the whole module graph is in Vite. No special handling.
7. **Watchers and HMR for `ds-*` source changes.** Each framework's plugin should watch its workspace's `src/**` so contract regens trigger iframe HMR. Cheaper than full reload.

## Non-claims

This ADR does NOT claim:

- That the implementation will be quick. Realistic estimate: one to two focused sessions per framework, plus an integration session for FrameworkPreview + tests + sweep.
- That all 225 combos will work on first try. The community pattern is well-trodden but multi-framework is bespoke; expect 2-3 edge cases per framework.
- That the Angular plugin should be migrated to match. Angular needs `performCompilation` because esm.sh's `@angular/common` is partial-linker output. Keep Angular's design.
- That `whyframe` should be adopted as a dependency. It assumes single-framework. Use it as a *reference* for the pattern.

## Open questions for the next session

1. Should each framework's plugin own its `tokensCss` injection, or is that better handled at `transformIndexHtml` time? (Affects whether token previews work the same as today.)
2. The Angular plugin synthesizes a per-component "host" because Angular's bootstrap requires a `Component` with `imports: [...]`. Do React/Vue/Svelte/Lit need similar host synthesis, or can they bootstrap the root component directly? (Probably direct — they don't have Angular's `imports: [...]` constraint.)
3. What's the migration story for the *demos* (`runtime/demos.ts`)? Today the demo is a string built showcase-side. With the new pipeline, the demo source could become a real `.tsx`/`.vue`/`.svelte` file on disk — or stay synthesized but written into the plugin's cache at server-start. Probably the latter, matching how the Angular plugin handles `spike-host` files.

## References

- [whyframe — How it works](https://whyframe.bjornlu.com/docs/how-it-works) — the most directly relevant open-source implementation of this pattern.
- [Storybook Vite Builder Internals](https://github.com/storybookjs/builder-vite/blob/main/packages/builder-vite/codegen-modern-iframe-script.ts) — production-grade reference.
- [Vite configureServer / Plugin API](https://vite.dev/guide/api-plugin) — the plugin hooks we'll use.
- `src/runtime/angular-compiler/vite-plugin.ts` (this repo) — the existing implementation of this pattern.
- `docs/internal/preview-sweep-results-v2.json` (this repo, gitignored) — the failure catalogue this ADR responds to.

## Implementation outcome

Steps 1-6 shipped across six commits between 2026-05-21 (ADR draft) and the verification at `ebbfb79`. Sweep results recorded in `docs/internal/preview-sweep-results-v3.json` (gitignored). Helper scripts under `docs/internal/sweep-runner.mjs` and `docs/internal/sweep-compare.mjs`.

### Commit map

| Step | What landed | Commit |
|------|-------------|--------|
| 1 | Install `@vitejs/plugin-vue` + `@sveltejs/vite-plugin-svelte`, register Vue/Svelte plugins in `vite.config.ts`, add workspace deps for ds-vue/ds-svelte/ds-lit | `e049140` |
| 2 | `fsds-react-preview` plugin: `/preview/react/<Name>` middleware + `virtual:fsds-preview-react/<Name>/entry.tsx` virtual module + tests | `c27e434` |
| 3 | `FrameworkPreview.tsx` per-framework src↔srcDoc switch; React tab uses new pipeline live; tests updated to assert per-pipeline iframe contract | `d18fc3b` |
| 4 | `fsds-vue-preview`, `fsds-svelte-preview`, `fsds-lit-preview` plugins; shared `preview-shell-common.ts`; FrameworkPreview wired for all four; `react()` exclude scopes plugin-react off Vue/Svelte/Lit/Angular workspace files | `5d83fdd` |
| 5 | Delete `shells/{react,vue,svelte,lit}.ts`, `shells/encode.ts`, `rewriteImports.ts`, `smoke.test.ts`; unify `vite-plugin-fsds-data.ts` types with `src/types/data.ts` to fix a Step 4 typecheck error | `ebbfb79` |
| 6 | Sweep verification (no code changes — only `docs/internal/sweep-runner.mjs` + `sweep-compare.mjs`, both gitignored). | this commit |

### v2 → v3 sweep diff

Sweep methodology: same as v2 (drive a real Chromium against each `/preview/<fw>/<Name>` for the new-pipeline frameworks, and against `/#/component/<Name>/developer` with the Angular tab clicked for Angular, recording `fsds:ready` / `fsds:error` postMessage per combo). v3 runtime: ~55s for 225 combos with warm Angular cache.

```
Total cells:       225
  no-change-pass:  142  (already worked before, still works)
  no-change-fail:    2  (Input.react, Checkbox.react — pre-existing demos.ts void-element bug)
  fixed:            81  (v2 fail → v3 pass)
  regressed:         0
```

| Framework | v2 ready | v3 ready | Δ |
|-----------|----------|----------|---|
| React     | 20/45    | 43/45    | +23 |
| Vue       | 20/45    | 45/45    | +25 |
| Svelte    | 20/45    | 45/45    | +25 |
| Angular   | 45/45    | 45/45    | 0 |
| Lit       | 37/45    | 45/45    | +8 |
| **Total** | **142/225** | **223/225** | **+81** |

### Pitfalls hit during implementation (in addition to those documented above)

1. **`@vitejs/plugin-react` v6 + plugin-vue/plugin-svelte coexistence.** plugin-react v6 uses oxc under the hood and injects React Fast Refresh hooks (`$RefreshSig$`, `$RefreshReg$`) into any `.ts`/`.tsx` file it claims — including the `<script lang="ts">` sub-modules emitted by plugin-vue, the `.svelte.ts` rune files in ds-svelte, and any plain `.ts` in ds-lit. Even with an explicit `exclude` regex matching the workspace path, the oxc transform fires before the exclude takes effect. Worked around by inlining no-op stubs for both globals at the top of the common preview shell (`src/runtime/preview-shell-common.ts:REFRESH_STUBS`). The React preview shell wires the real refresh runtime.
2. **Vite's import-analysis rejects `/@id/<virtual:...>` URLs with literal colons.** The shells use a runtime-computed string (`"/@id/" + entryId`) to dodge static analysis. See `src/runtime/preview-shell-common.ts` and `src/runtime/react-preview/shell.ts`.
3. **Entry virtual IDs must carry a file extension.** Without `.tsx` (for React) / `.ts` (for Vue/Svelte/Lit), Vite's import-analyzer refuses to parse JSX in extensionless virtual modules.
4. **Showcase-top-window pageerror contamination during sweeping.** Angular previews live inside an iframe inside the showcase; when the React tab's preview crashes (e.g. Input/Checkbox void-element bug), its `fsds:error` postMessage and any React error boundary noise bubbles up to the showcase top window. The sweep runner clears the captured result after clicking the Angular tab so only post-click messages count.

### Non-pipeline residuals

- `Input.react` and `Checkbox.react` still fail because `buildReactDemo` emits `<Input>Input</Input>` for components whose root is a void HTML element. Same bug affects Img, Hr, Br if/when they're added. Tracked separately as a `demos.ts` cleanup (the `NO_CHILD_LABEL` set in `src/runtime/demos.ts` should be expanded, or the demo builder should consult `anatomy.dom.tag` to detect void elements).
- `demos.ts:elementTag` uses naive lowercase for the "lit" branch (`fsds-profileflag` instead of `fsds-profile-flag`). The Lit preview plugin computes the tag correctly itself via `pascalToKebab` — see `src/runtime/lit-preview/vite-plugin.ts:litElementTag` — so previews work today, but the `demos.ts` helper still has the bug for any consumer that depends on it.
