/**
 * The stage-2 rules, one at a time (REL-VIEW-ALGEBRA-01).
 *
 * Each rule below exists because a corpus case demands it, and each test states
 * the case's own account of the defect rather than the engine's. Every rule is
 * tested with its LEGAL near-neighbour beside it: a rule that fires on the
 * defect but also on its lawful twin has not identified the defect, it has
 * identified the topic. The neighbours here are the same structures the fixture
 * ledger will later require as bound near-neighbour fixtures, checked first in
 * the smallest form that can fail.
 *
 * These are unit tests over the rules. The acceptance evidence that each rule
 * yields exactly the corpus's verdict is `checkFixtureLedger(stage=2)`, run in
 * corpus-integrity.test.ts against fixtures bound to the frozen answer key.
 */
import { describe, expect, it } from "vitest";
import { DIAG, OBLIGATION } from "./codes.js";
import { checkDerivations } from "./derivation.js";
import { judge } from "./engines.js";
import { codesOf, termsOf } from "./judgment.js";
import { RelationalStructure as RelationalStructureSchema } from "./relation-model.js";
import type { Assertion, Evidence, RelationalStructure } from "./relation-model.js";

const key = { transformation: "nominal", key: true } as const;
const ratio = { transformation: "ratio" } as const;

const valid = (s: unknown): RelationalStructure => {
  const r = RelationalStructureSchema.safeParse(s);
  expect(r.success, `structure is not schema-valid: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true);
  return s as RelationalStructure;
};
const boundary = (s: unknown, evidence?: Evidence) => checkDerivations(valid(s), evidence);
const boundaryCodes = (s: unknown, evidence?: Evidence) => boundary(s, evidence).map((f) => f.code ?? f.term);

describe("REL_BIN_CLOSURE_UNDECLARED — which bin gets 10.0?", () => {
  // A value that lands exactly on a boundary belongs to the bin below or the
  // bin above. With no declared closure the structure does not say, so two
  // readers counting the same rows get different counts.
  const binned = (closure?: "left-closed" | "right-closed") => ({
    relations: {
      readings: { grain: ["reading_id"], fields: { reading_id: key, celsius: ratio } },
      bucketed: {
        grain: ["reading_id"],
        fields: { reading_id: key, celsius: ratio },
        derivedBy: { kind: "bin", from: "readings", field: "celsius", ...(closure ? { closure } : {}) },
      },
    },
  });

  it("refuses a bin with no declared closure", () => {
    expect(boundaryCodes(binned())).toEqual([DIAG.BIN_CLOSURE_UNDECLARED]);
  });

  it("admits the same bin once the closure is declared", () => {
    expect(boundaryCodes(binned("left-closed"))).toEqual([]);
    expect(boundaryCodes(binned("right-closed"))).toEqual([]);
  });

  it("attributes the finding to declaration-missing, at the binned field", () => {
    const [f] = boundary(binned());
    expect(f.engine).toBe("declaration-missing");
    expect(f.evidenceClass).toBe("schema");
    expect(f.subject).toBe("bucketed.celsius");
  });
});

describe("REL_ADDITIVITY_NORMALIZE_NONADDITIVE — share of total average", () => {
  // Normalizing to a whole presumes the parts sum to the whole. An average has
  // no such sum: the "share of the total average" is a ratio whose denominator
  // does not exist.
  const normalized = (kind: "non-additive" | "additive") => ({
    relations: {
      regions: {
        grain: ["region"],
        fields: { region: key, avg_score: { ...ratio, additivity: { kind } } },
      },
      shares: {
        grain: ["region"],
        fields: { region: key, avg_score: { ...ratio, additivity: { kind } } },
        derivedBy: { kind: "normalize", from: "regions", field: "avg_score" },
      },
    },
  });

  it("refuses normalizing a non-additive measure to a whole", () => {
    expect(boundaryCodes(normalized("non-additive"))).toEqual([DIAG.NORMALIZE_NONADDITIVE]);
  });

  it("admits normalizing an additive measure", () => {
    expect(boundaryCodes(normalized("additive"))).toEqual([]);
  });

  it("attributes the finding to additivity", () => {
    expect(boundary(normalized("non-additive"))[0].engine).toBe("additivity");
  });
});

describe("REL_DERIVATION_DISCARDS_MEMBERSHIP — flattened so early nothing can rebuild it", () => {
  // The loss happens in the derivation, upstream of any choice of projection.
  // No later projection can be lawful, because the membership that any of them
  // would need to rebuild the hierarchy is already gone.
  // The grain is `sale_id` throughout, so the projection keeps every grain
  // column and its result grain stays determined. What it drops is a LEVEL,
  // which is the whole point: the loss is of hierarchy membership, not of
  // row identity, and only the first shows up as this diagnostic.
  const fields = (names: string[]) => Object.fromEntries(names.map((k) => [k, k === "revenue" ? ratio : key]));
  const flattened = (keep: string[]) => ({
    relations: {
      sales: { grain: ["sale_id"], fields: fields(["sale_id", "country", "state", "revenue"]) },
      hierarchy: {
        grain: ["sale_id"],
        fields: fields(["sale_id", "country", "state", "revenue"]),
        derivedBy: { kind: "nest", from: "sales", levels: ["country", "state"] },
      },
      flat: { grain: ["sale_id"], fields: fields(keep), derivedBy: { kind: "project", from: "hierarchy", keep } },
    },
  });

  it("refuses a projection that drops a level of the hierarchy it reads", () => {
    expect(boundaryCodes(flattened(["sale_id", "state", "revenue"]))).toEqual([DIAG.DISCARDS_MEMBERSHIP]);
  });

  it("admits a projection that keeps the levels and drops only a measure", () => {
    expect(boundaryCodes(flattened(["sale_id", "country", "state"]))).toEqual([]);
  });

  it("does not fire for a projection whose input is not nested", () => {
    // The same field is dropped; what is absent is the hierarchy that made the
    // drop irreversible. Without a nest there is no membership to discard.
    const s = {
      relations: {
        sales: { grain: ["sale_id"], fields: fields(["sale_id", "country", "state", "revenue"]) },
        flat: {
          grain: ["sale_id"],
          fields: fields(["sale_id", "state", "revenue"]),
          derivedBy: { kind: "project", from: "sales", keep: ["sale_id", "state", "revenue"] },
        },
      },
    };
    expect(boundaryCodes(s)).toEqual([]);
  });
});

describe("REL_GRAIN_SUBTOTAL_MISMATCH — nested table with wrong totals", () => {
  // A hierarchy [country, state] declares exactly two grains: per country, and
  // per country x state. A subtotal at [state] alone groups states from
  // different countries together, and nothing in the declaration says that is
  // what was meant.
  const subtotalled = (toGrain: string[]) => ({
    relations: {
      sales: { grain: ["country", "state"], fields: { country: key, state: key, revenue: ratio } },
      hierarchy: {
        grain: ["country", "state"],
        fields: { country: key, state: key, revenue: ratio },
        derivedBy: { kind: "nest", from: "sales", levels: ["country", "state"] },
      },
      subtotals: {
        grain: toGrain,
        fields: Object.fromEntries([...toGrain.map((g) => [g, key]), ["revenue", ratio]]),
        derivedBy: { kind: "aggregate-to-grain", from: "hierarchy", toGrain },
      },
    },
  });

  it("refuses a subtotal at a grain the hierarchy does not declare", () => {
    expect(boundaryCodes(subtotalled(["state"]))).toEqual([DIAG.SUBTOTAL_MISMATCH]);
  });

  it("admits a subtotal at a prefix of the hierarchy", () => {
    expect(boundaryCodes(subtotalled(["country"]))).toEqual([]);
    expect(boundaryCodes(subtotalled(["country", "state"]))).toEqual([]);
  });

  it("attributes the finding to additivity", () => {
    expect(boundary(subtotalled(["state"]))[0].engine).toBe("additivity");
  });
});

describe("REL_TEMPORAL_GRAIN_MIXED — daily and monthly series on one axis", () => {
  // Two relations at different temporal grains are simply two relations. The
  // peer declaration is what turns the difference into a defect: it says they
  // carry one claim, and a daily value and a monthly value are not two
  // readings of the same quantity.
  const series = (secondGrain: "day" | "month") => ({
    relations: {
      daily: { grain: ["day"], fields: { day: { ...key, temporality: { kind: "instant", grain: "day" } }, revenue: ratio } },
      other: {
        grain: ["period"],
        fields: { period: { ...key, temporality: { kind: "instant", grain: secondGrain } }, revenue: ratio },
      },
    },
    peers: [["daily", "other"]],
  });

  it("refuses two peers resolved to different temporal grains", () => {
    expect(boundaryCodes(series("month"))).toEqual([DIAG.TEMPORAL_GRAIN_MIXED]);
  });

  it("admits the same two series once both resolve to one grain", () => {
    expect(boundaryCodes(series("day"))).toEqual([]);
  });

  it("says nothing about two relations at different grains that are NOT declared peers", () => {
    const s = { ...series("month"), peers: undefined };
    delete (s as { peers?: unknown }).peers;
    expect(boundaryCodes(s)).toEqual([]);
  });
});

describe("REL_PEER_GRAIN_DIVERGENCE — the table totals by month, the picture by day", () => {
  // Two aggregations of ONE relation to different target grains are two
  // different claims. Which realization each ends up in is downstream and
  // irrelevant: the divergence is already in the derivations.
  const peers = (secondTarget: string[]) => ({
    relations: {
      events: { grain: ["day", "product"], fields: { day: key, product: key, revenue: ratio } },
      by_day: {
        grain: ["day"],
        fields: { day: key, revenue: ratio },
        derivedBy: { kind: "aggregate-to-grain", from: "events", toGrain: ["day"] },
      },
      by_other: {
        grain: secondTarget,
        fields: Object.fromEntries([...secondTarget.map((g) => [g, key]), ["revenue", ratio]]),
        derivedBy: { kind: "aggregate-to-grain", from: "events", toGrain: secondTarget },
      },
    },
    peers: [["by_day", "by_other"]],
  });

  it("refuses two peers that aggregate one relation to different target grains", () => {
    expect(boundaryCodes(peers(["product"]))).toEqual([DIAG.PEER_GRAIN_DIVERGENCE]);
  });

  it("admits two peers that aggregate to the same target grain", () => {
    expect(boundaryCodes(peers(["day"]))).toEqual([]);
  });

  it("names the shared source relation as the subject, since that is what the two claims are about", () => {
    expect(boundary(peers(["product"]))[0].subject).toBe("events");
  });
});

describe("REL_FLOW_NOT_CONSERVED and the conservation obligation — leaking sankey", () => {
  // `requiresConservation` is a REQUIREMENT, never evidence. Declaring it can
  // only raise the question; the edge values answer it.
  const flow = () => ({
    relations: {
      edges: { grain: ["src", "dst"], fields: { src: key, dst: key, amount: ratio } },
      sankey: {
        grain: ["src", "dst"],
        fields: { src: key, dst: key, amount: ratio },
        derivedBy: { kind: "graph", from: "edges", edgeFrom: "src", edgeTo: "dst", value: "amount", requiresConservation: true },
      },
    },
  });
  const rows = (middleOut: number): Evidence => ({
    rows: {
      edges: [
        { src: "a", dst: "b", amount: 10 },
        { src: "b", dst: "c", amount: middleOut },
      ],
    },
  });

  it("is unproven, not admissible, before any edge value is seen", () => {
    const f = boundary(flow());
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe("obligation");
    expect(f[0].term).toBe(OBLIGATION.CONSERVATION);
    expect(f[0].engine).toBe("task-invariant");
    expect(f[0].evidenceClass).toBe("instance");
    expect(judge(valid(flow()), []).status).toBe("unproven");
  });

  it("refuses rows that leak at a node which is neither source nor sink", () => {
    const f = boundary(flow(), rows(7));
    expect(f.map((x) => x.code)).toEqual([DIAG.FLOW_NOT_CONSERVED]);
    expect(f[0].subject).toBe("sankey.b");
    expect(f[0].evidenceClass).toBe("instance");
    expect(f[0].detail).toContain("flow into b is 10 but flow out is 7");
  });

  it("discharges the obligation when the rows balance", () => {
    expect(boundaryCodes(flow(), rows(10))).toEqual([]);
  });

  it("does not demand balance at the endpoints, where flow enters and leaves", () => {
    // `a` emits 10 and receives nothing; `c` receives 10 and emits nothing.
    // Only `b` is in between, and a rule that failed to make that distinction
    // would call every graph unconserved.
    expect(boundaryCodes(flow(), rows(10))).toEqual([]);
  });

  it("stays out of the way of a graph that claims nothing", () => {
    const s = flow();
    delete (s.relations.sankey.derivedBy as { requiresConservation?: true }).requiresConservation;
    expect(boundaryCodes(s)).toEqual([]);
  });
});

describe("REL_GRAIN_FANOUT from the declaration — double-counted revenue, order count that equals line count", () => {
  // The cardinality is the re-earned coordinate: it makes fan-out decidable
  // from the declaration instead of only from rows. On the many side of a
  // one-to-many join, each one-side row is repeated once per match.
  const joined = (cardinality: "one-to-many" | "many-to-one" | "one-to-one") => ({
    relations: {
      orders: { grain: ["order_id"], fields: { order_id: key, revenue: ratio } },
      lines: { grain: ["line_id"], fields: { line_id: key, order_id: key, qty: ratio } },
      order_lines: {
        grain: cardinality === "one-to-many" ? ["line_id"] : ["order_id"],
        fields: { order_id: key, line_id: key, revenue: ratio, qty: ratio },
        derivedBy: { kind: "join", from: "orders", with: "lines", cardinality },
      },
    },
  });
  const ask = (field: string, op: "sum" | "mean" | "count" | "min") =>
    [{ kind: "aggregate", relation: "order_lines", field, op }] as Assertion[];

  it("refuses summing the one-side measure after a one-to-many join", () => {
    const j = judge(valid(joined("one-to-many")), ask("revenue", "sum"));
    expect(codesOf(j)).toEqual([DIAG.GRAIN_FANOUT]);
    expect(j.diagnostics[0].evidenceClass).toBe("schema");
    expect(j.diagnostics[0].engine).toBe("additivity");
  });

  it("refuses counting the one-side key after a one-to-many join, which counts lines not orders", () => {
    expect(codesOf(judge(valid(joined("one-to-many")), ask("order_id", "count")))).toEqual([DIAG.GRAIN_FANOUT]);
  });

  it("admits the same aggregate over a measure of the surviving side", () => {
    expect(codesOf(judge(valid(joined("one-to-many")), ask("qty", "sum")))).toEqual([]);
  });

  it("follows the cardinality rather than the operand order: many-to-one duplicates the other side", () => {
    expect(codesOf(judge(valid(joined("many-to-one")), ask("revenue", "sum")))).toEqual([]);
    expect(codesOf(judge(valid(joined("many-to-one")), ask("qty", "sum")))).toEqual([DIAG.GRAIN_FANOUT]);
  });

  it("admits either side after a one-to-one join, where nothing is repeated", () => {
    expect(codesOf(judge(valid(joined("one-to-one")), ask("revenue", "sum")))).toEqual([]);
    expect(codesOf(judge(valid(joined("one-to-one")), ask("qty", "sum")))).toEqual([]);
  });

  it("exempts an order statistic, which repetition does not move", () => {
    expect(codesOf(judge(valid(joined("one-to-many")), ask("revenue", "min")))).toEqual([]);
  });

  it("separates the two ways fan-out goes wrong: a shared key is safe to SUM and unsafe to COUNT", () => {
    // `order_id` is carried by both sides, so the join manufactures no value
    // for it — the value branch must leave it alone. But it is a grain column
    // of the repeated side, so counting it counts lines while calling them
    // orders. A single "duplicated fields" set could not express both.
    const fan = valid(joined("one-to-many"));
    const sum = judge(fan, [{ kind: "aggregate", relation: "order_lines", field: "order_id", op: "sum" }] as Assertion[]);
    expect(codesOf(sum)).not.toContain(DIAG.GRAIN_FANOUT);
    expect(codesOf(judge(fan, ask("order_id", "count")))).toEqual([DIAG.GRAIN_FANOUT]);
  });

  it("counts the surviving side's own identity without complaint", () => {
    expect(codesOf(judge(valid(joined("one-to-many")), ask("line_id", "count")))).toEqual([]);
  });
});

describe("a refuted derivation withholds its own semantic findings too", () => {
  it("reports the well-formedness refusal alone, not the semantic complaint underneath it", () => {
    // The bin has no closure AND its result drops the binned field. The second
    // means the operator could not have produced this result at all, so the
    // closure complaint would be a finding about nothing.
    const s = valid({
      relations: {
        readings: { grain: ["reading_id"], fields: { reading_id: key, celsius: ratio } },
        bucketed: {
          grain: ["reading_id"],
          fields: { reading_id: key },
          derivedBy: { kind: "bin", from: "readings", field: "celsius" },
        },
      },
    });
    expect(boundaryCodes(s)).toEqual(["REL_DERIVATION_RESULT_NOT_DERIVABLE"]);
  });
});

describe("every stage-2 rule reaches the judgment it belongs in", () => {
  it("routes a boundary diagnostic to illegal and a boundary obligation to unproven", () => {
    const leak = valid({
      relations: {
        edges: { grain: ["src", "dst"], fields: { src: key, dst: key, amount: ratio } },
        sankey: {
          grain: ["src", "dst"],
          fields: { src: key, dst: key, amount: ratio },
          derivedBy: { kind: "graph", from: "edges", edgeFrom: "src", edgeTo: "dst", value: "amount", requiresConservation: true },
        },
      },
    });
    const unseen = judge(leak, []);
    expect(unseen.status).toBe("unproven");
    expect(termsOf(unseen)).toEqual([OBLIGATION.CONSERVATION]);

    const seen = judge(leak, [], {
      rows: {
        edges: [
          { src: "a", dst: "b", amount: 10 },
          { src: "b", dst: "c", amount: 4 },
        ],
      },
    });
    expect(seen.status).toBe("illegal");
    expect(codesOf(seen)).toEqual([DIAG.FLOW_NOT_CONSERVED]);
    expect(termsOf(seen)).toEqual([]);
  });
});
