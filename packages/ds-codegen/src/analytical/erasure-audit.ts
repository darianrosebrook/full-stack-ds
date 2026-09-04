/**
 * The semantic footprint of an erasure, MEASURED.
 *
 * A footprint is "every proposition this operation makes unobservable". It was
 * previously derived by string prefix on coordinate ids — which is the same
 * conflation the plan registry exists to end, reached from a fourth side: ids
 * are an encoding choice, and a footprint computed from them certifies that
 * choice as semantics.
 *
 * So it is a COARSENING relation over quotients, claimed from the locators and
 * the operations and then falsified against specimens:
 *
 *   q is in the footprint of P  iff  E_q(s) = E_q(t) implies E_P(s) = E_P(t)
 *
 * `E_holder . E_child = E_holder` is not a special fact about holders; it is
 * this relation instantiated at a containment.
 *
 * Two readings were rejected on the way, and both are recorded because each is
 * a trap this lane has already fallen into once:
 *
 * - "erasing q after P changes nothing" over-reports on merges. After merging
 *   `nominal` into `interval`, erasing `ordinal~interval` is vacuous because no
 *   `interval` remains — yet the ordinal-versus-interval distinction SURVIVES,
 *   spelled ordinal-versus-nominal. That reading recorded six transformation
 *   pairs as destroyed by an erasure that keeps every one separable.
 * - measuring coarsening directly is vacuous where the specimens never collide,
 *   so an unexercised coordinate would land in every footprint. Structure
 *   claims; specimens can only refute.
 *
 * WHAT THIS CHANGES ABOUT PRIMITIVE SUPPORT. "One coordinate" can no longer
 * mean `witness.coordinates.length === 1`. A holding one-coordinate witness
 * whose erasure destroys five others is not primitive evidence for one
 * coordinate; it establishes something about a composite object.
 *
 * But WHICH composite object matters, and the strict `setEqual(declared,
 * actual)` test cannot say. Every excess in this corpus turns out to be a
 * REFINEMENT of a leaf the witness already names — deleting
 * `assertion.aggregate.op` destroys its six member pairs, which are finer
 * distinctions within the same declaration, not independent neighbours. None
 * reaches a leaf the witness never mentions. So the audit separates
 * `subsumes-refinements` from `over-erasing`, and today there are twelve of the
 * first and none of the second.
 *
 * This module classifies. It moves no standing: that is an adjudication, one
 * witness at a time.
 *
 * WHAT IT IS MEASURED OVER, and therefore what it cannot see. The specimen set
 * is the corpus plus every stimulus any witness or closure resolves to. A
 * distinction no specimen exercises is reported as `dead`, never as
 * "unnecessary" — the difference between those two readings is the whole reason
 * this lane exists.
 *
 *   pnpm run analytical:footprints          # report
 *   pnpm run analytical:footprints:record   # rewrite the committed report
 *   pnpm run analytical:footprints:check    # fail when the report is stale
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { FIXTURE_SCHEMA, loadCensus, loadPlans } from "./census.js";
import { loadClosures } from "./closure.js";
import { deletionFootprint, executePlan, wouldChange, type ErasurePlan } from "./erasure-plan.js";
import { separatingPairs, type PairFailure } from "./erasure-specimens.js";
import {
  checkWitness,
  FIXTURES_DIR,
  loadOracle,
  loadWitnesses,
  resolveSide,
  WITNESSES_FILE,
  type Witness,
} from "./necessity.js";
import { canonical } from "./quotient.js";
import { parseFixtures, type Fixture } from "./structure.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FOOTPRINTS_FILE = path.join(FIXTURES_DIR, "erasure-footprints.json");

const sha = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");

/**
 * Every representation the measurement gets to look at.
 *
 * The corpus alone is not enough: most witnesses argue from PATCHED stimuli
 * that no corpus line contains, and a footprint measured without them would
 * report a coordinate dead that its own witness exercises.
 */
