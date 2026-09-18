/**
 * The isolated-node graph experiment (REL-GRAPH-NODE-UNIVERSE-01) and the
 * binding-selection correction (REL-GRAPH-BINDING-SELECTS-01).
 *
 * THE QUESTION: can one admitted relational structure preserve an independently
 * declared NODE POPULATION and its edge incidence through two produced
 * representations, without deriving the node population from the edges and
 * without adding special-case knowledge to a consumer?
 *
 * A graph must preserve something that may have NO corresponding edge
 * observation — an isolated node. A representation that reconstructs its node
 * list from the edge endpoints cannot tell `{n1,n2,n3}` with edges `{(n1,n2)}`
 * from `{n1,n2}` with the same edges.
 *
 * WHAT THE BINDING OWNS, established here: source SELECTION (it names the
 * relations and the source is keyed by those names), KEY QUALIFICATION (the
 * designated identity field is the relation's declared key, not merely a field
 * that resolves), ENDPOINT MEMBERSHIP (every supplied endpoint belongs to the
 * selected universe), and the resulting graph object. A name that resolves is
 * not a semantic qualification, and a caller cannot pair a binding with
 * independently preselected role arrays: no entry point takes them.
 *
 * THE AUTHORITY'S OWN GAP IS RECORDED, NOT REPAIRED. The relation model's `graph`
 * operand names an edge relation and two of its fields and declares NO node
 * relation. The binding is an explicit validated PREMISE; the zod model, schema
 * emission and the stage-2 ledgers are untouched.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTRACTS_DIR } from "./necessity.js";
import { GRAPH_VIEW_AUTHORING_FILE, GraphViewFile } from "./graph-view-model.js";
import type { GraphViewFileDecl } from "./graph-view-model.js";
import type { RelationalStructure } from "./relation-model.js";

/**
 * THE NAMED RELATIONAL SOURCE. Rows are keyed by RELATION NAME, so the binding's
 * names select them: a caller supplies ONE source, and which populations it
 * denotes is the binding's decision rather than the caller's arrangement of
 * arrays.
 */
export type GraphSource = {
  structure: RelationalStructure;
  rows: Record<string, ReadonlyArray<Record<string, unknown>>>;
};

/**
 * THE DECLARED NODE UNIVERSE. `nodes` names the relation whose rows ARE the node
 * universe and the field that KEYS it; `edges` names the relation whose rows are
 * the incidence and the two fields that reference a node. Nothing is inferred
 * from a field name.
 */
export type GraphBinding = {
  nodes: { relation: string; keyField: string };
  edges: { relation: string; fromField: string; toField: string };
};

export type GraphResult = {
  /** The declared node population, in declared order. */
  nodes: string[];
  /** The incidence, as ordered endpoint pairs. */
  edges: Array<{ from: string; to: string }>;
  /** Nodes that no edge touches. These are the reason the binding must be declared. */
  isolates: string[];
};

/**
 * Whether a binding denotes a graph over this source. Three-valued for the same
 * reason the analytical judgment is: a CONTRADICTION is refused, a MISSING
 * premise is carried, and only a discharged binding denotes a graph.
 */
export type GraphAdmission =
  | { kind: "denoted"; graph: GraphResult; selected: { nodes: string; edges: string } }
  | { kind: "unproven"; obligation: string; reason: string };

/**
 * The binding SELECTS from the source by name and QUALIFIES what it selected:
 * the identity field must be the node relation's declared key, and every
 * supplied endpoint must belong to the selected universe.
 */
