/**
 * Semantic erasure closure: a conditional proof constructor for DEPENDENT
 * representations (REL-VIEW-ALGEBRA-01).
 *
 * The strict retention rule is unchanged for INDEPENDENT coordinates:
 *
 *   erasing exactly coordinate `c` must destroy the independently grounded
 *   distinction.
 *
 * What this module corrects is treating that rule as universal. A tagged union
 * is not a Cartesian product of independently present coordinates; it is a
 * dependent sum,
 *
 *   Sigma constructor : Kind . Payload(constructor)
 *
 * where `toGrain` exists only under `aggregate-to-grain`, `keep` only under
 * `project`, `edgeFrom`/`edgeTo` only under `graph`. Once two constructors are
 * identified, their branch-indexed payload cannot remain untouched and still
 * produce a comparable encoding. The measured 1/3/4/5 raw-edit cardinalities on
 * the seven derivation constructors are therefore properties of the SERIALIZED
 * sum-type encoding, not measurements of semantic dimensionality.
 *
 * Leaving that unlicensed would make the schema's branch topology decide the
 * semantic result: all twenty non-control derivation pairs would lose standing
 * for the single reason that their constructors happen to require differently
 * named fields. That answers the subtraction with the representation under
 * test, which is the failure this lane exists to detect.
 *
 * So the proof object separates ONE semantic intervention from the
 * deterministic representational normalization it induces:
 *
 *   carrier         the single discriminator substitution under test
 *   normalization   the branch-conditional payload that must be erased for the
 *                   two encodings to enter the same comparison class
 *
 * `normalization`, never "cleanup": these coordinates may yet prove
 * semantically consequential. What is known now is only that their SERIALIZED
 * PRESENCE is conditional on the carrier's branch.
 *
 * This is a WITNESS CLASSIFICATION, not a sixth subtraction disposition. The
 * code-owned ledger vocabulary in `subtraction.ts` is unchanged, and a
 * provisional closure leaves its candidate's verdict `unresolved`. Nothing here
 * writes to `witnesses.json`, and no coordinate named here reaches
 * `primitiveRatified`.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { loadBranchSignatures, loadCensus, loadLocators, loadPlans, type BranchSignatures, type Coordinate } from "./census.js";
import { deletionFootprint, planAt, type ErasurePlan, type StructuralLocator } from "./erasure-plan.js";
import { basesForSpec, type SubtractionDisposition } from "./subtraction.js";
import {
  checkWitness,
  FIXTURES_DIR,
  interactionOnly,
  loadOracle,
  loadWitnesses,
  primitiveRatified,
  resolveSide,
  sameOutcome,
  type Oracle,
  type Side,
} from "./necessity.js";
import { canonical, planFor } from "./quotient.js";
import { executeAll } from "./erasure-plan.js";

/**
 * A reference to the holding witness that serves as a closure's control.
 *
 * By COORDINATE, because `witnesses.json` entries carry no ids: the stable
 * handle for "the witness that ratifies X" is X itself, and `primitiveRatified`
 * is what decides whether such a witness exists.
 */
export interface WitnessRef {
  coordinate: string;
}

/**
 * `provisional` — the carrier/normalization mechanism holds, but one or more
 *   normalization dependencies remain unresolved (or no control CAN exist).
 * `holding` — every proof obligation is discharged and the carrier has earned
 *   primitive standing.
 * `refuted` — a normalization coordinate independently carries the same
 *   distinction, an interaction remains, or the final quotient fails.
 */
export type ClosurePromotion = "provisional" | "holding" | "refuted";

export interface SemanticErasureClosure {
  /** Exactly one discriminator member-pair coordinate. */
  carrier: string;
  /**
   * The branch-field operations. Authored for inspectability, but obligation 2
   * requires them to equal the set DERIVED from the two branch signatures, and
   * each `footprint` to equal what the census actually carries under that
   * field — the author must not be able to pick whatever makes the collision
   * happen, nor to under-report what the erasure costs.
   */
  normalization: BranchNormalization[];
  control: WitnessRef;
  /**
   * Every coordinate whose standing must be settled before promotion: the union
   * of the operations' footprints, plus anything reached transitively when a
   * footprint coordinate is itself the carrier of another closure. That
   * transitivity is where a cycle would appear.
   */
  dependencies: string[];
  /** 1 + the residue on each side; the smallest raw erasure set. */
  minRawEdit: number;
  /** The claim under check, in the shape a verdict takes. */
  promotion: ClosurePromotion;
  /**
   * The controlled stimuli, when they have been constructed. Their ABSENCE is
   * a real state: obligations 3-6 are then not evaluable, which is exactly what
   * `provisional` says about the nineteen pairs whose stimuli nobody has built.
   */
  a?: Side;
  b?: Side;
  note?: string;
}