export function specimens(): { fixtures: Fixture[]; corpus: number; stimuli: number; synthesized: number; unbuilt: PairFailure[] } {
  const oracle = loadOracle();
  const corpus = parseFixtures(fs.readFileSync(path.join(FIXTURES_DIR, "fixtures.jsonl"), "utf-8"));
  const seen = new Set(corpus.map(canonical));
  const extra: Fixture[] = [];
  const add = (f: Fixture) => {
    const c = canonical(f);
    if (seen.has(c)) return;
    seen.add(c);
    extra.push(f);
  };
  for (const w of loadWitnesses().witnesses) {
    for (const side of [w.a, w.b]) {
      try {
        add(resolveSide(side, oracle).fixture);
      } catch {
        // A stimulus whose base no longer exists is a witness problem, reported
        // by checkWitness; it must not take the measurement down with it.
      }
    }
  }
  for (const c of loadClosures().closures) {
    for (const side of [c.a, c.b]) {
      if (!side) continue;
      try {
        add(resolveSide(side, oracle).fixture);
      } catch {
        /* as above */
      }
    }
  }
  // Synthesized separating pairs are counted separately, because they are a
  // different kind of evidence: the corpus and the stimuli were authored to
  // make an argument, these were written to give a footprint claim something
  // that could refute it.
  const authored = [...corpus, ...extra];
  const built = separatingPairs(authored, oracle.validate);
  const synthesized: Fixture[] = [];
  for (const p of built.pairs) {
    for (const f of [p.a, p.b]) {
      const c = canonical(f);
      if (seen.has(c)) continue;
      seen.add(c);
      synthesized.push(f);
    }
  }
  return {
    fixtures: [...authored, ...synthesized],
    corpus: corpus.length,
    stimuli: extra.length,
    synthesized: synthesized.length,
    unbuilt: built.unbuilt,
  };
}

/** Two plans act on the same occurrence when their step lists agree exactly. */
const stepsOf = (p: ErasurePlan) => JSON.stringify(p.locator.steps);

/**
 * The claimed footprint of every plan.
 *
 * Two rules, each with its justification, and nothing else claimed:
 *
 * 1. An UNCONDITIONAL deletion coarsens every plan whose locator it contains.
 *    Whatever those plans could have identified lived inside the deleted slot.
 *    Containment is on the STEP LIST — a structural fact — never on the id
 *    string, which is an encoding choice. That distinction is what keeps
 *    `field.whole` from claiming `field.whole.perRow`: the first ends in
 *    `scalar-only`, so it is not a prefix of the second.
 *
 * 2. Forgetting a reference's INCIDENCE coarsens forgetting its ORDER at the
 *    same slot. Index-keyed tokens make `[a,b]` and `[b,a]` both `[t0,t1]`, so
 *    every permutation the order erasure identifies, incidence identifies too.
 *    The converse fails, and so does arity in both directions.
 *
 * A CONDITIONAL deletion — `spell-member-as-absent`, `delete-tagged-holder` —
 * claims nothing beyond itself: it acts only where the slot carries one member,
 * so it identifies nothing a sibling distinction depends on. If that is too
 * conservative the falsification pass reports the omission rather than the
 * claim being widened by hand.
 */
export function claimedFootprints(plans: Map<string, ErasurePlan> = loadPlans()): Map<string, string[]> {
  const all = [...plans.values()];
  const out = new Map<string, string[]>();
  for (const p of all) {
    const f = new Set<string>([p.id, ...deletionFootprint(p, all)]);
    if (p.operation.kind === "forget-reference-incidence") {
      for (const q of all) if (q.operation.kind === "forget-reference-order" && stepsOf(q) === stepsOf(p)) f.add(q.id);
    }
    out.set(p.id, [...f].sort());
  }
  // Containment is transitive on its own, but the incidence/order rule is not
  // reachable by it, so close the relation rather than assume it is closed.
  for (const p of all) {
    const f = new Set(out.get(p.id));
    for (let grew = true; grew; ) {
      grew = false;
      for (const id of [...f]) {
        for (const r of out.get(id) ?? []) {
          if (f.has(r)) continue;
          f.add(r);
          grew = true;
        }
      }
    }
    out.set(p.id, [...f].sort());
  }
  return out;
}