export function denoteGraph(binding: GraphBinding, source: GraphSource): GraphAdmission {
  // Declared with an explicit function type so the calls narrow the code after
  // them: a `const` arrow with only a return annotation is not treated as a
  // never-returning call target for control-flow analysis.
  const refuse: (reason: string) => never = (reason) => {
    throw new Error(`the graph binding is refused: ${reason}`);
  };

  const nodeRel = source.structure.relations[binding.nodes.relation];
  if (!nodeRel) refuse(`the node universe names relation ${binding.nodes.relation}, which the structure does not declare`);
  const edgeRel = source.structure.relations[binding.edges.relation];
  if (!edgeRel) refuse(`the incidence names relation ${binding.edges.relation}, which the structure does not declare`);
  if (binding.nodes.relation === binding.edges.relation) {
    refuse("the node universe and the incidence must be different relations: deriving one from the other is what this binding exists to prevent");
  }

  // KEY QUALIFICATION. A field that resolves is not thereby an identity.
  const keyField = nodeRel.fields?.[binding.nodes.keyField];
  if (!keyField) refuse(`the node universe keys on ${binding.nodes.relation}.${binding.nodes.keyField}, which the relation does not declare`);
  if (keyField.key !== true) {
    refuse(`${binding.nodes.relation}.${binding.nodes.keyField} resolves but is not the relation's declared key, so it does not establish a node identity`);
  }
  for (const f of [binding.edges.fromField, binding.edges.toField]) {
    if (!edgeRel.fields?.[f]) refuse(`the incidence names ${binding.edges.relation}.${f}, which the relation does not declare`);
  }

  // A MISSING population is CARRIED, never silently empty.
  const nodeRows = source.rows[binding.nodes.relation];
  const edgeRows = source.rows[binding.edges.relation];
  if (!nodeRows) {
    return { kind: "unproven", obligation: "invariant:population-declared", reason: `no rows are supplied for the node universe ${binding.nodes.relation}` };
  }
  if (!edgeRows) {
    return { kind: "unproven", obligation: "invariant:population-declared", reason: `no rows are supplied for the incidence ${binding.edges.relation}` };
  }

  const nodes = nodeRows.map((r) => {
    const v = r[binding.nodes.keyField];
    if (typeof v !== "string") refuse(`a row of ${binding.nodes.relation} does not carry a string ${binding.nodes.keyField}`);
    return v;
  });
  const universe = new Set(nodes);
  const edges = edgeRows.map((r) => {
    const from = r[binding.edges.fromField];
    const to = r[binding.edges.toField];
    if (typeof from !== "string" || typeof to !== "string") {
      refuse(`a row of ${binding.edges.relation} does not carry string ${binding.edges.fromField}/${binding.edges.toField}`);
    }
    // ENDPOINT MEMBERSHIP. A contradictory endpoint is REFUSED, not dropped.
    if (!universe.has(from)) refuse(`${binding.edges.relation}.${binding.edges.fromField} names ${from}, which the selected node universe does not contain`);
    if (!universe.has(to)) refuse(`${binding.edges.relation}.${binding.edges.toField} names ${to}, which the selected node universe does not contain`);
    return { from, to };
  });

  const touched = new Set(edges.flatMap((e) => [e.from, e.to]));
  return {
    kind: "denoted",
    graph: { nodes, edges, isolates: nodes.filter((n) => !touched.has(n)) },
    selected: { nodes: binding.nodes.relation, edges: binding.edges.relation },
  };
}

/** The denoted graph, or a throw naming why the binding does not denote one. */
export function graphOf(binding: GraphBinding, source: GraphSource): GraphResult {
  const admission = denoteGraph(binding, source);
  if (admission.kind !== "denoted") throw new Error(`the binding does not denote a graph: ${admission.reason}`);
  return admission.graph;
}

/**
 * A representation that DERIVES its node list from edge endpoints. It is not a
 * projection this system produces; it is the counterexample the experiment must
 * beat, kept here so the collapse is exhibited rather than asserted.
 */
export function deriveNodesFromEdges(result: GraphResult): string[] {
  return [...new Set(result.edges.flatMap((e) => [e.from, e.to]))].sort();
}

/* ------------------------------------------------------- representations */

/** A relational readback: the two populations, kept apart and explicit. */
export type RelationalGraphOutput = {
  kind: "relational";
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
};

/**
 * An incidence-oriented output: every node carries its incident edges, and an
 * isolated node is present WITH NO INCIDENT EDGES rather than absent. This is the
 * representation whose shape would tempt a consumer to reconstruct the node list
 * from the edges, so it states the node list explicitly.
 */
export type IncidenceOutput = {
  kind: "incidence";
  entries: Array<{ node: string; incident: Array<{ from: string; to: string }> }>;
};

export type GraphOutputs = { relational: RelationalGraphOutput; incidence: IncidenceOutput };

export function produceGraph(result: GraphResult): GraphOutputs {
  return {
    relational: { kind: "relational", nodes: [...result.nodes], edges: result.edges.map((e) => ({ ...e })) },
    incidence: {
      kind: "incidence",
      entries: result.nodes.map((node) => ({ node, incident: result.edges.filter((e) => e.from === node || e.to === node).map((e) => ({ ...e })) })),
    },
  };
}

