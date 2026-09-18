/**
 * The isolated-node graph experiment (REL-GRAPH-NODE-UNIVERSE-01).
 *
 * THE QUESTION: can one admitted relational structure preserve an independently
 * declared NODE POPULATION and its edge incidence through two produced
 * representations, without deriving the node population from the edges and
 * without adding special-case knowledge to a consumer?
 *
 * Why this is a different shape from the stock experiment: there the analysis
 * produced a sequence of group/value pairs, every one of them backed by an
 * observation. A graph must preserve something that may have NO corresponding
 * edge observation — an isolated node. A representation that reconstructs its
 * node list from the edge endpoints cannot tell `{n1,n2,n3}` with edges
 * `{(n1,n2)}` from `{n1,n2}` with the same edges, and that pair is the
 * discriminator this module is built around.
 *
 * THE DECLARATION IS THE POINT. The relation model's own `graph` operand names
 * an edge relation and two of its fields (`from`, `edgeFrom`, `edgeTo`,
 * `value`); it does not name a node relation, so nothing in the authority says
 * `edges.src` ranges over `nodes.id`. Inferring that from the field names is
 * exactly what the doctrine forbids. This module therefore takes the binding as
 * an EXPLICIT PREMISE, validates it against the structure, and records the
 * authority's missing operand as the residual rather than silently repairing it
 * in a decoder.
 */
import fs from "node:fs";
import path from "node:path";
import { CONTRACTS_DIR } from "./necessity.js";
import type { RelationalStructure } from "./relation-model.js";

/** A supplied population: the node rows and the edge rows, kept apart. */
export type GraphRows = { nodes: ReadonlyArray<Record<string, unknown>>; edges: ReadonlyArray<Record<string, unknown>> };

/**
 * THE DECLARED NODE UNIVERSE.
 *
 * `nodes` names the relation whose rows ARE the node universe and the field that
 * keys it. `edges` names the relation whose rows are the incidence and the two
 * fields that reference a node. Nothing here is inferred: every name is stated,
 * and `declareGraphBinding` refuses a declaration that does not resolve.
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

export function declareGraphBinding(structure: RelationalStructure, binding: GraphBinding): GraphBinding {
  const nodeRel = structure.relations[binding.nodes.relation];
  if (!nodeRel) throw new Error(`the node universe names relation ${binding.nodes.relation}, which the structure does not declare`);
  if (!nodeRel.fields?.[binding.nodes.keyField]) {
    throw new Error(`the node universe keys on ${binding.nodes.relation}.${binding.nodes.keyField}, which the relation does not declare`);
  }
  const edgeRel = structure.relations[binding.edges.relation];
  if (!edgeRel) throw new Error(`the incidence names relation ${binding.edges.relation}, which the structure does not declare`);
  for (const f of [binding.edges.fromField, binding.edges.toField]) {
    if (!edgeRel.fields?.[f]) throw new Error(`the incidence names ${binding.edges.relation}.${f}, which the relation does not declare`);
  }
  if (binding.nodes.relation === binding.edges.relation) {
    throw new Error("the node universe and the incidence must be different relations: deriving one from the other is what this binding exists to prevent");
  }
  return binding;
}

/**
 * The analytical result: the declared node population and the incidence, read
 * from the two populations INDEPENDENTLY. The node list never comes from the
 * edges.
 */
export function evaluateGraph(binding: GraphBinding, rows: GraphRows): GraphResult {
  const nodes = rows.nodes.map((r) => {
    const v = r[binding.nodes.keyField];
    if (typeof v !== "string") throw new Error(`a node row does not carry a string ${binding.nodes.keyField}`);
    return v;
  });
  const edges = rows.edges.map((r) => {
    const from = r[binding.edges.fromField];
    const to = r[binding.edges.toField];
    if (typeof from !== "string" || typeof to !== "string") {
      throw new Error(`an edge row does not carry string ${binding.edges.fromField}/${binding.edges.toField}`);
    }
    return { from, to };
  });
  const touched = new Set(edges.flatMap((e) => [e.from, e.to]));
  return { nodes, edges, isolates: nodes.filter((n) => !touched.has(n)) };
}

