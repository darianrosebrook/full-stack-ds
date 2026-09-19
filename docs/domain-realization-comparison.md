---
doc_id: ARCH-DOMAIN-REALIZATION-COMPARISON-001
authority: architecture
status: active
title: Domain Authority and Realization Comparison
owner: "@darianrosebrook"
updated: 2026-09-19
governs:
  - docs/research-program.md
---

# Domain Authority and Realization Comparison

This document owns the comparison between governed domains in the research
program. It records how each domain moves from authored meaning to realization,
how the domains integrate, and what a new domain must contribute before it
counts as an extension of the thesis. It does not replace each domain's doctrine
or the [current implementation snapshot](current-implementation-snapshot.md),
which remains authoritative for current proof strength.

The initial comparison contains the three realization authorities examined
here. The broader research program also names design tokens, documentation,
generated evidence, and target-pack infrastructure. Their absence from these
tables is a comparison-scope decision, not a claim that they are not governed
domains. Any existing research-program row or newly proposed domain can become
the next comparison entry through the admission record below.

## The comparison vocabulary

Each domain is described through the same questions without requiring the same
implementation:

- **Authority** — the smallest authored representation allowed to define meaning.
- **Normalized substrate** — the typed facts downstream consumers may interpret.
- **Composition** — the operations that build higher-order artifacts from those
  facts.
- **Projection** — a derived view for a target or consumer. In the analytical
  domain this specifically means relation-to-geometry; elsewhere it means a
  target or consumer view of authority.
- **Realization** — an executable, inspectable, or resource-native artifact.
- **Conservation** — the meaning that must survive a projection.
- **Residue** — target-specific facts that legitimately remain outside the
  shared substrate.
- **Refusal** — the named condition under which the system declines to derive or
  admit an artifact.
- **Evidence** — the independent or derived observations that bound the claim.

The shared object is this discipline. There is no universal repository-wide IR
that erases the semantic differences among components, glyphs, and analytical
relations.

## Authority and integration map

~~~mermaid
flowchart TB
  method["Shared normal-form discipline<br/>authority → normalization → composition → projection → evidence"]

  subgraph components["Components"]
    componentAuthority["Component contract<br/>token and style sidecars"]
    componentIR["ComponentIR"]
    componentEmitters["Registered target emitters"]
    componentOutputs["Framework packages, native projections,<br/>descriptors and consumer views"]
    componentAuthority --> componentIR --> componentEmitters --> componentOutputs
  end

  subgraph icons["Iconography"]
    iconAuthority["Icon contract<br/>identity, semantics, authored geometry"]
    iconCatalog["Validated glyph catalog"]
    iconOutputs["SVG and platform-native glyph resources"]
    iconAuthority --> iconCatalog --> iconOutputs
  end

  subgraph analytics["Analytical relations"]
    analyticalAuthority["Relational structure<br/>assertion, task and evidence"]
    analyticalJudgment["Typed relation and three-valued judgment"]
    analyticalAlgebra["Derivation algebra"]
    analyticalExperiment["Bounded projection and lowering experiment"]
    analyticalAuthority --> analyticalJudgment --> analyticalAlgebra --> analyticalExperiment
  end

  method -. "method, not runtime dependency" .-> componentAuthority
  method -. "method, not runtime dependency" .-> iconAuthority
  method -. "method, not runtime dependency" .-> analyticalAuthority

  iconAuthority -. "known-name validation" .-> componentAuthority
  iconCatalog -. "Web resolver and native catalogs" .-> componentEmitters
~~~

The two icon-to-component edges are implemented. The analytical lane does not
feed ComponentIR or the registered component emitters. Its current projection
and lowering code is a bounded experiment over analytical authority, not another
source of component semantics.

## Mechanism comparison

| Domain | Authority | Normalized substrate | Governed composition | Realization families |
| --- | --- | --- | --- | --- |
| Components | Component contract plus token and style sidecars. Usage sidecars document compositions but do not define codegen semantics. | ComponentIR and its focused semantic facts for anatomy, state, behavior, accessibility, tokens, styles and references. | DOM anatomy, the Stack primitive, component references, composer slots, behavior primitives and closed binding operations. | Web framework packages, React Native, bounded native and engine projections, Figma descriptors, A2UI and documentation views. |
| Iconography | icons/Name/Name.icon.json: stable identity, semantic defaults, RTL policy, provenance and size-specific vector payloads. | A validated glyph catalog and resolved size variant. Iconography does not share ComponentIR; component consumption receives a dedicated IconGlyphIR fact. | Stable glyph identity composed from separately authored size variants and ordered path records; component contracts may bind icon-name and size props to an SVG node. | SVG files and sprite symbols, Web and React Native components, Android vector XML, Swift and Kotlin resources. |
| Analytical relations | A typed relational structure plus declarations of derivation, task and available evidence. | The L0–L2 relational kernel, typed L3 derivation results, bound analytical operations and three-valued judgments. | Typed relational operators; a bounded stage-three experiment forms projection programs from coordinate and channel products and admits, refuses or carries them as undecided. | The experiment lowers exactly two declared program topologies to readback and metric representations. General visual, tabular, textual, navigational and cross-substrate realization remains outside the ratified claim. |

## Conservation, refusal, and evidence