/** Recovers the graph from the RELATIONAL output alone. */
export function decodeRelationalGraph(o: RelationalGraphOutput): GraphResult {
  const touched = new Set(o.edges.flatMap((e) => [e.from, e.to]));
  return { nodes: [...o.nodes], edges: o.edges.map((e) => ({ ...e })), isolates: o.nodes.filter((n) => !touched.has(n)) };
}

/** Recovers the graph from the INCIDENCE output alone. */
export function decodeIncidence(o: IncidenceOutput): GraphResult {
  const nodes = o.entries.map((e) => e.node);
  // THE KEY MUST BE COLLISION-FREE UNDER CONCATENATION AMBIGUITY. Joining the
  // endpoints with a separator maps ("a->b","c") and ("a","b->c") to the same
  // text, so one of two distinct edges would be silently dropped. An ordered
  // pair, JSON-encoded, has no such collision.
  const seen = new Map<string, { from: string; to: string }>();
  for (const e of o.entries) for (const inc of e.incident) seen.set(JSON.stringify([inc.from, inc.to]), { ...inc });
  const edges = [...seen.values()];
  const touched = new Set(edges.flatMap((e) => [e.from, e.to]));
  return { nodes, edges, isolates: nodes.filter((n) => !touched.has(n)) };
}

export function recoverGraph(o: RelationalGraphOutput | IncidenceOutput): GraphResult {
  return o.kind === "relational" ? decodeRelationalGraph(o) : decodeIncidence(o);
}

/* ----------------------------------------------------------- experiment */

const sameGraph = (a: GraphResult, b: GraphResult) =>
  JSON.stringify(a.nodes) === JSON.stringify(b.nodes) && JSON.stringify(a.edges) === JSON.stringify(b.edges);

export type GraphPreservationReport = {
  result: GraphResult;
  relational: { ok: boolean; recovered: GraphResult };
  incidence: { ok: boolean; recovered: GraphResult };
  /** The counterexample: what a node-from-edges representation would report. */
  derivedFromEdges: { nodes: string[]; distinguishesThePair: boolean };
  /**
   * The identity mutation, applied to the PRODUCED incidence output: one entry's
   * node identity moves while the node count and the edge set are held fixed.
   */
  mutatedIsolate: { recovered: GraphResult; ok: boolean; countAndEdgesUnchanged: boolean };
};

/**
 * The pair partner: the same graph with its isolated node removed. A graph with
 * no isolate has no such neighbour, and returns `undefined` rather than a
 * silently identical copy, so "there is nothing to distinguish here" is a value
 * and not an accident.
 */
export function isolateRemoved(a: GraphResult): GraphResult | undefined {
  const isolate = a.isolates[0];
  if (isolate === undefined) return undefined;
  return { nodes: a.nodes.filter((n) => n !== isolate), edges: a.edges.map((e) => ({ ...e })), isolates: [] };
}

/** Mutates the PRODUCED output directly, instead of re-encoding a mutated result. */
export function renameInOutput<T extends RelationalGraphOutput | IncidenceOutput>(output: T, from: string, to: string): T {
  if (output.kind === "relational") {
    return { ...output, nodes: output.nodes.map((n) => (n === from ? to : n)) } as T;
  }
  return { ...output, entries: output.entries.map((e) => (e.node === from ? { ...e, node: to } : e)) } as T;
}

export function graphPreservation(binding: GraphBinding, source: GraphSource): GraphPreservationReport {
  const result = graphOf(binding, source);
  const outputs = produceGraph(result);
  const relational = recoverGraph(outputs.relational);
  const incidence = recoverGraph(outputs.incidence);

  const derived = deriveNodesFromEdges(result);
  const partner = isolateRemoved(result);
  const derivedPair = partner === undefined ? undefined : deriveNodesFromEdges(partner);

  const isolate = result.isolates[0];
  const mutatedOutput = isolate === undefined ? outputs.incidence : renameInOutput(outputs.incidence, isolate, `${isolate}-impostor`);
  const recoveredMutation = recoverGraph(mutatedOutput);

  return {
    result,
    relational: { ok: sameGraph(relational, result), recovered: relational },
    incidence: { ok: sameGraph(incidence, result), recovered: incidence },
    derivedFromEdges: {
      nodes: derived,
      distinguishesThePair: derivedPair !== undefined && JSON.stringify(derived) !== JSON.stringify(derivedPair),
    },
    mutatedIsolate: {
      recovered: recoveredMutation,
      ok: sameGraph(recoveredMutation, result),
      countAndEdgesUnchanged:
        recoveredMutation.nodes.length === result.nodes.length && JSON.stringify(recoveredMutation.edges) === JSON.stringify(result.edges),
    },
  };
}