export interface ClosureFile {
  $comment?: string;
  spec?: string;
  policyRef?: string;
  closures: SemanticErasureClosure[];
}

export const CLOSURES_FILE = path.join(FIXTURES_DIR, "closures-stage2.json");

export function loadClosures(file = CLOSURES_FILE): ClosureFile {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as ClosureFile;
}

/** `<holder>.kind:<a>~<b>` -> its parts, or undefined when it is not one. */
export function parseCarrier(id: string): { leaf: string; holder: string; members: [string, string] } | undefined {
  const m = /^(.*\.kind):([^~]+)~([^~]+)$/.exec(id);
  if (!m) return undefined;
  return { leaf: m[1], holder: m[1].replace(/\.kind$/, ""), members: [m[2], m[3]] };
}

/**
 * One normalization step: FORGET a branch-conditional field.
 *
 * Normalization is an OPERATION, not a coordinate, and conflating the two
 * under-approximated the dependency set. Deleting `toGrain` from the encoding
 * does not erase only some `toGrain#present` proposition; it destroys the value
 * and therefore every semantic coordinate carried inside it — `#arity`,
 * `#order`, `#incidence`. Naming the operation after the handle that happened
 * to implement it made a closure look like it depended on one coordinate when
 * it depended on four. For `join.cardinality` the gap is larger: forgetting the
 * field forgets all six cardinality member pairs, not a bare leaf.
 *
 * So the operation is identified structurally, and its FOOTPRINT — what the
 * operation actually costs — is derived from the census rather than authored.
 */
export interface BranchNormalization {
  holder: string;
  branch: string;
  field: string;
  operation: "forget-branch-field";
  /** Every live semantic coordinate at or below the forgotten field. Derived, never authored. */
  footprint: string[];
}

/** The path a branch-field operation forgets. */
export const branchFieldPath = (n: Pick<BranchNormalization, "holder" | "branch" | "field">) => `${n.holder}.${n.branch}.${n.field}`;

/**
 * The erasure handle for a branch-field operation, as an executable plan.
 *
 * It is not a coordinate — the operation is "forget this branch-conditional
 * payload", which no retained coordinate names — but it is not a second system
 * either: its LOCATION comes from the same census registry every coordinate
 * plan's does. It used to be a synthetic `Coordinate` with a fabricated id,
 * which worked only because the quotient reconstructed locations from ids; once
 * the quotient executes plans, a fabricated id resolves to no plan and the
 * erasure silently does nothing, so `planAt` throws instead.
 */
export const forgetPath = (path: string, locators: Map<string, StructuralLocator> = loadLocators()): ErasurePlan =>
  planAt(`forget(${path})`, path, locators, { kind: "delete-holder" });

export const forgetBranchField = (
  n: Pick<BranchNormalization, "holder" | "branch" | "field">,
  locators: Map<string, StructuralLocator> = loadLocators(),
): ErasurePlan =>
  planAt(`forget(${branchFieldPath(n)})`, branchFieldPath(n), locators, {
    kind: "forget-branch-field",
    branch: n.branch,
    field: n.field,
  });

/**
 * Every coordinate a branch-field deletion at `path` makes unobservable.
 *
 * Computed from the LOCATORS the census emits, not from string prefixes on
 * coordinate ids. The two agree on every branch field in this schema, and the
 * agreement is a fact about this schema rather than a licence: an id prefix is
 * an encoding coincidence, and it is already wrong elsewhere — `field.whole`
 * prefixes `field.whole.perRow` as a string while its locator, which ends in
 * `scalar-only`, does not contain it. A footprint computed from ids would have
 * had the leaf subsuming a coordinate it cannot reach.
 */
export function footprintOf(path: string, plans: Map<string, ErasurePlan> = loadPlans(), locators = loadLocators()): string[] {
  return deletionFootprint(planAt(`forget(${path})`, path, locators, { kind: "delete-holder" }), plans.values());
}

export interface DerivedNormalization {
  /** Required payload each branch carries that the other does not. */
  residue: { [member: string]: string[] };
  /** The branch-field operations that erase that residue, in path order. */
  normalization: BranchNormalization[];
  /** Union of the operations' footprints: what the closure actually depends on. */
  footprint: string[];
  /** 1 + the residue on each side. The count of raw EDITS, not of dependencies. */
  minRawEdit: number;
  /** Residue on BOTH sides — the shape a <=2-coordinate witness cannot express. */
  bilateral: boolean;
}

/**
 * Derive the normalization set MECHANICALLY, from the symmetric difference of
 * the two branch payload signatures.
 *
 * Erasing a discriminator rewrites one member's tag to the other's. Required
 * payload each branch carries that the other does not is RESIDUE: it survives
 * the rewrite and keeps the two encodings out of the same comparison class.
 */