export interface Measurement {
  /** Coordinate id -> every coordinate its erasure makes unobservable, including itself. */
  footprints: Map<string, string[]>;
  /** Coordinates whose erasure changes no specimen. Dead HERE, not unnecessary. */
  dead: string[];
  /** Coordinates whose erasure identifies no two distinct specimens: unfalsifiable here. */
  unseparated: string[];
  /** Claimed coarsenings a specimen pair refutes. Must be empty. */
  refuted: { destroys: string; claimed: string; counterexample: string }[];
  /** Coarsenings the specimens support that the structural rules do not claim. */
  unclaimed: { destroys: string; supported: string }[];
}

export function measure(
  fixtures: Fixture[],
  plans: Map<string, ErasurePlan> = loadPlans(),
  /** Injectable so the falsification pass can itself be falsified. */
  claimed: Map<string, string[]> = claimedFootprints(plans),
): Measurement {
  const all = [...plans.values()];
  const baseline = fixtures.map(canonical);
  const sig = new Map<string, string[]>();
  for (const p of all) sig.set(p.id, fixtures.map((f, i) => (wouldChange(f, p) ? canonical(executePlan(f, p)) : baseline[i])));

  const dead = all.filter((p) => sig.get(p.id)!.every((s, i) => s === baseline[i])).map((p) => p.id).sort();

  /** Specimen index pairs each erasure identifies, where the specimens differ. */
  const identified = new Map<string, [number, number][]>();
  for (const p of all) {
    const blocks = new Map<string, number[]>();
    sig.get(p.id)!.forEach((s, i) => blocks.set(s, [...(blocks.get(s) ?? []), i]));
    const pairs: [number, number][] = [];
    for (const idx of blocks.values()) {
      for (let x = 0; x < idx.length; x++) {
        for (let y = x + 1; y < idx.length; y++) if (baseline[idx[x]] !== baseline[idx[y]]) pairs.push([idx[x], idx[y]]);
      }
    }
    identified.set(p.id, pairs);
  }

  const refuted: Measurement["refuted"] = [];
  const unclaimed: Measurement["unclaimed"] = [];
  for (const p of all) {
    const ps = sig.get(p.id)!;
    for (const q of all) {
      const pairs = identified.get(q.id)!;
      if (pairs.length === 0) continue; // nothing to falsify against
      const coarsens = pairs.every(([i, j]) => ps[i] === ps[j]);
      const isClaimed = claimed.get(p.id)!.includes(q.id);
      if (isClaimed && !coarsens) {
        const [i, j] = pairs.find(([x, y]) => ps[x] !== ps[y])!;
        refuted.push({ destroys: p.id, claimed: q.id, counterexample: `${fixtures[i].id} / ${fixtures[j].id}` });
      }
      if (!isClaimed && coarsens && p.id !== q.id) unclaimed.push({ destroys: p.id, supported: q.id });
    }
  }
  return {
    footprints: claimed,
    dead,
    unseparated: all.filter((p) => identified.get(p.id)!.length === 0).map((p) => p.id).sort(),
    refuted,
    unclaimed,
  };
}

/**
 * `subsumes-refinements` is a distinction the strict `setEqual(declared, actual)`
 * test cannot draw, and the two situations are not the same argument.
 *
 * Deleting `assertion.aggregate.op` destroys the leaf AND its six member pairs
 * — but those pairs are REFINEMENTS of the very leaf the witness names, not
 * independent neighbours. The witness establishes something about the
 * aggregate-operation family as a composite object, which is a weaker claim
 * than "the bare leaf is primitive" and a much stronger one than "this argument
 * reached outside itself".
 *
 * `over-erasing` is reserved for collateral on a leaf the witness never names.
 * That is the case a closure or an explicitly composite proposition is for.
 */