/**
 * A representation that DERIVES its node list from edge endpoints. It is not a
 * projection this system produces; it is the counterexample the experiment must
 * beat, kept in the module so the collapse is exhibited rather than asserted.
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
 * isolated node is present WITH NO INCIDENT EDGES rather than absent. This is
 * the representation whose shape would tempt a consumer to reconstruct the node
 * list from the edges, so it states the node list explicitly.
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
  const seen = new Map<string, { from: string; to: string }>();
  for (const e of o.entries) for (const inc of e.incident) seen.set(`${inc.from}->${inc.to}`, { ...inc });
  const edges = [...seen.values()];
  const touched = new Set(edges.flatMap((e) => [e.from, e.to]));
  return { nodes, edges, isolates: nodes.filter((n) => !touched.has(n)) };
}

export function recoverGraph(o: RelationalGraphOutput | IncidenceOutput): GraphResult {
  return o.kind === "relational" ? decodeRelationalGraph(o) : decodeIncidence(o);
}

/* ----------------------------------------------------------- experiment */

const sameGraph = (a: GraphResult, b: GraphResult) =>
  JSON.stringify(a.nodes) === JSON.stringify(b.nodes) &&
  JSON.stringify(a.edges) === JSON.stringify(b.edges);

export type GraphPreservationReport = {
  result: GraphResult;
  relational: { ok: boolean; recovered: GraphResult };
  incidence: { ok: boolean; recovered: GraphResult };
  /** The counterexample: what a node-from-edges representation would report. */
  derivedFromEdges: { nodes: string[]; distinguishesThePair: boolean };
  /** The identity mutation: the isolate's NAME moves, count and edges do not. */
  mutatedIsolate: { recovered: GraphResult; ok: boolean; countAndEdgesUnchanged: boolean };
};

/**
 * The decisive pair: an IDENTICAL edge relation over different declared node
 * populations. `B` is `A` with the isolated node removed. Nothing about the
 * edges differs, so anything that reads the node population off the edges —
 * including `deriveNodesFromEdges` — cannot tell them apart.
 */
export function isolateRemoved(a: GraphResult): GraphResult {
  const isolate = a.isolates[0];
  if (isolate === undefined) throw new Error("the pair needs a structure with an isolated node to remove");
  return { nodes: a.nodes.filter((n) => n !== isolate), edges: a.edges.map((e) => ({ ...e })), isolates: [] };
}

/** Replaces the isolated node's identity, holding the node count and edges fixed. */
export function renameIsolate(a: GraphResult, to: string): GraphResult {
  const isolate = a.isolates[0];
  if (isolate === undefined) throw new Error("the mutation needs a structure with an isolated node to rename");
  return { nodes: a.nodes.map((n) => (n === isolate ? to : n)), edges: a.edges.map((e) => ({ ...e })), isolates: [to] };
}

