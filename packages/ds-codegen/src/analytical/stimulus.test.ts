/**
 * Occurrence-bound prediction receipts (REL-VIEW-ALGEBRA-01, Step 6 gate).
 *
 * The receipt exists because a closure's obligation 3 cannot tell WHICH
 * derivation moved. Its holder is structural — `relation.derivedBy` addresses
 * every derivation at once — so on a fixture carrying two of them, erasing the
 * holder masks a rewrite at either, and "identical outside the holder" holds
 * whichever one the author actually touched. Six of the ninety bound fixtures
 * carry two derivations, and the one live derivation stimulus is built on one
 * of them.
 *
 * So the tests that matter here are the ones that FAIL when the cited cause and
 * the rewritten slot come apart. The occurrence swap is the central one: hold
 * every authored field fixed except `targetOccurrence`, re-freeze so the digest
 * clause cannot be what fires, point it at the OTHER derivation in the same
 * fixture, and require admission to refuse. If that mutant survives, the
 * occurrence binding is decorative and every receipt built on it is worthless.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { loadOracle } from "./necessity.js";
import {
  checkReceipt,
  checkReceipts,
  loadReceipts,
  predictionDigest,
  readPath,
  summarizeReceipts,
  under,
  type Precondition,
  type StimulusPrediction,
  type StimulusReceipt,
} from "./stimulus.js";

const oracle = loadOracle();
const live = () => loadReceipts().receipts[0]!;

/** Re-freeze after an edit, so the digest clause is never what a mutant trips. */
const refrozen = (edit: (p: StimulusPrediction) => StimulusPrediction, engine?: StimulusReceipt["engine"]): StimulusReceipt => {
  const edited = edit(structuredClone(live().prediction));
  return { prediction: { ...edited, digest: predictionDigest(edited) }, ...(engine ? { engine } : {}) };
};

const clauseOf = (check: ReturnType<typeof checkReceipt>, id: string) => check.clauses.find((c) => c.id.startsWith(id));

describe("the recorded receipts hold", () => {
  it("every receipt in the ledger passes every clause, and the summary names the ledger it read", () => {
    const result = checkReceipts();
    expect(result.problems).toEqual([]);
    expect(result.ok).toBe(true);
    for (const check of result.checks) {
      expect(check.verdict).toBe("held");
      expect(check.clauses.filter((c) => !c.held)).toEqual([]);
    }
    expect(summarizeReceipts(result)).toContain("stimulus receipts (REL-VIEW-ALGEBRA-01): OK");
  });

  it("the live ledger promotes nothing: its one receipt is a retrofit and no engine has been recorded against it", () => {
    expect(loadReceipts().receipts[0]!.prediction.provenance).toBe("retrofit");
    expect(loadReceipts().receipts[0]!.engine).toBeUndefined();
    expect(checkReceipts().promotable).toEqual([]);
  });

  it("promotion needs all three: held, authored before the engine, and agreeing — provenance alone decides between two otherwise identical ledgers", () => {
    const engine = { ranAt: "2026-09-06", observed: live().prediction.expected };
    const ledger = (r: StimulusReceipt) => {
      const file = path.join(os.tmpdir(), `receipts-${Math.random().toString(36).slice(2)}.json`);
      fs.writeFileSync(file, JSON.stringify({ receipts: [r] }));
      return checkReceipts(file, oracle);
    };

    const independent = ledger(refrozen((p) => ({ ...p, provenance: "authored-before-engine" }), engine));
    expect(independent.promotable).toEqual(["relation.derivedBy.kind:aggregate-to-grain~project"]);

    const retrofit = ledger(refrozen((p) => p, engine));
    expect(retrofit.checks[0]!.verdict).toBe("held");
    expect(retrofit.checks[0]!.agreement?.agrees).toBe(true);
    expect(retrofit.promotable).toEqual([]);

    const unrun = ledger(refrozen((p) => ({ ...p, provenance: "authored-before-engine" })));
    expect(unrun.checks[0]!.verdict).toBe("held");
    expect(unrun.promotable).toEqual([]);
  });
});

