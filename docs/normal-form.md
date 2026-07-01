---
doc_id: ARCH-NORMAL-FORM-001
authority: architecture
status: active
title: The Normal Form of Compositional Systems
owner: "@darianrosebrook"
updated: 2026-06-11
governs:
  - packages/ds-contracts/**/*.contract.json
  - packages/ds-contracts/component.contract.schema.json
  - packages/ds-contracts/primitives/Stack.primitive.json
  - packages/ds-contracts/primitives/primitive.contract.schema.json
  - packages/ds-contracts/a2ui/derive.ts
  - packages/ds-codegen/src/ir.ts
  - packages/ds-codegen/src/preserve.ts
  - packages/ds-codegen/src/frameworks/**
---

# The Normal Form of Compositional Systems

This repository is not, primarily, a design system. It is a falsifiable claim about compositional systems, with a design system as the existence proof.

The claim, stated plainly:

> Compositional systems — systems where higher-order artifacts are assembled from lower-order ones under shared constraints — converge on a single architectural shape. That shape can be written down. Systems that conform to it compose cleanly across heterogeneous targets, regenerate safely, and survive transfer to new substrates. Systems that resist it accumulate a predictable family of symptoms — shadow files, stubbed-out implementations, force-pushes around quality gates, runtime drift between layers, irreproducible builds — that no amount of after-the-fact tooling fully fixes.

The constraint of "<!-- component-count -->49 components, 1 primitive, 5 frameworks" exists to test this claim. Five frameworks is not a feature; it is the falsification surface. If the same contract can drive React (function components with hooks), Vue (reactive composables), Svelte (compiler-driven runes), Angular (signals with dependency injection), and Lit (web components with reactive controllers) without leaking implementation detail into any of them — and without the contract growing per-framework escape hatches — then the contract is at the right level of abstraction. If it cannot, the contract is wrong, and the wrongness will be visible as friction in exactly one of those five outputs.

This document names the architectural shape, identifies the load-bearing pieces of this codebase that encode it, and states the falsification conditions. It is intended for readers who want to evaluate the architecture as a claim, not just use the codegen.

## Evidence status

This document argues from one concrete codebase. The current evidence is:

- <!-- component-count -->49 component contracts generated through one primitive. (Count is loader-derived — `contracts-fs.ts` walks `components/*/<Name>.contract.json`; do not hand-maintain this number, re-derive it.)
- Five framework emitters consuming a shared IR.
- Boundary checks in the IR that fail on unresolved contract references.
- Regeneration semantics that preserve custom regions while rewriting generated regions.
- An A2UI projection that exposes consumer-facing capability without renderer internals.

This is sufficient to evaluate whether the seven properties hold in this repository. It is not sufficient, by itself, to prove that every compositional system must converge on this shape. The claim's broader scope is left for readers to test against systems they know.

## The discipline this is an instance of

The operative concern is governance, not composition. "Compositional" describes the result; governance describes the work. A system has the normal form when the rules about what can be composed with what, by whom, and under what guarantees are encoded structurally — in contracts, IRs, fail-loud boundaries, mutable/immutable site discipline, and consumer-facing descriptors — rather than encoded socially in convention, review culture, or institutional memory.

The point of encoding governance structurally is not control for its own sake. It is to **raise the floor so the quality bar is easier to hit**. Without the normal form, doing the right thing requires heroic effort by every contributor on every change. With it, the right thing is the path of least resistance, and the wrong thing is loud enough to be visible before it ships. A system in normal form does not produce better work by demanding better people; it produces consistent work by removing the choices that lead to drift.

The same discipline calibrates to the reliability of the consumer. When the consumer is a reasonably disciplined human, advisory linting and visual review can carry property 5 (fail-loud boundaries). When the consumer is a stochastic generator that will silently fabricate references it cannot resolve, property 5 has to be enforced harder — hashing, schema validation, fail-closed throws. The shape of the property is the same; the strictness scales with how much the consumer can be trusted to follow rules it has not been forced to follow. Whether this re-scaling generalizes cleanly to other substrates is a question this codebase alone cannot settle.

## The move that produces normal-form systems

The seven properties are the outcome of a recurring methodological move. Naming it makes the doc actionable rather than descriptive:

1. **Refuse the surface request.** "Add a new component," "add a new variant," "add a new framework target," "add a new primitive" — these are usually requests to extend the surface rather than fix the underlying abstraction. Take the request seriously enough to ask what it is actually asking for.
2. **Diagnose the actual ask.** What is under-represented in the current contract? What state, what behavior, what consumer need is the surface request a proxy for? The diagnostic question is "what is the contract missing that makes the obvious answer wrong?"
3. **Name the domain-scoped trap.** Most surface requests are domain-specific solutions to under-represented general problems. Identify the place where one consumer's problem is being mistaken for the system's problem. That is where the wrong abstraction lives.
4. **Lower the primitive while raising the governance.** Push the new capability down into a primitive or a contract field that all consumers can use, not up into a new component or escape hatch. Simultaneously raise the governance to cover the new composition, so the lowering does not create a new ungoverned surface.
5. **Validate that governance survives the composition.** The test of the move is not "does the new thing work." It is "does the existing governance still apply to the new composition." If governance has to be relaxed to make the composition work, the move was wrong; the abstraction is still in the wrong place.

This is the move that, applied consistently, produces the constraint of "one primitive, many components" in this codebase. Each time a surface request for a new primitive was refused, the contract grew the fields that made the new primitive unnecessary instead. The result is a corpus where the primitive count has stayed at one across <!-- component-count -->49 components; it is not a proof that the primitive count would stay at one indefinitely.

The seven properties below are what falls out of running this move consistently. Read them as the residue of the methodology, not as a checklist that produces the methodology.

## The seven properties

A system in normal form has all seven of these properties. They are not independent — several imply the others — but each is worth naming because the failure modes look different when each is absent.

### 1. A typed contract that owns semantic authority for the artifact

There is exactly one place where the meaning of an artifact lives. In this repo, that place is `packages/ds-contracts/<Name>.contract.json`, validated against `component.contract.schema.json`. Every other file that describes the component — generated source, tests, CSS, agent-facing descriptors — derives from it. The contract is the only thing a human edits to change what the component *is*.

The word "semantic" is doing work. The contract owns what the component *means*: its anatomy, its props' types, its accessible role, its keyboard behavior, the channels through which it communicates with consumers, the events it emits. The contract does not own how any specific framework renders it, what classnames a particular CSS methodology generates, or what test harness runs against it. Those are realization details, downstream.

### 2. A framework-neutral intermediate representation derived from the contract by deterministic projection

Between contract and target sits an IR — `packages/ds-codegen/src/ir.ts` — that is built once per contract by `buildComponentIR` and consumed by all emitters. The IR is the single place where contract field interpretation happens. "Which props become BEM value modifiers", "which role is implicit on the chosen root element", "is this change handler value-shaped or event-shaped" — these decisions are made once, in the IR, never in target-specific code.

The IR matters because it is what makes adding a new framework target *cheap*. Without it, each framework's emitter would re-interpret raw contract fields, and the cost of adding the sixth framework would be a multiple of the cost of adding the fifth. With it, a new emitter consumes the IR and produces idiomatic source — no contract semantics to relearn.

The projection from contract to IR is deterministic: a pure function, no I/O, no clock, no randomness. Given the same contract bytes, the IR is byte-identical. This is what makes regeneration safe.

### 3. One small set of typed primitives that compose into all higher-order constructs

Every component in this repo is composed of one primitive: `Stack`, defined in `packages/ds-contracts/primitives/Stack.primitive.json`. There is no `Button` primitive, no `Input` primitive, no `Dialog` primitive. `Button` is `<Stack as="button">` with a contract that constrains its props. `Dialog` is `<Stack as="div" role="dialog">` plus compound parts, also stacks.

This is the constraint that pins the contract at the right level of abstraction. If a contract needs to escape into a new primitive to express something, the contract is missing a field. The intent is that every new behavior must be expressible *in the contract*, not in a new primitive. Across the current <!-- component-count -->49 components, no second primitive has been required; whether that continues under broader component pressure is open.

The number of primitives is part of the claim. One is not a magic number — two or three might also be in normal form for a different problem — but the claim is that the set is small, fixed, and chosen at the highest level of abstraction the domain permits. Systems that have a sprawling primitive catalog have not yet found the right abstraction.

### 4. Multiple realization targets, each idiomatic, each derived from the IR with zero contract interpretation in target code

The five framework emitters under `packages/ds-codegen/src/frameworks/<framework>/` each consume the IR and produce framework-idiomatic source. "Idiomatic" is the operative word: the React output uses hooks, the Vue output uses composables, the Svelte output uses `.svelte.ts` rune-based stores, the Angular output uses signals with standalone components, the Lit output uses reactive controllers on `LitElement`. These are structurally opposed paradigms — immutable virtual-DOM with hooks vs. mutable shadow-DOM with controllers — and the contract abstraction spans both.

Critically, zero contract interpretation happens in target code. The React emitter does not know that `behavior.channels` exists; it knows only that the IR has `normalizedChannels` with a `callbackKind` already inferred. A target emitter that finds itself reading raw contract fields is a signal that the IR is missing a derivation, not that the target needs a new escape hatch.

The cost of adding the sixth framework is roughly the cost of writing one emitter that consumes a stable IR — at least, that is the prediction the IR/emitter split is meant to underwrite. Whether the prediction holds for a sixth target is a question the architecture is set up to be checked against, not one the current five frameworks settle on their own.

### 5. Boundary linters that fail loud on references to non-existent contract entities

The cleanest example in this codebase is `validateDomBindings` in `ir.ts`. When a contract's `anatomy.dom` block contains `bindings: { onChange: "channel:checked.onChange" }`, the IR builder walks the tree, looks up `checked` in the normalized-channels set, and *throws a descriptive error* if it does not exist. It does not silently emit a literal string `channel:checked.onChange` into the generated output. It does not log a warning. It fails the build.

This is fail-closed governance at codegen time. The principle: when the system has more information than the author (it knows what channels exist; the author might have mistyped), it rejects ambiguity loudly rather than guessing. The alternative — silent fallthrough to a literal string in the generated output — is common enough in codegen tools that we treat it as a default to be refused, not a discovery. The fail-closed choice keeps the contract authoritative; silent fallthrough lets the generated output become a second, accidental source of truth.

A system in normal form has fail-loud linters at *every* boundary where the system can detect ambiguity the author could not. The DOM-binding check is one; schema validation against `component.contract.schema.json` is another; the unresolved-type-ref pass in the IR is a third.

### 6. Stable mutable/immutable site discipline that allows human edits to survive regeneration without violating invariants

Generated files in this repo use `@generated:start`/`@generated:end` and `@custom:start`/`@custom:end` markers (`packages/ds-codegen/src/preserve.ts`). On regeneration, content inside `@custom` blocks is preserved verbatim across runs; `@generated` blocks are rewritten. CSS and pure scaffolding are always regenerated. Hand-authored TSX with detected interactive logic is preserved unless `--force` is passed.

The discipline matters because the alternative is the file mode every code generator eventually adopts: "generate once, then never regenerate, because the team has hand-edited the output." That mode means the contract is no longer authoritative. The marker discipline keeps the contract authoritative while permitting humans to extend the artifact at known sites.

The boundary itself is enforced by the system, not by the user. Editing outside a `@custom` block is allowed but documented as lossy; on the next regeneration the edit is overwritten. The user does not need to remember the rule; the rule is encoded in the output and the regeneration semantics.

### 7. A consumer-facing descriptor projected from the contract that strips renderer-internal seams and exposes only what the consumer is allowed to depend on

In this repo, the clearest instance is `packages/ds-contracts/a2ui/derive.ts`. The A2UI descriptor takes a component contract and projects it into an agent-facing view: prop allowlist, accepts, enum, required, events, form. It excludes by name (`className`, `style`, `ref`) and by type (`React.AllHTMLAttributes`, function-component shapes) — the seams that exist for renderer reasons and have no semantic meaning to a downstream consumer.

The point is not that agents are the only consumer. The point is that *every* consumer gets a projection of the contract scoped to what they are allowed to depend on. Documentation sites get prop tables. Design tools get tokens and variants. Test generators get behavior channels. Each projection is a deterministic derivation from the contract, and each one strips the seams that would let a consumer take a dependency on something that is not contractually stable.

A system in normal form has at least one such descriptor for every class of consumer that needs to reason about it without owning it.

## How the seven properties hang together

Property 1 (typed contract) gives the system a single authoritative source. Property 2 (IR) makes that source consumable by many targets at acceptable cost. Property 3 (small primitive set) forces the contract to live at the right level of abstraction by removing the escape valve of "just add a new primitive." Property 4 (idiomatic emitters with zero contract interpretation) makes the per-target cost roughly constant. Property 5 (fail-loud linters) keeps the contract authoritative by refusing to silently paper over author error. Property 6 (mutable/immutable site discipline) keeps the contract authoritative across human edits. Property 7 (consumer-facing descriptors) extends the contract's authority to consumers without exposing them to renderer detail they have no business depending on.

Drop any one of these and a predictable failure mode appears.

- Drop **property 1** and authority diffuses; multiple files become "kind of" the source of truth and they drift.
- Drop **property 2** and per-target cost compounds; the fifth framework costs 5× the first because each emitter re-derives semantics.
- Drop **property 3** and the primitive set grows without bound; "compositional" becomes aspirational.
- Drop **property 4** and the contract leaks; targets accumulate framework-specific escape hatches that the contract has to track.
- Drop **property 5** and the contract becomes suggestive; consumers learn not to trust it and start reading the generated output instead, which becomes the de facto source.
- Drop **property 6** and the contract stops being authoritative the first time a human edits a generated file.
- Drop **property 7** and consumers couple to renderer internals; the contract owns semantics on paper but cannot be changed in practice without breaking everyone.

These are not hypothetical. They are the symptoms that show up across the broader software industry whenever a system that *should* be compositional is not. Shadow file proliferation, stubbed-out implementations, force-pushes around quality gates, runtime drift between layers, irreproducible builds — these are not unrelated quality problems. They are the symptom catalog of compositional systems missing the normal form, and they are mostly diagnostic of which property is missing.

## Two functions worth reading carefully

`validateDomBindings` and `inferCallbackKind` in `ir.ts` are the two clearest instances of the discipline in this codebase. Most of the IR is mechanical translation; these two encode architectural choices.

**`validateDomBindings`** is property 5 made concrete. It walks the IR's `DomNodeIR` tree, looks up every `channel:X` reference against the normalized-channel set and every `prop:Y` reference against the styled-prop set, and throws on the first violation. The comment in the source makes the intent explicit: "Throws a descriptive error so contract authors see exactly what went wrong... rather than silently emitting a literal string in the generated output." The function could have been a no-op. It could have logged a warning. It could have emitted the literal string and let the framework reject it at runtime. It throws. That is the discipline.

**`inferCallbackKind`** is the IR mediating between semantic intent and framework idiom without letting either side dictate. The contract says a change handler is `(checked: boolean) => void`. Some frameworks (React) expose change events natively and require the emitter to unwrap them into the value the handler expects. Other frameworks (Vue, Svelte) expose values directly. The contract should not declare "this is a value handler" — that is redundant, because the type signature already says so. The IR inspects the TypeScript type string, defaults to value-shaped, and flips to event-shaped only when the parameter type matches a DOM-event identifier (`MouseEvent`, `ChangeEvent`, etc.). The contract carries semantic intent; the framework idiom carries realization detail; the IR mediates with a deterministic rule. Neither side dictates the other.

Both functions are short. Read together, they are where the architectural choices in this codebase are most concentrated.

## The cross-paradigm spread is the test

The five frameworks were chosen for paradigm spread, not popularity. The contract must drive:

- **React** — function components, hooks (`useEffect`, `useState`, `useCallback`), synthetic events, virtual DOM, immutable props, hooks-as-state.
- **Vue 3** — single-file components, `<script setup>`, reactive composables, refs and reactives, template syntax with directives, value-shaped event handlers.
- **Svelte 5** — `.svelte` compiler output, runes (`$state`, `$derived`, `$effect`), `.svelte.ts` for shared logic, native event handlers, compiler-driven reactivity.
- **Angular** — standalone components, signals, dependency injection, decorators, RxJS-adjacent reactivity, change detection, two-way binding via `[(ngModel)]`-style conventions.
- **Lit** — web components, `LitElement`, reactive properties, reactive controllers, shadow DOM, tagged template literals, attribute reflection.

Hooks vs. controllers, virtual DOM vs. shadow DOM, immutable props vs. mutable reactive properties, synthetic events vs. native events, function components vs. classes. These paradigms are not minor variations on a theme. They are different answers to the same questions, and the contract must give an answer that is correct in each idiom without being framed in any of them.

The contract currently drives all five idiomatically, with hundreds of passing tests per framework. The mechanism by which a leak would show up is concrete: an emitter wanting access to a contract field that no other emitter uses, surfacing as friction in the IR. No such leak is present today in the five emitters; that is what makes the IR short, mechanical, and shared. Whether the spread is wide enough to count as adversarial — or whether a sixth or seventh framework would expose a leak — is a question the current evidence does not resolve.

## What this is not

This document does not claim that this codebase is the only well-designed compositional system. It claims that compositional systems that work well exhibit these seven properties, and that the codebase is one demonstration that the properties are achievable in practice for a non-trivial domain.

It does not claim that the codebase is feature-complete or production-grade beyond its own scope. The <!-- component-count -->49 components were chosen to exercise the contract; they are not optimized for adoption.

It does not claim that this is the only architectural shape compositional systems converge on. It claims this is *one* shape, written down, and offered for comparison against others.

## Falsification conditions

The claim is broad. It is also narrow enough to be falsified. The clean falsifications:

1. **A compositional system that works well without one of the seven properties.** "Works well" means: regenerates safely, composes across heterogeneous targets, surfaces author errors loudly, allows consumer dependencies without coupling to renderer internals, has stable per-target cost. A system that achieves all of these without (say) a framework-neutral IR — that is, by re-interpreting contract semantics in every target — would falsify property 2.

2. **A system with these seven properties that fails to compose.** Built the way the document describes, runs into the symptom catalog anyway. This would tell us the properties are insufficient and there is at least one more.

3. **A class of compositional systems where the contract cannot be made framework-neutral.** If there is a domain where the substrate fundamentally requires per-target semantic interpretation — and not just per-target syntactic translation — then property 4 fails for that class, and the claim must be narrowed.

The seven properties are stated at the level of generality where they are meant to compare against other compositional systems. Whether they do is left to the reader to test against systems they know.

## What this codebase demonstrates, and does not

It demonstrates that, for the <!-- component-count -->49 components built so far, a single typed contract drives idiomatic source across React, Vue, Svelte, Angular, and Lit through one shared IR and one primitive, with fail-closed boundary checks and preserved custom regions across regenerations. The IR is one file; the contract schema is one file; the emitters are five small directories. A reader can clone the repo, regenerate, inspect the IR and one or two contracts, and form a view in under an hour.

It does not demonstrate that every compositional system must take this shape, that the contract will continue to hold past 100 components, or that the architecture transfers to substrates outside UI engineering. Those are open questions, named here so the reader does not have to infer them.
