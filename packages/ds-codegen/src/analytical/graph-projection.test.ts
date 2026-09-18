/**
 * The isolated-node graph experiment (REL-GRAPH-NODE-UNIVERSE-01).
 *
 * THE DISCRIMINATOR IS A PAIR, not a fixture. Both structures have the SAME edge
 * relation — one edge from `n1` to `n2` — and differ only in their declared node
 * population: `{n1,n2,n3}` against `{n1,n2}`. Anything that reads the node list
 * off the edge endpoints is blind to the difference, which is why the node
 * universe has to be declared rather than inferred.
 *
 * The fixture is real: `FX_P_GRAPH_ISOLATED_NODE` declares `nodes` (grain `[id]`)
 * and `edges` (grain `[src, dst]`) and supplies an orphan node. The binding is
 * declared here as an explicit premise because the authority's own `graph`
 * operand names no node relation — that absence is recorded in the ledger, not
 * silently patched in a decoder.
 */
import fs from "node:fs";
import { describe, expect, it } from "vitest";
import {
  GRAPH_LEDGER,
  GRAPH_NON_CLAIMS,
  declareGraphBinding,
  decodeIncidence,
  decodeRelationalGraph,
  deriveNodesFromEdges,
  evaluateGraph,
  graphLedger,
  graphPreservation,
  isolateRemoved,
  produceGraph,
  recoverGraph,
  renameIsolate,
} from "./graph-projection.js";
import type { GraphBinding, GraphRows } from "./graph-projection.js";
import type { RelationalStructure } from "./relation-model.js";

/** The fixture's own declarations, transcribed from FX_P_GRAPH_ISOLATED_NODE. */
const STRUCTURE: RelationalStructure = {
  relations: {
    nodes: { grain: ["id"], fields: { id: { transformation: "nominal", key: true }, label: { transformation: "nominal" } } },
    edges: { grain: ["src", "dst"], fields: { src: { transformation: "nominal" }, dst: { transformation: "nominal" }, weight: { transformation: "ratio" } } },
  },
} as RelationalStructure;

/** The declaration. Every name is STATED; none is inferred from a field name. */
const BINDING: GraphBinding = {
  nodes: { relation: "nodes", keyField: "id" },
  edges: { relation: "edges", fromField: "src", toField: "dst" },
};
const bound = declareGraphBinding(STRUCTURE, BINDING);

/** Structure A: three declared nodes, one edge, one isolated node. */
const ROWS_A: GraphRows = {
  nodes: [{ id: "n1", label: "Contract" }, { id: "n2", label: "IR" }, { id: "n3", label: "Orphan" }],
  edges: [{ src: "n1", dst: "n2", weight: 1 }],
};
/** Structure B: the SAME edges, the isolated node's row simply absent. */
const ROWS_B: GraphRows = {
  nodes: [{ id: "n1", label: "Contract" }, { id: "n2", label: "IR" }],
  edges: [{ src: "n1", dst: "n2", weight: 1 }],
};

const report = graphPreservation(bound, ROWS_A);
const a = report.result;

describe("A1 — the node universe is DECLARED and validated, never inferred", () => {
  it("resolves every name in the declaration against the structure", () => {
    expect(bound).toEqual(BINDING);
    expect(a.nodes).toEqual(["n1", "n2", "n3"]);
    expect(a.edges).toEqual([{ from: "n1", to: "n2" }]);
    expect(a.isolates).toEqual(["n3"]);
  });

  it("refuses a declaration that does not resolve, rather than falling back to a convention", () => {
    expect(() => declareGraphBinding(STRUCTURE, { ...BINDING, nodes: { relation: "missing", keyField: "id" } })).toThrow(/does not declare/);
    expect(() => declareGraphBinding(STRUCTURE, { ...BINDING, nodes: { relation: "nodes", keyField: "name" } })).toThrow(/does not declare/);
    expect(() => declareGraphBinding(STRUCTURE, { ...BINDING, edges: { relation: "edges", fromField: "source", toField: "dst" } })).toThrow(/does not declare/);
  });

  it("refuses to let the node universe be the edge relation", () => {
    expect(() =>
      declareGraphBinding(STRUCTURE, { nodes: { relation: "edges", keyField: "src" }, edges: { relation: "edges", fromField: "src", toField: "dst" } }),
    ).toThrow(/different relations/);
  });

  it("does not read the node population off the edges", () => {
    // `n3` has no edge, so nothing derived from the incidence can produce it.
    expect(a.nodes).toContain("n3");
    expect(deriveNodesFromEdges(a)).not.toContain("n3");
  });
});