describe("the cited cause must explain the occurrence that moved", () => {
  it("swapping targetOccurrence to the other derivation in the same fixture, with the cause held fixed, is refused", () => {
    const swapped = refrozen((p) => ({ ...p, targetOccurrence: "structure.relations.hierarchy.derivedBy" }));
    const check = checkReceipt(swapped, oracle);

    expect(check.verdict).toBe("failed");
    // It is a real occurrence of the holder — so clause 1 does NOT fire, and the
    // refusal has to come from the cause/slot mismatch itself.
    expect(clauseOf(check, "1-occurrence")?.held).toBe(true);
    expect(clauseOf(check, "2a-occurrence-spells-the-source-member")?.held).toBe(false);
    expect(clauseOf(check, "2a-occurrence-spells-the-source-member")?.detail).toContain("nest");
    expect(clauseOf(check, "3-changes-contained-in-the-occurrence")?.held).toBe(false);
    expect(clauseOf(check, "3-changes-contained-in-the-occurrence")?.detail).toContain("structure.relations.flat.derivedBy");
  });

  it("a targetOccurrence that names no holder instance is refused before anything else is read", () => {
    const nowhere = refrozen((p) => ({ ...p, targetOccurrence: "structure.relations.sales.derivedBy" }));
    const check = checkReceipt(nowhere, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "1-occurrence")?.held).toBe(false);
    // `sales` declares no derivation, so it is not an occurrence — even though a
    // locator resolves a slot there. The detail lists the two that exist.
    const enumerated = clauseOf(check, "1-occurrence")!.detail.split("occurrence(s) of relation.derivedBy: ")[1]!;
    expect(enumerated.split(", ")).toEqual([".structure.relations.flat.derivedBy", ".structure.relations.hierarchy.derivedBy"]);
  });

  it("a rewrite that does not spell the target member is refused: the carrier is about the pair, not about any edit at the slot", () => {
    const notTheTarget = refrozen((p) => ({
      ...p,
      patch: [{ set: "structure.relations.flat.derivedBy", value: { kind: "nest", from: "hierarchy", levels: ["state"] } }],
    }));
    const check = checkReceipt(notTheTarget, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "2b-rewrite-spells-the-target-member")?.held).toBe(false);
    expect(clauseOf(check, "2b-rewrite-spells-the-target-member")?.detail).toContain("nest");
  });
});

describe("containment is measured, not asserted", () => {
  it("a second patch op outside the occurrence is refused even though the occurrence itself is rewritten correctly", () => {
    const spills = refrozen((p) => ({
      ...p,
      patch: [...p.patch, { set: "structure.relations.hierarchy.derivedBy.levels", value: ["country"] }],
    }));
    const check = checkReceipt(spills, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "2b-rewrite-spells-the-target-member")?.held).toBe(true);
    expect(clauseOf(check, "3-changes-contained-in-the-occurrence")?.held).toBe(false);
    expect(clauseOf(check, "3-changes-contained-in-the-occurrence")?.detail).toContain("structure.relations.hierarchy.derivedBy.levels");
  });

  it("`under` distinguishes a sibling whose name extends the occurrence's from something inside it", () => {
    expect(under(".a.b", ".a.b")).toBe(true);
    expect(under(".a.b.c", ".a.b")).toBe(true);
    expect(under(".a.b[0]", ".a.b")).toBe(true);
    expect(under(".a.bc", ".a.b")).toBe(false);
  });

  it("a schema-invalid rewrite is refused: the b-side must be a fixture, not merely a JSON edit", () => {
    const invalid = refrozen((p) => ({
      ...p,
      patch: [{ set: "structure.relations.flat.derivedBy", value: { kind: "aggregate-to-grain", from: "hierarchy" } }],
    }));
    const check = checkReceipt(invalid, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "4-rewrite-is-schema-valid")?.held).toBe(false);
  });
});