/* -------------------------------------------------------------- ledger */

export const GRAPH_LEDGER = path.join(CONTRACTS_DIR, "analytical-fixtures/graph-experiment.json");

export const GRAPH_NON_CLAIMS = [
  "This is a bounded experiment on ONE source holding two candidate node universes and one edge relation, plus its isolate-removal neighbor. It does not establish arbitrary graph realization, does not implement a layout, marks, interaction or accessibility, and does not establish the complete projection thesis.",
  "NO CANONICAL-MODEL INTEGRATION. The authority's graph operand declares no node relation, so the binding is an explicit validated PREMISE; the zod model, schema emission and the stage-2 ledgers are untouched. What this slice measures is what the binding OWNS — source selection, key qualification, endpoint membership and the resulting graph object — so that a later placement decision integrates measured semantics rather than a promising shape.",
  "The graph tests construct the source directly and do not invoke the analytical judge, so they establish binding resolution, selection and representation preservation, not graph-specific semantic admission through the full authority.",
  "The two representations differ in shape, not in substrate: both are inspectable data structures, and neither is rendered.",
  "The key check establishes that the designated field carries `key: true`. It does NOT establish that every supplied identity is unique, and it is NOT a general source-key integrity proof.",
  "The supplied arrays ARE the selected populations for a snapshot. How a partially fetched population should be interpreted is not established here, and `not observed yet` is not silently read as `outside the universe`.",
  "The graph-valued result carries STRING identities and directed endpoint pairs. Labels, weights, layout and arbitrary multigraph behaviour have not earned preservation claims merely because their source fields exist.",
];

/**
 * THE CANONICAL LOADER. The authored file is parsed and validated against the
 * definition the emitted schema is rendered from, so a declaration enters
 * through the project's own path rather than as a hand-built TypeScript object
 * beside a separately checked schema.
 */
export function loadGraphViews(contractsDir = CONTRACTS_DIR): {
  declaration: GraphViewFileDecl;
  source: GraphSource;
  views: Map<string, GraphBinding>;
} {
  const file = path.join(contractsDir, GRAPH_VIEW_AUTHORING_FILE);
  const parsed = GraphViewFile.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
  if (!parsed.success) {
    throw new Error(`the authored graph views at ${GRAPH_VIEW_AUTHORING_FILE} do not validate: ${JSON.stringify(parsed.error.issues[0])}`);
  }
  const declaration = parsed.data;
  const views = new Map<string, GraphBinding>(declaration.views.map((v) => [v.id, v.binds as GraphBinding]));
  return { declaration, source: { structure: declaration.structure, rows: declaration.rows }, views };
}

/** The view ids the experiment's decisive pair uses, as authored. */
export const VIEW_ALL_NODES = "GV_ALL_NODES";
export const VIEW_CONNECTED_SET = "GV_CONNECTED_SET";

const attempt = (f: () => unknown): string => {
  try {
    f();
    return "ACCEPTED";
  } catch (err) {
    return (err as Error).message;
  }
};

/**
 * The retained result. It carries the CONCRETE SOURCE, both bindings over it, the
 * two representations' recovered graphs, the counterexample's collapse, the
 * qualification refusals and the direct output mutation — not a verdict.
 */
