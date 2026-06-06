# Examples

Consumer-app parity proving surfaces. **Not** demos, **not** documentation, **not** marketing surfaces.

This directory is the consumer-side falsification surface for the normal-form claim. The core repo proves that contracts can generate framework packages; `examples/` asks the next question: can those packages survive ordinary app composition without consumers learning renderer internals, generated file layout, or framework-specific escape hatches?

Each app shape declares one framework-neutral spec, then each framework lane realizes that spec through only its package's public exports. A passing example is bounded evidence that the public package boundary is usable. A failing example is also valuable: it localizes whether the leak is in the contract, IR, emitter, package export map, generated runtime behavior, or the app spec itself.

Read this as a proving-ground portfolio, not a demo gallery. Every app shape must name the claim it pressures, the falsifiers it admits, the evidence files it produces, and the non-claims it leaves outside scope.

## Current Status

| App shape | Implementations | Standing | Primary claim |
|---|---|---|---|
| `settings/` | `react/` only | scaffolded evidence lane | A small forms, overlay, and layout consumer app can build against `@full-stack-ds/react` through public exports. |

The five-framework app-parity claim is not proven by `examples/` yet. The repo's admitted five-framework evidence lives in codegen, generated packages, the governed rail, and the runtime fact rail. The examples directory is the consumer-transfer lane that should eventually make those claims more app-shaped.

## Normal-Form Pressure

`examples/` does not reinterpret contracts. It pressures the surfaces that normal form is supposed to make stable for consumers:

| Normal-form concern | How examples pressure it |
|---|---|
| Semantic authority | `spec.md` owns app requirements; framework lanes are realizations, not separate designs. |
| Public descriptor boundary | Apps import package exports only; private generated paths are treated as boundary failures. |
| Target transfer | The same app spec must survive React, Vue, Svelte, Angular, and Lit without semantic rewrites. |
| Fail-loud governance | Build, type, import, and interaction failures are evidence, not noise to work around. |
| Consumer dependency hygiene | App code must not depend on renderer seams, generator internals, or local styling patches to make behavior possible. |

If an example can only pass by teaching the consumer a framework-specific trick, the example did its job: it found a place where the normal-form boundary is too weak.

## Directory Contract

Each app shape follows this layout:

```text
examples/
  <app-name>/
    spec.md
    react/
    vue/
    svelte/
    angular/
    lit/
```

`spec.md` is the authority surface for the app shape. It states the app's required structure, interactions, component coverage, acceptance bar, findings, and non-claims. Framework directories are realizations of that spec, not independent product designs.

Framework lanes may use framework idioms. They may not change the app semantics. If a framework implementation needs a private import, hand-rolled substitute, CSS override, or behavior escape hatch that the others do not need, that is a parity finding.

## Claim Surface

Each app shape should answer these reviewer-facing questions before it becomes an admission target:

| Question | Requirement |
|---|---|
| Claim | What consumer-app capability is being pressured? |
| Falsifier | What concrete build, render, interaction, or package-boundary failure disproves the claim? |
| Stress axis | Which component family or consumer pattern is under pressure: forms, overlays, layout, state, animation, data display, or cross-framework composition? |
| Transfer | Does the same spec work across React, Vue, Svelte, Angular, and Lit without framework-specific semantic changes? |
| Evidence closure | Can a reviewer rerun the build and interaction checks from committed files only? |

An app shape without those answers is a useful scratch consumer, but it is not yet admissible evidence. The bar is not "the app looks plausible." The bar is "the app makes the package boundary falsifiable."

## What These Prove

1. Public package consumption: examples import from `@full-stack-ds/<framework>` package exports only.
2. Consumer-facing normal form: generated packages expose enough stable surface for app code to compose components without renderer knowledge.
3. Contract-level transfer pressure: one app spec must be realized in multiple framework idioms without smuggling framework lore into the spec.
4. Consumer API gaps: examples reveal missing events, missing attributes, incomplete CSS exports, awkward compound-component exports, or type surfaces that the showcase can hide.
5. Localized failures: if every framework fails the same way, the contract or shared codegen is suspect; if only one framework fails, that framework package or emitter is suspect.

