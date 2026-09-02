---
doc_id: ARCH-ANALYTICAL-RELATION-001
authority: architecture
status: draft
title: Typed Analytical Relations and Combinatorial Projection
owner: "@darianrosebrook"
updated: 2026-09-02
governs:
  # Exist after stage 0 / 0.5 (the corpus contract and its integrity checker):
  - packages/ds-contracts/analytical-pack/**
  - packages/ds-codegen/src/analytical/**
  # Exist after stage 1 (the relational structure, the fixtures and their ledger, the engine):
  - packages/ds-contracts/relation.contract.schema.json
  - packages/ds-contracts/analytical-fixtures/**
---

# Typed Analytical Relations and Combinatorial Projection

This document is a **draft architecture doc**: a proposed shape, ratified only in part. What exists is the **corpus contract** — `packages/ds-contracts/analytical-pack/` (vocabulary, form-name denylist, case schema, corpus) and `packages/ds-codegen/src/analytical/corpus-integrity.ts`, which binds the corpus and this document to each other mechanically (the diagnostic catalogue and the vocabulary appendix below are parsed by it). That is stage 0 and 0.5 of "Order of construction". Stage 1 also exists: the relational-structure schema (`packages/ds-contracts/relation.contract.schema.json`), the answer-free fixtures and their binding ledger (`packages/ds-contracts/analytical-fixtures/`), and the engine (`packages/ds-codegen/src/analytical/engines.ts` with `structure.ts` and `judgment.ts`) that adjudicates every stage-1 corpus case three-valued (admissible / illegal / unproven) with exactly the expected diagnostic or obligation. Everything from the necessity witnesses onward — stage 1.5, the view algebra, the projection space, the realizations — is provisional and unbuilt. The doctrine's shape is ratified, and `status` flips to `active`, when stage 1.5 carries a necessity witness for every axis the schema retains. Until then this doc confers no authority (see `document_governance.md`, "Drafts confer no authority").

It extends `normal-form.md`. Read that first.

## The claim

> A chart type is not a primitive. It is a **theorem**: a name for a bundle of preconditions on a typed analytical relation, plus a projection that discharges them. Realization — bars, candles, cells, a nested table, a spoken summary — is a byproduct of the relation's type and a declared perceptual task, not the target the author aims at.

Stated as the inversion it is: the usual pipeline is *pick a chart, then shape the data to fit it*. The proposed pipeline is *type the data, declare the task, then enumerate what the data may legally become*. "Bar chart" is what falls out when a relation admits `{one discrete positional field, one ratio-scaled measure with a meaningful zero}` and a magnitude-comparison task asks for a cartesian projection. If the preconditions fail, the form is not "a poor choice" — it is **ill-typed**, and the system says so with a diagnostic. If the preconditions cannot be decided from what is declared, the form is **unproven**, and the system says which premise is missing.

This is why the substrate cannot be "chart semantics" in the visualization-grammar sense. Grammar-of-graphics systems (Wilkinson; Vega-Lite as its checkable descendant) are more semantic than a chart-component API — they type fields as quantitative / temporal / ordinal / nominal rather than by JS primitive — but their centre of gravity is still the *encoding*. Their data side is thin: no grain, no additivity, no units, no missing-mechanism, no provenance. The semantic-layer lineage (OLAP cubes, Malloy, LookML, MetricFlow) has the measure algebra right and no rendering semantics at all.

The two halves *have* been joined before, and the doctrine is honest about where. Polaris / VizQL (Stolte, Tang, Hanrahan) is a table algebra over a relational cube whose nesting operators yield small multiples and nested tables — the closest lineage to what this doctrine calls `nest` and `facet`. Draco (Moritz et al.) encodes expressiveness and effectiveness constraints as a logic program that enumerates and rejects designs — the closest lineage to the enumerator. Both stop short of what is asked for here: neither carries units and dimensional analysis, per-dimension additivity, a nullability or provenance taxonomy, accessibility as a peer projection, or emission across substrates; and in both the rejection is a solver outcome, not a first-class typed artifact with a named cause. The gap this doctrine occupies is the *conjunction* — relation typing strong enough to reject, a projection algebra strong enough to enumerate and compose, and realization across substrates including non-visual ones — not the bare idea of deriving charts from data.

## What this tests that components and iconography could not

`normal-form.md` names three falsification conditions. The third is:

> A class of compositional systems where the contract cannot be made framework-neutral. If there is a domain where the substrate fundamentally requires per-target semantic interpretation — and not just per-target syntactic translation — then property 4 fails for that class, and the claim must be narrowed.

Analytical relations are the sharpest test of that condition this repository can mount, for a reason that is qualitative rather than a matter of difficulty:

- A **component** contract *describes* one semantic object. Contract-to-realization is 1:N syntactically and 1:1 semantically. The test is whether one description lowers idiomatically to five paradigms.
- An **icon** is a symbol with governed geometry. The test is a pipeline seam: ingested like a token, delivered like a component.
- An **analytical relation** contract must *constrain a space* of semantically distinct admissible realizations rather than describe one. The interesting artifact stops being the emitter and becomes the **admissibility relation itself**. The contract layer moves from a descriptive language to a judgmental one: a relation type inhabits a set of legal projections, and realization is finding a witness.

That is new information about the normal form. It tests whether property 1 (a typed contract owning semantic authority) can carry *constraints*, not just *facts*, and whether property 5 (fail-loud boundaries) can be a type checker rather than a reference checker.

It also carries the sharpest trap. If analytical work is bolted onto the existing contract shape, the result is `BarChart.contract.json` with `variant: "stacked"` — Vega-Lite with fewer features, and nothing learned. The tell that the work is on the right side of the trap is a single invariant: **nothing named after a chart appears below the projection layer.**

### The residue principle

The normal-form thesis has a failure mode of its own: it can become unfalsifiable by pushing every domain downward until "everything is composition." The guard is a narrower claim, adopted here as doctrine:

> Heterogeneous realizations should share **exactly** the semantic structure they genuinely have in common, and no more.

Applied concretely: for each realization family (visual, tabular, navigational, textual) the design must be able to enumerate the **unshared residue** — what that family carries that the substrate does not. An empty residue is a red flag that the substrate has absorbed realization detail; a residue that is nearly everything is a sign the substrate is too thin to matter. The iconography layer already demonstrates the pattern (its README states the emission-ledger substrate is "not icon-shaped"); analytical relations are asked to demonstrate it against a domain where the temptation to over-share is stronger.

The same guard applies *inside* the substrate. A sufficiently rich ontology can describe every bad chart on earth; that does not make it a normal form. A normal form is a compression: a distinction stays only because removing it makes two analytically different states indistinguishable. That is the **axis-necessity** requirement (invariant 15, falsification condition 9).

## Vocabulary

Terms below are used with exactly these meanings. Where a term collides with one already in the docs, the collision is named. The machine-readable term list is the "Vocabulary appendix" at the end; `vocabulary.json` must equal it.

- **Relation** — a typed tuple set with a declared grain.
- **Relational structure** — the authoritative analytical object: one or more named relations with declared relationships between them. A single relation is the degenerate case. See L1.
- **Grain** — the key set that makes a row unique. Every aggregation, fan-out, and navigation hierarchy is defined relative to it.
- **Field** — a typed column. Carries the full field algebra (below), not a scalar type.
- **Shape** — the form of a field's value (scalar, interval, set, distribution, point), orthogonal to its scale.
- **Dimension / Measure** — a field used to partition versus a field used to aggregate. The distinction is a *role in a derivation*, not a property of the field; a field may be a measure in one view and a dimension in another.
- **Derivation** — a typed operator over relations that yields a relation (filter, aggregate-to-grain, bin, …). Derivations have typing rules.
- **Task** — the perceptual question a view is meant to answer (compare magnitudes, see a distribution, read composition, trace change, inspect topology, follow flow). A task declares the invariants any projection serving it must preserve.
- **Projection** — a coordinate space plus a channel assignment plus the invariants it claims to preserve. This is *relation → geometry*. It is a different sense from the `consumer-projection-doctrine.md` use of "projection" (*contract → consumer-facing view*); both are deterministic derivations from an authority, which is why the same word fits, but they are not the same operation.
- **Combinator** — an operator over projections (`layer`, `facet`, `embed`) with its own typing rule; the reason "combinatorial" means an algebra, not a menu.
- **Realization** — a projection lowered to a substrate: SVG in a web family, React Native, native drawing, Figma vectors, an HTML table, a navigable hierarchy, a text summary.
- **Form** — a *named* point in the projection space ("histogram", "candlestick"). Forms are aliases, never primitives.
- **Judgment** — what the engine returns for an assertion: **admissible**, **illegal** (with a diagnostic), or **unproven** (with an obligation naming the missing premise).
- **Diagnostic** — the *causal* name of an illegality (`REL_*`). Many distinct observations may share one diagnostic; the catalogue below is the set of causes, not the set of cases.
- **Case** — one observation in the corpus (`CASE_*`): an assertion, the expected judgment, and the earliest stage that can decide it. Case identity is independent of diagnostic identity.
- **Evidence class** — whether a judgment is decidable from the relation type alone (`schema`) or needs actual rows (`instance`).
- **Pack** — the governed vocabulary the checker consumes: unit dimensions, per-target channel inventories, the form alias catalogue, the corpus. Modelled on Sterling's language packs: authoring source compiled into one governed artifact that the realizer reads, never loose files read at runtime.

## The stack

Each layer owns a class of facts and is forbidden knowledge of the layers above it. The layer numbering is the doctrine; the field lists are the current best guess and are expected to grow exactly the way `ir.ts` grew when React Native arrived — cost landing in the IR, never in a contract escape hatch or an emitter branch. Every axis that survives into the relation schema must earn its place with a necessity witness (invariant 15).

### L0 — Field algebra

A field is not `number | string | Date`. It carries:

- **Scale** — `nominal` · `ordinal` (with an explicit order, and whether it is total or partial) · **`cyclic`** (with a period: weekday, month, hour, bearing, phase) · `interval` (zero not meaningful: temperature, calendar year) · `ratio` (meaningful zero) · `count` · `proportion` (of a declared whole) · `index` (rebased, with a declared base). Cyclic is its own scale because it is the only one that licenses the angle channel. Whether these eight are *primitive* types or convenient aliases over a smaller capability algebra — admissible transformation group, order structure, zero and reference semantics, discreteness, boundedness, declared whole — is an open question stage 1 is required to answer, not assume: `count` is ratio-like but discrete, `proportion` is ratio plus a bound and a whole, `index` is ratio plus a base, `cyclic` is chiefly an order topology.
- **Shape** — the form of the value, orthogonal to scale: `scalar` · `interval` (a range with declared closure — a price low–high, an age band, a bin) · `set` · `distribution` · `point` (a 2-D or geographic coordinate). Shape is what lets an interval-valued field be a *value* rather than two columns that happen to be related, and it is what a `bin` derivation produces. Uncertainty (below) is metadata *about* a value and stays distinct from an interval-shaped value, which *is* the value.
- **Unit** — a dimension (currency, time, length, mass, dimensionless, …) and a unit, plus a **rate decomposition** for derived quantities: numerator and denominator dimensions, so that a per-capita measure re-derives on rollup instead of being averaged. Two units are commensurable when a declared conversion rate relates them; otherwise incommensurable.
- **Temporality** — `instant` · `interval` (with declared closure: half-open is the default and matters for binning) · `duration`; calendar and timezone; grain (day, week, fiscal quarter).
- **Identity** — whether the field is a key, and at what grain. Keys are not nominal categories even though they look like them, and a key may never be encoded to a non-positional channel or aggregated.
- **Nullability** — a taxonomy, not a boolean: `absent` · `not-applicable` · `censored` (left / right / interval) · `suppressed` (privacy or threshold) · `unknown` · `missing-after-join`. A projection that interpolates across a null, or a derivation that coerces one, must declare the missing mechanism it assumes.
- **Uncertainty** — `none` · `interval` (with level and whether it is a confidence or credible interval) · `distribution` (family and parameters) · `measurement-error` · `rounded` (precision). Dropping declared uncertainty in a derivation or projection is a lossy step and is declared as such.
- **Ordering** — the field's intrinsic order, separated from any *presentation* order derived from a measure. Sorting by a measure is a derivation, not a render option.
- **Provenance** — `observed` · `derived` · `imputed` · **`layout-generated`**. A layout-generated value (a force-simulation coordinate, a tree-layout x, a stacking baseline offset) is barred by type from every positional-meaning claim. This is the axis that stops a realization artifact quietly acquiring semantic standing.

**Type-level and observation-level qualifiers are different facts.** Provenance, nullability, and uncertainty vary row by row in real data: one temperature is observed, the next imputed, another censored, another suppressed, and uncertainty widths differ per reading. The field *type* declares which qualifiers it **permits**; each *observation* carries which qualifier it **has**. A design that makes `provenance: imputed` a whole-column enum either forces columns to be homogeneous or loses exactly the per-observation standing the axis exists to preserve. Stage 1 is required to carry a heterogeneous fixture that kills the column-level design on contact, and this is why several judgments have `instance` evidence class: the type says what *may* be present, the rows say what *is*.

### L1 — Relational structure and grain

The authoritative object is a **relational structure**: one or more named relations, each with a declared grain, plus declared relationships between them (foreign keys; node-to-edge incidence). A single relation is the degenerate structure with one member. This is a position, not merely a question, because the probes force it: an OHLC series is one relation; a nested hierarchy is a relation plus a parent–child relationship on its own key; a graph is a node relation *and* an edge relation, and an isolated node cannot be represented by edges alone without either dropping it or denormalizing node attributes into edge rows. A schema that assumes exactly one flat relation would make the graph adversary a breaking change that was visible from day one. Stage 1's pre-schema recon confirms the position by expressing all four probes without a chart-specific field; if it cannot, the primitive is wrong and the recon says how.

From grain the checker derives what is a duplicate, what is a fan-out under a join, what "aggregate" means, and — later — the navigation hierarchy of the accessible projection. Grain may be declared **unknown**; that is a value, not an error, and it makes grain-dependent judgments *unproven* with `grain:declared` as the obligation, rather than blocking (see "What makes it checkable").

### L2 — Measures and aggregability

A measure is a field plus an aggregation semigroup (sum, mean, count, min, max, …) plus **per-dimension additivity**: `additive` · `semi-additive` over a named dimension set · `non-additive`. Inventory balance sums over product and averages over time; a sum of it along time — as an aggregate or as a stack, the cause is the same — is a lie the checker can name. Ratio measures declare their numerator and denominator so that rollup re-derives them; averaging a ratio is `REL_RATIO_MEASURE_AVERAGED`, not a rendering choice.

### L3 — View algebra

Operators closed over relational structures, each with a typing rule. The initial set: `filter`, `project`, `aggregate-to-grain`, `bin`, `window` / `rank`, `pivot` / `unpivot`, `join` (with declared cardinality), `partition` (faceting, small multiples), `nest` (hierarchies: nested tables, treemaps), `graph` (node relation + edge relation + directedness + whether flow is conserved), `normalize` (to a declared whole), `sort` (a derivation, never a render option), `domain` (an explicit domain re-declaration). Two illustrative rules:

- `bin` takes a `ratio` or `interval` field and yields an `interval`-shaped field and a `count` measure; if bin widths are unequal, the dependent measure is *density*, and a projection that encodes the count to length is ill-typed.
- `graph` with `flow: conserved` requires the edge measure to satisfy conservation at every non-terminal node, or to declare leakage. Conservation is an *instance* fact: declared without rows, it is unproven.

Every derivation is classified into one of five kinds, and the kind is part of the derivation's type: **truth-preserving reorganization** (pivot, sort by intrinsic order) · **meaning-producing derivation** (aggregate, bin, rank — yields new claims) · **lossy but admissible** (dropping uncertainty, sampling, top-N with declared remainder) · **perceptual-only** (no analytical standing: jitter, label collision avoidance, colour ramp choice) · **illegal** for the structure presented. The classification is what lets a downstream consumer know which steps changed what may be inferred.

### L3.5 — Task

A task is declared, not inferred. Each task names the invariants any projection serving it must preserve:

| Task | Must preserve |
|---|---|
| magnitude-comparison | ratio comparability → zero baseline on the length/position channel |
| composition | exhaustive, mutually exclusive partition; additivity over the partition dimension |
| distribution | interval-shaped domain; density under unequal bins; declared closure |
| change-over-time | intrinsic temporal order; declared interpolation policy across nulls |
| correlation | two positional channels each carrying a ratio or interval field; no layout-generated position |
| ranking | a total order; presentation order equals the ranked order |
| topology | connection channel; position declared non-meaningful |
| flow | conservation or declared leakage; directedness |
| lookup-rollup | grain-respecting subtotal derivation (nested tables) |
| trend | intrinsic order and direction only; no baseline claim |

Preconditions are indexed by task, not by form. The same relation can serve a comparison task legally and a composition task illegally without changing a byte of data.

**A declared task cannot disavow what the encoding asserts.** If obligations flowed only from the declared task, an author could make a truncated-baseline length encoding legal by declaring the task as `lookup-rollup`. Admissibility is therefore the *intersection* of two directions: the task declares the claims a projection must support, and the projection's channel structure *induces* claims that cannot be renounced — a length channel asserts magnitude comparability whether or not the author says so. A task can demand more of a projection; it cannot erase semantics the encoding creates. This is `REL_TASK_UNDERSTATED_ENCODING_CLAIM` and falsification condition 10.

### L4 — Projection

A projection is a point in a product space:

`coordinate space × channel assignment × preserved invariants`

- **Coordinate spaces** — `cartesian` · `polar` (angle carries cyclic order; radius carries ratio) · `tabular` (row/column cells) · `lane` (temporal lanes, one per series) · `geographic` (with a declared map projection; area comparison requires an equal-area one) · `containment` (nesting) · `non-metric` (layout-generated position; position carries no claim).
- **Channels with declared capacity** — `position` (ordinal through ratio) · `length` (ratio; requires a zero baseline for ratio claims) · `area` (ratio only; never interval) · `angle` (cyclic only, or arcs of a declared whole) · `hue` (nominal only; cannot carry order) · `luminance` (ordinal / ratio, sequential; diverging requires a declared midpoint) · `shape` / `texture` (nominal) · `connection` (topology) · `containment` (hierarchy) · `order` (ordinal) · `text` (anything, at the cost of preattentive reading).

Channel capacity is a **type rule**, distinct from perceptual effectiveness ranking (Cleveland–McGill and successors). "Hue cannot carry order" is a licensing fact; "position is read more accurately than area" is a preference. The checker enforces the first and may advise on the second. Conflating them makes taste look like type checking.

A **form** is an alias for a region of this space. Forms live in the pack's alias catalogue and are derived, never authored as primitives.

#### Projection combinators

The product space above is the space of *atomic* projections. "Combinatorial" has to mean more than a product of choices: projections compose, and the composition has typing rules of its own.

- **`layer`** — several atomic projections over one coordinate space with **shared scales**. A range mark for low–high under a range mark for open–close is a layer; so is a line with its uncertainty band. Layers declare scale sharing per channel; an unshared positional scale inside one coordinate space is the general form of the dual-axis illegality. Annotations — a target line, a threshold band, an event marker — are *relations* (often single-row) layered in, not decorations: a target line has a unit and must be commensurable with the axis it sits on. Both are one cause, `REL_UNIT_INCOMMENSURABLE_SHARED_SCALE`, observed twice.
- **`facet`** — repeat a projection over a `partition`, with a declared scale policy (`shared` or `free`) per channel. Free scales trade comparability for resolution; that trade is a claim, and leaving the policy undeclared is ill-typed.
- **`embed`** — a projection as the value of a cell in a `tabular` projection (a trend line or a micro-bar inside a nested table). The embedded projection is typed against the cell's **channel budget**: with position only and no baseline or axis it can serve a *trend* task and cannot serve a *magnitude comparison* task. This is what "nested tables" most often means in practice, and it is where the tabular oracle and a visual projection meet in one artifact.

**Admissibility is compositional.** The legality of a composite is derived from the legality of its parts plus the combinator's rule, never from a whole-composite special case. If a composite ever needs a precondition that cannot be written as a rule on the combinator, the algebra is wrong. This is the strongest form of the doctrine's compositional claim and is stated as invariant 13.

**Interaction is derivation.** A brush is a `filter` driven by input; a hover is the textual projection of one tuple; a zoom is a `domain` re-declaration; a selection is a `partition`. Interactions bind to the same behaviour channels components use (`BehaviorIR.normalizedChannels`) and are typed as derivation + projection, not as a realization feature. Deferred to stage 4b and recorded here so the first visual emitter does not invent it.

### L5 — Realization targets

- **Visual** — per web family (SVG in the DOM, so the existing a11y tree and runtime rails still apply), React Native, native drawing, Figma vectors.
- **Tabular** — the complete relational structure as a typed relational serialization, rendered as one or more coordinated HTML/native tables. This is the **lore oracle** (below). It is lossless with respect to the structure and non-navigable at scale by design.
- **Navigational** — a hierarchy derived from grain and ordering for keyboard and screen-reader traversal. Lossy by declaration: it summarizes, groups, and drills. Semantic conservation does not require structural conservation; a 10,000-cell grid does not expose 10,000 nodes.
- **Textual** — a structured summary derived from the task (extrema, trend, share). Not free prose.
- Sonification and tactile are named as future targets so the design does not accidentally assume the visual channel.

## What makes it checkable

Three engines carry the "more legal than syntacto-semantics" claim. Their violations are arithmetic, not judgments.

1. **Meaningfulness under admissible transformation** (Stevens; Luce / Narens). A statistic is meaningful only if its truth value is invariant under the transformations the scale admits. Mean of an ordinal is not. Sum of an interval-scaled field is not. Ratio comparison on an interval scale is not — 20 °C is not "twice" 10 °C. A truncated baseline is a claim that the reader is comparing *differences*, not *ratios*, which makes **the baseline a contract-level fact, not a style token**.
2. **Grain × additivity.** Average-of-averages, double-counted fan-out, sums and stacks of semi-additives, subtotals that do not respect grain, proportions of different wholes added, pies over non-exhaustive or overlapping parts.
3. **Dimensional analysis.** Incommensurable scales shared by marks or annotations, summing across currencies without a declared rate, ratio-of-ratio rollups, index fields without a base.

A fourth, **channel capacity**, is type-shaped but perceptual in origin; it is enforced as a licence (hue cannot carry order; area cannot carry interval; angle requires cyclic) and it is where "never distinguish by colour alone" *falls out* — if hue is nominal-capacity and the distinction must survive, redundant encoding is forced by the type, not by a lint rule. The corpus attributes each case to one of eight engines; the other four (provenance, task-invariant, derivation-typing, declaration-missing) name where the fact lives rather than a separate mathematics.

**Judgments are three-valued.** For every assertion the engine returns exactly one of:

- **admissible** — every precondition discharged from the evidence available;
- **illegal** — a precondition is violated, with the causal diagnostic (`REL_*`);
- **unproven** — a precondition is neither discharged nor violated because a premise is missing, with the premise carried as an **obligation** (a vocabulary term: `grain:declared`, `unit:commensurable`, `invariant:positive-domain`, …).

Two different questions hide behind "type checking," and the corpus records which one each case asks: *is this operation legal for values of this declared type?* (evidence class `schema`) and *do these actual observations satisfy the premises that make it legal?* (evidence class `instance`). A log transform on a ratio field is admissible on a positive domain and undefined at zero; without rows the judgment is unproven, with rows containing zero it is illegal, with rows that are all positive it is admissible. A schema that hardens around facts it cannot know will either over-reject or lie; the split is a stage-1 obligation, even though the concrete cross-target witness transport (decision D4) is deferred.

## Combinatorial projection

The user-facing consequence of the stack: given a relation and a task, the admissible projection set is **enumerable**. The catalogue of named forms is a human lookup over that set; it is not the set.

Worked decompositions, written so that no form name appears in the preconditions:

- **Discrete positional + ratio length, cartesian, comparison task.** Preconditions: one nominal/ordinal field; one ratio measure; zero baseline. *Colloquially:* bar.
- **… + `partition` to `order` along the length channel.** Adds: additivity over the partition dimension; exhaustive, exclusive parts. *Colloquially:* stacked bar. A `normalize` derivation adds: proportion-of-declared-whole. *Colloquially:* 100% stacked.
- **Temporal field → position; `partition → order`; measure → thickness (length); baseline `layout-generated`.** Preconditions: additivity over the partition; a non-negative measure or a declared negative split; thickness is readable, absolute position is not — the baseline offset is a layout artifact and carries no claim. *Colloquially:* streamgraph. Unrelated to the graph case below anywhere under L4, which is the point of listing both.
- **`bin` on a ratio field → interval → position-extent; count (or density) → length.** Preconditions: closure declared; density if unequal. *Colloquially:* histogram.
- **Proportion → angle, polar, composition task.** Preconditions: exhaustive, exclusive, ratio, declared whole. *Colloquially:* pie. Note the angle channel is licensed here by the *composition* invariant (arcs of a whole), not by cyclic order — the two licences are distinct and the pack records which applies.
- **Two dimensions → row/column, one measure → luminance, tabular.** Preconditions: near-complete grid or declared sparsity; sequential scale, or diverging with a declared midpoint. *Colloquially:* heat map.
- **Temporal-interval grain; four co-registered ratio measures under the invariant `low ≤ {open, close} ≤ high`; lane coordinate; two layered range marks; a derived nominal (`close ≥ open`) → hue.** *Colloquially:* candlestick. Nothing below L4 knows the word.
- **`nest` over a hierarchy; measures → text; subtotals by `aggregate-to-grain` respecting additivity; containment coordinate.** *Colloquially:* nested table.
- **`graph`; edges → connection; position `layout-generated`, coordinate `non-metric`; topology task.** The projection must *decline* to make a positional claim. *Colloquially:* force-directed graph.
- **Cyclic field → angle; measure → radius; polar.** Preconditions: the angular field's scale is `cyclic`. A nominal field here is `REL_CYCLIC_ANGLE_NONCYCLIC`. *Colloquially:* radial / polar bar.

Requesting a form is therefore an *assertion of its preconditions*. The system discharges them and emits, fails and names the precondition, or reports the premise it cannot yet decide. Unnamed legal projections exist and are first-class; a form name is a convenience for humans and for the alias catalogue, and that is all.

## Semantic facts that are not style

Each of the following is a claim about the data and belongs in the relation/task/projection contract, never in a token or a style sidecar:

baseline (zero or truncated) · sort order and its source (intrinsic vs by-measure) · binning policy and closure · missing mechanism assumed by interpolation or coercion · axis transform (log, sqrt) · normalization (to a declared whole) · stacking order · diverging-scale midpoint · dual-axis pairing · index base · sampling or top-N with remainder · uncertainty dropped · declared domain extent (a fixed axis range for cross-view comparability) · facet scale policy · layer scale sharing · map projection.

Colour ramps, mark thickness, label typography, animation, and spacing *are* style and flow through the existing token graph. The boundary is: if changing it changes what a careful reader may infer, it is semantic.

## Accessibility as a peer projection

If the substrate is a typed relation and the chart is a projection, then the accessible table is not an *alternative* to the chart — it is a sibling projection from the same authority, and it is the least lossy one. That yields the strongest structural oracle in the design:

> **The lore oracle.** Every fact asserted by a visual projection must be recoverable from the tabular projection of the same structure and derivation. A visual assertion that cannot be so recovered is a fact the substrate did not carry — the emitter invented lore.

This is `codegen-authority.md`'s "no per-component lore in emitters" invariant transposed to a domain where it has a mechanical check.

The navigational projection is a second, distinct a11y target. Its hierarchy derives from grain (levels), its traversal order from declared ordering (so a by-measure sort in the visual must be a declared derivation the navigation also consumes — otherwise `REL_ORDER_TRAVERSAL_MISMATCH`), and its announced values from units. It is lossy by declaration, which is correct: semantic conservation does not imply structural conservation.

What is mechanically checkable today, and therefore gateable: contrast between adjacent categorical encodings; non-colour-only distinction (derived from channel capacity); accessible name and description derived from task and relation, never separately authored; keyboard operability derived from grain; target size for interactive marks. What is **not** available: an ARIA ontology for analytical forms *in general*. WAI-ARIA Graphics Module 1.0 provides `graphics-document`, `graphics-object`, and `graphics-symbol` and nothing form-specific; the W3C SVG Accessibility Task Force's chart-role proposals (`chart`, `dataset`, `datapoint`, `axis`, `legend`, …) were never standardized. The one coordinate space where the platform *is* prescriptive is `tabular`: native table semantics and the ARIA `table` / `grid` roles carry row and column structure, header scope, spans, indices, counts, and sort state (`aria-sort`, `aria-rowindex`, `aria-colindex`, `aria-rowspan`), and the IR already models the native attributes (`NativeTableAttr` in `ir.ts`). That asymmetry is a second reason the tabular projection is the oracle: it is the one realization whose accessible structure is fully specified by the substrate rather than derived by this design. The honest claim is *a11y realization is a peer target with declared coverage*, not *accessible charts*.

## The semantic pack

The Sterling analogy is precise in one respect and should be held to it: the **engine** is shared and fixed; the **pack** is governed vocabulary the engine consumes.

- **Engine** (in codegen, deterministic, no I/O — property 2): the field algebra, the derivation typing rules, the three checkability engines, the three-valued judgment, the enumerator. These are axioms and mathematics; they are not configurable per pack.
- **Pack** (authoring source under contracts, compiled to one governed artifact the engine reads — never loose files at runtime): unit dimensions and conversion declarations; **per-target channel inventories with capacities** (a Figma target has no hover; a sonification target has pitch and not hue; a monochrome print target has luminance and texture but no hue — the inventory is what makes "cross-substrate" mean something); the form alias catalogue; the corpus with expected judgments.
- **Policy** (pack content, optional): house rules that *narrow* the engine's admissible set — always a zero baseline, no angle encoding of proportions, a fixed categorical hue budget. Policy may only remove forms; it may never license one the engine rejects. This is the analogue of Sterling's `realization_policy`: a realization preference the realizer honours, subordinate to the grammar.

The pack is content-addressed and admitted the way generated artifacts are admitted today: a stale or hand-edited pack is a rail failure, not a warning.

## Design invariants

These are the invariants the slices are asked to encode structurally. Each names the failure it prevents.

1. **No form name below L4.** No contract field, IR fact, derivation, or diagnostic refers to a chart type. Prevents the emitter becoming the authoring layer (the `BarChart.contract.json` trap).
2. **Forms are derived aliases.** The catalogue is generated from the projection space and the pack; it is never a source of truth. Prevents the catalogue re-becoming a primitive set.
3. **The tabular projection is the lore oracle.** Every visual assertion is recoverable from it. Prevents invented facts.
4. **Layout-generated values carry no positional claim.** Enforced by provenance type. Prevents realization artifacts acquiring semantic standing.
5. **Semantic facts are not style.** The list above lives in the contract; tokens carry only what does not change inference. Prevents the token graph laundering claims.
6. **Rejection is a first-class artifact.** The checker can say no, with a typed `REL_*` diagnostic naming the causal fact. Prevents a decorative type system.
7. **Unproven preconditions narrow, they do not block.** Unknown grain, untyped units, undeclared closure each remove forms from the admissible set and are ledgered, in the same two-directional ratchet the styling and a11y realization audits use. Prevents fail-closed unusability and prevents silent permissiveness alike.
8. **Non-empty, enumerable residue per family.** Each realization family lists what it carries that the substrate does not. Prevents unfalsifiability.
9. **Rail binds the projection program, not pixels.** Scale domains, label placement, and binning are data-dependent; determinism is claimed for the derivation and the projection, not the rendered image. Prevents over-claiming what the admission rail proves.
10. **A11y projections are derived, never authored beside the visual.** Name, description, table, navigation, and announced values all come from relation + task. Prevents a second interpretation of the data.
11. **Emitters do last-mile syntax only.** Same as components: an emitter reading a relation field is a sign the IR is missing a derivation. Prevents per-target semantic interpretation — which is exactly normal-form falsification condition 3, and exactly what this domain is expected to pressure hardest.
12. **The relation type lives in the contract; rows arrive at runtime with a conformance witness.** Prevents the contract describing data the runtime never checks.
13. **Admissibility is compositional.** The legality of a layered, faceted, or embedded projection is derived from its parts and the combinator's rule; no composite carries a special case. Prevents the projection algebra collapsing back into a catalogue of composite forms.
14. **Case identity is not diagnostic identity.** The corpus names observations (`CASE_*`) separately from causes (`REL_*`), and at least one cause is shared by independent observations. Prevents the distinct-diagnostic metric from being satisfied by row count; an engine that names a diagnostic per case is overfitting, not partitioning.
15. **Every retained axis has a necessity witness.** For each L0–L2 axis in the relation schema there is a discriminating pair — the same structure in every represented coordinate except that axis, whose legality or derived meaning differs. Prevents data for data's sake: an ontology that can describe every bad chart is not thereby a normal form.
16. **Judgments are three-valued and evidence-classed.** Admissible, illegal with diagnostic, or unproven with obligation; each judgment says whether it needed rows. Prevents a schema hardening around facts it cannot know, and prevents "unproven" existing only in prose.

## Cost to the existing architecture

Named up front so they are non-claims from the start and not discoveries later.

- **A runtime type boundary that does not exist today.** Component contracts describe static artifacts; nothing validates incoming data against a contract. Analytical contracts carry a relation *type*; the rows arrive at runtime and must conform. "Does this realization honour its contract" is only checkable if the runtime carries a witness. This is a new seam in every target family, and it is the one place where a target might legitimately need something the IR cannot pre-compute. The *distinction* between schema-decidable and instance-decidable judgments is a stage-1 obligation (invariant 16); only the transport of the witness across targets is deferred (D4).
- **Determinism changes shape.** Every other target is a pure function of contract and emitter. Analytical pixels are not: domains, ticks, label collision, and bins depend on values. Invariant 9 scopes the rail's claim accordingly.
- **Substrate divergence is worse than for components.** SVG, Canvas, RN/Skia, SwiftUI `Path`, Compose `Canvas`, Figma vectors share no layout model, no flexbox, and differ in path and text-measurement semantics. DOM affordances carry almost nothing. This makes the lowering harder and the test better; per-target channel inventories in the pack are the mechanism that keeps the divergence in data rather than in emitter branches.
- **Expressiveness versus checkability.** Real analytical data has unknown grain and string units. Invariant 7 and the unproven judgment are the resolution: incompleteness is a declared state that narrows admissibility and is ledgered, not a failure that blocks authoring.
- **Where it lives** (decision D1, recommended, not decided): relation contracts at `packages/ds-contracts/relations/<Name>/<Name>.relation.json` against `relation.contract.schema.json` (exists; today only fixtures instantiate it, inline under `analytical-fixtures/`); pack authoring source at `packages/ds-contracts/analytical-pack/` (exists); engine at `packages/ds-codegen/src/analytical/` (exists: the corpus-integrity checker and the stage-1 engine) with its own `RelationIR` / `ProjectionIR` module rather than growing `ir.ts`. Emitters extend the existing target packs so tokens, styles, admission, and the CI generated-tree diff apply unchanged.
- **The tabular oracle and `Table`** (decision D2, a probe, not a commitment): the existing `Table` component (`CODEGEN-TABLE-COMPOUND-PARTS-REALIZATION-01`) is the *candidate* realization of the tabular projection. The probe is whether it can carry a genuinely lossless peer projection of every stage-3 structure — multi-relation graphs, distribution-shaped cells, uncertainty, null kinds, units, derivation lineage. If it cannot, that does not falsify the normal form; it falsifies the assumption that one table component is the canonical human-readable oracle, and the oracle is then the typed relational serialization, rendered as several coordinated tables.

## Order of construction and what each stage falsifies

The order is forced by dependencies, which is why it is doctrine rather than schedule: the oracle must exist before the thing it checks; the type must be able to reject before it is asked to accept. A stage-N engine is judged only on corpus cases whose `stage` is at most N; later cases are not-yet-adjudicable, neither pass nor fail.

| Stage | Builds | Falsifier | Stop condition |
|---|---|---|---|
| 0 | This doctrine and the corpus (`corpus.jsonl`), each case with its expected judgment. No engine. | Can every case be described in the vocabulary appendix without a form name? | A case that can only be described as "a bad *X*-chart" means the vocabulary is incomplete; fix the vocabulary, not the case. |
| 0.5 | The corpus contract repaired so it cannot bias the engine: case identity split from diagnostic identity, per-case stage and evidence class, the `unproven` verdict with an obligation, vocabulary pinned to this document both ways. | Cases outnumber diagnostics; stage-1 cases are a non-empty selectable subset; the vocabulary and this document cannot drift apart silently. | A corpus in which every diagnostic has exactly one case. |
| 1 | L0–L2 as executable types over a **relational structure** (`relation.contract.schema.json`, recursively closed); the checkability engines as pure, order-independent, **answer-blind** rules (`engines.ts` imports nothing from the corpus and names no case); the **three-valued**, occurrence-bearing judgment with evidence classes; answer-free fixtures under a binding ledger (`analytical-fixtures/`, the only place a case meets a fixture); necessity witnesses are stage 1.5: a heterogeneous fixture (per-observation provenance, nulls, uncertainty), a legal near-neighbour per diagnostic, a discharge triad per obligation, a holdout authored against a recorded rule digest, and the five probes (a categorical-vs-ratio relation, a binned ratio field, an OHLC-over-interval relation, a nested hierarchy, a graph with an isolated node) expressed without a form-specific field. | Every **stage-1** corpus case returns exactly its expected judgment (one occurrence, in the case's evidence class); the cases partition as the corpus partitions them; the engine's distinct diagnostics over stage-1 cases equal the catalogue's stage-1 diagnostics; every near-neighbour is admissible; the holdout matches; alpha-renaming every identifier changes nothing but subjects. | Undercount (two catalogue causes collapse into one emitted diagnostic) or overcount (a diagnostic per case: overfitting); a probe expressible only with a form-specific field; the column-level qualifier design surviving the heterogeneous fixture; a judgment that changes under declaration or rule order. |
| 1.5 | A **necessity witness** per retained L0–L2 axis: quotient and collision ablations under a separating-set bound precommitted before the ablations run; the scale-as-alias question answered (which of the eight scales are primitive over the capability algebra and which are aliases). | Each retained axis has a discriminating pair — two structures that differ only in that axis and differ in legality or derived meaning — and no axis survives without one. | An axis with no discriminating pair; a bound loosened after the ablations to keep an axis. |
| 2 | L3 view algebra with typing rules and the five-kind classification, closed over relational structures. | Every stage ≤ 2 case returns its expected judgment; `bin` on ratio yields interval shape + count; unequal widths force density; `aggregate-to-grain` refuses non-additive rollups and returns unproven on unknown grain; `graph` conservation is unproven without rows and illegal with violating rows. | A derivation whose output type cannot be stated without reference to how it will be drawn. |
| 3 | L3.5 task table with the encoding-induced-claims rule, L4 projection space and **combinators** (`layer`, `facet`, `embed`), the **enumerator**, and the alias catalogue *generated* from it. | Every stage ≤ 3 case returns its expected judgment; for each probe the enumeration contains the expected forms and excludes the corpus's illegal ones; a graph is enumerable only with non-metric position; a layered OHLC and an embedded trend-in-table type-check from their parts; declaring a lookup task over a truncated length encoding is still illegal. | An expected form reachable only by adding a form-specific field below L4, or a composite that needs its own rule, or a task declaration that erases an encoding-induced claim. |
| 4 | The **tabular** realization first (D2 probe against `Table`), then one visual realization (SVG in the DOM, one web family); the runtime conformance witness against real rows. | The lore oracle: every visual assertion is derivable from the table. Then the four probes plus a force layout lowered through the same IR. | A visual assertion with no tabular derivation that is *not* classified perceptual-only; a stage-3 structure `Table` cannot carry losslessly (which redirects the oracle, not the doctrine). |
| 5 | Navigational and textual a11y projections; WCAG gates derived from channel capacity; the residue enumeration per family. | Traversal order equals declared order under a by-measure sort; non-colour-only forced by hue capacity; each family's residue listed and non-empty. | Empty residue for any family. |
| 6 | Cross-substrate: the remaining web families, React Native, then a native target and Figma, each via its pack channel inventory. | Same IR, no per-target semantic interpretation (normal-form condition 3 under direct test). | A target that needs a relation field the IR did not pre-derive — this is the informative outcome, to be recorded as IR growth, not patched in the emitter. |

Two adversaries are deliberately early. The OHLC relation *looks* like a chart type and is actually a constrained relation; if the substrate expresses it with no `candlestick` concept below L4, that is strong evidence. The graph relation is the opposite case — position is not data, and an isolated node is not an edge — and forces both the relational-structure position and the projection layer's ability to decline a claim.

## Diagnostic catalogue

One row per **cause**. Cases — the observations that exhibit a cause, with their stage and evidence class — live in `packages/ds-contracts/analytical-pack/corpus.jsonl`; several cases may share a row here, and `corpus-integrity.ts` requires the set of diagnostics carried by illegal cases to equal this table in both directions. The cause column is written in the vocabulary appendix's terms only; the colloquial column exists to show the name is downstream of the cause. Stage is the earliest stage at which *some* case for the cause is adjudicable.

| Diagnostic | Engine | Stage | Cause | Colloquially |
|---|---|---|---|---|
| `REL_MEANINGFULNESS_ORDINAL_MEAN` | meaningfulness | 1 | the mean is not invariant under monotone transformation of an ordinal scale | average satisfaction score |
| `REL_MEANINGFULNESS_INTERVAL_RATIO` | meaningfulness | 1 | a ratio is undefined without a meaningful zero | bar of temperatures |
| `REL_MEANINGFULNESS_INTERVAL_SUM` | meaningfulness | 1 | a sum is not invariant under the affine transformations an interval scale admits | total degrees |
| `REL_MEANINGFULNESS_NOMINAL_ORDER_STAT` | meaningfulness | 1 | an order statistic needs an order the scale does not have | the biggest region code |
| `REL_MEANINGFULNESS_CYCLIC_LINEAR_MEAN` | meaningfulness | 1 | a cyclic scale needs a circular mean; the linear mean depends on where the period is cut | mean of 23:00 and 01:00 is noon |
| `REL_IDENTITY_AGGREGATED` | meaningfulness | 1 | a key is not a quantity; no aggregate over it is meaningful | total of the user ids |
| `REL_TEMPORAL_INSTANT_SUM` | meaningfulness | 1 | instants are interval-scaled in time; only their differences, which are durations, are meaningful | adding two dates |
| `REL_ADDITIVITY_SUM_SEMIADDITIVE` | additivity | 1 | the measure is declared non-additive along that dimension, whether the sum is an aggregate or a stack | total inventory for the year; stacked inventory over time |
| `REL_ADDITIVITY_NORMALIZE_NONADDITIVE` | additivity | 2 | normalization presumes the parts sum to the whole | 100% stacked averages |
| `REL_RATIO_MEASURE_AVERAGED` | additivity | 1 | a rate must re-derive from its numerator and denominator at the new grain | average of per-capita rates |
| `REL_GRAIN_FANOUT` | additivity | 2 | rows duplicated by a one-to-many join inflate sums and counts | double-counted revenue |
| `REL_GRAIN_SUBTOTAL_MISMATCH` | additivity | 2 | the subtotal derivation is undefined off the declared grain | nested table with wrong totals |
| `REL_PROPORTION_SUM_ACROSS_WHOLES` | additivity | 1 | proportions of different wholes are not additive | shares of two markets added |
| `REL_UNIT_INCOMMENSURABLE_SHARED_SCALE` | dimensional | 3 | dimensional analysis fails across a shared scale | dual-axis line; target line in the wrong unit |
| `REL_UNIT_SUM_ACROSS_CURRENCY` | dimensional | 1 | values in different units are not summable | total revenue across currencies |
| `REL_PROPORTION_WHOLE_UNDECLARED` | declaration-missing | 1 | the normalization base is absent | percent of what? |
| `REL_INDEX_BASE_MISSING` | declaration-missing | 1 | a rebased value has no referent | index = 100 with no anchor |
| `REL_BIN_CLOSURE_UNDECLARED` | declaration-missing | 2 | boundary membership is ambiguous | which bin gets 10.0? |
| `REL_NULL_INTERPOLATE_UNDECLARED` | declaration-missing | 3 | interpolation asserts a value that is not there | line through a gap |
| `REL_DIVERGING_MIDPOINT_UNDECLARED` | declaration-missing | 3 | the midpoint is a claim | diverging ramp with an arbitrary centre |
| `REL_SORT_AS_RENDER_OPTION` | declaration-missing | 3 | ordering is semantic | sort: desc in a token |
| `REL_LAYER_SCALE_UNSHARED` | declaration-missing | 3 | marks in one space imply one scale | a secret second axis |
| `REL_FACET_SCALE_POLICY_UNDECLARED` | declaration-missing | 3 | cross-facet comparability is a claim | small multiples, mixed axes |
| `REL_BIN_UNEQUAL_COUNT` | derivation-typing | 3 | the area-density invariant is violated | misleading histogram |
| `REL_TEMPORAL_INTERVAL_AS_INSTANT` | derivation-typing | 3 | the extent is lost without a declared lossy step | range bars drawn as points |
| `REL_UNCERTAINTY_DROPPED_UNDECLARED` | derivation-typing | 3 | the loss is unstated | point estimate only |
| `REL_UNCERTAINTY_UNPROPAGATED` | derivation-typing | 1 | an aggregate over uncertain values must carry the uncertainty or declare the loss | exact total of approximate readings |
| `REL_LOG_SCALE_ZERO_CLAIM` | derivation-typing | 3 | the transform is undefined at zero and destroys additivity of lengths | log axis that swallows the zeros; log-scaled stack |
| `REL_NULL_SUPPRESSED_AS_ZERO` | derivation-typing | 2 | a missing value is not a measured zero; the null kind is collapsed with no declared mechanism | privacy-suppressed cells drawn as zero |
| `REL_NULL_CENSORED_AS_OBSERVED` | derivation-typing | 1 | a censored value is a bound, not a measurement | average survival including the still-alive |
| `REL_TEMPORAL_GRAIN_MIXED` | derivation-typing | 2 | values at different grains are not co-registered | daily and monthly on one axis |
| `REL_CYCLIC_ANGLE_NONCYCLIC` | channel-capacity | 3 | angle is licensed by a cyclic scale or a composition invariant only | radial bar of regions |
| `REL_AREA_INTERVAL_SCALE` | channel-capacity | 3 | area carries ratio only | bubble of temperatures |
| `REL_HUE_CARRIES_ORDER` | channel-capacity | 3 | hue is nominal-capacity and cannot carry order | rainbow ordinal legend |
| `REL_SEQUENTIAL_ON_NOMINAL` | channel-capacity | 3 | a sequential ramp implies an order the scale lacks | regions shaded by alphabet |
| `REL_COLOR_ONLY_DISTINCTION` | channel-capacity | 3 | the distinction is not conserved under hue loss | colour-only series |
| `REL_KEY_ENCODED_TO_CHANNEL` | channel-capacity | 3 | keys are not categories | one colour per user id |
| `REL_PROVENANCE_LAYOUT_GEOMETRY_CLAIM` | provenance | 3 | layout-generated geometry carries no claim | reading distance off a force layout; reading height off a stream baseline |
| `REL_BASELINE_RATIO_CLAIM` | task-invariant | 3 | the ratio-comparability invariant is violated | truncated-axis bar |
| `REL_TASK_UNDERSTATED_ENCODING_CLAIM` | task-invariant | 3 | the encoding induces a claim the declared task cannot disavow | "it is just a lookup, ignore the heights" |
| `REL_PARTITION_NOT_EXHAUSTIVE` | task-invariant | 3 | composition requires an exhaustive partition | pie of the top five |
| `REL_PARTITION_OVERLAPPING` | task-invariant | 3 | overlapping parts double-count the whole | pie of multi-select answers |
| `REL_FLOW_NOT_CONSERVED` | task-invariant | 2 | the conservation invariant fails on the rows | leaking sankey |
| `REL_STACK_NEGATIVE_UNDECLARED` | task-invariant | 3 | stacked lengths do not sum to the total | stacked bar with negatives |
| `REL_EMBED_TASK_EXCEEDS_CHANNEL_BUDGET` | task-invariant | 3 | the task invariant is unsatisfiable within the channel budget | sparkline read as a bar |
| `REL_GEO_AREA_NON_EQUAL_AREA` | task-invariant | 3 | the map projection distorts area, so area carries no ratio | comparing countries by size on a Mercator map |
| `REL_ORDER_TRAVERSAL_MISMATCH` | task-invariant | 5 | the ordering derivation is not shared across projections | a11y reads A to Z, the visual shows rank |

Forty-seven causes. The corpus carries more cases than this because several causes are observed in independent ways, and five further cases expect the `unproven` judgment with an obligation rather than a diagnostic (unknown grain under rollup; a per-row currency before rows are seen; a field that permits suppression before rows are seen; conserved flow before edge values are seen; a log transform before positivity is known).

## Vocabulary appendix

The machine-readable term list. `packages/ds-contracts/analytical-pack/vocabulary.json` must equal this table in both directions; `corpus-integrity.ts` parses it and reports any difference. Corpus cases reference these as `namespace:term`. The prose sections above describe the terms; this table pins them.

| Namespace | Terms |
|---|---|
| `engines` | meaningfulness · additivity · dimensional · channel-capacity · provenance · task-invariant · derivation-typing · declaration-missing |
| `scale` | nominal · ordinal · cyclic · interval · ratio · count · proportion · index |
| `shape` | scalar · interval · set · distribution · point |
| `unit` | dimension · rate · numerator · denominator · commensurable · incommensurable · currency · conversion-rate |
| `temporality` | instant · interval · duration · closure · grain · calendar |
| `identity` | key |
| `null` | absent · not-applicable · censored · suppressed · unknown · missing-after-join · missing-mechanism |
| `uncertainty` | none · interval · distribution · measurement-error · rounded |
| `ordering` | intrinsic · presentation · total · partial |
| `provenance` | observed · derived · imputed · layout-generated |
| `grain` | declared · unknown · fan-out · subtotal |
| `additivity` | additive · semi-additive · non-additive · ratio-measure |
| `aggregate` | sum · mean · count · min · max |
| `derivation` | filter · project · aggregate-to-grain · bin · window · rank · pivot · unpivot · join · partition · nest · graph · normalize · sort · domain |
| `derivation-kind` | truth-preserving · meaning-producing · lossy-admissible · perceptual-only · illegal |
| `task` | magnitude-comparison · composition · distribution · change-over-time · correlation · ranking · topology · flow · lookup-rollup · trend |
| `coordinate` | cartesian · polar · tabular · lane · geographic · containment · non-metric |
| `channel` | position · length · area · angle · hue · luminance · shape · texture · connection · containment · order · text |
| `capacity` | nominal-only · ordinal · ratio-only · cyclic-only · zero-baseline · sequential · diverging |
| `combinator` | layer · facet · embed |
| `transform` | log · sqrt |
| `invariant` | meaningful-zero · admissible-transformation · zero-baseline · exhaustive · exclusive · declared-whole · density-under-unequal-bins · declared-closure · interpolation-policy · conservation · leakage · scale-sharing · scale-policy · channel-budget · position-non-meaningful · negative-split · extent-preserved · redundant-encoding · declared-midpoint · declared-base · shared-ordering · declared-projection · positive-domain |

Terms in this table with no corpus case are the legal-side vocabulary; stage 1's legal corpus and necessity witnesses are what exercise them. A term that neither an illegal case, a legal case, nor a necessity witness ever touches has not earned its place and is removed under invariant 15.

## Falsification conditions

The doctrine is wrong, and should be narrowed or abandoned, if any of the following holds after the corresponding stage:

1. **Lore.** A realization requires a fact not present in the structure, derivation, task, or projection — and the fact is not classifiable as perceptual-only. (Stage 4.)
2. **Oracle.** A visual assertion is not derivable from the tabular projection. (Stage 4.)
3. **Rejection.** The engine cannot return the expected judgment on the corpus's stage-adjudicable cases with distinct, causal diagnostics. (Stage 1 onward, scoped by stage.)
4. **Residue.** A realization family shares everything with the substrate. (Stage 5.)
5. **Re-grain.** Rolling up a dimension of a structure breaks a projection or its navigational a11y without any change to the projection declaration — meaning the contract encoded a chart, not a relation. (Stage 3–4.)
6. **Enumeration.** A well-known legal form is reachable only by adding a form-specific field below L4. (Stage 3.)
7. **Condition 3 of the normal form.** A target requires per-target *semantic* interpretation of the relation rather than IR extension. This one is expected to be pressured hardest at stage 6, and the honest outcomes are recorded either way: IR growth refines the claim; an emitter branch on relation content falsifies it.
8. **Composite special case.** A layered, faceted, or embedded projection is admitted or rejected only by a rule written for that composite rather than derived from its parts and the combinator. (Stage 3.)
9. **Axis without necessity.** An L0–L2 axis survives into the relation schema with no discriminating pair — no two structures that differ only in that axis and differ in legality or derived meaning. (Stage 1.5.)
10. **Task disavowal.** A declared task makes a projection admissible whose channel structure induces a claim the task does not support. (Stage 3.)

## What counts as complete

Two bars, so the lane can neither stop early nor be denied a stopping point.

| Bar | Requires |
|---|---|
| **Analytical normal-form candidate complete** (end of stage 3) | One authoritative relational-structure schema; L0–L3 closed under every admitted derivation; admissible, illegal, and unproven judgments with evidence classes; every retained axis has a necessity witness; corpus cases independent of diagnostic ids and several diagnostics shared; schema-level vs instance-level evidence explicit; no form name below L4; the OHLC, hierarchy, binned-distribution, and graph-with-isolated-node probes all express without escape hatches; a holdout set of cases not used to shape the rules behaves correctly. |
| **Projection system functionally complete** (end of stage 5) | Given structure + evidence + task, the legal projection set is enumerable; aliases are generated; combinators type from their parts; task understatement cannot evade channel-induced obligations; tabular and one visual target consume the same IR; a machine-comparable claim set proves the lore oracle; runtime conformance is witnessed against real rows; navigational and textual projections derive from the same source; losses and residues are explicit. |
| **FSDS substrate experiment complete** (end of stage 6) | The same analytical IR crosses at least one genuinely hostile non-DOM realization after the web proof with zero per-target semantic interpretation; target-pack differences are channel inventories, not relation branches; the rail binds the projection program and the runtime witness without claiming pixel determinism; residue remains non-empty per family. |

The semantic core can be called complete at the first bar without waiting for the third; the project thesis is not settled before the third. Stage 6 is what says whether this taught something about compositional normal forms or merely built a good web analytical grammar.

## What this does not claim

- It does not claim the engine, the relation schema, the projection space, or any realization is built. The corpus contract and its integrity checker exist; everything else under `governs:` is proposed.
- It does not claim the field algebra is complete, and it does not claim every term in the appendix has earned its place. It claims the *layering* is right, expects the fields to grow, and requires each to carry a necessity witness before stage 1 keeps it.
- It does not claim that a case's prose is exhausted by its declared terms. The mechanical claim is narrower: every declared vocabulary reference resolves, the vocabulary equals this document's appendix, and no form name appears outside the colloquial field. Semantic completeness is what the structured relation representation of stage 1 provides; prose cannot.
- It does not tell anyone what "revenue," "temperature," "country," or "customer" *is* in the world. It can say a value has ratio semantics, a currency unit, temporal extent, aggregation rules, provenance, and uncertainty. That is analytical meaning, not denotation. Concept identity, causal structure, and source ontology are deliberately out of scope so that, if a later layer needs them, it is possible to tell which layer did the work.
- It does not claim "accessible charts." It claims a11y realization is a peer projection with declared, gateable coverage and a named ceiling.
- It does not claim rendered-pixel determinism, visual quality, or perceptual effectiveness. It claims derivation and projection determinism and type-licensed channel use.
- It does not claim the substrate is universal. The residue principle and the necessity requirement are the guards against that claim being made by accident.