describe("the freeze", () => {
  it("a prediction edited after it was frozen fails clause 0 and nothing further is read from it", () => {
    const p = structuredClone(live().prediction);
    const edited: StimulusReceipt = {
      prediction: { ...p, expected: { status: "admissible", codes: [], terms: [] } },
      engine: { ranAt: "2026-09-06", observed: { status: "admissible", codes: [], terms: [] } },
    };
    const check = checkReceipt(edited, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "0-frozen")?.held).toBe(false);
    expect(check.clauses).toHaveLength(1);
    expect(check.problems.join(" ")).toContain("edited after it was frozen");
    // The agreement it would have manufactured is never computed.
    expect(check.agreement).toBeUndefined();
  });

  it("the digest covers the occurrence: re-pointing it without re-freezing is a freeze failure, not a silent pass", () => {
    const p = structuredClone(live().prediction);
    const check = checkReceipt({ prediction: { ...p, targetOccurrence: "structure.relations.hierarchy.derivedBy" } }, oracle);
    expect(clauseOf(check, "0-frozen")?.held).toBe(false);
  });
});

describe("the target law must apply to the surroundings as they stand", () => {
  it("an unmet precondition makes the BASE ineligible, which is a different result from a defective receipt", () => {
    const unmet = refrozen((p) => ({
      ...p,
      target: { ...p.target, preconditions: [...p.target.preconditions, { path: "structure.relations.hierarchy.derivedBy.window", holds: "present" } as Precondition] },
    }));
    const check = checkReceipt(unmet, oracle);
    expect(check.verdict).toBe("ineligible");
    expect(clauseOf(check, "6b-preconditions-hold-unmodified")?.held).toBe(false);
    expect(clauseOf(check, "6b-preconditions-hold-unmodified")?.detail).toContain("structure.relations.hierarchy.derivedBy.window");
    // Every structural clause still held: the receipt is well-formed, the base is wrong.
    for (const id of ["0-frozen", "1-occurrence", "2a", "2b", "3-changes", "4-rewrite"]) expect(clauseOf(check, id)?.held).toBe(true);
  });

  it("a precondition INSIDE the occurrence is refused: it states what the rewrite writes, not what the surroundings carry", () => {
    const circular = refrozen((p) => ({
      ...p,
      target: { ...p.target, preconditions: [{ path: "structure.relations.flat.derivedBy.toGrain", holds: "present" } as Precondition] },
    }));
    const check = checkReceipt(circular, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "6a-preconditions-are-about-the-surroundings")?.held).toBe(false);
    expect(check.problems.join(" ")).toContain("what the rewrite writes");
  });

  it("an `equals` precondition reads the value, not merely the path", () => {
    const wrongValue = refrozen((p) => ({
      ...p,
      target: { ...p.target, preconditions: [{ path: "structure.relations.hierarchy.derivedBy.kind", holds: "equals", value: "join" } as Precondition] },
    }));
    expect(checkReceipt(wrongValue, oracle).verdict).toBe("ineligible");
    expect(readPath(oracle.fixtures.get("FX_PROJECT_DROPS_NEST_LEVEL"), "structure.relations.hierarchy.derivedBy.kind").value).toBe("nest");
  });
});

describe("citation and engine agreement", () => {
  it("an authority citing no oracle-grounded identifier is refused, so a plausible sentence cannot stand in for a law", () => {
    const prose = refrozen((p) => ({ ...p, target: { ...p.target, authority: "this seems like it would obviously be illegal" } }));
    const check = checkReceipt(prose, oracle);
    expect(check.verdict).toBe("failed");
    expect(clauseOf(check, "5-authorities-are-grounded")?.held).toBe(false);
    expect(clauseOf(check, "5-authorities-are-grounded")?.detail).toContain("target");
  });

  it("engine disagreement is recorded as disagreement and never resolved toward the engine", () => {
    const disagreeing = refrozen((p) => ({ ...p, provenance: "authored-before-engine" }), {
      ranAt: "2026-09-06",
      observed: { status: "illegal", codes: ["REL_DERIVATION_DISCARDS_MEMBERSHIP"], terms: [] },
    });
    const check = checkReceipt(disagreeing, oracle);
    expect(check.agreement?.agrees).toBe(false);
    expect(check.agreement?.expected.codes).toEqual(["REL_GRAIN_SUBTOTAL_MISMATCH"]);
    expect(check.agreement?.observed.codes).toEqual(["REL_DERIVATION_DISCARDS_MEMBERSHIP"]);
    expect(check.problems.join(" ")).toContain("recorded as disagreement");
    // The structural clauses still hold: the receipt is sound, the prediction was wrong.
    expect(check.verdict).toBe("held");
  });
});