export function deriveNormalization(
  carrier: string,
  signatures: Map<string, BranchSignatures> = loadBranchSignatures(),
): DerivedNormalization | { error: string } {
  const parsed = parseCarrier(carrier);
  if (!parsed) return { error: `${carrier} is not a discriminator member-pair id` };
  const sig = signatures.get(parsed.leaf);
  if (!sig) return { error: `${parsed.leaf} is not a discriminated union in the schema` };
  const [a, b] = parsed.members;
  const reqA = sig.required[a];
  const reqB = sig.required[b];
  if (!reqA || !reqB) return { error: `${parsed.leaf} has no branch ${!reqA ? a : b}` };

  const residue: DerivedNormalization["residue"] = {
    [a]: reqA.filter((f) => !reqB.includes(f)),
    [b]: reqB.filter((f) => !reqA.includes(f)),
  };
  const normalization: BranchNormalization[] = [];
  for (const [branch, fields] of Object.entries(residue)) {
    for (const field of fields) {
      const n = { holder: parsed.holder, branch, field, operation: "forget-branch-field" as const, footprint: [] as string[] };
      normalization.push({ ...n, footprint: footprintOf(branchFieldPath(n)) });
    }
  }
  normalization.sort((x, y) => branchFieldPath(x).localeCompare(branchFieldPath(y)));
  const counts = [residue[a].length, residue[b].length];
  return {
    residue,
    normalization,
    footprint: [...new Set(normalization.flatMap((n) => n.footprint))].sort(),
    minRawEdit: 1 + counts[0] + counts[1],
    bilateral: counts[0] > 0 && counts[1] > 0,
  };
}

/**
 * Sibling member pairs on the same discriminator with COMPATIBLE branch payload
 * topology: an empty symmetric difference, so a single-coordinate witness for
 * them is possible at all.
 */
export function compatibleControls(
  carrier: string,
  census: Coordinate[] = loadCensus(),
  signatures: Map<string, BranchSignatures> = loadBranchSignatures(),
): string[] {
  const parsed = parseCarrier(carrier);
  if (!parsed) return [];
  return census
    .filter((c) => c.kind === "member-pair" && c.leaf === parsed.leaf && c.id !== carrier)
    .filter((c) => {
      const d = deriveNormalization(c.id, signatures);
      return !("error" in d) && d.normalization.length === 0;
    })
    .map((c) => c.id)
    .sort();
}

/**
 * Every identifier the frozen oracle grounds: corpus case ids, diagnostic
 * codes, obligation terms, holdout fixture ids.
 *
 * Obligation 3 requires a hand-adjudicated side to cite one. Without that the
 * "not merely engine output" clause is unfalsifiable prose — `resolveSide`
 * never labels a source `engine`, so a `cause` reading "probe only" would sail
 * through while being exactly what the clause forbids. Citing a grounded
 * identifier does not prove the reasoning is right; it proves the author was
 * required to name the authority they claim to be reading, which is the part a
 * checker can enforce.
 */
export function groundedVocabulary(oracle: Oracle): Set<string> {
  const out = new Set<string>();
  for (const id of oracle.fixtures.keys()) {
    const o = oracle.outcomeOf(id);
    if (!o) continue;
    for (const c of o.outcome.codes) out.add(c);
    for (const t of o.outcome.terms) out.add(t);
    const name = o.source.split(":")[1];
    if (name) out.add(name);
  }
  return out;
}

/** The live standing of one coordinate, for obligation 8. */
export type Standing =
  | { state: "primitive" }
  | { state: "interaction-only" }
  | { state: "resolved"; disposition: SubtractionDisposition }
  | { state: "unresolved" }
  | { state: "unowned" };

export interface StandingIndex {
  of(coordinate: string): Standing;
}

/** Standing read from the live witnesses and every basis the spec opened. */
export function loadStanding(spec = "REL-VIEW-ALGEBRA-01", oracle: Oracle = loadOracle(), census: Coordinate[] = loadCensus()): StandingIndex {
  const holding = loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok);
  const primitive = primitiveRatified(holding);
  const interaction = new Set(interactionOnly(holding));
  const verdicts = new Map<string, SubtractionDisposition>();
  for (const { ledger } of basesForSpec(spec)) {
    for (const id of ledger.basis.candidates) verdicts.set(id, ledger.verdicts[id]?.disposition ?? "unresolved");
  }
  return {
    of(coordinate) {
      if (primitive.has(coordinate)) return { state: "primitive" };
      if (interaction.has(coordinate)) return { state: "interaction-only" };
      const d = verdicts.get(coordinate);
      if (d === undefined) return { state: "unowned" };
      return d === "unresolved" ? { state: "unresolved" } : { state: "resolved", disposition: d };
    },
  };
}

export interface Obligation {
  id: string;
  held: boolean;
  /** Neither held nor failed: the condition cannot be evaluated or cannot exist. */
  unevaluable?: boolean;
  detail: string;
}