export type WitnessVerdict = "atomic" | "interaction" | "subsumes-refinements" | "over-erasing" | "unresolved-plan";

export interface WitnessAudit {
  /** Witnesses carry no ids; the stable handle is the coordinate set itself. */
  witness: string;
  declared: string[];
  /** Union of the declared coordinates' measured footprints. */
  actual: string[];
  /** In `actual` and not `declared` — what the argument destroys without saying so. */
  collateral: string[];
  /** Collateral on a leaf the witness never names: the serious half of the finding. */
  outside: string[];
  verdict: WitnessVerdict;
  holds: boolean;
  /** What the witness supports today, so a reclassification's cost is visible. */
  standing: "primitive" | "interaction-only" | "none";
}

export function auditWitnesses(m: Measurement, witnesses: Witness[] = loadWitnesses().witnesses): WitnessAudit[] {
  const census = loadCensus();
  const byId = new Map(census.map((c) => [c.id, c]));
  const oracle = loadOracle();
  const plans = loadPlans();
  return witnesses
    .map((w): WitnessAudit => {
      const declared = [...w.coordinates].sort();
      const holds = checkWitness(w, census, oracle).ok;
      const unplanned = declared.filter((id) => !plans.has(id));
      const actual = [...new Set(declared.flatMap((id) => m.footprints.get(id) ?? []))].sort();
      const collateral = actual.filter((id) => !declared.includes(id));
      const leaves = new Set(declared.map((id) => byId.get(id)?.leaf).filter((x): x is string => x !== undefined));
      const outside = collateral.filter((id) => !leaves.has(byId.get(id)?.leaf ?? ""));
      const verdict: WitnessVerdict =
        unplanned.length > 0
          ? "unresolved-plan"
          : outside.length > 0
            ? "over-erasing"
            : collateral.length > 0
              ? "subsumes-refinements"
              : declared.length === 1
                ? "atomic"
                : "interaction";
      return {
        witness: w.coordinates.join(" + "),
        declared,
        actual,
        collateral,
        outside,
        verdict,
        holds,
        standing: !holds ? "none" : declared.length === 1 ? "primitive" : "interaction-only",
      };
    })
    .sort((x, y) => x.witness.localeCompare(y.witness));
}

export interface FootprintReport {
  $comment: string;
  digests: Record<string, string>;
  specimens: { corpus: number; stimuli: number; synthesized: number; total: number };
  /** Coordinates for which no separating pair could be written, and why. */
  unbuilt: PairFailure[];
  /**
   * Erasures whose result is not a schema-valid representation.
   *
   * A necessity argument says "no consumer of the QUOTIENTED representation can
   * tell the two apart". Where the quotient leaves the language, there is no
   * such consumer, and the argument is standing on a shape the schema rejects.
   * Reported, never acted on: four of these currently support holding witnesses.
   */
  invalidating: { coordinate: string; specimens: number; error: string }[];
  /** Coordinate id -> measured footprint. Every plan appears, singleton or not. */
  footprints: Record<string, string[]>;
  /** Erasures no specimen distinguishes. A corpus fact; never read as a verdict. */
  dead: string[];
  /** Erasures that change specimens but identify no two distinct ones here. */
  unseparated: string[];
  /** Structural claims a specimen pair refutes. A non-empty list is a defect. */
  refuted: { destroys: string; claimed: string; counterexample: string }[];
  /** Coarsenings the specimens support and the structural rules do not claim. */
  unclaimed: { destroys: string; supported: string }[];
  witnesses: WitnessAudit[];
}

/**
 * Which erasures produce a representation the schema rejects.
 *
 * Measured over the AUTHORED specimens only. A synthesized pair is discarded
 * unless both sides validate, so including them would make this look better by
 * construction — the population would be filtered by the property being tested.
 */
