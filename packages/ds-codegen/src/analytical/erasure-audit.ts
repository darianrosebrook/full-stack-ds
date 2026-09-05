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
import { authorityIdentities, footprintBasisDigest, type AuthorityIdentities } from "./authority.js";
import { loadCensus, loadPlans } from "./census.js";
import { ruleSurfaceDigest } from "./corpus-integrity.js";
import { loadClosures } from "./closure.js";
import { deletionFootprint, executePlan, wouldChange, type ErasurePlan } from "./erasure-plan.js";
import { separatingPairs, type PairFailure } from "./erasure-specimens.js";
import {
  checkWitness,
  FIXTURES_DIR,
  loadOracle,
  loadWitnesses,
  resolveSide,
  RULE_SOURCES,
  WITNESSES_FILE,
  type Witness,
} from "./necessity.js";
import { canonical } from "./quotient.js";
import { loadQuotientValidator, QUOTIENT_SCHEMA_VERSION } from "./quotient-image.js";
import { CONTRACTS_DIR } from "./emit-schemas.js";
import { parseFixtures, type Fixture } from "./structure.js";

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

/**
 * THE BINDINGS EVERY CERTIFIABLE REPORT CARRIES.
 *
 * A property of the report CONTRACT, shared by producer and consumer -- not of
 * either instance. The comparisons used to enumerate one instance's own keys:
 * inputs from `recorded.digests`, identities from `live.authority`. So removing
 * a key deleted its own obligation, and the gate stayed green. Enumerating the
 * union of both objects would not fix it either, since an identity missing from
 * both sides still leaves the obligation set.
 *
 * `computeReport` builds from these, so producer and consumer cannot disagree
 * about what a complete report is.
 */
export const REPORT_INPUTS: Record<string, () => Buffer> = {
  "fixtures.jsonl": () => fs.readFileSync(path.join(FIXTURES_DIR, "fixtures.jsonl")),
  "witnesses.json": () => fs.readFileSync(WITNESSES_FILE),
  "closures-stage2.json": () => fs.readFileSync(path.join(FIXTURES_DIR, "closures-stage2.json")),
};

/**
 * The identities every certifiable report carries, by cause.
 *
 * The consumer's declared contract. NOTE what this is and is not: the input
 * bindings above are CONSTRUCTED from their declaration, so producer and
 * consumer cannot disagree about them. The authority block is produced
 * independently, by `authorityIdentities(...) + ruleDigest`, and merely
 * VALIDATED against this list. That is an adequate compatibility check, but it
 * is a weaker mechanism than shared construction and should not be described
 * as the same thing.
 */
export const REPORT_AUTHORITIES = ["coordinateBasisDigest", "erasureAuthorityDigest", "witnessAuthorityDigest", "quotientSchemaVersion", "ruleDigest"] as const;

/** A recorded digest is 64 lowercase hex characters, or it is not evidence. */
const SHA256 = /^[0-9a-f]{64}$/;

/**
 * Is this binding EVIDENCE, or merely defined?
 *
 * Presence closed the deletion path: a required binding can no longer vanish
 * along with its own comparison. It does not close the AGREEMENT path, because
 * two reports carrying the same non-evidence compare equal. Measured before
 * this check existed: `null`, `""` and `"not-a-sha256"` on both sides were all
 * accepted, as was `quotientSchemaVersion: "banana"`.
 */
function inadmissible(key: string, value: unknown, side: string): string | undefined {
  if (value === undefined) return `the ${side} report carries no ${key}; it cannot be shown what produced it`;
  if (key === "quotientSchemaVersion") {
    return typeof value === "number" && Number.isInteger(value) && value > 0
      ? undefined
      : `the ${side} report's quotientSchemaVersion is not a schema version: ${JSON.stringify(value)}`;
  }
  return typeof value === "string" && SHA256.test(value) ? undefined : `the ${side} report's ${key} is not a sha256 digest: ${JSON.stringify(value)}`;
}

/**
 * The digest of a specimen population, by MEMBERSHIP.
 *
 * One recipe, used both for the population a report NAMES and for the
 * population a check was COMPUTED OVER, so the two are directly comparable.
 * Equal counts are not equal populations: a same-cardinality substitution
 * leaves every count intact and changes this.
 */
export function populationDigest(fixtures: Fixture[]): string {
  return sha(Buffer.from(fixtures.map(canonical).join("\u0000")));
}

/** The population one language report was actually computed over. */
export interface LanguageScope {
  specimens: number;
  /** sha over the canonical form of every specimen validated, in order. */
  populationDigest: string;
}