export interface ClosureCheck {
  carrier: string;
  /** False for a MALFORMED proof object — distinct from a refuted one. */
  ok: boolean;
  problems: string[];
  obligations: Obligation[];
  promotion: ClosurePromotion;
  derived?: DerivedNormalization;
  /** Set when obligation 7 is unsatisfiable by construction rather than false. */
  classification?: "indeterminate";
  /** How a dependency that later earns standing must be re-read. */
  rereadIf?: string;
  standing: { coordinate: string; standing: Standing }[];
}

const REREAD =
  "A normalization coordinate gaining primitive standing does not erase this structural measurement; it changes the inference. " +
  "`carrier + normalization collides` remains a true fact about the encoding, but `the carrier is independently primitive` no longer follows from it. " +
  "The result becomes either a DERIVED DISCRIMINATOR (the branch payload already identifies the constructor, so the tag is reporting vocabulary or decoding convenience) " +
  "or a COMPOSITE CONSTRUCTOR (tag and payload jointly constitute one irreducible semantic object, and neither coordinate deserves primitive standing alone). " +
  "Which one it is must be re-decided, never assumed.";

/**
 * Check one closure against the eight proof obligations.
 *
 * Obligations 3-6 need stimuli. A closure with none is not thereby wrong — it
 * is a structural measurement whose stimuli have not been constructed, and its
 * promotion is `provisional`. Reporting those obligations as FAILED would make
 * "nobody has built the fixtures yet" indistinguishable from "the mechanism
 * does not hold", which are opposite findings.
 */
