/**
 * The isolated-node graph experiment and its binding-selection correction
 * (REL-GRAPH-NODE-UNIVERSE-01, REL-GRAPH-BINDING-SELECTS-01).
 *
 * ONE SOURCE, TWO BINDINGS. `graphFixture()` holds two candidate node universes
 * (`allNodes` = {n1,n2,n3}, `connectedSet` = {n1,n2}) and one edge relation
 * (`links` = {(n1,n2)}). The rows never change; only the binding does. If the
 * binding merely documented a choice the caller had already made, changing it
 * would change nothing — so that is the control.
 *
 * The remaining controls are the input conditions this experiment relies on: a
 * field that RESOLVES is not thereby the key, an endpoint outside the selected
 * universe is a contradiction rather than a silent omission, a missing
 * population is carried rather than becoming empty, and two distinct edges whose
 * endpoint strings compose to the same joined text stay distinct.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  GRAPH_LEDGER,
  GRAPH_NON_CLAIMS,
  decodeIncidence,
  decodeRelationalGraph,
  denoteGraph,
  deriveNodesFromEdges,
  declaredGraphViewCoordinates,
  graphLedger,
  graphOf,
  graphViewNecessityCensus,
  loadGraphViews,
  VIEW_ALL_NODES,
  VIEW_CONNECTED_SET,
  graphPreservation,
  isolateRemoved,
  produceGraph,
  recoverGraph,
  renameInOutput,
} from "./graph-projection.js";
import { enumerateGraph, inducedGraphClaims, EXPERIMENT_TARGET } from "./projection.js";
import type { GraphBinding, GraphResult } from "./graph-projection.js";
import { GraphViewFile } from "./graph-view-model.js";
import { CONTRACTS_DIR } from "./necessity.js";

// THE DECISIVE PAIR ENTERS THROUGH THE CANONICAL LOADER. Nothing here hand-builds
// a declaration: the views are parsed from the authored file and validated
// against the definition the emitted schema is rendered from.
const LOADED = loadGraphViews();
const SOURCE = LOADED.source;
const ALL_NODES = LOADED.views.get(VIEW_ALL_NODES)!;
const CONNECTED_SET = LOADED.views.get(VIEW_CONNECTED_SET)!;

const all = graphPreservation(ALL_NODES, SOURCE);
const connected = graphPreservation(CONNECTED_SET, SOURCE);

describe("the canonical path: authored, parsed, schema-emitted", () => {
  it("declares the views in the canonical authored file and parses them", () => {
    expect([...LOADED.views.keys()].sort()).toEqual([VIEW_ALL_NODES, VIEW_CONNECTED_SET]);
    expect(LOADED.declaration.views).toHaveLength(2);
  });

  it("reproduces the two already-earned graphs from the PARSED declarations", () => {
    // Same source, same rows; only the parsed node-universe binding differs.
    expect(graphPreservation(ALL_NODES, SOURCE).result.nodes).toEqual(["n1", "n2", "n3"]);
    expect(graphPreservation(CONNECTED_SET, SOURCE).result.nodes).toEqual(["n1", "n2"]);
  });

  it("refuses an authored file that does not validate, rather than defaulting", () => {
    // A view naming no node relation is schema-valid in shape but not in meaning;
    // a file missing the required `views` key fails validation outright.
    const bad = JSON.parse(fs.readFileSync(path.join(CONTRACTS_DIR, "analytical-fixtures/graph-views.json"), "utf-8"));
    expect(GraphViewFile.safeParse({ structure: bad.structure, rows: bad.rows }).success).toBe(false);
    expect(GraphViewFile.safeParse({ ...bad, views: [] }).success).toBe(false);
  });
});

describe("the binding SELECTS its populations from one named source", () => {
  it("changes the denoted graph when only the binding changes", () => {
    expect(all.result.nodes).toEqual(["n1", "n2", "n3"]);
    expect(connected.result.nodes).toEqual(["n1", "n2"]);
    expect(all.result.isolates).toEqual(["n3"]);
    expect(connected.result.isolates).toEqual([]);
  });

  it("holds the edge relation fixed across the two bindings", () => {
    expect(all.result.edges).toEqual([{ from: "n1", to: "n2" }]);
    expect(connected.result.edges).toEqual(all.result.edges);
  });

  it("reads the arrays by the binding's relation NAMES rather than trusting an arrangement", () => {
    const admission = denoteGraph(CONNECTED_SET, SOURCE);
    expect(admission.kind).toBe("denoted");
    if (admission.kind !== "denoted") throw new Error("unreachable");
    expect(admission.selected).toEqual({ nodes: "connected_set", edges: "links" });
    const other = denoteGraph(ALL_NODES, SOURCE);
    expect(other.kind === "denoted" && other.graph.nodes).toEqual(["n1", "n2", "n3"]);
  });

  it("creates the isolate-removal neighbour by binding change alone", () => {
    const partner = isolateRemoved(all.result)!;
    expect(partner.nodes).toEqual(connected.result.nodes);
    expect(partner.edges).toEqual(connected.result.edges);
    // A graph with no isolate has no such neighbour, and says so.
    expect(isolateRemoved(connected.result)).toBeUndefined();
  });
});

describe("preservation through two produced representations", () => {
  it("recovers the exact node identities and incidence for BOTH bindings", () => {
    for (const [name, report, expected] of [
      ["allNodes", all, ["n1", "n2", "n3"]],
      ["connectedSet", connected, ["n1", "n2"]],
    ] as const) {
      expect(report.relational.ok, `${name} relational`).toBe(true);
      expect(report.incidence.ok, `${name} incidence`).toBe(true);
      expect(report.relational.recovered.nodes).toEqual([...expected]);
      expect(report.incidence.recovered.nodes).toEqual([...expected]);
      expect(report.relational.recovered.edges).toEqual([{ from: "n1", to: "n2" }]);
      expect(report.incidence.recovered.edges).toEqual([{ from: "n1", to: "n2" }]);
    }
  });

  it("keeps the isolated node in the incidence representation with no incident edges", () => {
    const orphan = produceGraph(all.result).incidence.entries.find((e) => e.node === "n3");
    expect(orphan).toBeDefined();
    expect(orphan!.incident).toEqual([]);
  });

  it("EXHIBITS the collapse a node-from-edges representation would suffer", () => {
    expect(deriveNodesFromEdges(all.result)).toEqual(deriveNodesFromEdges(connected.result));
    expect(all.derivedFromEdges.distinguishesThePair).toBe(false);
  });

  it("gives each decoder one argument", () => {
    expect(decodeRelationalGraph.length).toBe(1);
    expect(decodeIncidence.length).toBe(1);
    expect(recoverGraph.length).toBe(1);
  });
});

describe("qualification: a name that resolves is not a semantic qualification", () => {
  it("refuses an identity field that resolves but is not the relation's key", () => {
    // `label` exists, so a name-resolution check alone accepted it.
    expect(() => denoteGraph({ ...ALL_NODES, nodes: { relation: "all_nodes", keyField: "label" } }, SOURCE)).toThrow(/not the relation's declared key/);
  });

  it("refuses an endpoint outside the SELECTED universe instead of dropping it", () => {
    expect(() => denoteGraph(ALL_NODES, { ...SOURCE, rows: { ...SOURCE.rows, links: [{ src: "n1", dst: "n9", weight: 1 }] } })).toThrow(/does not contain/);
    const widened = { ...SOURCE, rows: { ...SOURCE.rows, all_nodes: [...SOURCE.rows.all_nodes, { id: "n9", label: "Extra" }] } };
    expect(denoteGraph(ALL_NODES, widened).kind).toBe("denoted");
  });

  it("CARRIES a missing population rather than treating it as empty", () => {
    const missing = denoteGraph(ALL_NODES, { structure: SOURCE.structure, rows: { links: SOURCE.rows.links } });
    expect(missing.kind).toBe("unproven");
    if (missing.kind !== "unproven") throw new Error("unreachable");
    expect(missing.obligation).toBe("invariant:population-declared");
    // A silent empty population would have produced `nodes: []` and called it a graph.
    expect(() => graphPreservation(ALL_NODES, { structure: SOURCE.structure, rows: { links: SOURCE.rows.links } })).toThrow(/does not denote a graph/);
  });

  it("still refuses to let the node universe be the edge relation", () => {
    expect(() =>
      denoteGraph({ nodes: { relation: "links", keyField: "src" }, edges: { relation: "links", fromField: "src", toField: "dst" } }, SOURCE),
    ).toThrow(/different relations/);
  });

  it("refuses names that do not resolve at all", () => {
    expect(() => denoteGraph({ ...ALL_NODES, nodes: { relation: "missing", keyField: "id" } }, SOURCE)).toThrow(/does not declare/);
    expect(() => denoteGraph({ ...ALL_NODES, edges: { relation: "links", fromField: "source", toField: "dst" } }, SOURCE)).toThrow(/does not declare/);
  });
});

describe("the incidence decoder keeps distinct edges distinct", () => {
  it("recovers two edges whose endpoint strings compose to the same joined text", () => {
    const ambiguous: GraphResult = { nodes: ["a", "b", "c"], edges: [{ from: "a->b", to: "c" }, { from: "a", to: "b->c" }], isolates: [] };
    const decoded = recoverGraph(produceGraph(ambiguous).incidence);
    expect(decoded.edges).toHaveLength(2);
    expect(decoded.edges).toEqual(expect.arrayContaining([{ from: "a->b", to: "c" }, { from: "a", to: "b->c" }]));
  });
});

describe("the identity mutation is detected in the PRODUCED output", () => {
  it("moves one produced entry's identity while holding the count and the edge set", () => {
    const produced = produceGraph(all.result).incidence;
    const mutated = renameInOutput(produced, "n3", "n3-impostor");
    const recovered = recoverGraph(mutated);
    expect(recovered.nodes).toEqual(["n1", "n2", "n3-impostor"]);
    expect(recovered.nodes.length).toBe(all.result.nodes.length);
    expect(recovered.edges).toEqual(all.result.edges);
    expect(recovered.nodes).not.toEqual(all.result.nodes);
  });

  it("reports the mutation detected through the module's own control", () => {
    expect(all.mutatedIsolate.ok).toBe(false);
    expect(all.mutatedIsolate.countAndEdgesUnchanged).toBe(true);
  });
});

describe("the retained ledger", () => {
  it("matches a fresh computation, so a stale ledger is drift", () => {
    expect(fs.existsSync(GRAPH_LEDGER), "run: tsx packages/ds-codegen/src/analytical/graph-projection.ts --record").toBe(true);
    const committed = JSON.parse(fs.readFileSync(GRAPH_LEDGER, "utf-8"));
    expect(committed).toEqual(JSON.parse(JSON.stringify(graphLedger())));
  });

  it("records the selection control, the refusals, the mutation and the collision", () => {
    const ledger = graphLedger();
    const selection = ledger.selectionControl as { selectionChanged: boolean; edgeRelationIdentical: boolean };
    expect(selection.selectionChanged).toBe(true);
    expect(selection.edgeRelationIdentical).toBe(true);
    const qualification = ledger.qualification as Record<string, unknown>;
    expect(String(qualification.keyThatResolvesButIsNotTheKey)).toMatch(/not the relation's declared key/);
    expect(String(qualification.endpointOutsideTheSelectedUniverse)).toMatch(/does not contain/);
    expect(qualification.missingPopulation).toMatchObject({ carried: "invariant:population-declared" });
    expect((ledger.identityMutation as { detected: boolean }).detected).toBe(true);
    expect((ledger.decoderCollision as { bothSurvive: boolean }).bothSurvive).toBe(true);
    expect((ledger.counterexample as { distinguishesThePair: boolean }).distinguishesThePair).toBe(false);
    expect((ledger.authorityGap as { declaresANodeRelation: boolean }).declaresANodeRelation).toBe(false);
  });

  it("carries non-claims, including the authority's missing node operand", () => {
    expect(GRAPH_NON_CLAIMS.some((n) => /no node relation/i.test(n))).toBe(true);
    expect(GRAPH_NON_CLAIMS.some((n) => n.includes("NO CANONICAL-MODEL INTEGRATION"))).toBe(true);
  });
});

describe("M1 EXIT — the projection layer consumes the graph-valued result", () => {
  const denoted = graphPreservation(ALL_NODES, SOURCE).result;

  it("enumerates candidates for the task a graph serves, from the RESULT", () => {
    const e = enumerateGraph({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET });
    expect(e.retained.length).toBeGreaterThan(0);
    for (const p of e.retained) {
      // Judged from the graph result and the channel capacities alone.
      expect(p.graph.nodes).toEqual(denoted.nodes);
      expect(inducedGraphClaims(p)).toContain("incidence-recoverable");
      expect(p.coordinate).toBe("non-metric");
    }
  });

  it("takes NO binding, so it cannot re-resolve a source name or re-select a population", () => {
    // The input type is the contract: `{graph, task, inventory}`. A layer that
    // never receives a binding cannot invent the analysis behind it.
    const e = enumerateGraph({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET });
    const inputKeys = Object.keys({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET }).sort();
    expect(inputKeys).toEqual(["graph", "inventory", "task"]);
    expect(e.retained.every((p) => !("operation" in p) && !("binding" in p))).toBe(true);
  });

  it("states its domain restriction rather than reporting no lawful projection", () => {
    const e = enumerateGraph({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET });
    // Every positional coordinate is EXCLUDED, not refused: outside the declared
    // domain is not the same as illegal, and the counters keep that visible.
    expect(e.population.considered).toBeGreaterThan(0);
    expect(e.population.excluded).toBeGreaterThan(0);
    expect(e.retained.every((p) => p.coordinate === "non-metric")).toBe(true);
  });

  it("still refuses a program that cannot carry the incidence", () => {
    const e = enumerateGraph({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET });
    expect(e.refused.every((r) => r.detail.length > 0)).toBe(true);
  });

  it("distinguishes the two graph universes through the SAME enumerator", () => {
    const other = graphPreservation(CONNECTED_SET, SOURCE).result;
    const a = enumerateGraph({ graph: denoted, task: "topology", inventory: EXPERIMENT_TARGET });
    const b = enumerateGraph({ graph: other, task: "topology", inventory: EXPERIMENT_TARGET });
    expect(a.retained.length).toBe(b.retained.length); // same topologies...
    expect(a.retained[0].graph.nodes).not.toEqual(b.retained[0].graph.nodes); // ...different graph
  });
});

describe("M1 gap — missing versus explicitly EMPTY population", () => {
  it("denotes an EMPTY graph when both populations are explicitly empty", () => {
    const empty = denoteGraph(ALL_NODES, { structure: SOURCE.structure, rows: { all_nodes: [], links: [] } });
    expect(empty.kind).toBe("denoted");
    if (empty.kind !== "denoted") throw new Error("unreachable");
    expect(empty.graph).toEqual({ nodes: [], edges: [], isolates: [] });
  });

  it("REFUSES an explicitly empty node population beside a non-empty edge relation", () => {
    // The contradiction is established, so it is refused rather than carried.
    expect(() => denoteGraph(ALL_NODES, { structure: SOURCE.structure, rows: { all_nodes: [], links: [{ src: "n1", dst: "n2" }] } })).toThrow(
      /does not contain/,
    );
  });

  it("keeps MISSING distinct from EMPTY", () => {
    const missing = denoteGraph(ALL_NODES, { structure: SOURCE.structure, rows: { links: SOURCE.rows.links } });
    const empty = denoteGraph(ALL_NODES, { structure: SOURCE.structure, rows: { all_nodes: [], links: [] } });
    expect(missing.kind).toBe("unproven");
    expect(empty.kind).toBe("denoted");
  });
});

describe("M1 gap — a binding mutant that leaves descriptive metadata unchanged", () => {
  it("ties the RESULT to the population the parsed binding names, not to a fixed relation", () => {
    // The mutant this detects: an implementation that always reads `all_nodes`
    // while `selected` still reports the declared relation. An outcome-only
    // check passes it; this comparison does not.
    for (const view of [VIEW_ALL_NODES, VIEW_CONNECTED_SET]) {
      const binding = LOADED.views.get(view)!;
      const declaredRelation = binding.nodes.relation;
      const independent = (SOURCE.rows[declaredRelation] as Array<Record<string, unknown>>).map((r) => r[binding.nodes.keyField]);
      const denoted = denoteGraph(binding, SOURCE);
      expect(denoted.kind).toBe("denoted");
      if (denoted.kind !== "denoted") throw new Error("unreachable");
      expect(denoted.graph.nodes).toEqual(independent);
      expect(denoted.selected.nodes).toBe(declaredRelation);
    }
    // ...and the two populations are genuinely different, so the check has teeth.
    const a = graphPreservation(ALL_NODES, SOURCE).result.nodes;
    const b = graphPreservation(CONNECTED_SET, SOURCE).result.nodes;
    expect(a).not.toEqual(b);
    expect(a).toEqual(["n1", "n2", "n3"]);
    expect(b).toEqual(["n1", "n2"]);
  });
});

describe("M1 — necessity accounting for the declaration coordinates", () => {
  it("accounts for EVERY coordinate the emitted schema declares", () => {
    const declared = declaredGraphViewCoordinates();
    const census = graphViewNecessityCensus();
    expect(census.map((c) => c.coordinate).sort()).toEqual(declared);
    // Derived from the emitted schema, so a field added to the declaration
    // arrives failing here rather than silently gaining standing.
    expect(declared).toEqual([
      "binds.edges.fromField",
      "binds.edges.relation",
      "binds.edges.toField",
      "binds.nodes.keyField",
      "binds.nodes.relation",
      "id",
    ]);
  });

  it("earns the witnessed dispositions with EXECUTED pairs, not assertions", () => {
    const byId = new Map(graphViewNecessityCensus().map((c) => [c.coordinate, c]));
    const nodesRelation = byId.get("binds.nodes.relation")!;
    expect(nodesRelation.disposition).toBe("witnessed");
    if (nodesRelation.disposition !== "witnessed") throw new Error("unreachable");
    // Same source, same edge relation; only the node universe differs.
    expect(nodesRelation.outcomes).toEqual({ a: "n1,n2,n3", b: "n1,n2" });

    const edgesRelation = byId.get("binds.edges.relation")!;
    if (edgesRelation.disposition !== "witnessed") throw new Error("unreachable");
    expect(edgesRelation.outcomes.a).not.toBe(edgesRelation.outcomes.b);

    for (const field of ["binds.edges.fromField", "binds.edges.toField"]) {
      const c = byId.get(field)!;
      expect(c.disposition).toBe("witnessed");
      if (c.disposition !== "witnessed") throw new Error("unreachable");
      expect(c.pair.differsIn).toContain("JOINTLY");
      // The reversal changes the DIRECTED incidence and no population at all.
      expect(c.outcomes).toEqual({ a: "n1->n2", b: "n2->n1" });
    }
  });

  it("records the key field as derived, and the reason it is not independent HERE", () => {
    const key = graphViewNecessityCensus().find((c) => c.coordinate === "binds.nodes.keyField")!;
    expect(key.disposition).toBe("representation-artifact");
    if (key.disposition !== "representation-artifact") throw new Error("unreachable");
    expect(key.reason).toContain("exactly 1 key");
    expect(key.reason).toContain("more than one key");
  });

  it("shows by EXECUTION that the declaration id carries no analytical degree of freedom", () => {
    // Renaming the view and updating its references denotes the same graph, so
    // the id is an artifact of the declaration's encoding, not a coordinate.
    const { source, views, declaration } = loadGraphViews();
    const original = views.get(VIEW_ALL_NODES)!;
    const renamedDeclaration = { ...declaration, views: declaration.views.map((v) => (v.id === VIEW_ALL_NODES ? { ...v, id: "GV_RENAMED" } : v)) };
    const renamedView = renamedDeclaration.views.find((v) => v.id === "GV_RENAMED")!;
    // Same source, same binding, different id: the graph it denotes is unchanged.
    expect(graphOf(renamedView.binds as GraphBinding, source).nodes).toEqual(graphOf(original, source).nodes);
    expect(graphOf(renamedView.binds as GraphBinding, source).edges).toEqual(graphOf(original, source).edges);
    const id = graphViewNecessityCensus().find((c) => c.coordinate === "id")!;
    expect(id.disposition).toBe("representation-artifact");
    if (id.disposition !== "representation-artifact") throw new Error("unreachable");
    expect(id.reason).toContain("SAME GRAPH");
  });

  it("carries the census in the retained ledger", () => {
    const census = graphLedger().necessityCensus as Array<{ coordinate: string; disposition: string }>;
    expect(census).toHaveLength(6);
    expect(census.every((c) => c.disposition.length > 0)).toBe(true);
  });
});