export interface LanguageScopes {
  sourceLanguageDeparture: LanguageScope;
  quotientLanguageInvalid: LanguageScope;
}

export interface FootprintReport {
  $comment: string;
  digests: Record<string, string>;
  /**
   * The authority this measurement was taken under, by CAUSE.
   *
   * `digests` above lists the data the report reads. These say what the report
   * MEANS: which coordinates exist, what an erasure does, what admits a
   * witness, and what the engine judges. A flat list of file digests reports
   * that something moved; these report which of those four moved, and only one
   * of them requires re-verifying erasure behaviour by hand.
   */
  authority: AuthorityIdentities & { ruleDigest: string };
  /**
   * The identity of the specimen POPULATION, held apart from the four above.
   *
   * A footprint claim is population-sensitive — "no specimen separates this" is
   * a statement about the specimens — while a witness is existential and
   * survives the population growing. Binding both to one identity would reject
   * standing that a new specimen cannot possibly have disturbed.
   */
  footprintBasisDigest: string;
  /** Which quotient language these images were measured in. */
  quotientSchemaVersion: number;
  specimens: { corpus: number; stimuli: number; synthesized: number; total: number; populationDigest: string };
  /** Coordinates for which no separating pair could be written, and why. */
  unbuilt: PairFailure[];
  /**
   * Erasures whose image is not an unmodified SOURCE declaration.
   *
   * Usually expected, and not by itself a defect. An erasure is a map into a
   * quotient language; nothing requires that language to be a subset of the
   * source one, any more than a compiler IR must parse as source. This count
   * exists to be READ, not to be driven to zero.
   */
  sourceLanguageDeparture: LanguageReport[];
  /**
   * Erasures whose image is not a legal QUOTIENT image. Always a defect.
   *
   * The terminal invariant of this lane, and the one with teeth: a required leaf
   * deleted with no marker left behind, an array emptied below its floor, a hole
   * that serializes as `null`, a branch tag written over another branch's
   * payload. Each of those has actually happened here.
   */
  quotientLanguageInvalid: LanguageReport[];
  /**
   * Which specimens each report above was computed over.
   *
   * Recorded so the artifact cannot name a population in `specimens` while a
   * report describes a subset of it -- the defect this field exists to make
   * impossible to reintroduce silently.
   */
  scopes: LanguageScopes;
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

export interface LanguageReport {
  coordinate: string;
  /** How many specimens the erasure produces an offending image from. */
  specimens: number;
  /** The first validator error, verbatim — enough to name the defect class. */
  error: string;
  /**
   * The first specimen the offending image came from.
   *
   * A finding that names only a plan cannot be chased: the same plan is legal
   * on most of the population, and the question is always WHICH specimen it is
   * illegal on.
   */
  specimen: string;
}

/**
 * Which erasures leave the source language, and which leave the quotient one.
 *
 * The same walk answers both, against two different validators, because the
 * whole point is that these are different questions and were previously one.
 * `source` rejecting an image is information; `quotient` rejecting it is a bug.
 *
 * THE TWO QUESTIONS HAVE DIFFERENT POPULATIONS, and this used to give them one.
 *
 * `sourceLanguageDeparture` is measured over the AUTHORED specimens only. That
 * is a REPORTING POLICY, not a logical necessity, and the old comment overstated
 * it: the synthesizer filters on "the INPUT validates as source", while this
 * statistic asks "does the IMAGE fail to validate as source". Those are
 * different propositions, and a source-valid input does not force a source-valid
 * image — the whole codomain exists because erasure leaves the source language.
 * Measured over everything, the synthesized population in fact exposes one
 * departure coordinate the authored population does not (63 against 62). The
 * scope is kept because the statistic is about authored intent, and it is now
 * recorded by membership so the narrower population is stated rather than
 * assumed.
 *
 * That argument does NOT transfer to `quotientLanguageInvalid`, and applying it
 * there was a coverage defect. Nothing filters the IMAGES — only the inputs —
 * so a synthesized specimen can produce an illegal quotient image as readily as
 * an authored one, and it is exactly the population written to reach shapes the
 * corpus does not. The check reported a `specimens` block naming 208 while
 * validating 112 of them, so 96 (46%) of the population the acceptance
 * criterion names never reached the invariant that criterion is about.
 *
 * The terminal invariant is now measured over EVERYTHING, in one walk, and both
 * scopes are reported by membership rather than by count — a report that names
 * a population it did not check is the defect, not a wrong number.
 */
export function languageReports(
  fixtures: Fixture[],
  /**
   * How many leading fixtures are authored. Source departure is tallied over
   * that prefix; quotient legality over all of them.
   */
  authored: number = fixtures.length,
  plans: Map<string, ErasurePlan> = loadPlans(),
): { sourceLanguageDeparture: LanguageReport[]; quotientLanguageInvalid: LanguageReport[]; scopes: LanguageScopes } {
  const source = loadOracle().validate;
  const quotient = loadQuotientValidator(CONTRACTS_DIR);
  const tally = (into: Map<string, LanguageReport>, id: string, errors: string[], specimen: string) => {
    if (errors.length === 0) return;
    const prev = into.get(id);
    if (prev) prev.specimens++;
    else into.set(id, { coordinate: id, specimens: 1, error: errors[0], specimen });
  };
  const departed = new Map<string, LanguageReport>();
  const illegal = new Map<string, LanguageReport>();
  for (const p of plans.values()) {
    fixtures.forEach((f, i) => {
      if (!wouldChange(f, p)) return;
      const image = executePlan(f, p);
      if (i < authored) tally(departed, p.id, source(image), f.id);
      tally(illegal, p.id, quotient(image), f.id);
    });
  }
  const order = (m: Map<string, LanguageReport>) =>
    [...m.values()].sort((a, b) => b.specimens - a.specimens || a.coordinate.localeCompare(b.coordinate));
  const scope = (fs: Fixture[]): LanguageScope => ({ specimens: fs.length, populationDigest: populationDigest(fs) });
  return {
    sourceLanguageDeparture: order(departed),
    quotientLanguageInvalid: order(illegal),
    // MEMBERSHIP, not just a count: two populations of the same size are not
    // the same population, and the whole failure here was a report naming one
    // population while checking another.
    scopes: { sourceLanguageDeparture: scope(fixtures.slice(0, authored)), quotientLanguageInvalid: scope(fixtures) },
  };
}

/**
 * `plans` is injectable so the ACCEPTANCE PATH can be falsified, not only the
 * helper beneath it. The defect this report was repaired for lived in the
 * caller's choice of population, so a falsifier that assembles its own array
 * and calls `languageReports` directly cannot reach it.
 */
export function computeReport(plans: Map<string, ErasurePlan> = loadPlans()): FootprintReport {
  const s = specimens();
  const m = measure(s.fixtures);
  return {
    $comment:
      "Measured semantic footprints. q is in the footprint of P iff E_q(s) = E_q(t) implies E_P(s) = E_P(t): a COARSENING relation, claimed from locators and operations and then falsified against specimens, never derived by string prefix on coordinate ids. (The earlier reading, `erasing q after P changes nothing`, is recorded in the module doc as rejected: it over-reports on merges.) `dead` names erasures no specimen distinguishes, which is a fact about the specimen set and not a verdict on the coordinate. `sourceLanguageDeparture` counts images that are not unmodified source declarations and is usually expected; `quotientLanguageInvalid` counts images that are not legal quotient images and is always a defect. The witness audit CLASSIFIES; it moves no standing, because a witness whose footprint exceeds what it declares is an adjudication, one at a time.",
    // DATA only. The source modules that used to be listed here one at a time
    // are covered by the identities below, over their whole import closure: a
    // per-file list under-claims by construction, and `erasure-specimens.ts`
    // synthesizes every pair the measurement depends on while never appearing
    // in it.
    digests: Object.fromEntries(Object.entries(REPORT_INPUTS).map(([name, read]) => [name, sha(read())])),
    authority: { ...authorityIdentities(QUOTIENT_SCHEMA_VERSION), ruleDigest: ruleSurfaceDigest(RULE_SOURCES) },
    footprintBasisDigest: footprintBasisDigest(s.fixtures.map(canonical)),
    quotientSchemaVersion: QUOTIENT_SCHEMA_VERSION,
    // The population the report NAMES, by membership. A scope that does not
    // reproduce this digest did not cover it, whatever its count says.
    specimens: { corpus: s.corpus, stimuli: s.stimuli, synthesized: s.synthesized, total: s.fixtures.length, populationDigest: populationDigest(s.fixtures) },
    unbuilt: s.unbuilt,
    ...languageReports(s.fixtures, s.corpus + s.stimuli, plans),
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
  // Over the REQUIRED set, so a comparison cannot be removed by removing the
  // key it compares. Presence is established below, per side; this decides
  // only whether the bound values agree.
  for (const k of Object.keys(REPORT_INPUTS)) {
    const was = recorded.digests?.[k];
    const now = live.digests?.[k];
    if (was !== undefined && now !== undefined && was !== now) problems.push(`input ${k} moved since the report was recorded`);
  }
  // Named separately from the data inputs, and by cause. "An input moved" is
  // one finding; "the coordinates moved" and "what an erasure does moved" are
  // two, and they call for different re-verification before re-recording.
  const recordedAuthority = recorded.authority as unknown as Record<string, string | number>;
  const liveAuthority = live.authority as unknown as Record<string, string | number>;
  for (const k of REPORT_AUTHORITIES) {
    if (recordedAuthority?.[k] === undefined || liveAuthority?.[k] === undefined) continue;
    if (recordedAuthority[k] !== liveAuthority[k]) {
      problems.push(`authority ${k} moved since the report was recorded: ${String(recordedAuthority?.[k])} -> ${String(liveAuthority[k])}`);
    }
  }
  if (recorded.footprintBasisDigest !== live.footprintBasisDigest) {
    // A footprint claim is population-sensitive and a witness is not, so this
    // rejects the classifications without touching witness standing.
    problems.push("the specimen population moved: every footprint classification bound to footprintBasisDigest is rejected");
  }
  const ids = new Set([...Object.keys(recorded.footprints), ...Object.keys(live.footprints)]);
  for (const id of [...ids].sort()) {
    const a = recorded.footprints[id];
    const b = live.footprints[id];
    if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(`footprint of ${id}: ${JSON.stringify(a)} -> ${JSON.stringify(b)}`);
  }
  // THE COVERAGE CHECK. `quotientLanguageInvalid` is the spec's terminal
  // invariant, and it must be measured over every specimen the report names --
  // not over a prefix of them. Checked by MEMBERSHIP: a population of the same
  // size is not the same population.
  // INTERNAL COHERENCE, ASSERTED OF EACH REPORT SEPARATELY.
  //
  // These checks only ever ran against `live`. A freshly computed coherent
  // report does not make a stored incoherent one coherent, so a recorded
  // report whose scope count contradicted its own named population, or whose
  // named-population digest contradicted its own scope digest, was certified.
  // Presence was required on both sides; agreement was required on neither.
  const coherent = (r: FootprintReport, side: "RECORDED" | "CURRENT"): string[] => {
    const out: string[] = [];
    const q = r.scopes?.quotientLanguageInvalid;
    const named = r.specimens?.populationDigest;
    // COMPLETENESS FIRST. Admission establishes that the required bindings are
    // present; only then does comparison decide whether their values agree.
    for (const k of Object.keys(REPORT_INPUTS)) {
      const bad = inadmissible(`binding for input ${k}`, r.digests?.[k], side);
      if (bad) out.push(bad);
    }
    for (const k of REPORT_AUTHORITIES) {
      const bad = inadmissible(k, (r.authority as unknown as Record<string, unknown>)?.[k], side);
      if (bad) out.push(bad);
    }
    // The population identity is carried separately from the authority block
    // and had only an equality comparison, so two reports missing it agreed.
    const bad = inadmissible("footprintBasisDigest", r.footprintBasisDigest, side);
    if (bad) out.push(bad);
    if (r.scopes?.sourceLanguageDeparture === undefined) out.push(`the ${side} report carries no sourceLanguageDeparture scope; it cannot state what it validated`);
    if (q === undefined) out.push(`the ${side} report carries no quotientLanguageInvalid scope; it cannot be shown to cover the population it names`);
    if (named === undefined) out.push(`the ${side} report names no population digest; coverage could only be compared by count, which two different populations can share`);
    // The count catches a scope that admits it saw fewer...
    if (q !== undefined && q.specimens !== r.specimens.total) {
      out.push(`the ${side} report's terminal invariant was measured over ${q.specimens} of ${r.specimens.total} specimens; a report must not name a population it did not check`);
    }
    // ...the digest catches one that saw as many, but not the same ones.
    if (q !== undefined && named !== undefined && q.populationDigest !== named) {
      out.push(`the ${side} report's terminal invariant covers a membership that is not the population it names: ${q.populationDigest.slice(0, 12)} vs ${named.slice(0, 12)}`);
    }
    return out;
  };
  problems.push(...coherent(recorded, "RECORDED"), ...coherent(live, "CURRENT"));

  // CROSS-RECORD STABILITY, which is a different claim from coverage: two
  // reports agreeing with each other proves neither covered what it names.
  //
  // The first version read `live.scopes` while its message said "recorded",
  // and compared with `if (was && now && ...)` -- so deleting a recorded scope
  // disabled the check instead of failing it, and a missing current
  // source-departure scope was skipped silently. Absence is now reported, and
  // reported separately on each side: a pre-scope record stays readable as
  // historical data, it just cannot receive the same certification.
  for (const k of ["sourceLanguageDeparture", "quotientLanguageInvalid"] as const) {
    const was = recorded.scopes?.[k];
    const now = live.scopes?.[k];
    if (was && now && was.populationDigest !== now.populationDigest) {
      problems.push(`the ${k} population moved: ${was.specimens} -> ${now.specimens} specimens, digest ${was.populationDigest.slice(0, 12)} -> ${now.populationDigest.slice(0, 12)}`);
    }
  }

  const key = (w: WitnessAudit) => `${w.witness}: ${w.verdict}`;
  const was = recorded.witnesses.map(key).sort();
  const is = live.witnesses.map(key).sort();
  for (const w of was.filter((x) => !is.includes(x))) problems.push(`witness classification gone: ${w}`);
  for (const w of is.filter((x) => !was.includes(x))) problems.push(`witness classification new: ${w}`);
  return { ok: problems.length === 0, problems };
}

/**
 * What the `--check` gate refuses, and why, over ONE report.
 *
 * Exported so the decision is reachable from a test rather than only from
 * `process.argv`. Both obligations must hold OF THE SAME OBJECT: the block
 * previously called `checkReport()` -- which computes its own live report
 * through its default argument -- and then `computeReport()` again, so
 * consistency described one sweep and legality another, and their conjunction
 * rested on the unstated assumption that the two agree.
 *
 * The causes stay named apart. Consistency is the report checker's obligation
 * and a report may faithfully describe a defect; zero illegal images is the
 * acceptance path's, and `footprints --check: OK` must not be readable as the
 * second when it only established the first.
 */
export function gateProblems(recorded: FootprintReport, live: FootprintReport): string[] {
  return [
    ...checkReport(recorded, live).problems.map((p) => `consistency: ${p}`),
    ...live.quotientLanguageInvalid.map(
      (i) => `terminal invariant: ${i.coordinate} produces an illegal quotient image on ${i.specimens} specimen(s), first ${i.specimen}: ${i.error}`,
    ),
  ];
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  if (process.argv.includes("--record")) {
    fs.writeFileSync(FOOTPRINTS_FILE, `${JSON.stringify(computeReport(), null, 2)}\n`);
    console.log(`footprints: recorded ${FOOTPRINTS_FILE}`);
  } else if (process.argv.includes("--check")) {
    // TWO OBLIGATIONS, kept apart and both enforced by the gate.
    //
    // `checkReport` is a CONSISTENCY checker: it asks whether the record still
    // faithfully describes the tree, and a report can faithfully describe a
    // defect. It never consults `quotientLanguageInvalid`, so on its own it
    // returns ok for a record that accurately reports an illegal image.
    //
    // The terminal invariant is a different obligation and belongs to the
    // acceptance path. The gate must satisfy both, or `footprints --check: OK`
    // gets read as evidence that no illegal image exists when it only says the
    // report has not drifted.
    // ONE REPORT, CERTIFIED BY BOTH OBLIGATIONS. See `gateProblems`.
    //
    // This read `checkReport()` -- which computes its own live report through
    // its default argument -- and then `computeReport()` again. Consistency and
    // coverage therefore applied to the first object while legality and the
    // success message described the second, and the conjunction held only under
    // the unstated assumption that two sweeps agree. The gate must preserve the
    // identity of what it certifies; sharing the snapshot also removes a second
    // full population sweep.
    const recorded = loadReport();
    const live = computeReport();
    const problems = gateProblems(recorded, live);
    const ok = problems.length === 0;
    console.log(
      ok
        ? `footprints --check: OK — report consistent, and 0 illegal quotient images over ${live.scopes.quotientLanguageInvalid.specimens} specimen(s)`
        : `footprints --check: ${problems.length} problem(s):\n  ${problems.join("\n  ")}`,
    );
    if (!ok) process.exit(1);
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
    // Two counts, deliberately printed with different framing. The first is a
    // reading; the second is the terminal invariant, and it is the only one a
    // reader should be alarmed by.
    console.log(
      `  ${report.sourceLanguageDeparture.length} erasure(s) leave the SOURCE language over ${report.scopes.sourceLanguageDeparture.specimens} authored specimen(s) (expected: a quotient image need not parse as a declaration)`,
    );
    console.log(`  ${report.quotientLanguageInvalid.length} erasure(s) produce an ILLEGAL quotient image over ${report.scopes.quotientLanguageInvalid.specimens} specimen(s) (must be 0):`);
    for (const i of report.quotientLanguageInvalid) console.log(`    ${String(i.specimens).padStart(3)}  ${i.coordinate.padEnd(50)} ${i.error}`);
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