export function checkClosure(
  closure: SemanticErasureClosure,
  census: Coordinate[] = loadCensus(),
  oracle: Oracle = loadOracle(),
  standingIndex: StandingIndex = loadStanding("REL-VIEW-ALGEBRA-01", oracle, census),
  ledger: SemanticErasureClosure[] = [],
  signatures: Map<string, BranchSignatures> = loadBranchSignatures(),
): ClosureCheck {
  const problems: string[] = [];
  const obligations: Obligation[] = [];
  const byId = new Map(census.map((c) => [c.id, c]));
  const coord = (id: string) => byId.get(id);

  // 1. SINGLE SEMANTIC CARRIER. The semantic witness bound stays at one
  //    carrier; raw normalization cardinality is not counted against it.
  const parsed = parseCarrier(closure.carrier);
  const carrierCoord = coord(closure.carrier);
  const c1 = parsed !== undefined && carrierCoord?.kind === "member-pair" && carrierCoord.leaf.endsWith(".kind");
  obligations.push({
    id: "1-single-semantic-carrier",
    held: c1,
    detail: c1 ? `${closure.carrier} is the only discriminator substitution` : `${closure.carrier} is not a live discriminator member-pair coordinate`,
  });
  if (!c1 || !parsed) {
    problems.push(`${closure.carrier}: obligation 1 failed, so nothing further can be derived`);
    return { carrier: closure.carrier, ok: false, problems, obligations, promotion: "refuted", standing: [] };
  }

  // 2. MECHANICALLY DERIVED NORMALIZATION.
  const derived = deriveNormalization(closure.carrier, signatures);
  if ("error" in derived) {
    problems.push(`${closure.carrier}: ${derived.error}`);
    return { carrier: closure.carrier, ok: false, problems, obligations, promotion: "refuted", standing: [] };
  }
  const norm = (ns: BranchNormalization[]) =>
    [...ns]
      .sort((x, y) => branchFieldPath(x).localeCompare(branchFieldPath(y)))
      .map((n) => `${n.operation}(${branchFieldPath(n)})=[${[...n.footprint].sort().join(",")}]`)
      .join("\n");
  const c2 = norm(closure.normalization) === norm(derived.normalization) && closure.minRawEdit === derived.minRawEdit;
  obligations.push({
    id: "2-mechanically-derived-normalization",
    held: c2,
    detail: c2
      ? `${derived.normalization.length} branch-field operation(s) from the symmetric difference of the branch signatures; minRawEdit ${derived.minRawEdit}; footprint of ${derived.footprint.length} coordinate(s)`
      : `authored operations/footprints do not match the derived ones:\n      authored: ${norm(closure.normalization).replace(/\n/g, "\n      ")}\n      derived:  ${norm(derived.normalization).replace(/\n/g, "\n      ")}`,
  });
  if (!c2) problems.push(`${closure.carrier}: authored normalization does not equal the derived set`);
  // A closure with nothing to normalize is not a weak closure; it is a
  // single-coordinate witness wearing the wrong record type, and admitting one
  // here would let a plain witness claim the closure form's licence.
  if (derived.normalization.length === 0) {
    problems.push(`${closure.carrier}: derives an EMPTY normalization set, so it is a single-coordinate witness and belongs in witnesses.json`);
  }

  // Dependencies: the FOOTPRINT — every coordinate the operations destroy —
  // plus whatever it reaches transitively through the closures of its own
  // members. Walking the operation handles instead would under-report by
  // exactly the coordinates that made this refactor necessary.
  const byCarrier = new Map(ledger.map((c) => [c.carrier, c]));
  const deps = new Set<string>();
  const stack = [...derived.footprint];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (deps.has(id)) continue;
    deps.add(id);
    for (const n of byCarrier.get(id)?.normalization ?? []) for (const f of n.footprint) stack.push(f);
  }
  const depList = [...deps].sort();
  const declaredDeps = [...closure.dependencies].sort();
  if (declaredDeps.join("\n") !== depList.join("\n")) {
    problems.push(`${closure.carrier}: declared dependencies [${declaredDeps.join(", ")}] are not the reachable set [${depList.join(", ")}]`);
  }

  const stimuli = closure.a !== undefined && closure.b !== undefined;
  const unevaluable = (id: string, detail: string): Obligation => ({ id, held: false, unevaluable: true, detail });

  let a: ReturnType<typeof resolveSide> | undefined;
  let b: ReturnType<typeof resolveSide> | undefined;
  if (stimuli) {
    a = resolveSide(closure.a!, oracle);
    b = resolveSide(closure.b!, oracle);
  }

  // 3. CONTROLLED STIMULI: identical outside the discriminated holder, and
  //    their required outcomes differ under authority that is not the engine.
  //
  //    "Identical outside the holder" is checked by FORGETTING the holder path
  //    in both and comparing canonical forms.
  //
  //    This used to gather every census coordinate under `<holder>.` and erase
  //    those instead, which made a structural question depend on which
  //    coordinates the census happened to emit: once the required-child presence
  //    rule removed the coordinates that DELETE a required branch field, nothing
  //    in the set could remove it any more, and two stimuli differing only
  //    inside the holder began reporting as differing outside it. The same
  //    conflation the footprint model exists to fix, reached from a third side.
  if (!stimuli) {
    obligations.push(unevaluable("3-controlled-stimuli", "no stimuli constructed"));
  } else {
    const forgetHolder = [forgetPath(parsed.holder)];
    const outside = canonical(executeAll(a!.fixture, forgetHolder)) === canonical(executeAll(b!.fixture, forgetHolder));
    const differ = !sameOutcome(a!.outcome, b!.outcome);
    const vocabulary = groundedVocabulary(oracle);
    const ungrounded = ([["a", closure.a!], ["b", closure.b!]] as const)
      .filter(([, side]) => "base" in side && ![...vocabulary].some((v) => side.cause.includes(v)))
      .map(([label]) => label);
    const held = outside && differ && ungrounded.length === 0;
    obligations.push({
      id: "3-controlled-stimuli",
      held,
      detail: held
        ? `identical outside ${parsed.holder}; ${a!.source} vs ${b!.source} require different outcomes`
        : !outside
          ? `the stimuli differ somewhere other than ${parsed.holder}`
          : !differ
            ? `both stimuli require ${JSON.stringify(a!.outcome)}`
            : `hand-adjudicated side(s) ${ungrounded.join(", ")} cite no corpus case, diagnostic code or obligation term the frozen oracle grounds`,
    });
    for (const [label, side] of [["a", a!], ["b", b!]] as const) {
      const errors = oracle.validate(side.fixture);
      if (errors.length > 0) problems.push(`${closure.carrier}: stimulus ${label} is schema-invalid: ${errors.join("; ")}`);
    }
  }

  /** Erase the carrier (a census coordinate) and/or a set of branch-field operations. */
  const collidesUnder = (withCarrier: boolean, ops: BranchNormalization[]): boolean => {
    const cs: ErasurePlan[] = ops.map((o) => forgetBranchField(o));
    if (withCarrier) {
      const cc = coord(closure.carrier);
      const carrierPlan = cc && planFor(cc);
      if (!carrierPlan) return false;
      cs.push(carrierPlan);
    }
    return canonical(executeAll(a!.fixture, cs)) === canonical(executeAll(b!.fixture, cs));
  };

  // 4. CARRIER INSUFFICIENCY BEFORE NORMALIZATION: the carrier alone must not
  //    collide, and neither may the carrier with any PROPER subset of the
  //    derived normalization set. That is what makes the set minimal.
  if (!stimuli) {
    obligations.push(unevaluable("4-carrier-insufficient-before-normalization", "no stimuli constructed"));
  } else {
    const n = derived.normalization;
    const offenders: string[] = [];
    // The carrier ALONE is tested unconditionally, never as subset zero of the
    // sweep. When the normalization set is empty the sweep has no proper
    // subsets at all, and folding the two together silently skipped the one
    // clause obligation 4 exists for — reporting PASS for a carrier that in
    // fact collided on its own.
    if (collidesUnder(true, [])) offenders.push("the carrier alone");
    for (let mask = 1; mask < 1 << n.length; mask++) {
      const subset = n.filter((_, i) => (mask >> i) & 1);
      if (subset.length === n.length) continue;
      if (collidesUnder(true, subset)) offenders.push(`carrier + ${subset.map(branchFieldPath).join(" + ")}`);
    }
    obligations.push({
      id: "4-carrier-insufficient-before-normalization",
      held: offenders.length === 0,
      detail:
        offenders.length === 0
          ? `the carrier alone and every one of the ${(1 << n.length) - 2} other proper subsets leave the stimuli distinct`
          : `already collides: ${offenders.join("; ")}`,
    });
  }

  // 5. COMPLETE CLOSURE SUFFICIENCY.
  if (!stimuli) {
    obligations.push(unevaluable("5-complete-closure-sufficiency", "no stimuli constructed"));
  } else {
    const held = collidesUnder(true, derived.normalization);
    obligations.push({
      id: "5-complete-closure-sufficiency",
      held,
      detail: held ? "carrier + the complete normalization set collides the stimuli" : "an INTERACTION remains: the full set does not collide them",
    });
  }

  // 6. NORMALIZATION IS NOT THE CITED CAUSE: without the carrier it must not
  //    collide, every member must lie in payload conditional on one branch, and
  //    no member gains standing by appearing here.
  const misplaced = derived.normalization
    .filter((n) => n.holder !== parsed.holder || !parsed.members.includes(n.branch))
    .map(branchFieldPath);
  if (!stimuli) {
    obligations.push(
      misplaced.length > 0
        ? { id: "6-normalization-is-not-the-cited-cause", held: false, detail: `outside the branch payload: ${misplaced.join(", ")}` }
        : unevaluable("6-normalization-is-not-the-cited-cause", "branch-conditionality holds; the collision half needs stimuli"),
    );
  } else {
    const alone = collidesUnder(false, derived.normalization);
    const held = !alone && misplaced.length === 0;
    obligations.push({
      id: "6-normalization-is-not-the-cited-cause",
      held,
      detail: held
        ? `every operation is under ${parsed.holder}.{${parsed.members.join(",")}}., and applying them without the carrier leaves the stimuli distinct`
        : alone
          ? "the normalization set alone already collides the stimuli, so IT carries the distinction"
          : `outside the branch payload: ${misplaced.join(", ")}`,
    });
  }

  // 7. SAME-ENUM CONTROL. Where no compatible sibling pair exists, the
  //    condition is unsatisfiable by construction rather than false, and the
  //    classification is `indeterminate` — not a failure.
  const possible = compatibleControls(closure.carrier, census, signatures);
  const controlStanding = standingIndex.of(closure.control.coordinate);
  const controlValid = possible.includes(closure.control.coordinate) && controlStanding.state === "primitive";
  let indeterminate = false;
  if (possible.length === 0) {
    indeterminate = true;
    obligations.push(
      unevaluable("7-same-enum-control", `UNAVAILABLE: no sibling pair on ${parsed.leaf} has a compatible branch payload signature, so no control can exist`),
    );
  } else {
    obligations.push({
      id: "7-same-enum-control",
      held: controlValid,
      detail: controlValid
        ? `${closure.control.coordinate} has a compatible payload signature and a holding single-coordinate witness`
        : !possible.includes(closure.control.coordinate)
          ? `${closure.control.coordinate} is not a payload-compatible sibling; candidates: ${possible.join(", ") || "(none)"}`
          : `${closure.control.coordinate} is payload-compatible but its standing is ${controlStanding.state}, not primitive`,
    });
  }

  // 8. DEPENDENCY AND FIXED-POINT DISCHARGE, over the FOOTPRINT.
  //
  //   unresolved            -> the closure stays provisional
  //   interaction-only      -> the factorization stays open
  //   primitive             -> this closure cannot prove the carrier primitive:
  //                            tag and payload are composite under this encoding
  //   resolved non-primitive-> may advance, subject to the final quotient
  //
  // A coordinate retained as `required-derived-vocabulary` is reported
  // separately rather than folded into "removed artifact": it carries no
  // primitive semantics but it IS governed authority, and a closure that
  // silently treated the two alike would be erasing a name somebody requires.
  const standing = depList.map((coordinate) => ({ coordinate, standing: standingIndex.of(coordinate) }));
  const open = standing.filter((s) => s.standing.state === "unresolved" || s.standing.state === "unowned");
  const primitiveDeps = standing.filter((s) => s.standing.state === "primitive");
  const interactionDeps = standing.filter((s) => s.standing.state === "interaction-only");
  const governed = standing.filter((s) => s.standing.state === "resolved" && s.standing.disposition === "required-derived-vocabulary");
  const c8 = open.length === 0 && primitiveDeps.length === 0 && interactionDeps.length === 0;
  const say = (rows: typeof standing) => rows.map((s) => s.coordinate).join(", ");
  obligations.push({
    id: "8-dependency-and-fixed-point-discharge",
    held: c8,
    detail: c8
      ? `all ${standing.length} footprint coordinate(s) adjudicated non-primitive${governed.length > 0 ? ` (${governed.length} retained as required derived vocabulary: ${say(governed)})` : ""}; the simultaneous final quotient remains a close condition of the slice`
      : [
          open.length > 0 ? `${open.length} of ${standing.length} footprint coordinate(s) unadjudicated: ${say(open)}` : "",
          interactionDeps.length > 0 ? `${interactionDeps.length} interaction-only, so the factorization stays open: ${say(interactionDeps)}` : "",
          primitiveDeps.length > 0
            ? `${primitiveDeps.length} PRIMITIVE, so this closure cannot prove the carrier primitive — constructor and payload are composite under this encoding: ${say(primitiveDeps)}`
            : "",
        ]
          .filter(Boolean)
          .join("; "),
  });

  // Promotion. `refuted` is reserved for the three named causes; everything
  // else that is not fully discharged is `provisional`, because "not proven" and
  // "disproven" are different results and collapsing them would let an
  // unconstructed fixture read as a refutation.
  const failed = (id: string) => obligations.some((o) => o.id.startsWith(id) && !o.held && !o.unevaluable);
  const refuted = failed("5-") || failed("6-");
  const promotion: ClosurePromotion = refuted ? "refuted" : obligations.every((o) => o.held) ? "holding" : "provisional";

  return {
    carrier: closure.carrier,
    ok: problems.length === 0,
    problems,
    obligations,
    promotion,
    derived,
    classification: indeterminate ? "indeterminate" : undefined,
    rereadIf: primitiveDeps.length > 0 || interactionDeps.length > 0 || open.length > 0 ? REREAD : undefined,
    standing,
  };
}