| Domain | Meaning that must survive | Legitimate target residue | Refusal boundary | Current evidence and boundary |
| --- | --- | --- | --- | --- |
| Components | Anatomy, public types, state channels, declared behavior, accessibility relationships, token/style commitments and component references. | Framework reactivity, host APIs, event spelling, platform interaction physics and target-native resource syntax. | Schema and semantic validation reject unresolved or contradictory facts; target emitters explicitly refuse unsupported shapes. | Generated-artifact admission and bounded runtime facts establish the strongest end-to-end result in the repository. They do not establish broad behavioral parity, visual quality or complete accessibility adequacy. |
| Iconography | Canonical glyph identity, the selected authored geometry, semantic defaults and provenance. | Platform path capabilities, resource naming, accessibility wrappers and target-specific unsupported geometry recorded as residuals. | Contract validation rejects malformed identity, geometry and naming; component semantic validation rejects unknown literal icon references. | Build drift checks and the content-addressed emission ledger bind governed inputs to emitted bytes. They do not establish visual equivalence on every platform. |
| Analytical relations | Grain, field meaning, licensed derivations, task-required claims, induced encoding claims and qualified judgment premises. | Perceptual behavior, navigation, interaction and rendering properties belonging to a realization family. This residue is still unmeasured at realization level. | The engine returns admissible, illegal with causes, or unproven with missing obligations; the bounded enumerator also records unsupported tasks and unrealized programs. | The L0–L2 kernel is ratified. L3 subtraction remains open. The bounded stage-three enumerator and two lowerings run as an experiment and do not ratify coordinates, general projection, rendered behavior or cross-substrate conservation. |

## Live integration edges

### Iconography into component realization

1. The icon corpus owns canonical names and vector payloads.
2. An anatomy.dom[].iconGlyph directive identifies the component prop carrying
   the icon name and, optionally, its size.
3. generate:check validates literal names supplied through component references
   and usage compositions against the committed icon corpus.
4. IR construction parses the directive into IconGlyphIR.
5. The Web DOM emitters import the icon catalog resolver and lower resolved path
   records without branching on an icon or component name. SwiftUI and Compose
   instead generate target-native glyph catalogs from the same icon authority.

The React Native component emitter currently clears the icon-glyph fact, so its
generated Icon component does not render the standalone React Native glyphs this
package emits. The Figma component descriptor carries Icon props and metadata
without vector geometry. These are explicit realization gaps, not alternate
authorities.

This is an authority edge, not an authority merge: the icon contract still owns
the glyph, while the component contract owns how and why that glyph appears in a
component.

### Analytical relations beside component realization

Analytical authority currently terminates in its own judgment, derivation,
projection-experiment and evidence surfaces. It does not generate design-system
components, enter ComponentIR, or authorize component behavior. A future UI
consumer may render an admitted analytical program with design-system
components, but that consumer would be a downstream integration and would not
move analytical meaning into the component contract.

### Evidence substrate reused across domains

The icon emission ledger's core records only governed input fingerprints,
emitted byte fingerprints and their relation. ledger-components.mjs applies
that core to component generation without making it component-shaped. This is a
cross-domain mechanism reuse. The component, icon and analytical semantic models
remain separate.

## Admitting another comparison entry

A fourth entry belongs in this comparison only when all of these questions have
concrete answers:

1. **Distinct authority:** What authored meaning does this domain own that no
   existing domain owns?
2. **Composition pressure:** Which higher-order artifacts or transformations must
   be derived from it?
3. **Heterogeneous realization:** Which genuinely different consumers or targets
   test the abstraction?
4. **Conservation law:** What must every lawful projection preserve?
5. **Residue:** What must remain target-specific, and how will that residue be
   inventoried?
6. **Typed refusal:** Which invalid or unsupported cases can the substrate name
   without guessing?
7. **Independent falsifier:** What observation could show that the authority or
   normalization is wrong rather than merely self-consistent?
8. **Non-catalogue result:** What new artifact can appear without adding a branch
   named after that artifact?
9. **Claim boundary:** What is implemented, admitted, observed and still outside
   the claim?
10. **Integration edges:** Which existing authorities does it consume, and which
    consumers may use it, without transferring ownership accidentally?

Failing the first question indicates a new consumer or target inside an existing
domain. Failing the conservation, residue, refusal, or falsifier questions means
the proposal has not yet established another normal-form experiment.

### Row template

Append one row to each comparison table and add its real integration edges. Use
this record before writing domain-specific narrative:

| Field | Required entry |
| --- | --- |
| Domain | Stable domain name and bounded subject matter |
| Authority | Owning source path and the meaning it alone may define |
| Normalized substrate | Typed form consumed by downstream composition |
| Composition | Closed operators or primitives and their constraints |
| Realizations | At least two heterogeneous target or consumer families, or an explicit experimental boundary |
| Conservation | Meaning every lawful projection must retain |
| Residue | Facts owned only by each realization family |
| Refusal | Named invalid, unsupported and insufficient-evidence outcomes |
| Evidence | Derived checks and at least one independent falsifier |
| Current boundary | Implemented, admitted, observed and unproven claims stated separately |
| Integration edges | Inputs consumed from, and outputs exposed to, existing domains |
| Non-catalogue result | A derived result that did not require an artifact-specific branch |

When a domain's proof strength changes, update its doctrine and the canonical
snapshot first, then reconcile this comparison and the
[research program](research-program.md). Avoid copying volatile counts here;
use governed claim markers or cite the deriving authority.

## Detailed authorities

- [Component normal form](normal-form.md)
- [Iconography package authority](../packages/ds-iconography/README.md)
- [Analytical relation doctrine](architecture/analytical-relation-doctrine.md)
- [Research program](research-program.md)
- [Current implementation snapshot](current-implementation-snapshot.md)
