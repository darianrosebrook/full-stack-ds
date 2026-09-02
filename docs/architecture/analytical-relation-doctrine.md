---
doc_id: ARCH-ANALYTICAL-RELATION-001
authority: architecture
status: draft
title: Typed Analytical Relations and Combinatorial Projection
owner: "@darianrosebrook"
updated: 2026-09-02
governs:
  # Proposed homes. None of these paths exist; this doc is the shape the first
  # analytical slices are asked to ratify or falsify. See "Order of construction".
  - packages/ds-contracts/relations/**
  - packages/ds-contracts/relation.contract.schema.json
  - packages/ds-contracts/analytical-pack/**
  - packages/ds-codegen/src/analytical/**
---

# Typed Analytical Relations and Combinatorial Projection

This document is a **draft architecture doc**: a proposed shape, not a description of landed code. Nothing below is implemented. Its purpose is to fix the doctrine, the design invariants, and the falsifiers *before* the first analytical slice, so that the slice can be judged against something it did not get to write for itself. The slices named under "Order of construction" are what ratify or falsify it; until one lands, this doc confers no authority (see `document_governance.md`, "Drafts confer no authority").

It extends `normal-form.md`. Read that first.

## The claim

> A chart type is not a primitive. It is a **theorem**: a name for a bundle of preconditions on a typed analytical relation, plus a projection that discharges them. Realization — bars, candles, cells, a nested table, a spoken summary — is a byproduct of the relation's type and a declared perceptual task, not the target the author aims at.

Stated as the inversion it is: the usual pipeline is *pick a chart, then shape the data to fit it*. The proposed pipeline is *type the data, declare the task, then enumerate what the data may legally become*. "Bar chart" is what falls out when a relation admits `{one discrete positional field, one ratio-scaled measure with a meaningful zero}` and a magnitude-comparison task asks for a cartesian projection. If the preconditions fail, the form is not "a poor choice" — it is **ill-typed**, and the system says so with a diagnostic.

This is why the substrate cannot be "chart semantics" in the visualization-grammar sense. Grammar-of-graphics systems (Wilkinson; Vega-Lite as its checkable descendant) are more semantic than a chart-component API — they type fields as quantitative / temporal / ordinal / nominal rather than by JS primitive — but their centre of gravity is still the *encoding*. Their data side is thin: no grain, no additivity, no units, no missing-mechanism, no provenance. The semantic-layer lineage (OLAP cubes, Malloy, LookML, MetricFlow) has the measure algebra right and no rendering semantics at all. Nobody has joined the two halves under a projection discipline. That gap is what this doctrine occupies.

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

## Vocabulary

Terms below are used with exactly these meanings. Where a term collides with one already in the docs, the collision is named.

- **Relation** — a typed tuple set with a declared grain. The authoritative analytical object.
- **Grain** — the key set that makes a row unique. Every aggregation, fan-out, and navigation hierarchy is defined relative to it.
- **Field** — a typed column. Carries the full field algebra (below), not a scalar type.
- **Dimension / Measure** — a field used to partition versus a field used to aggregate. The distinction is a *role in a derivation*, not a property of the field; a field may be a measure in one view and a dimension in another.
- **Derivation** — a typed operator over relations that yields a relation (filter, aggregate-to-grain, bin, …). Derivations have typing rules.
- **Task** — the perceptual question a view is meant to answer (compare magnitudes, see a distribution, read composition, trace change, inspect topology, follow flow). A task declares the invariants any projection serving it must preserve.
- **Projection** — a coordinate space plus a channel assignment plus the invariants it claims to preserve. This is *relation → geometry*. It is a different sense from the `consumer-projection-doctrine.md` use of "projection" (*contract → consumer-facing view*); both are deterministic derivations from an authority, which is why the same word fits, but they are not the same operation.
- **Realization** — a projection lowered to a substrate: SVG in a web family, React Native, native drawing, Figma vectors, an HTML table, a navigable hierarchy, a text summary.
- **Form** — a *named* point in the projection space ("histogram", "candlestick"). Forms are aliases, never primitives.
- **Pack** — the governed vocabulary the checker consumes: unit dimensions, per-target channel inventories, the form alias catalogue, the illegal-form corpus. Modelled on Sterling's language packs: authoring source compiled into one governed artifact that the realizer reads, never loose files read at runtime.

## The stack

Each layer owns a class of facts and is forbidden knowledge of the layers above it. The layer numbering is the doctrine; the field lists are the current best guess and are expected to grow exactly the way `ir.ts` grew when React Native arrived — cost landing in the IR, never in a contract escape hatch or an emitter branch.

### L0 — Field algebra

A field is not `number | string | Date`. It carries:

- **Scale** — `nominal` · `ordinal` (with an explicit order and whether it is total) · **`cyclic`** (with a period: weekday, month, hour, bearing, phase) · `interval` (zero not meaningful: temperature, calendar year) · `ratio` (meaningful zero) · `count` · `proportion` (of a *declared* whole) · `index` (rebased, with a declared base). Cyclic is its own scale because it is the only one that licenses the angle channel.
- **Unit** — a dimension (currency, time, length, mass, dimensionless, …) and a unit, plus a **rate decomposition** for derived quantities: numerator and denominator dimensions, so that a per-capita measure re-derives on rollup instead of being averaged.
- **Temporality** — `instant` · `interval` (with declared closure: half-open is the default and matters for binning) · `duration`; calendar and timezone; grain (day, week, fiscal quarter).
- **Identity** — whether the field is a key, and at what grain. Keys are not nominal categories even though they look like them, and a key may never be encoded to a non-positional channel.
- **Nullability** — a taxonomy, not a boolean: `absent` · `not-applicable` · `censored` (left / right / interval) · `suppressed` (privacy or threshold) · `unknown` · `missing-after-join`. A projection that interpolates across a null must declare the missing mechanism it assumes.
- **Uncertainty** — `none` · `interval` (with level and whether it is a confidence or credible interval) · `distribution` (family and parameters) · `measurement-error` · `rounded` (precision). Dropping declared uncertainty in a projection is a lossy step and is declared as such.
- **Ordering** — the field's intrinsic order, separated from any *presentation* order derived from a measure. Sorting by a measure is a derivation, not a render option.
- **Provenance** — `observed` · `derived` · `imputed` · **`layout-generated`**. A layout-generated value (a force-simulation coordinate, a tree-layout x) is barred by type from every positional-meaning claim. This is the axis that stops a realization artifact quietly acquiring semantic standing.

### L1 — Relation and grain

A relation declares its grain. From grain the checker derives what is a duplicate, what is a fan-out under a join, what "aggregate" means, and — later — the navigation hierarchy of the accessible projection. Grain may be declared **unknown**; that is a value, not an error, and it narrows the admissible projection set rather than blocking (see "Cost to the existing architecture").

### L2 — Measures and aggregability

A measure is a field plus an aggregation semigroup plus **per-dimension additivity**: `additive` · `semi-additive` over a named dimension set · `non-additive`. Inventory balance sums over product and averages over time; a stack of it along time is a lie the checker can name. Ratio measures declare their numerator and denominator so that rollup re-derives them; averaging a ratio is `REL_RATIO_MEASURE_AVERAGED`, not a rendering choice.

### L3 — View algebra

Operators closed over relations, each with a typing rule. The initial set: `filter`, `project`, `aggregate-to-grain`, `bin`, `window` / `rank`, `pivot` / `unpivot`, `join` (with declared cardinality), `partition` (faceting, small multiples), `nest` (hierarchies: nested tables, treemaps), `graph` (node relation + edge relation + directedness + whether flow is conserved). Two illustrative rules:

- `bin` takes a `ratio` or `interval` field and yields an `interval`-temporality field and a `count` measure; if bin widths are unequal, the dependent measure is *density*, and a projection that encodes the count to length is ill-typed.
- `graph` with `flow: conserved` requires the edge measure to satisfy conservation at every non-terminal node, or to declare leakage.

Every derivation is classified into one of five kinds, and the kind is part of the derivation's type: **truth-preserving reorganization** (pivot, sort by intrinsic order) · **meaning-producing derivation** (aggregate, bin, rank — yields new claims) · **lossy but admissible** (dropping uncertainty, sampling, top-N with declared remainder) · **perceptual-only** (no analytical standing: jitter, label collision avoidance, colour ramp choice) · **illegal** for the relation presented. The classification is what lets a downstream consumer know which steps changed what may be inferred.

### L3.5 — Task

A task is declared, not inferred. Each task names the invariants any projection serving it must preserve:

| Task | Must preserve |
|---|---|
| magnitude comparison | ratio comparability → zero baseline on the length/position channel |
| composition | exhaustive, mutually exclusive partition; additivity over the partition dimension |
| distribution | interval-typed domain; density under unequal bins; declared closure |
| change over time | intrinsic temporal order; declared interpolation policy across nulls |
| correlation | two positional channels each carrying a ratio or interval field; no layout-generated position |
| ranking | a total order; presentation order equals the ranked order |
| topology | connection channel; position declared non-meaningful |
| flow | conservation or declared leakage; directedness |
| lookup / rollup | grain-respecting subtotal derivation (nested tables) |

Preconditions are indexed by task, not by form. The same relation can serve a comparison task legally and a composition task illegally without changing a byte of data.

### L4 — Projection

A projection is a point in a product space:

`coordinate space × channel assignment × preserved invariants`

- **Coordinate spaces** — `cartesian` · `polar` (angle carries cyclic order; radius carries ratio) · `tabular` (row/column cells) · `lane` (temporal lanes, one per series) · `geographic` (with a declared map projection) · `containment` (nesting) · `non-metric` (layout-generated position; position carries no claim).
- **Channels with declared capacity** — `position` (ordinal through ratio) · `length` (ratio, requires a zero baseline for ratio claims) · `area` (ratio only; never interval) · `angle` (cyclic) · `hue` (nominal only; cannot carry order) · `luminance` (ordinal / ratio, sequential; diverging requires a declared midpoint) · `shape` / `texture` (nominal) · `connection` (topology) · `containment` (hierarchy) · `order` (ordinal) · `text` (anything, at the cost of preattentive reading).

Channel capacity is a **type rule**, distinct from perceptual effectiveness ranking (Cleveland–McGill and successors). "Hue cannot carry order" is a licensing fact; "position is read more accurately than area" is a preference. The checker enforces the first and may advise on the second. Conflating them makes taste look like type checking.

A **form** is an alias for a region of this space. Forms live in the pack's alias catalogue and are derived, never authored as primitives.

### L5 — Realization targets

- **Visual** — per web family (SVG in the DOM, so the existing a11y tree and runtime rails still apply), React Native, native drawing, Figma vectors.
- **Tabular** — the complete relation as an HTML/native table. This is the **lore oracle** (below). It is lossless with respect to the relation and non-navigable at scale by design.
- **Navigational** — a hierarchy derived from grain and ordering for keyboard and screen-reader traversal. Lossy by declaration: it summarizes, groups, and drills. Semantic conservation does not require structural conservation; a 10,000-cell grid does not expose 10,000 nodes.
- **Textual** — a structured summary derived from the task (extrema, trend, share). Not free prose.
- Sonification and tactile are named as future targets so the design does not accidentally assume the visual channel.

## What makes it checkable

Three engines carry the "more legal than syntacto-semantics" claim. Their violations are arithmetic, not judgments.

1. **Meaningfulness under admissible transformation** (Stevens; Luce / Narens). A statistic is meaningful only if its truth value is invariant under the transformations the scale admits. Mean of an ordinal is not. Ratio comparison on an interval scale is not — 20 °C is not "twice" 10 °C. A truncated baseline is a claim that the reader is comparing *differences*, not *ratios*, which makes **the baseline a contract-level fact, not a style token**.
2. **Grain × additivity.** Average-of-averages, double-counted fan-out, stacked semi-additives, subtotals that do not respect grain, pies over non-exhaustive or overlapping parts.
3. **Dimensional analysis.** Incommensurable dual axes, summing across currencies without a declared rate, ratio-of-ratio rollups, index fields without a base.

A fourth, **channel capacity**, is type-shaped but perceptual in origin; it is enforced as a licence (hue cannot carry order; area cannot carry interval; angle requires cyclic) and it is where "never distinguish by colour alone" *falls out* — if hue is nominal-capacity and the distinction must survive, redundant encoding is forced by the type, not by a lint rule.

## Combinatorial projection

The user-facing consequence of the stack: given a relation and a task, the admissible projection set is **enumerable**. The catalogue of named forms is a human lookup over that set; it is not the set.

Worked decompositions, written so that no form name appears in the preconditions:

- **Discrete positional + ratio length, cartesian, comparison task.** Preconditions: one nominal/ordinal field; one ratio measure; zero baseline. *Colloquially:* bar.
- **… + `partition` to `order` along the length channel.** Adds: additivity over the partition dimension; exhaustive, exclusive parts. *Colloquially:* stacked bar. A `normalize` derivation adds: proportion-of-declared-whole. *Colloquially:* 100% stacked.
- **`bin` on a ratio field → interval → position-extent; count (or density) → length.** Preconditions: closure declared; density if unequal. *Colloquially:* histogram.
- **Proportion → angle, polar, composition task.** Preconditions: exhaustive, exclusive, ratio, declared whole. *Colloquially:* pie. Note the angle channel is licensed here by the *composition* invariant (arcs of a whole), not by cyclic order — the two licences are distinct and the pack records which applies.
- **Two dimensions → row/column, one measure → luminance, tabular.** Preconditions: near-complete grid or declared sparsity; sequential scale, or diverging with a declared midpoint. *Colloquially:* heat map.
- **Temporal-interval grain; four co-registered ratio measures under the invariant `low ≤ {open, close} ≤ high`; lane coordinate; two layered range marks; a derived nominal (`close ≥ open`) → hue.** *Colloquially:* candlestick. Nothing below L4 knows the word.
- **`nest` over a hierarchy; measures → text; subtotals by `aggregate-to-grain` respecting additivity; containment coordinate.** *Colloquially:* nested table.
- **`graph`; edges → connection; position `layout-generated`, coordinate `non-metric`; topology task.** The projection must *decline* to make a positional claim. *Colloquially:* force-directed graph.
- **Cyclic field → angle; measure → radius; polar.** Preconditions: the angular field's scale is `cyclic`. A nominal field here is `REL_CYCLIC_ANGLE_NONCYCLIC`. *Colloquially:* radial / polar bar.

Requesting a form is therefore an *assertion of its preconditions*. The system discharges them and emits, or fails and names the precondition. Unnamed legal projections exist and are first-class; a form name is a convenience for humans and for the alias catalogue, and that is all.

## Semantic facts that are not style

Each of the following is a claim about the data and belongs in the relation/task/projection contract, never in a token or a style sidecar:

baseline (zero or truncated) · sort order and its source (intrinsic vs by-measure) · binning policy and closure · missing mechanism assumed by interpolation · axis transform (log, sqrt) · normalization (to a declared whole) · stacking order · diverging-scale midpoint · dual-axis pairing · index base · sampling or top-N with remainder · uncertainty dropped.

Colour ramps, mark thickness, label typography, animation, and spacing *are* style and flow through the existing token graph. The boundary is: if changing it changes what a careful reader may infer, it is semantic.

## Accessibility as a peer projection

If the substrate is a typed relation and the chart is a projection, then the accessible table is not an *alternative* to the chart — it is a sibling projection from the same authority, and it is the least lossy one. That yields the strongest structural oracle in the design:

> **The lore oracle.** Every fact asserted by a visual projection must be recoverable from the tabular projection of the same relation and derivation. A visual assertion that cannot be so recovered is a fact the substrate did not carry — the emitter invented lore.

This is `codegen-authority.md`'s "no per-component lore in emitters" invariant transposed to a domain where it has a mechanical check.

The navigational projection is a second, distinct a11y target. Its hierarchy derives from grain (levels), its traversal order from declared ordering (so a by-measure sort in the visual must be a declared derivation the navigation also consumes — otherwise `REL_ORDER_TRAVERSAL_MISMATCH`), and its announced values from units. It is lossy by declaration, which is correct: semantic conservation does not imply structural conservation.

What is mechanically checkable today, and therefore gateable: contrast between adjacent categorical encodings; non-colour-only distinction (derived from channel capacity); accessible name and description derived from task and relation, never separately authored; keyboard operability derived from grain; target size for interactive marks. What is **not** available: an ARIA ontology for analytical forms. WAI-ARIA Graphics Module 1.0 provides `graphics-document`, `graphics-object`, and `graphics-symbol` and nothing form-specific; the W3C SVG Accessibility Task Force's chart-role proposals (`chart`, `dataset`, `datapoint`, `axis`, `legend`, …) were never standardized. The honest claim is *a11y realization is a peer target with declared coverage*, not *accessible charts*.

## The semantic pack

The Sterling analogy is precise in one respect and should be held to it: the **engine** is shared and fixed; the **pack** is governed vocabulary the engine consumes.

- **Engine** (in codegen, deterministic, no I/O — property 2): the field algebra, the derivation typing rules, the three checkability engines, the admissibility judgment, the enumerator. These are axioms and mathematics; they are not configurable per pack.
- **Pack** (authoring source under contracts, compiled to one governed artifact the engine reads — never loose files at runtime): unit dimensions and conversion declarations; **per-target channel inventories with capacities** (a Figma target has no hover; a sonification target has pitch and not hue; a monochrome print target has luminance and texture but no hue — the inventory is what makes "cross-substrate" mean something); the form alias catalogue; the illegal-form corpus with expected diagnostics.

The pack is content-addressed and admitted the way generated artifacts are admitted today: a stale or hand-edited pack is a rail failure, not a warning.

## Design invariants

These are the invariants the first slices are asked to encode structurally. Each names the failure it prevents.

1. **No form name below L4.** No contract field, IR fact, derivation, or diagnostic refers to a chart type. Prevents the emitter becoming the authoring layer (the `BarChart.contract.json` trap).
2. **Forms are derived aliases.** The catalogue is generated from the projection space and the pack; it is never a source of truth. Prevents the catalogue re-becoming a primitive set.
3. **The tabular projection is the lore oracle.** Every visual assertion is recoverable from it. Prevents invented facts.
4. **Layout-generated values carry no positional claim.** Enforced by provenance type. Prevents realization artifacts acquiring semantic standing.
5. **Semantic facts are not style.** The list above lives in the contract; tokens carry only what does not change inference. Prevents the token graph laundering claims.
6. **Rejection is a first-class artifact.** The checker can say no, with a typed `REL_*` diagnostic naming the L0–L3 fact. Prevents a decorative type system.
7. **Unproven preconditions narrow, they do not block.** Unknown grain, untyped units, undeclared closure each remove forms from the admissible set and are ledgered, in the same two-directional ratchet the styling and a11y realization audits use. Prevents fail-closed unusability and prevents silent permissiveness alike.
8. **Non-empty, enumerable residue per family.** Each realization family lists what it carries that the substrate does not. Prevents unfalsifiability.
9. **Rail binds the projection program, not pixels.** Scale domains, label placement, and binning are data-dependent; determinism is claimed for the derivation and the projection, not the rendered image. Prevents over-claiming what the admission rail proves.
10. **A11y projections are derived, never authored beside the visual.** Name, description, table, navigation, and announced values all come from relation + task. Prevents a second interpretation of the data.
11. **Emitters do last-mile syntax only.** Same as components: an emitter reading a relation field is a sign the IR is missing a derivation. Prevents per-target semantic interpretation — which is exactly normal-form falsification condition 3, and exactly what this domain is expected to pressure hardest.
12. **The relation type lives in the contract; rows arrive at runtime with a conformance witness.** Prevents the contract describing data the runtime never checks.

## Cost to the existing architecture

Named up front so they are non-claims from the start and not discoveries later.

- **A runtime type boundary that does not exist today.** Component contracts describe static artifacts; nothing validates incoming data against a contract. Analytical contracts carry a relation *type*; the rows arrive at runtime and must conform. "Does this realization honour its contract" is only checkable if the runtime carries a witness. This is a new seam in every target family, and it is the one place where a target might legitimately need something the IR cannot pre-compute.
- **Determinism changes shape.** Every other target is a pure function of contract and emitter. Analytical pixels are not: domains, ticks, label collision, and bins depend on values. Invariant 9 scopes the rail's claim accordingly.
- **Substrate divergence is worse than for components.** SVG, Canvas, RN/Skia, SwiftUI `Path`, Compose `Canvas`, Figma vectors share no layout model, no flexbox, and differ in path and text-measurement semantics. DOM affordances carry almost nothing. This makes the lowering harder and the test better; per-target channel inventories in the pack are the mechanism that keeps the divergence in data rather than in emitter branches.
- **Expressiveness versus checkability.** Real analytical data has unknown grain and string units. Invariant 7 is the resolution: incompleteness is a declared state that narrows admissibility and is ledgered, not a failure that blocks authoring.
- **Where it lives** (decision D1, recommended, not decided): relation contracts at `packages/ds-contracts/relations/<Name>/<Name>.relation.json` against a new `relation.contract.schema.json`; pack authoring source at `packages/ds-contracts/analytical-pack/`; engine at `packages/ds-codegen/src/analytical/` with its own `RelationIR` / `ProjectionIR` module rather than growing `ir.ts` (the god-object gate is set to warn, and this is a genuinely separate arm). Emitters extend the existing target packs so tokens, styles, admission, and the CI generated-tree diff apply unchanged. The existing `Table` component (`CODEGEN-TABLE-COMPOUND-PARTS-REALIZATION-01`) is the natural realization of the tabular projection and would become the first component consumed *by* an analytical projection (decision D2, recommended).

## Order of construction and what each stage falsifies

The order is forced by dependencies, which is why it is doctrine rather than schedule: the oracle must exist before the thing it checks; the type must be able to reject before it is asked to accept.

| Stage | Builds | Falsifier | Stop condition |
|---|---|---|---|
| 0 | This doctrine and the **illegal-form corpus** (machine-readable, ~30 entries, each with an expected `REL_*` diagnostic). No code. | Can every entry be described in L0–L3 vocabulary without a form name? | An entry that can only be described as "a bad *X*-chart" means the vocabulary is incomplete; fix the vocabulary, not the entry. |
| 1 | L0–L2: field algebra, relation schema, measure aggregability; the three checkability engines as pure functions. | The illegal corpus rejects with the expected diagnostics; a legal corpus accepts. **Metric: count of distinct rejection diagnostics**, not chart types. | Fewer than ~20 distinct diagnostics → the type system is decorative; stop and reassess before any geometry. |
| 2 | L3 view algebra with typing rules and the five-kind classification. | `bin` on ratio yields interval + count; unequal widths force density; `aggregate-to-grain` refuses non-additive rollups; `graph` enforces conservation. | A derivation whose output type cannot be stated without reference to how it will be drawn. |
| 3 | L3.5 task table, L4 projection space, the **enumerator**, and the alias catalogue *generated* from it. | For each of four probe relations (a categorical-vs-ratio relation, a binned ratio field, an OHLC-over-interval relation, a nested hierarchy) the enumeration contains the expected forms and excludes the corpus's illegal ones; a graph relation is enumerable only with non-metric position. | An expected form reachable only by adding a form-specific field to any layer below L4. |
| 4 | The **tabular** realization first (via `Table`), then one visual realization (SVG in the DOM, one web family). | The lore oracle: every visual assertion is derivable from the table. Then the four probes plus a force layout lowered through the same IR. | A visual assertion with no tabular derivation that is *not* classified perceptual-only. |
| 5 | Navigational and textual a11y projections; WCAG gates derived from channel capacity; the residue enumeration per family. | Traversal order equals declared order under a by-measure sort; non-colour-only forced by hue capacity; each family's residue listed and non-empty. | Empty residue for any family. |
| 6 | Cross-substrate: the remaining web families, React Native, then a native target and Figma, each via its pack channel inventory. | Same IR, no per-target semantic interpretation (normal-form condition 3 under direct test). | A target that needs a relation field the IR did not pre-derive — this is the informative outcome, to be recorded as IR growth, not patched in the emitter. |

Two adversaries are deliberately early. The OHLC relation *looks* like a chart type and is actually a constrained relation; if the substrate expresses it with no `candlestick` concept below L4, that is strong evidence. The graph relation is the opposite case — position is not data — and forces the projection layer to be able to decline a claim.

## Illegal-form corpus (seed)

The cause column is written in L0–L3 vocabulary only. The colloquial column exists to show that the name is downstream of the cause.

| Id | Asserted projection | Ill-typed because | Colloquially |
|---|---|---|---|
| `REL_MEANINGFULNESS_ORDINAL_MEAN` | `aggregate: mean` over an `ordinal` field | mean is not invariant under monotone transformation | "average satisfaction score" |
| `REL_MEANINGFULNESS_INTERVAL_RATIO` | ratio comparison (length from zero) on an `interval` field | ratio undefined without a meaningful zero | bar of temperatures |
| `REL_BASELINE_RATIO_CLAIM` | comparison task; length channel; baseline ≠ 0 | ratio comparability invariant violated | truncated-axis bar |
| `REL_ADDITIVITY_STACK_SEMIADDITIVE` | `partition → order` along length on a `semi-additive` measure over its non-additive dimension | stack asserts additivity the measure lacks | stacked inventory over time |
| `REL_PARTITION_NOT_EXHAUSTIVE` | composition task over parts that do not cover the declared whole | composition invariant needs exhaustiveness | pie of top-5 |
| `REL_PARTITION_OVERLAPPING` | composition task over non-exclusive parts | parts double-count the whole | pie of multi-select answers |
| `REL_PROPORTION_WHOLE_UNDECLARED` | `proportion` field with no declared whole | normalization base absent | "percent of…?" |
| `REL_RATIO_MEASURE_AVERAGED` | `aggregate: mean` over a rate measure on rollup | must re-derive numerator/denominator | average of per-capita rates |
| `REL_GRAIN_FANOUT` | `join` at cardinality 1:N followed by sum on the 1-side measure | duplicated rows inflate the sum | double-counted revenue |
| `REL_GRAIN_SUBTOTAL_MISMATCH` | `nest` with subtotals not at a declared grain | subtotal derivation undefined | nested table with wrong totals |
| `REL_UNIT_INCOMMENSURABLE_AXES` | two positional channels in one coordinate space carrying different unit dimensions with no declared relation | dimensional analysis fails | dual-axis line |
| `REL_UNIT_SUM_ACROSS_CURRENCY` | `aggregate: sum` over a currency field with mixed units and no rate | not summable | "total revenue" across currencies |
| `REL_INDEX_BASE_MISSING` | `index` field without base | rebased value has no referent | "index = 100" with no anchor |
| `REL_BIN_UNEQUAL_COUNT` | `bin` with unequal widths; count → length | area-density invariant violated | misleading histogram |
| `REL_BIN_CLOSURE_UNDECLARED` | `bin` with no declared closure | boundary membership ambiguous | which bin gets 10.0? |
| `REL_TEMPORAL_INTERVAL_AS_INSTANT` | `interval` temporality encoded to a point position | extent lost without declaration | OHLC bars drawn as points |
| `REL_NULL_INTERPOLATE_UNDECLARED` | change task; connection across a `not-applicable` or `censored` null; no mechanism declared | interpolation asserts a value that is not there | line through a gap |
| `REL_UNCERTAINTY_DROPPED_UNDECLARED` | field with `interval` uncertainty projected to a point mark, not classified lossy | loss unstated | point estimate only |
| `REL_CYCLIC_ANGLE_NONCYCLIC` | `nominal` field → angle, polar | angle licensed by cyclic scale only | radial bar of regions |
| `REL_AREA_INTERVAL_SCALE` | `interval` field → area | area carries ratio only | bubble of temperatures |
| `REL_HUE_CARRIES_ORDER` | `ordinal` field → hue | hue is nominal-capacity | rainbow ordinal legend |
| `REL_COLOR_ONLY_DISTINCTION` | nominal distinction on hue alone with no redundant channel | distinction not conserved under hue loss | colour-only series |
| `REL_DIVERGING_MIDPOINT_UNDECLARED` | diverging luminance scale with no declared midpoint | the midpoint is a claim | red/blue heat map, arbitrary centre |
| `REL_KEY_ENCODED_TO_CHANNEL` | identity field → hue / size | keys are not categories | one colour per user id |
| `REL_PROVENANCE_LAYOUT_POSITION_CLAIM` | `layout-generated` position under a correlation or comparison task | position carries no data | reading distance off a force graph |
| `REL_FLOW_NOT_CONSERVED` | `graph` with `flow: conserved`; edge measures violate conservation; no leakage declared | conservation invariant | leaking sankey |
| `REL_ORDER_TRAVERSAL_MISMATCH` | visual sorted by measure; navigational projection traverses intrinsic order | ordering derivation not shared | a11y reads A→Z, chart shows rank |
| `REL_SORT_AS_RENDER_OPTION` | by-measure sort declared in style, not as a derivation | ordering is semantic | "sort: desc" in a token |
| `REL_LOG_SCALE_ZERO_CLAIM` | log axis transform on a field containing zero or non-positive values, or under a composition task | transform undefined / additivity lost | log-scaled stacked bar |
| `REL_NORMALIZED_STACK_ADDITIVITY` | `normalize` then `partition → order` on a non-additive measure | normalization presumes additivity | 100% stacked averages |

Thirty entries. Stage 0 turns this into a machine-readable corpus; stage 1 must reject every one with the named diagnostic before any projection code exists.

## Falsification conditions

The doctrine is wrong, and should be narrowed or abandoned, if any of the following holds after the corresponding stage:

1. **Lore.** A realization requires a fact not present in the relation, derivation, task, or projection — and the fact is not classifiable as perceptual-only. (Stage 4.)
2. **Oracle.** A visual assertion is not derivable from the tabular projection. (Stage 4.)
3. **Rejection.** The type system cannot reject the illegal corpus with distinct, named diagnostics. (Stage 1.)
4. **Residue.** A realization family shares everything with the substrate. (Stage 5.)
5. **Re-grain.** Rolling up a dimension of a relation breaks a projection or its navigational a11y without any change to the projection declaration — meaning the contract encoded a chart, not a relation. (Stage 3–4.)
6. **Enumeration.** A well-known legal form is reachable only by adding a form-specific field below L4. (Stage 3.)
7. **Condition 3 of the normal form.** A target requires per-target *semantic* interpretation of the relation rather than IR extension. This one is expected to be pressured hardest at stage 6, and the honest outcomes are recorded either way: IR growth refines the claim; an emitter branch on relation content falsifies it.

## What this does not claim

- It does not claim any of this is built. Every path under `governs:` is proposed.
- It does not claim the field algebra is complete. It claims the *layering* is right and expects the fields to grow.
- It does not claim "accessible charts." It claims a11y realization is a peer projection with declared, gateable coverage and a named ceiling.
- It does not claim rendered-pixel determinism, visual quality, or perceptual effectiveness. It claims derivation and projection determinism and type-licensed channel use.
- It does not claim the substrate is universal. The residue principle is the guard against that claim being made by accident.