export function invalidatingErasures(fixtures: Fixture[], plans: Map<string, ErasurePlan> = loadPlans()): FootprintReport["invalidating"] {
  const validate = loadOracle().validate;
  const out: FootprintReport["invalidating"] = [];
  for (const p of plans.values()) {
    let count = 0;
    let first = "";
    for (const f of fixtures) {
      if (!wouldChange(f, p)) continue;
      const errors = validate(executePlan(f, p));
      if (errors.length === 0) continue;
      count++;
      first ||= errors[0];
    }
    if (count > 0) out.push({ coordinate: p.id, specimens: count, error: first });
  }
  return out.sort((a, b) => b.specimens - a.specimens || a.coordinate.localeCompare(b.coordinate));
}

export function computeReport(): FootprintReport {
  const s = specimens();
  const m = measure(s.fixtures);
  return {
    $comment:
      "Measured semantic footprints (REL-VIEW-ALGEBRA-01). q is in the footprint of P iff q acts on some specimen AND erasing q after P changes nothing — i.e. E_q . E_P = E_P. Derived by measurement over the corpus plus every witness and closure stimulus, never by string prefix on coordinate ids. `dead` names erasures no specimen distinguishes, which is a fact about the specimen set and not a verdict on the coordinate. The witness audit CLASSIFIES; it moves no standing, because a witness whose footprint exceeds what it declares is an adjudication, one at a time.",
    digests: {
      "fixture.schema.json": sha(fs.readFileSync(FIXTURE_SCHEMA)),
      "fixtures.jsonl": sha(fs.readFileSync(path.join(FIXTURES_DIR, "fixtures.jsonl"))),
      "census.ts": sha(fs.readFileSync(path.join(HERE, "census.ts"))),
      "erasure-plan.ts": sha(fs.readFileSync(path.join(HERE, "erasure-plan.ts"))),
      "quotient.ts": sha(fs.readFileSync(path.join(HERE, "quotient.ts"))),
      "witnesses.json": sha(fs.readFileSync(WITNESSES_FILE)),
      "closures-stage2.json": sha(fs.readFileSync(path.join(FIXTURES_DIR, "closures-stage2.json"))),
    },
    specimens: { corpus: s.corpus, stimuli: s.stimuli, synthesized: s.synthesized, total: s.fixtures.length },
    unbuilt: s.unbuilt,
    invalidating: invalidatingErasures(s.fixtures.slice(0, s.corpus + s.stimuli)),
    footprints: Object.fromEntries([...m.footprints].sort(([a], [b]) => a.localeCompare(b))),
    dead: m.dead,
    unseparated: m.unseparated,
    refuted: m.refuted,
    unclaimed: m.unclaimed,
    witnesses: auditWitnesses(m),
  };
}

export function loadReport(file = FOOTPRINTS_FILE): FootprintReport {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as FootprintReport;
}