export function graphLedger(): Record<string, unknown> {
  const { source, views } = loadGraphViews();
  const allNodes = views.get(VIEW_ALL_NODES);
  const connectedSet = views.get(VIEW_CONNECTED_SET);
  if (!allNodes || !connectedSet) throw new Error(`the authored file must declare ${VIEW_ALL_NODES} and ${VIEW_CONNECTED_SET}`);
  const all = graphPreservation(allNodes, source);
  const connected = graphPreservation(connectedSet, source);

  const ambiguous: GraphResult = { nodes: ["a", "b", "c"], edges: [{ from: "a->b", to: "c" }, { from: "a", to: "b->c" }], isolates: [] };
  const ambiguousDecoded = recoverGraph(produceGraph(ambiguous).incidence);
  const missing = denoteGraph(allNodes, { structure: source.structure, rows: { links: source.rows.links } });

  return {
    $comment:
      "The isolated-node graph experiment (REL-GRAPH-NODE-UNIVERSE-01), its binding-selection correction (REL-GRAPH-BINDING-SELECTS-01), and the canonical graph-view integration (REL-GRAPH-VIEW-CANONICAL-01). The views are AUTHORED in analytical-fixtures/graph-views.json and loaded through the canonical parser; regenerate with `tsx packages/ds-codegen/src/analytical/graph-projection.ts --record`.",
    authoredFrom: GRAPH_VIEW_AUTHORING_FILE,
    schemaEmittedFrom: "graph-view-model.ts",
    viewIds: [...views.keys()],
    question:
      "Can one admitted relational structure preserve an independently declared node population and its edge incidence through two produced representations, without deriving the node population from the edges and without special-case consumer knowledge?",
    selectionControl: {
      what: "ONE authored source holds two candidate node universes and one edge relation; only the PARSED binding changes",
      sourceRelations: Object.keys(source.structure.relations),
      byAllNodes: { selected: all.result.nodes, edges: all.result.edges, isolates: all.result.isolates },
      byConnectedSet: { selected: connected.result.nodes, edges: connected.result.edges, isolates: connected.result.isolates },
      selectionChanged: JSON.stringify(all.result.nodes) !== JSON.stringify(connected.result.nodes),
      edgeRelationIdentical: JSON.stringify(all.result.edges) === JSON.stringify(connected.result.edges),
    },
    recovered: {
      allNodes: { relational: all.relational.recovered, incidence: all.incidence.recovered, bothPreserve: all.relational.ok && all.incidence.ok },
      connectedSet: { relational: connected.relational.recovered, incidence: connected.incidence.recovered, bothPreserve: connected.relational.ok && connected.incidence.ok },
    },
    counterexample: {
      what: "a representation that derives its node list from edge endpoints",
      derivedForAllNodes: deriveNodesFromEdges(all.result),
      derivedForConnectedSet: deriveNodesFromEdges(connected.result),
      distinguishesThePair: all.derivedFromEdges.distinguishesThePair,
    },
    qualification: {
      keyThatResolvesButIsNotTheKey: attempt(() => denoteGraph({ ...allNodes, nodes: { relation: "all_nodes", keyField: "label" } }, source)),
      endpointOutsideTheSelectedUniverse: attempt(() => denoteGraph(allNodes, { ...source, rows: { ...source.rows, links: [{ src: "n1", dst: "n9", weight: 1 }] } })),
      missingPopulation: missing.kind === "unproven" ? { carried: missing.obligation, reason: missing.reason } : "ACCEPTED",
      nodeUniverseIsTheEdgeRelation: attempt(() => denoteGraph({ nodes: { relation: "links", keyField: "src" }, edges: { relation: "links", fromField: "src", toField: "dst" } }, source)),
    },
    identityMutation: {
      what: "the isolated node's identity moves IN THE PRODUCED OUTPUT while the node count and the edge set are held fixed",
      recovered: all.mutatedIsolate.recovered,
      detected: !all.mutatedIsolate.ok,
      countAndEdgesUnchanged: all.mutatedIsolate.countAndEdgesUnchanged,
    },
    decoderCollision: {
      what: "two distinct edges whose endpoint strings compose to the same joined text under a separator-keyed deduplication",
      input: ambiguous.edges,
      recovered: ambiguousDecoded.edges,
      bothSurvive: ambiguousDecoded.edges.length === ambiguous.edges.length,
    },
    authorityGap: {
      operand: { from: "relation", edgeFrom: "field", edgeTo: "field", value: "field" },
      declaresANodeRelation: false,
      note: "the relation-valued graph derivation is unchanged and retains its documented edge-relation meaning; the graph VIEW is a separate declaration family whose result is a graph, accounted under its own identity rather than by extending the relation algebra",
    },
    nonClaims: GRAPH_NON_CLAIMS,
  };
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly && process.argv.includes("--record")) {
  fs.writeFileSync(GRAPH_LEDGER, `${JSON.stringify(graphLedger(), null, 2)}\n`);
  console.log(`graph-projection: recorded ${GRAPH_LEDGER}`);
}