export interface ClosureGateResult {
  ok: boolean;
  problems: string[];
  checks: ClosureCheck[];
  /** Closure carriers that reach themselves through their normalization sets. */
  cycles: string[][];
  /** Every distinct dependency across the ledger, with its live standing. */
  dependencies: { coordinate: string; standing: Standing; blocks: string[] }[];
}

/**
 * Strongly connected components of the carrier -> normalization graph with more
 * than one member, or a self-loop.
 *
 * A normalization coordinate whose own support eventually depends back on the
 * carrier is evidence of a COMPOSITE semantic object rather than two
 * independently primitive coordinates. Such a component stays unresolved until
 * it is refactored or discharged by the simultaneous quotient — a closure must
 * never be able to delete the competing carrier that stood in its way.
 */
export function closureCycles(closures: SemanticErasureClosure[]): string[][] {
  // Edges run carrier -> FOOTPRINT: a cycle is a footprint coordinate whose
  // own support eventually depends back on the carrier, which is the signature
  // of a composite semantic object rather than two independent coordinates.
  const edges = new Map(closures.map((c) => [c.carrier, c.normalization.flatMap((n) => n.footprint)]));
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const out: string[][] = [];
  let counter = 0;
  const strongconnect = (v: string): void => {
    index.set(v, counter);
    low.set(v, counter);
    counter += 1;
    stack.push(v);
    onStack.add(v);
    for (const w of edges.get(v) ?? []) {
      if (!index.has(w)) {
        strongconnect(w);
        low.set(v, Math.min(low.get(v)!, low.get(w)!));
      } else if (onStack.has(w)) {
        low.set(v, Math.min(low.get(v)!, index.get(w)!));
      }
    }
    if (low.get(v) === index.get(v)) {
      const component: string[] = [];
      for (;;) {
        const w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
        if (w === v) break;
      }
      const selfLoop = component.length === 1 && (edges.get(component[0]) ?? []).includes(component[0]);
      if (component.length > 1 || selfLoop) out.push(component.sort());
    }
  };
  for (const c of closures.map((x) => x.carrier)) if (!index.has(c)) strongconnect(c);
  return out.sort((x, y) => x.join().localeCompare(y.join()));
}