## Falsifiers

The examples lane should fail honestly on any of these:

- A framework app cannot build from committed workspace packages.
- A package export is missing for a surface ordinary consumers need.
- An implementation reaches into `dist/`, generated internals, source files, or non-exported package paths.
- The implementation uses local CSS to supply behavior, structure, or state indication that the package should own.
- The app spec has to be rewritten for one framework to make the implementation possible.
- A required interaction works in one framework implementation but not another.
- The same component requires materially different consumer semantics across frameworks.
- A failure can only be hidden by weakening the app spec instead of fixing the contract, emitter, package export, or runtime behavior.

## Non-Claims

- Not visual-quality proof. The examples use package CSS and should stay visually modest.
- Not accessibility adequacy proof. They exercise shipped behavior, but accessibility claims belong to component contracts, generated behavior primitives, and dedicated rails.
- Not a replacement for unit tests. Component tests remain in `packages/ds-*/src/components/`.
- Not a replacement for the governed rail. Examples pressure package consumption; the rail binds emitted artifacts to contract, codegen, and environment evidence.
- Not current five-framework app parity. Today only `settings/react` exists.
- Not contract authority. App specs pressure package consumption; component semantics still live in `packages/ds-contracts/`.

## How to Run

Each implementation is a standalone app. From the repo root:

```bash
cd examples/settings/react
pnpm install
pnpm dev
pnpm build
```

Intended portfolio gate once examples are populated:

```bash
pnpm -r --filter "./examples/**" run build
```

If an example changes package-generated output or contract semantics, run the relevant root gates as well:

```bash
pnpm run generate:check
pnpm run governed:rail
```

## Adding an App Shape

1. Create `examples/<app-name>/spec.md`.
2. State the claim, falsifiers, stress axis, transfer expectation, acceptance bar, findings log, and non-claims in the spec.
3. Implement one framework first to expose consumer API gaps.
4. Port to the remaining admitted Web DOM frameworks one at a time.
5. Record findings in the spec until they are promoted into issues, contracts, emitters, package exports, or tests.

Good app shapes prove distinct consumer seams:

| App shape | Stress axis | Useful components |
|---|---|---|
| `settings/` | Forms, overlays, basic layout | `Stack`, `Card`, `Field`, `Input`, `Switch`, `Button`, `Dialog`, `Tooltip` |
| `commerce/` | Data display, choice, async-ish UI | `Table`, `Select`, `Tabs`, `Badge`, `Progress`, `Toast` |
| `workflow/` | Dense operational state | `Command`, `Dialog`, `Sheet`, `Checkbox`, `List`, `Status` |
| `media/` | Layout and visual primitives | `AspectRatio`, `Image`, `Avatar`, `Card`, `Skeleton` |

Pick app shapes for what they can falsify, not what they look like. A good app shape is small enough that a reviewer can see the boundary failure and realistic enough that a package-consumption flaw cannot hide behind toy markup.

## Adding a Framework Lane

1. Read `spec.md`.
2. Implement `examples/<app-name>/<framework>/` using only public package exports.
3. Build the app.
4. Compare consumer semantics against existing lanes.
5. If the framework needs an escape hatch, treat it as a package or emitter bug before changing the app spec.

## Evidence Files

| File | Purpose |
|---|---|
| `examples/README.md` | Portfolio-level rules for examples as consumer-pressure evidence. |
| `examples/<app-name>/spec.md` | App-shape claim, framework-neutral requirements, findings, and acceptance bar. |
| `examples/<app-name>/<framework>/package.json` | Public package-consumption boundary and build command. |
| Future Playwright specs | Runtime interaction evidence for app-level behavior. |
