/**
 * The Stage-2 subtraction gate, and the separation that makes it admissible.
 *
 * Two claims are under test and they are different claims:
 *
 * - The gate is a slice-completion proof obligation over a FROZEN basis, not a
 *   freeze over the live kernel. It must not re-derive its candidates from the
 *   current census, and growth in the census must not reopen it.
 * - Constructor existence is governed separately from coordinate necessity. No
 *   coordinate verdict can remove a constructor, and — the subtler half — the
 *   current corpus population must not be what mechanically owns vocabulary
 *   existence either, or the cheap discharge simply moves one level upstream to
 *   deleting the referencing case.
 *
 * Every gate case below is synthetic, so the tests keep their meaning as the
 * live ledger burns down.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { loadCensus } from "./census.js";
import { Derivation } from "./relation-model.js";
import {
  checkSubtraction,
  loadSubtraction,
  verdictDrift,
  type SubtractionLedger,
} from "./subtraction.js";

const live = loadSubtraction();

const ledgerOf = (over: Partial<SubtractionLedger>): SubtractionLedger => ({
  dispositions: {
    unresolved: "not yet adjudicated",
    witnessed: "a holding witness ratifies it",
    "representation-artifact": "another coordinate already carries the distinction",
    "not-yet-admitted": "no active authority requires it",
  },
  basis: { frozenAt: "abc1234", reason: "test", digest: "0".repeat(64), count: 2, candidates: ["a.b", "c.d"] },
  constructors: {},
  verdicts: { "a.b": { disposition: "unresolved" }, "c.d": { disposition: "unresolved" } },
  ...over,
});

const check = (l: SubtractionLedger) => checkSubtraction("<synthetic>", l);

describe("the close condition is a verdict per candidate, not a smaller schema", () => {
  it("refuses to close while any candidate is unadjudicated", () => {
    const r = check(ledgerOf({}));
    expect(r.ok).toBe(false);
    expect(r.unresolved).toEqual(["a.b", "c.d"]);
    expect(r.message).toContain("cannot claim ratification");
  });

  it("closes when every candidate carries a reasoned verdict, whichever verdict it is", () => {
    const r = check(
      ledgerOf({
        verdicts: {
          "a.b": { disposition: "witnessed", reason: "witnessed by FX_X | FX_Y under CASE_Z" },
          "c.d": { disposition: "not-yet-admitted", reason: "no active authority distinguishes it", reintroducibleAt: 3 },
        },
      }),
    );
    expect(r.ok).toBe(true);
    expect(r.problems).toEqual([]);
  });

  it("refuses a verdict with no reason, which is a bare enumeration and discharges nothing", () => {
    const r = check(ledgerOf({ verdicts: { "a.b": { disposition: "witnessed" }, "c.d": { disposition: "unresolved" } } }));
    expect(r.problems).toContain("a.b: witnessed with no reason");
  });

  it("refuses a removal with no re-earning stage, so absence stays re-earnable rather than final", () => {
    const r = check(
      ledgerOf({
        verdicts: {
          "a.b": { disposition: "not-yet-admitted", reason: "nothing requires it" },
          "c.d": { disposition: "unresolved" },
        },
      }),
    );
    expect(r.problems).toContain("a.b: not-yet-admitted with no reintroducibleAt stage");
  });

  it("refuses a verdict for something the experiment never opened, and a candidate with no verdict", () => {
    expect(check(ledgerOf({ verdicts: { ...ledgerOf({}).verdicts, "e.f": { disposition: "witnessed", reason: "x" } } })).problems).toContain(
      "verdict e.f is not in the frozen basis",
    );
    expect(check(ledgerOf({ verdicts: { "a.b": { disposition: "unresolved" } } })).problems).toContain("candidate c.d has no verdict entry");
  });
});

describe("the basis is frozen, so a later stage's growth cannot reopen this one", () => {
  it("takes its candidates from the recorded basis and never from the live census", () => {
    // The gate must be decidable with no census at all. If it read
    // `loadCensus()` it would be a shrink-only ledger keyed to an evolving
    // population, which is the shape the freeze doctrine forbids.
    const r = check(ledgerOf({}));
    expect(r.unresolved).toEqual(["a.b", "c.d"]);
    // Neither synthetic id exists in the live kernel; the gate did not notice
    // and must not.
    const kernelIds = new Set(loadCensus().map((c) => c.id));
    expect(kernelIds.has("a.b")).toBe(false);
  });

  it("a live coordinate outside the basis is never a failure of this gate", () => {
    // Ownership is a repo-level invariant that no single experiment owns; this
    // gate must not be able to see one. `checkSubtraction` reads only the
    // frozen basis, so its result cannot mention anything outside it.
    expect(check(live).unresolved.every((id) => live.basis.candidates.includes(id))).toBe(true);
    expect(check(live).problems.every((p) => live.basis.candidates.some((id) => p.includes(id)) || p.startsWith("basis"))).toBe(true);
  });

  it("the live ledger's basis is internally consistent", () => {
    expect(live.basis.candidates).toHaveLength(live.basis.count);
    expect(new Set(live.basis.candidates).size).toBe(live.basis.count);
    expect(check(live).problems).toEqual([]);
  });
});

describe("a verdict must be true of the live tree, or it is a story about it", () => {
  const drift = (verdicts: SubtractionLedger["verdicts"], live: string[], ratified: string[]) =>
    verdictDrift(ledgerOf({ verdicts }), new Set(live), new Set(ratified));

  it("catches a coordinate recorded as witnessed that no witness ratifies", () => {
    expect(drift({ "a.b": { disposition: "witnessed", reason: "r" }, "c.d": { disposition: "unresolved" } }, ["a.b", "c.d"], [])).toEqual([
      "a.b: recorded witnessed, but no holding witness ratifies it",
    ]);
  });

  it("catches a removal that was decided but never applied", () => {
    for (const d of ["not-yet-admitted", "representation-artifact"] as const) {
      expect(drift({ "a.b": { disposition: d, reason: "r", reintroducibleAt: 3 }, "c.d": { disposition: "unresolved" } }, ["a.b"], [])).toEqual([
        `a.b: recorded ${d}, but the kernel still carries it`,
      ]);
    }
  });

  it("catches a coordinate that quietly earned a witness while still recorded unresolved", () => {
    expect(drift({ "a.b": { disposition: "unresolved" }, "c.d": { disposition: "unresolved" } }, ["a.b"], ["a.b"])).toEqual([
      "a.b: is ratified but still recorded unresolved",
    ]);
  });

  it("is silent when every verdict has taken effect", () => {
    expect(
      drift(
        {
          "a.b": { disposition: "witnessed", reason: "r" },
          "c.d": { disposition: "not-yet-admitted", reason: "r", reintroducibleAt: 3 },
        },
        ["a.b"],
        ["a.b"],
      ),
    ).toEqual([]);
  });
});

describe("constructor existence is governed separately from coordinate necessity", () => {
  const kinds = () => Derivation.options.map((o) => o.shape.kind.value as string).sort();

  it("every constructor the algebra admits carries a required disposition and a retention rationale", () => {
    const required = Object.entries(live.constructors)
      .filter(([, c]) => c.disposition === "required")
      .map(([k]) => k)
      .sort();
    expect(required).toEqual(kinds());
    for (const [name, c] of Object.entries(live.constructors)) {
      expect(c.retentionRationale.trim().length, `${name} has no retention rationale`).toBeGreaterThan(0);
      expect(c.evidenceCases.length, `${name} cites no case`).toBeGreaterThan(0);
      expect(c.removableWhen.trim().length, `${name} does not say what could retire it`).toBeGreaterThan(0);
    }
  });

  it("the ledger points at the law rather than stating it, so it is not a second authority for meaning", () => {
    // A subtraction that authored the definitions it then found necessary would
    // be circular, which is the failure this whole slice has been removing. So
    // every constructor's `authorityRef` must name real loci that really carry
    // the operator, and the ledger's own prose must be about survival.
    const repo = path.resolve(__dirname, "../../../..");
    for (const [name, c] of Object.entries(live.constructors)) {
      for (const [role, refText] of Object.entries(c.authorityRef)) {
        const file = refText.split(/[ (§]/)[0];
        const p = path.join(repo, file);
        expect(fs.existsSync(p), `${name}.authorityRef.${role} names a missing file ${file}`).toBe(true);
        expect(fs.readFileSync(p, "utf-8"), `${name}.authorityRef.${role} (${file}) does not mention ${name}`).toContain(name);
      }
    }
  });

  it("no coordinate verdict can reach a constructor: the two ledgers do not share a key", () => {
    // The structural guarantee behind "coordinate subtraction cannot remove a
    // constructor". A verdict is keyed by coordinate id; a constructor by
    // operator name; `checkSubtraction` reads only the former. If a constructor
    // could be retired by adjudicating `relation.derivedBy.kind:a~b`, the
    // cheapest discharge of an unwitnessed pair would be deleting an operator.
    for (const id of live.basis.candidates) expect(id in live.constructors).toBe(false);
    const retired = check({ ...live, constructors: {} });
    expect(retired.problems).toEqual([]);
    expect(retired.ok).toBe(check(live).ok);
  });

  it("a constructor's necessity is not owned by the current corpus population", () => {
    // Cases are EVIDENCE that Stage-2 authority needs the constructor, not the
    // mechanism that keeps it alive. If deleting the referencing case were
    // enough to retire an operator, the cheap discharge would have moved one
    // level upstream. So retirement requires its own disposition, and the
    // ledger says so per constructor.
    for (const [name, c] of Object.entries(live.constructors)) {
      expect(c.disposition, `${name}`).toBe("required");
      expect(c.removableWhen, `${name}`).toMatch(/disposition/);
      expect(c.removableWhen, `${name}`).toMatch(/no coordinate verdict/);
    }
  });
});

describe("the gate is a slice obligation, not repo admission", () => {
  it("is not wired into CI or any hook", () => {
    // Terminal at zero. A standing gate keyed to this experiment would fire
    // inside later slices that neither caused nor can discharge it.
    const repo = path.resolve(__dirname, "../../../..");
    const ci = path.join(repo, ".github/workflows/ci.yml");
    if (fs.existsSync(ci)) expect(fs.readFileSync(ci, "utf-8")).not.toContain("analytical:subtraction");
    const hooks = path.join(repo, ".caws/hooks");
    if (fs.existsSync(hooks)) {
      for (const f of fs.readdirSync(hooks)) {
        const p = path.join(hooks, f);
        if (fs.statSync(p).isFile()) expect(fs.readFileSync(p, "utf-8"), f).not.toContain("analytical:subtraction");
      }
    }
  });

  it("reads a ledger file rather than requiring one to exist at a fixed path", () => {
    // So the ledger can become historical evidence after the slice closes.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "subtraction-"));
    const file = path.join(dir, "elsewhere.json");
    fs.writeFileSync(file, JSON.stringify(ledgerOf({})));
    expect(checkSubtraction(file).unresolved).toEqual(["a.b", "c.d"]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