export function checkClosures(file = CLOSURES_FILE): ClosureGateResult {
  const ledger = loadClosures(file);
  const census = loadCensus();
  const oracle = loadOracle();
  const signatures = loadBranchSignatures();
  const standingIndex = loadStanding("REL-VIEW-ALGEBRA-01", oracle, census);
  const problems: string[] = [];

  const dupes = [...new Set(ledger.closures.map((c) => c.carrier).filter((id, i, all) => all.indexOf(id) !== i))].sort();
  if (dupes.length > 0) problems.push(`duplicate closure carrier(s): ${dupes.join(", ")}`);

  const checks = ledger.closures.map((c) => checkClosure(c, census, oracle, standingIndex, ledger.closures, signatures));
  for (const c of checks) problems.push(...c.problems);
  // The recorded promotion is a CLAIM, checked exactly as a verdict is.
  for (const [i, c] of checks.entries()) {
    const claimed = ledger.closures[i].promotion;
    if (claimed !== c.promotion) problems.push(`${c.carrier}: recorded promotion "${claimed}" but the obligations yield "${c.promotion}"`);
  }
  // No closure may confer standing. This is the guarantee that adopting the
  // proof form did not quietly widen what ratifies a coordinate.
  const primitive = primitiveRatified(loadWitnesses().witnesses.filter((w) => checkWitness(w, census, oracle).ok));
  for (const c of checks) {
    if (c.promotion !== "holding" && primitive.has(c.carrier)) {
      problems.push(`${c.carrier}: is primitively ratified while its closure is ${c.promotion}`);
    }
  }

  const blocks = new Map<string, string[]>();
  for (const c of checks) for (const s of c.standing) blocks.set(s.coordinate, [...(blocks.get(s.coordinate) ?? []), c.carrier].sort());
  const dependencies = [...blocks.keys()]
    .sort()
    .map((coordinate) => ({ coordinate, standing: standingIndex.of(coordinate), blocks: blocks.get(coordinate)! }));

  return { ok: problems.length === 0, problems, checks, cycles: closureCycles(ledger.closures), dependencies };
}