describe("A2 — the decisive pair: identical edges, different declared node populations", () => {
  const b = evaluateGraph(bound, ROWS_B);

  it("holds the edge relation fixed across the pair", () => {
    expect(a.edges).toEqual(b.edges);
    expect(a.nodes).not.toEqual(b.nodes);
  });

  it("distinguishes the pair through BOTH produced representations", () => {
    const relA = recoverGraph(produceGraph(a).relational);
    const relB = recoverGraph(produceGraph(b).relational);
    const incA = recoverGraph(produceGraph(a).incidence);
    const incB = recoverGraph(produceGraph(b).incidence);
    expect(relA.nodes).toEqual(["n1", "n2", "n3"]);
    expect(relB.nodes).toEqual(["n1", "n2"]);
    expect(incA.nodes).toEqual(["n1", "n2", "n3"]);
    expect(incB.nodes).toEqual(["n1", "n2"]);
  });

  it("EXHIBITS the collapse a node-from-edges representation would suffer", () => {
    // This is the counterexample, executed rather than asserted: the derived node
    // list is identical for A and B, so it cannot tell them apart.
    expect(deriveNodesFromEdges(a)).toEqual(deriveNodesFromEdges(b));
    expect(report.derivedFromEdges.distinguishesThePair).toBe(false);
  });

  it("keeps the isolated node in the incidence representation, with no incident edges", () => {
    const outputs = produceGraph(a);
    const orphan = outputs.incidence.entries.find((e) => e.node === "n3");
    expect(orphan).toBeDefined();
    expect(orphan!.incident).toEqual([]);
    expect(outputs.incidence.entries.find((e) => e.node === "n1")!.incident).toEqual([{ from: "n1", to: "n2" }]);
  });
});

describe("A3 — recovery reads each representation alone", () => {
  it("recovers the exact node identities and the incidence from the relational output", () => {
    expect(report.relational.ok).toBe(true);
    const decoded = decodeRelationalGraph(produceGraph(a).relational);
    expect(decoded.nodes).toEqual(["n1", "n2", "n3"]);
    expect(decoded.edges).toEqual([{ from: "n1", to: "n2" }]);
    expect(decoded.isolates).toEqual(["n3"]);
  });

  it("recovers them from the incidence output, including the isolated node", () => {
    expect(report.incidence.ok).toBe(true);
    const decoded = decodeIncidence(produceGraph(a).incidence);
    expect(decoded.nodes).toEqual(["n1", "n2", "n3"]);
    expect(decoded.edges).toEqual([{ from: "n1", to: "n2" }]);
    expect(decoded.isolates).toEqual(["n3"]);
  });

  it("gives each decoder one argument", () => {
    expect(decodeRelationalGraph.length).toBe(1);
    expect(decodeIncidence.length).toBe(1);
    expect(recoverGraph.length).toBe(1);
  });

  it("names the isolate-removed neighbour as the SAME edges with one fewer node", () => {
    const b = isolateRemoved(a);
    expect(b.edges).toEqual(a.edges);
    expect(b.nodes).toEqual(["n1", "n2"]);
    expect(b.isolates).toEqual([]);
  });
});

describe("A4 — the identity mutation is detected, not just the count", () => {
  it("detects a changed isolate IDENTITY while the count and the edge set are unchanged", () => {
    const mutated = renameIsolate(a, "n9");
    expect(mutated.nodes).toEqual(["n1", "n2", "n9"]);
    expect(mutated.edges).toEqual(a.edges);
    expect(mutated.nodes.length).toBe(a.nodes.length);
    expect(report.mutatedIsolate.ok).toBe(false);
  });

  it("shows that agreement on 'three nodes, one edge' would NOT be sufficient", () => {
    // The mutation preserves both counts, so a consumer comparing counts passes
    // it. Recovery compares IDENTITIES, which is what the mutation changes.
    expect(report.mutatedIsolate.countAndEdgesUnchanged).toBe(true);
    expect(report.mutatedIsolate.recovered.nodes).not.toEqual(a.nodes);
    expect(report.mutatedIsolate.recovered.nodes.length).toBe(a.nodes.length);
    expect(report.mutatedIsolate.recovered.edges.length).toBe(a.edges.length);
  });

  it("accepts the unmutated graph through the same comparison", () => {
    expect(report.relational.ok).toBe(true);
    expect(report.incidence.ok).toBe(true);
  });
});

describe("the retained ledger", () => {
  it("matches a fresh computation, so a stale ledger is drift", () => {
    expect(fs.existsSync(GRAPH_LEDGER), "run: tsx packages/ds-codegen/src/analytical/graph-projection.ts --record").toBe(true);
    const committed = JSON.parse(fs.readFileSync(GRAPH_LEDGER, "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(graphLedger(STRUCTURE, BINDING, ROWS_A, ROWS_B))));
  });

  it("records the pair, the counterexample and the identity mutation", () => {
    const ledger = graphLedger(STRUCTURE, BINDING, ROWS_A, ROWS_B);
    expect((ledger.pair as { edgeRelationIdentical: boolean }).edgeRelationIdentical).toBe(true);
    expect((ledger.counterexample as { distinguishesThePair: boolean }).distinguishesThePair).toBe(false);
    expect((ledger.identityMutation as { detected: boolean }).detected).toBe(true);
    expect((ledger.authorityGap as { declaresANodeRelation: boolean }).declaresANodeRelation).toBe(false);
  });
});

describe("the record bounds the result", () => {
  it("carries non-claims, including the authority's missing node operand", () => {
    expect(GRAPH_NON_CLAIMS.some((n) => n.includes("NO node relation"))).toBe(true);
    expect(GRAPH_NON_CLAIMS.some((n) => n.includes("does not establish arbitrary graph realization"))).toBe(true);
  });
});