/** Which recorded facts the live tree no longer produces. */
export function checkReport(recorded = loadReport(), live = computeReport()): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  for (const [k, v] of Object.entries(recorded.digests)) {
    if (live.digests[k] !== v) problems.push(`input ${k} moved since the report was recorded`);
  }
  const ids = new Set([...Object.keys(recorded.footprints), ...Object.keys(live.footprints)]);
  for (const id of [...ids].sort()) {
    const a = recorded.footprints[id];
    const b = live.footprints[id];
    if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(`footprint of ${id}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
  }
  const key = (w: WitnessAudit) => `${w.witness}: ${w.verdict}`;
  const was = recorded.witnesses.map(key).sort();
  const is = live.witnesses.map(key).sort();
  for (const w of was.filter((x) => !is.includes(x))) problems.push(`witness classification gone: ${w}`);
  for (const w of is.filter((x) => !was.includes(x))) problems.push(`witness classification new: ${w}`);
  return { ok: problems.length === 0, problems };
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  if (process.argv.includes("--record")) {
    fs.writeFileSync(FOOTPRINTS_FILE, `${JSON.stringify(computeReport(), null, 2)}\n`);
    console.log(`footprints: recorded ${FOOTPRINTS_FILE}`);
  } else if (process.argv.includes("--check")) {
    const r = checkReport();
    console.log(r.ok ? "footprints --check: OK" : `footprints --check: ${r.problems.length} problem(s):\n  ${r.problems.join("\n  ")}`);
    if (!r.ok) process.exit(1);
  } else {
    const report = computeReport();
    const wide = Object.entries(report.footprints).filter(([, f]) => f.length > 1);
    console.log(
      `footprints: ${report.specimens.total} specimens (${report.specimens.corpus} corpus + ${report.specimens.stimuli} stimuli + ${report.specimens.synthesized} synthesized)`,
    );
    const byReason = new Map<string, string[]>();
    for (const u of report.unbuilt) {
      const key = u.reason.startsWith("schema-invalid") ? "erasing it produces a schema-invalid representation" : u.reason;
      byReason.set(key, [...(byReason.get(key) ?? []), u.coordinate]);
    }
    console.log(`  ${report.invalidating.length} erasure(s) leave the language (schema-invalid result):`);
    for (const i of report.invalidating) console.log(`    ${String(i.specimens).padStart(3)}  ${i.coordinate.padEnd(50)} ${i.error}`);
    console.log(`  ${report.unbuilt.length} coordinate(s) with no separating pair:`);
    for (const [reason, ids] of [...byReason].sort((a, b) => b[1].length - a[1].length)) {
      console.log(`    ${String(ids.length).padStart(3)}  ${reason}`);
      for (const id of ids.slice(0, 6)) console.log(`         ${id}`);
      if (ids.length > 6) console.log(`         … and ${ids.length - 6} more`);
    }
    console.log(`  ${wide.length} of ${Object.keys(report.footprints).length} erasures destroy more than themselves`);
    console.log(`  ${report.dead.length} erasure(s) no specimen distinguishes\n`);
    for (const [id, f] of wide.sort((a, b) => b[1].length - a[1].length).slice(0, 12)) {
      console.log(`  ${String(f.length).padStart(3)}  ${id}`);
    }
    if (report.refuted.length > 0) {
      console.log(`\nREFUTED structural claims (${report.refuted.length}):`);
      for (const r of report.refuted) console.log(`  ${r.destroys} does not destroy ${r.claimed}: ${r.counterexample}`);
    }
    if (report.unclaimed.length > 0) {
      console.log(`\nsupported but unclaimed (${report.unclaimed.length}):`);
      for (const u of report.unclaimed.slice(0, 20)) console.log(`  ${u.destroys} -> ${u.supported}`);
    }
    console.log(`\n${report.unseparated.length} erasure(s) identify no two distinct specimens`);
    const byVerdict = new Map<string, WitnessAudit[]>();
    for (const w of report.witnesses) byVerdict.set(w.verdict, [...(byVerdict.get(w.verdict) ?? []), w]);
    console.log("");
    for (const [v, ws] of [...byVerdict].sort()) console.log(`  ${String(ws.length).padStart(3)}  ${v}`);
    for (const v of ["over-erasing", "subsumes-refinements"] as const) {
      const ws = byVerdict.get(v) ?? [];
      if (ws.length === 0) continue;
      console.log(`\n${v} witnesses:`);
      for (const w of ws) {
        console.log(`  ${w.witness}`);
        console.log(`     supports ${w.standing}${w.holds ? "" : " (does not hold)"}`);
        console.log(`     also destroys ${w.collateral.join(", ")}`);
        if (w.outside.length > 0) console.log(`     OUTSIDE its declared leaves: ${w.outside.join(", ")}`);
      }
    }
  }
}