export function graphPreservation(binding: GraphBinding, rows: GraphRows): GraphPreservationReport {
  const result = evaluateGraph(binding, rows);
  const outputs = produceGraph(result);
  const relational = recoverGraph(outputs.relational);
  const incidence = recoverGraph(outputs.incidence);

  const derived = deriveNodesFromEdges(result);
  const derivedPair = deriveNodesFromEdges(isolateRemoved(result));

  // Mutate the PRODUCED incidence output: the isolate's identity moves, its
  // count and the edge set do not.
  const mutated = produceGraph(renameIsolate(result, `${result.isolates[0]}-impostor`)).incidence;
  const recoveredMutation = recoverGraph(mutated);

  return {
    result,
    relational: { ok: sameGraph(relational, result), recovered: relational },
    incidence: { ok: sameGraph(incidence, result), recovered: incidence },
    derivedFromEdges: {
      nodes: derived,
      distinguishesThePair: JSON.stringify(derived) !== JSON.stringify(derivedPair),
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

/**
 * The retained result. It carries the CONCRETE PAIR, the two representations'
 * recovered graphs, the counterexample's collapse, and the identity mutation -
 * not a verdict about them.
 */
export function graphLedger(structure: RelationalStructure, binding: GraphBinding, rowsA: GraphRows, rowsB: GraphRows): Record<string, unknown> {
  const declared = declareGraphBinding(structure, binding);
  const report = graphPreservation(declared, rowsA);
  const b = evaluateGraph(declared, rowsB);
  return {
    $comment:
      "The bounded graph experiment (REL-GRAPH-NODE-UNIVERSE-01). The discriminator is the PAIR: identical edges, different declared node populations. Regenerate with `tsx packages/ds-codegen/src/analytical/graph-projection.ts --record`; the test fails when this file and a fresh computation disagree.",
    question:
      "Can one admitted relational structure preserve an independently declared node population and its edge incidence through two produced representations, without deriving the node population from the edges and without special-case consumer knowledge?",
    binding: declared,
    pair: {
      A: { declaredNodes: report.result.nodes, edges: report.result.edges, isolates: report.result.isolates },
      B: { declaredNodes: b.nodes, edges: b.edges },
      edgeRelationIdentical: JSON.stringify(report.result.edges) === JSON.stringify(b.edges),
    },
    recovered: {
      relational: report.relational.recovered,
      incidence: report.incidence.recovered,
      bothPreserve: report.relational.ok && report.incidence.ok,
    },
    counterexample: {
      what: "a representation that derives its node list from edge endpoints",
      derivedForA: deriveNodesFromEdges(report.result),
      derivedForB: deriveNodesFromEdges(b),
      distinguishesThePair: report.derivedFromEdges.distinguishesThePair,
    },
    identityMutation: {
      what: "the isolated node's identity moves while the node count and the edge set are held fixed",
      recovered: report.mutatedIsolate.recovered,
      detected: !report.mutatedIsolate.ok,
      countAndEdgesUnchanged: report.mutatedIsolate.countAndEdgesUnchanged,
    },
    authorityGap: {
      operand: { from: "relation", edgeFrom: "field", edgeTo: "field", value: "field" },
      declaresANodeRelation: false,
      note: "the authority's graph operand names an edge relation and two of its fields and no node relation; the binding is an explicit validated premise here, and moving it into the authority is separate work",
    },
    nonClaims: GRAPH_NON_CLAIMS,
  };
}

export const GRAPH_NON_CLAIMS = [
  "This is a bounded experiment on ONE three-node/one-edge fixture and its isolate-removal neighbor. It does not establish arbitrary graph realization, does not implement a layout, marks, interaction or accessibility, and does not establish the complete projection thesis.",
  "THE AUTHORITY'S OWN GAP IS RECORDED, NOT REPAIRED. The relation model's `graph` operand names an edge relation and its endpoint fields and declares NO node relation, so nothing in the authority says the endpoints range over a named node key. This slice declares the binding as an explicit validated PREMISE; it does not extend the zod model, does not touch schema emission, and does not alter the stage-2 ledgers. A future slice that moves the binding into the authority is a different piece of work.",
  "The two representations differ in shape, not in substrate: both are inspectable data structures, and neither is rendered.",
];

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (invokedDirectly && process.argv.includes("--record")) {
  const rowsA: GraphRows = {
    nodes: [{ id: "n1", label: "Contract" }, { id: "n2", label: "IR" }, { id: "n3", label: "Orphan" }],
    edges: [{ src: "n1", dst: "n2", weight: 1 }],
  };
  const rowsB: GraphRows = { nodes: [{ id: "n1", label: "Contract" }, { id: "n2", label: "IR" }], edges: [{ src: "n1", dst: "n2", weight: 1 }] };
  const structure = {
    relations: {
      nodes: { grain: ["id"], fields: { id: { transformation: "nominal", key: true }, label: { transformation: "nominal" } } },
      edges: { grain: ["src", "dst"], fields: { src: { transformation: "nominal" }, dst: { transformation: "nominal" }, weight: { transformation: "ratio" } } },
    },
  } as unknown as RelationalStructure;
  const binding: GraphBinding = { nodes: { relation: "nodes", keyField: "id" }, edges: { relation: "edges", fromField: "src", toField: "dst" } };
  fs.writeFileSync(GRAPH_LEDGER, `${JSON.stringify(graphLedger(structure, binding, rowsA, rowsB), null, 2)}\n`);
  console.log(`graph-projection: recorded ${GRAPH_LEDGER}`);
}