/**
 * The TERMINAL condition, which `--check` deliberately does not test.
 *
 * `--check` asks whether the ledger is internally consistent: derived
 * operations, footprints, obligations, and the recorded promotion all agree.
 * Every one of the twenty-two closures satisfies that today while every one is
 * `provisional`, so a command called `--gate` that reported OK on consistency
 * alone would read, to anyone glancing at CI, as "the closures are settled".
 * They are not settled; nothing they carry may be spent.
 *
 * So the two are separated and `--gate` fails until the experiment can close:
 * no carrier still provisional, no dependency still unresolved, no cycle.
 */
export function closureGate(r: ClosureGateResult): { ok: boolean; message: string } {
  const provisional = r.checks.filter((c) => c.promotion === "provisional").map((c) => c.carrier);
  const refuted = r.checks.filter((c) => c.promotion === "refuted").map((c) => c.carrier);
  const open = r.dependencies.filter((d) => d.standing.state !== "resolved").map((d) => d.coordinate);
  const reasons = [
    r.ok ? "" : `${r.problems.length} consistency problem(s) — see --check`,
    refuted.length > 0 ? `${refuted.length} refuted carrier(s): ${refuted.join(", ")}` : "",
    provisional.length > 0 ? `${provisional.length} of ${r.checks.length} carrier(s) still provisional` : "",
    open.length > 0 ? `${open.length} dependency coordinate(s) without a settled standing` : "",
    r.cycles.length > 0 ? `${r.cycles.length} dependency cycle(s)` : "",
  ].filter(Boolean);
  return {
    ok: reasons.length === 0,
    message:
      reasons.length === 0
        ? `closures --gate: OK — all ${r.checks.length} carrier(s) holding with settled dependencies`
        : `closures --gate: REL-VIEW-ALGEBRA-01 cannot close on these closures:\n  ${reasons.join("\n  ")}`,
  };
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  const r = checkClosures();
  if (process.argv.includes("--check")) {
    console.log(r.ok ? `closures --check: OK — ${r.checks.length} closure(s) consistent with their obligations` : r.problems.join("\n"));
    if (!r.ok) process.exit(1);
  } else if (process.argv.includes("--gate")) {
    const g = closureGate(r);
    console.log(g.message);
    if (!g.ok) process.exit(1);
  } else {
    const byPromotion = new Map<string, number>();
    for (const c of r.checks) byPromotion.set(c.promotion, (byPromotion.get(c.promotion) ?? 0) + 1);
    console.log(`closures: ${r.checks.length} semantic-erasure-closure record(s)`);
    for (const [p, n] of [...byPromotion].sort()) console.log(`  ${String(n).padStart(4)}  ${p}`);
    console.log(`\n${r.dependencies.length} distinct dependency coordinate(s) across ${r.checks.length} carriers:`);
    for (const d of r.dependencies) {
      console.log(`  ${d.coordinate.padEnd(56)} ${d.standing.state.padEnd(16)} blocks ${d.blocks.length}`);
    }
    console.log(r.cycles.length === 0 ? "\nno dependency cycles" : `\n${r.cycles.length} cycle(s): ${r.cycles.map((c) => c.join(" -> ")).join("; ")}`);
    if (r.problems.length > 0) console.log(`\n${r.problems.length} problem(s):\n  ${r.problems.join("\n  ")}`);
  }
}
