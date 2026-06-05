---
doc_id: REF-CURRENT-IMPLEMENTATION-SNAPSHOT-001
authority: reference
status: active
title: Current Implementation Snapshot
owner: "@darianrosebrook"
updated: 2026-06-02
governs:
  - README.md
  - docs/**/*.md
  - fsds.targets.json
  - .github/workflows/ci.yml
  - e2e/runtime-rail.spec.ts
  - packages/ds-codegen/**
  - packages/ds-contracts/**
---

# Current Implementation Snapshot

This is the routing document for current project state. Read it before older architecture notes, ADRs, and successor-work docs when deciding whether a surface is doctrine, partial machinery, or proven machinery.

Snapshot point: `main@5f197b0bc45b5e229337bb0c5862b88035f9b112` (`fix(e2e): skip runtime-rail screenshots under CI=true via test.skip`).

This document is not a replacement for the underlying architecture docs. It is an index of claim strength: what has landed, what the evidence actually proves, what it does not prove, and which older docs should no longer be read as the only truth surface.

## Freshness rule

Use this order when answering "what is true now?":

1. Current implementation snapshot.
2. Code and workflow surfaces at the cited commit.
3. Implemented/proven docs with `verified_at_commit`.
4. Architecture and reference docs.
5. `successor-work.md` only for remaining work, not as a statement that everything listed is unimplemented.

If an older doc says a surface is future work but this snapshot identifies a landed implementation, treat the older language as stale until that specific doc is reconciled.

## Current claim ledger

| Surface | Current claim | Claim strength | Evidence surface | Non-claims | Next admissible move |
|---|---|---|---|---|---|
| Contract corpus layout | Component contracts live under `packages/ds-contracts/components/<Name>/<Name>.contract.json`, with sidecars for tokens, styles, and usage examples. The loader, not a hand-maintained README count, is the authority for corpus discovery. | implemented | `packages/ds-codegen/src/contracts-fs.ts`; `vite-plugin-fsds-data.ts` | A visible component count in prose is not an authority surface. | Generate or remove README count/table so corpus size cannot drift. |
| Five Web DOM framework generation | React, Vue, Svelte, Angular, and Lit remain the primary executable Web DOM family. Codegen emits framework-specific component source, tests, styles, behavior primitives, and barrels from the same contract/IR path. | implemented / rail-admitted | `packages/ds-codegen/src/frameworks/*`; `packages/ds-{react,vue,svelte,angular,lit}/src`; `pnpm run governed:rail` | This proves cross-framework Web DOM realization, not substrate-neutral UI semantics. | Promote target-family IR boundaries out of implicit Web DOM assumptions. |
| Generated artifact admission rail | Required-mode rail is wired into CI and binds generated artifacts to manifest, contract bytes, codegen source bytes, framework checks, and bounded environment. CI also refuses generated drift after regeneration. | implemented / CI-gated | `.github/workflows/ci.yml`; `docs/admission-rail.md`; `docs/governed-ci.md`; `packages/ds-codegen/src/validation/**` | It does not prove determinism, full environment attestation, per-file semantic proof, visual quality, or accessibility adequacy. | Move target-pack provenance into the manifest instead of treating every rail participant as a framework vocabulary member. |
| Runtime visual proof rail | A separate CI job runs after the main gate and exercises Progress, Truncate, ShowMore, OTP, and Calendar in real Chromium through React, Vue, Svelte, Lit, and Angular preview mounts. It asserts contract facts, not screenshot pixels. Non-default prop facts are asserted too: React/Vue/Svelte/Lit via a query-param override seam, and Angular via three fixed pre-compiled startup fixtures (ShowMore `maxLines=7`, Progress `value=50`, Truncate `lines=5`). Angular preview is executable in both surfaces — the showcase `FrameworkPreview` and this rail. | implemented / CI-gated for fact assertions | `e2e/runtime-rail.spec.ts`; `.github/workflows/ci.yml`; commits `9c7bead`, `11193fb`, `df722b2`; specs `RUNTIME-RAIL-ANGULAR-01`, `RUNTIME-RAIL-ANGULAR-NONDEFAULT-02` | Behavioral parity beyond DOM shape is not asserted. Arbitrary request-carried Angular non-default prop-sets are intentionally NOT admitted — only the three fixed fixtures plus default-prop facts (Angular bakes props before AOT compile, so it has no query-param override seam). Screenshot baselines are darwin-only and skipped under `CI=true`. | Widen the non-default surface (more components/props); if a need arises, admit arbitrary Angular prop-set compilation beyond the fixed fixtures. |
| Iteration and binding semantics | IR-level `iterate` lowers to framework-native loop constructs across the five Web DOM frameworks. OTP and Calendar are production count-iteration consumers with index bindings. | implemented / runtime-proven for count iteration defaults | commits `bf73ca4`, `894381c`, `457de31`, `9c7bead`; `packages/ds-codegen/src/frameworks/iteration-bindings.test.ts`; `e2e/runtime-rail.spec.ts` | Production usage currently proves count iteration, not a real array-shaped Calendar day model. Array iteration remains emitter-test evidence unless a production contract opts in. | Add one production array-iteration contract or promote Calendar to a real day-array shape. |
| CSS custom-property bindings | Prop-to-CSS custom-property lowering exists and is runtime-checked for both default/fallback and explicit non-default cases in Progress, Truncate, and ShowMore. Non-default props are mounted two ways: React/Vue/Svelte/Lit via a request-carried query-param `overrideProps` seam, and Angular via fixed pre-compiled startup fixtures. | implemented / runtime-proven for defaults plus selected non-default cases | `packages/ds-codegen/src/frameworks/css-var-bindings.test.ts`; `e2e/runtime-rail.spec.ts` | The rail does not prove every non-default computed visual geometry, every component/prop pair, every token cascade branch, or arbitrary Angular prop-set compilation (Angular admits only the fixed fixtures). | Widen the non-default surface beyond the three components/props, and bind rail outcomes into component evidence pages. |
| Target-pack registry | Target-pack manifest and registry config machinery exists. Built-in targets are described through manifests; local target packs can be declared, resolved, validated, fingerprinted, and described. | implemented foundation | `fsds.targets.json`; `packages/ds-codegen/src/target-packs/{manifest,builtin,config,local}.ts`; `docs/architecture/design/target-pack-registry.md` | Local target packs are metadata-only in this slice: their emitter entrypoints are not imported/executed. npm/package-source loading is not implemented. | Add executable local target-pack loading after manifest validation while keeping file writing centralized. |
| Figma descriptor target | `figma` is a built-in design-tool target that emits descriptor artifacts and README projections from ComponentIR. Its target-pack manifest declares descriptor-only token strategy and non-behavioral capability limits. | implemented descriptor surface | `fsds.targets.json`; `packages/ds-codegen/src/frameworks/figma/*`; `packages/ds-codegen/src/target-packs/builtin.ts` | This does not prove live Figma canvas mutation, library publication, or MCP tool availability. | Wire descriptor consumption through the Figma plugin path and add evidence for canvas/materialization behavior. |
| Component evidence/showcase pages | The showcase has moved beyond doctrine: Design view derives usage examples, anatomy, variants, states, props, accessibility, and token sections from component bundles; Developer view renders per-framework preview/source tabs and trace regions. | partially implemented | `src/views/DesignView.tsx`; `src/views/DeveloperView.tsx`; `src/views/sections/*`; `src/runtime/FrameworkPreview.tsx` | Evidence/residual sections, A2UI descriptor surfacing, and full per-framework readiness reporting are not complete proof surfaces. | Finish an explicit Evidence/Residuals section per component and bind it to rail/runtime results. |
| Curated usage examples | Usage JSONL sidecars are loaded into component bundles and rendered as live React in the Design view where present. | implemented narrow path | `packages/ds-contracts/components/*/*.usage.jsonl`; `vite-plugin-fsds-data.ts`; `src/lib/render-usage.tsx`; `src/views/sections/UsageExamples.tsx`; commit `33f7c8e` | Curated examples are not codegen inputs, and existing examples can still contain product/content curation issues. | Expand usage coverage and decide whether usage examples should have their own evidence/validation report. |
| Token governance | Token build, DTCG validation, committed-build drift check, contrast validation, brand reference validation, and usage-regression gates are in CI before codegen checks. | implemented / CI-gated | `.github/workflows/ci.yml`; `packages/ds-tokens/**`; `docs/tokens-architecture.md` | Token gates do not prove visual design quality or complete accessibility adequacy. | Connect token gate summaries to component evidence pages. |
| Non-web generation (substrate) | Non-web remains a recon/prototype lane and Web DOM is still the only executable multi-framework family. Three contract/IR-level proofs have since landed and closed, moving the non-web story from speculative to structurally validated at the semantic layer: typed token facts on the framework-neutral IR for non-DOM consumers, and a second collapse-intent vocabulary member proven on Details (the collector required zero change — it branches on declared intent value, not component name). | recon lane; narrow semantic proofs landed | `docs/non-web-generation.md`; `packages/ds-codegen/src/frameworks/swift/**`; `FEAT-MOBILE-IR-001` (closed `eb933df`); `FEAT-MOBILE-DISCLOSURE-001` (closed `f00110c`); `packages/ds-codegen/src/collapse-intent.test.ts` | These are contract/IR semantic proofs, not generated-system parity: no generated mobile package, no registered mobile target, no rail admission, no Native View IR/layout, no substrate-neutral surface proof. | See the parity-matrix row below; pick a mobile execution lane (SwiftUI package/admission vs. Native View IR recon). |
| Mobile-vs-web parity (measured) | A reproducible scoring script + matrix measures the asymmetry across eight dimensions for five web + three native targets. Measured result: web = governed generated system (admitted targets, package roots, rail plans, preservation); native = callable emitter code with zero admission infrastructure (emitter source present, but zero generated package roots, zero registered targets, zero rail plans). | measured / reference artifact | `MOBILE-PARITY-QUALITY-RECON-01` (closed `2788873`); `scripts/mobile-parity-matrix.mjs` (`--check` self-consistency gate); `docs/successor-work-mobile-parity-matrix.md` (`REF-MOBILE-PARITY-MATRIX-001`) | The matrix marks emitter-completeness, token-realization, behavior, and surface support as `unmeasured` (this is "not measured here", not "absent") — qualitative depth stays evidence-anchored, not freshly measured. It makes no parity claim and recommends no lane. | Decide the lane; size the named gaps (Native View IR, native token realization, SurfaceIR neutrality, RN/Compose elevation). |

## Stale-doc corrections this snapshot makes explicit

Several older docs are still useful, but their frontmatter/status or prose lags the code:

- `docs/successor-work.md` should no longer be read as "all listed surfaces are unimplemented." Some items are now partial or promoted, especially target-pack registry, component evidence pages, usage examples, and runtime rail.
- README still contains hand-maintained component-count language. Treat loader discovery under `packages/ds-codegen/src/contracts-fs.ts` as authoritative until the README count is generated or removed.
- The five-framework claim is still true but narrower than the broader target story. The current executable family is Web DOM; target packs and Figma descriptors extend the projection model but do not yet prove external pack execution or non-web runtime semantics.
- Runtime rail evidence is newer than the original architecture docs. Any answer that treats runtime preview/fact testing as future work is stale.

## Current bounded thesis

The project is no longer only a design-system generator or a doctrine bundle. It is a contract-governed design-system substrate with generated Web DOM framework realizations, target-pack admission scaffolding, Figma descriptor projection, token governance, generated-artifact admission, runtime fact assertions, and partially derived component evidence pages.

The claim boundary is still bounded. It does not yet prove production adoption ergonomics, complete accessibility adequacy, visual quality, npm-distributed packages, live Figma library publication, executable external target packs, or substrate-neutral UI semantics. The non-web mobile arc has narrowed — but not closed — the substrate-neutrality question: contract/IR-level semantic proofs landed (typed token facts; a second collapse-intent member proven on Details without component-name lore), while generated-system parity for native targets did not (no generated package, no registered target, no rail admission, no Native View IR, no surface-neutrality proof — see the two non-web rows in the ledger and `REF-MOBILE-PARITY-MATRIX-001`).
