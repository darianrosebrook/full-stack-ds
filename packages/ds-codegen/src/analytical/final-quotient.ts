/**
 * The final quotient (REL-VIEW-ALGEBRA-01 close condition `final-quotient`).
 *
 * The subtraction ledgers record, coordinate by coordinate, that a candidate
 * is a REPRESENTATION ARTIFACT: erasing it cannot collapse two representations
 * because another coordinate already carries the distinction. Each such
 * verdict is an argument about ONE coordinate against the kernel as it stood
 * when the verdict was written. The close condition asks a different question:
 *
 *   after SIMULTANEOUSLY removing every coordinate adjudicated out, evaluated
 *   over the final retained set as a whole, does every artifact remain
 *   redundant?
 *
 * Otherwise two coordinates can each be declared carried by the other, both be
 * removed, and collectively erase the distinction — the cyclic form of the
 * instrument problem the isolation rule closes for single erasures. The
 * quotient successor showed the same shape at the level of listings: 514
 * closure-listing violations that no individual closure proof exposed. Local
 * arguments compose badly; this module is where the composition is checked.
 *
 * WHAT A REMOVAL IS HERE. None of the recorded artifacts is a live coordinate
 * with an erasure plan. They were removed by census FACTORIZATION: a rule that
 * stops emitting a coordinate because its proposition is entailed by others.
 * The census records the required-child form itself (`derivedPresence`:
 * present(p) = present(H) AND branch(H) = k); the discriminator normal form
 * removed the `H.kind:m~<absent>` cross-terms, whose proposition is
 * present(H) AND kind(H) = m. So "executing the removal" is not an erasure to
 * run — it is a factorization to RECOGNIZE from the census, VERIFY on real
 * specimens, and HOLD against the final retained set. A verdict the checker
 * cannot recognize is a reason string and nothing more, and is refused here.
 *
 * Five properties are checked, and each is reported separately because they
 * fail for different reasons:
 *
 *  1. CONFLUENCE of any EXECUTABLE removal set. Artifacts that are still live
 *     with plans (a drift, not a design) would have to compose to one image
 *     whatever their listing; the A10 certifier decides, pairwise, and a
 *     non-confluent pair is refused rather than normalized through one order.
 *  2. NO GROUNDED COLLAPSE. Over every specimen with an adjudicated outcome,
 *     no two with DIFFERENT outcomes read identically on every retained
 *     coordinate. Coordinates are read through their own locators and
 *     operations — the information each erasure forgets — on the name-blind
 *     form. Instance-role coordinates (row-level facts) are read as a separate
 *     component, so a pair separated ONLY by rows is counted, not hidden.
 *  3. PRIMITIVE EVIDENCE SURVIVES. Every coordinate a holding single-coordinate
 *     witness ratifies is live and not adjudicated out.
 *  4. REQUIRED DERIVED VOCABULARY stays recoverable: a retained-by-name verdict
 *     must say what it is derivable from in terms of live retained coordinates.
 *  5. LEDGER AND FACTORIZATION AGREE. Every artifact verdict has a recognized
 *     factorization form, its carriers are live and retained, and the
 *     factorization is TRUE on every specimen and EXERCISED on both sides —
 *     a proposition no specimen exercises is unfalsified here, not proven.
 *
 * What this proves is bounded: a representational result over the admitted
 * schema, the frozen oracle and the specimens actually built. It does not prove
 * that a removed coordinate names nothing analytically real — only that this
 * representation, under this authority, cannot support it as an independent
 * degree of freedom.
 */
import * as path from "node:path";
import { alphaRename } from "./alpha-rename.js";
import {
  loadBranchSignatures,
  loadCensus,
  loadDerivedPresence,
  loadLocators,
  loadPlans,
  loadSequenceFacts,
  type BranchSignatures,
  type Coordinate,
  type DerivedPresence,
} from "./census.js";
import { loadClosures } from "./closure.js";
import { resolveSlots, type ErasurePlan, type StructuralLocator } from "./erasure-plan.js";
import {
  checkWitness,
  loadOracle,
  loadWitnesses,
  primitiveRatified,
  resolveSide,
  type Oracle,
  type Outcome,
} from "./necessity.js";
import type { QuotientImage } from "./quotient-image.js";
import type { SequenceFact } from "./relation-model.js";
import { distinctListingImages, nameBlindMap } from "./quotient.js";
import type { Fixture } from "./structure.js";
import { basesForSpec, type SubtractionDisposition } from "./subtraction.js";

type Json = Record<string, unknown>;
const obj = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * The factorization forms the census performs. A new one is a new census rule
 * and must be added here on purpose.
 *
 * `declared-set-order` is the third: a name list whose declaration says `set`
 * loses its `#order` facet, because no rule reads the position of its members.
 */
export type FactorizationForm = "required-child-presence" | "member-absence-cross-term" | "declared-set-order";

export interface Factorization {
  artifact: string;
  form: FactorizationForm;
  /** The live coordinates that carry the distinction the artifact was a cross-term of. */
  carriers: string[];
  /** Path of the discriminated holder H. */
  holder: string;
  branch?: string;
  /** required-child-presence: the property p required by `branch`. */
  property?: string;
  /** member-absence-cross-term: the member m. */
  member?: string;
  /** declared-set-order: the name-list leaf whose declaration says `set`. */
  leaf?: string;
}

/**
 * Recognize an artifact's factorization from the census, or return undefined.
 *
 * Recognition is mechanical on purpose: nothing here reads the verdict's
 * reason. A required-child presence is one the census records in
 * `derivedPresence`; a member-absence cross-term is `H.kind:m~<absent>` on a
 * discriminated union whose branch `m` the schema declares.
 */
export function factorizationOf(
  artifact: string,
  derived: DerivedPresence[] = loadDerivedPresence(),
  signatures: Map<string, BranchSignatures> = loadBranchSignatures(),
  census: Coordinate[] = loadCensus(),
  facts: Map<string, SequenceFact> = loadSequenceFacts(),
): Factorization | undefined {
  // A declared set: the facet is gone because the emission refused to invent it,
  // and what carries its distinction is the leaf's own `#incidence` (whose
  // erasure already identifies every permutation the order erasure did) together
  // with `#arity` (how many members there were). Recognition reads the SAME
  // declaration the walk read, so a list that ever declares `ordered` cannot be
  // filed this way.
  const order = /^(.+)#order$/.exec(artifact);
  if (order) {
    const leaf = order[1];
    if (facts.get(leaf) !== "set") return undefined;
    return { artifact, form: "declared-set-order", carriers: [`${leaf}#arity`, `${leaf}#incidence`], holder: `${leaf}#incidence`, leaf };
  }
  if (artifact.endsWith("#present")) {
    const d = derived.find((x) => x.proposition === artifact);
    if (!d) return undefined;
    const holder = d.holder.replace(/#present$/, "");
    const prefix = d.branch ? `${holder}.${d.branch}.` : `${holder}.`;
    if (!artifact.startsWith(prefix)) return undefined;
    const property = artifact.slice(prefix.length).replace(/#present$/, "");
    if (!property || property.includes(".")) return undefined;
    return {
      artifact,
      form: "required-child-presence",
      carriers: [d.holder, ...(d.branch ? [`${holder}.kind`] : [])],
      holder,
      ...(d.branch ? { branch: d.branch } : {}),
      property,
    };
  }
  const m = /^(.+)\.kind:([^~:]+)~<absent>$/.exec(artifact);
  if (m) {
    const holder = m[1];
    const member = m[2];
    // The tag may discriminate a union with per-branch payloads (the branch
    // signatures know it) or be a plain enum leaf on an optional holder
    // (`field.temporality.kind`, whose members carry no payload of their own).
    // Either way the cross-term is present(H) AND kind(H) = m, and `m` must be
    // a member the schema declares.
    const sig = signatures.get(`${holder}.kind`);
    const leaf = census.find((c) => c.kind === "leaf" && c.leaf === `${holder}.kind` && c.enum?.includes(member));
    if (!(sig && member in sig.required) && !leaf) return undefined;
    return { artifact, form: "member-absence-cross-term", carriers: [`${holder}#present`, `${holder}.kind`], holder, member };
  }
  return undefined;
}

export interface ArtifactCheck {
  artifact: string;
  form?: FactorizationForm;
  carriers: string[];
  problems: string[];
  /** How often each side of the proposition occurred across every holder slot of every specimen. */
  exercised: { entailed: number; holderAbsent: number; otherBranch: number };
  /** Specimen ids on which the factorization is FALSE. Must be empty. */
  violations: string[];
  held: boolean;
}

export interface Specimen {
  id: string;
  /** Name-blind form, so spelling never separates two specimens. */
  renamed: QuotientImage;
  outcome?: Outcome;
}

const OUT: ReadonlySet<SubtractionDisposition> = new Set(["representation-artifact", "not-yet-admitted"]);

export interface QuotientContext {
  census: Coordinate[];
  live: Set<string>;
  plans: Map<string, ErasurePlan>;
  locators: Map<string, StructuralLocator>;
  verdicts: Map<string, SubtractionDisposition>;
  derived: DerivedPresence[];
  signatures: Map<string, BranchSignatures>;
  specimens: Specimen[];
}

/** Is `id` kept in the kernel under the final set: live, and not adjudicated out. */
export const retained = (id: string, ctx: Pick<QuotientContext, "live" | "verdicts">) => ctx.live.has(id) && !OUT.has(ctx.verdicts.get(id) ?? "unresolved");

interface Slot {
  parent: unknown;
  key: string | number;
}
const present = (s: Slot) => (Array.isArray(s.parent) ? (s.key as number) < s.parent.length : (s.key as string) in (s.parent as Json));
const read = (s: Slot): unknown => (s.parent as Record<string | number, unknown>)[s.key];

export function checkArtifact(artifact: string, ctx: QuotientContext): ArtifactCheck {
  const problems: string[] = [];
  const exercised = { entailed: 0, holderAbsent: 0, otherBranch: 0 };
  const violations: string[] = [];
  if (ctx.live.has(artifact)) problems.push(`${artifact}: recorded as removed, but the kernel still carries it`);
  if (ctx.plans.has(artifact)) problems.push(`${artifact}: recorded as removed, but still has an executable erasure plan`);
  const f = factorizationOf(artifact, ctx.derived, ctx.signatures, ctx.census);
  if (!f) {
    problems.push(`${artifact}: no factorization the census performs matches it; the verdict is a reason string only`);
    return { artifact, carriers: [], problems, exercised, violations, held: false };
  }
  for (const c of f.carriers) {
    if (!ctx.live.has(c)) problems.push(`${artifact}: carrier ${c} is not in the kernel`);
    else if (OUT.has(ctx.verdicts.get(c) ?? "unresolved")) {
      problems.push(`${artifact}: carrier ${c} is itself adjudicated out (${ctx.verdicts.get(c)}); removed together they would erase the distinction collectively`);
    }
  }
  if (f.form === "declared-set-order") {
    const loc = ctx.locators.get(f.holder);
    if (!loc) {
      problems.push(`${artifact}: no locator for ${f.holder}, so the list's occurrence cannot be measured`);
      return { artifact, form: f.form, carriers: f.carriers, problems, exercised, violations, held: false };
    }
    // What the specimen population can show for this form: that the list OCCURS
    // (non-vacuity) and how often it occurs with more than one member, which is
    // the only shape a permutation could have moved. `entailed` counts the
    // first and `otherBranch` the second; neither is a violation, because
    // whether the order MATTERS is a fact about the laws, stated in the
    // declaration the walk refused to guess around. The empirical half is C1g
    // in necessity.test.ts, which permutes the list on every committed fixture
    // and requires the judgment not to move.
    for (const s of ctx.specimens) {
      const slots = resolveSlots(s.renamed, loc) as Slot[];
      if (slots.length === 0) continue;
      exercised.entailed++;
      const v = read(slots[0]);
      if (Array.isArray(v) && v.length > 1) exercised.otherBranch++;
    }
    if (exercised.entailed === 0) problems.push(`${artifact}: unexercised — no specimen carries ${f.leaf}`);
    return { artifact, form: f.form, carriers: f.carriers, problems, exercised, violations, held: problems.length === 0 };
  }
  const holderLoc = ctx.locators.get(f.holder);
  if (!holderLoc) {
    problems.push(`${artifact}: no locator for holder ${f.holder}`);
    return { artifact, form: f.form, carriers: f.carriers, problems, exercised, violations, held: false };
  }
  // The factorization, evaluated on every holder slot of every specimen.
  for (const s of ctx.specimens) {
    let violated = false;
    for (const slot of resolveSlots(s.renamed, holderLoc) as Slot[]) {
      const hPresent = present(slot);
      const hv = hPresent ? read(slot) : undefined;
      const kind = obj(hv) ? hv.kind : undefined;
      if (!hPresent) {
        exercised.holderAbsent++;
      } else if (f.form === "required-child-presence") {
        const onBranch = f.branch === undefined || kind === f.branch;
        // `p` is the BRANCH-QUALIFIED property: its slot exists only where the
        // holder is on branch k (the locator's branch step selects nothing
        // elsewhere), so a same-named property on another branch is that
        // branch's own coordinate, not this one. present(p) = present(H) AND
        // branch(H) = k, read on the specimen rather than assumed from the schema.
        const pPresent = onBranch && obj(hv) && f.property! in hv;
        if (onBranch) exercised.entailed++;
        else exercised.otherBranch++;
        if (pPresent !== onBranch) violated = true;
      } else {
        // present(H) AND kind(H) = m: the reading is a function of the carriers' readings by construction;
        // what the specimen can still show is that both sides of the cross-term occur.
        if (kind === f.member) exercised.entailed++;
        else exercised.otherBranch++;
      }
    }
    if (violated) violations.push(s.id);
  }
  if (violations.length > 0) problems.push(`${artifact}: the factorization is false on ${violations.length} specimen(s): ${violations.slice(0, 5).join(", ")}`);
  if (exercised.entailed === 0) problems.push(`${artifact}: unexercised — no specimen shows the holder on this branch`);
  if (exercised.holderAbsent === 0) problems.push(`${artifact}: unexercised — no specimen shows the holder absent`);
  return { artifact, form: f.form, carriers: f.carriers, problems, exercised, violations, held: problems.length === 0 };
}

/**
 * Read one coordinate on a specimen: the information its erasure forgets, per
 * slot, as a token. Two specimens agree on a coordinate iff their tokens agree.
 */
export function readCoordinate(fixture: Fixture | QuotientImage, plan: ErasurePlan): string {
  const op = plan.operation;
  const tokens = (resolveSlots(fixture, plan.locator) as Slot[]).map((s) => {
    if (!present(s)) return "∅";
    const v = read(s);
    switch (op.kind) {
      case "forget-value":
      case "delete-slot":
        return JSON.stringify(v);
      case "delete-holder":
        return "present";
      case "merge-enum-members": {
        const one = (x: unknown) => (x === op.from ? "from" : x === op.into ? "into" : "other");
        return Array.isArray(v) ? v.map(one).join("|") : one(v);
      }
      case "spell-member-as-absent":
        return v === op.member ? "member" : "other";
      case "delete-tagged-holder":
        return obj(v) && v.kind === op.member ? "member" : "other";
      case "forget-reference-arity":
        return Array.isArray(v) ? String(v.length) : "1";
      case "forget-reference-order": {
        if (!Array.isArray(v)) return "-";
        const order = v.map((_, i) => i).sort((i, j) => (String(v[i]) < String(v[j]) ? -1 : String(v[i]) > String(v[j]) ? 1 : i - j));
        return order.join(",");
      }
      case "forget-reference-incidence":
        // Incidence is co-reference: which declared entity a position names.
        // On the name-blind form spelling is already structural, so the
        // renamed token IS the referent's identity — reading only the pattern
        // of equalities within one list would forget which field an assertion
        // aggregates, and two specimens summing different fields collapsed.
        return JSON.stringify(v);
      case "forget-branch-field":
        return "-";
    }
  });
  return tokens.join(";");
}

export interface Separation {
  specimens: number;
  /** Specimens carrying an adjudicated outcome, which is what a collapse is measured against. */
  grounded: number;
  /** Pairs of grounded specimens whose outcomes differ. */
  differingPairs: number;
  /** Pairs with different outcomes that read identically on every retained coordinate of BOTH roles. Must be empty. */
  collapsed: { a: string; b: string; outcomeA: Outcome; outcomeB: Outcome }[];
  /** Pairs with different outcomes separated by instance-role coordinates (row-level facts) alone. */
  instanceOnly: number;
  retainedCoordinates: number;
}

export function checkSeparation(ctx: QuotientContext): Separation {
  const role = new Map(ctx.census.map((c) => [c.id, c.role]));
  const retainedIds = [...ctx.plans.keys()].filter((id) => retained(id, ctx)).sort();
  // The census classifies every coordinate as schema-level or instance-level
  // (`role`). A pair told apart only by instance-role coordinates is a
  // distinction the rows carry and the declarations do not — counted, so that
  // an instance-decided outcome is never mistaken for a schema-level one.
  const schemaIds = retainedIds.filter((id) => role.get(id) !== "instance");
  const instanceIds = retainedIds.filter((id) => role.get(id) === "instance");
  const grounded = ctx.specimens.filter((s) => s.outcome !== undefined);
  const schema = new Map<string, string>();
  const instance = new Map<string, string>();
  for (const s of grounded) {
    schema.set(s.id, schemaIds.map((id) => readCoordinate(s.renamed, ctx.plans.get(id)!)).join("\n"));
    instance.set(s.id, instanceIds.map((id) => readCoordinate(s.renamed, ctx.plans.get(id)!)).join("\n"));
  }
  const collapsed: Separation["collapsed"] = [];
  let differingPairs = 0;
  let instanceOnly = 0;
  for (let i = 0; i < grounded.length; i++) {
    for (let j = i + 1; j < grounded.length; j++) {
      const a = grounded[i];
      const b = grounded[j];
      if (JSON.stringify(a.outcome) === JSON.stringify(b.outcome)) continue;
      differingPairs++;
      if (schema.get(a.id) !== schema.get(b.id)) continue;
      if (instance.get(a.id) !== instance.get(b.id)) instanceOnly++;
      else collapsed.push({ a: a.id, b: b.id, outcomeA: a.outcome!, outcomeB: b.outcome! });
    }
  }
  return { specimens: ctx.specimens.length, grounded: grounded.length, differingPairs, collapsed, instanceOnly, retainedCoordinates: retainedIds.length };
}

export interface FinalQuotientCheck {
  ok: boolean;
  spec: string;
  problems: string[];
  artifacts: ArtifactCheck[];
  separation: Separation;
  /** Removed coordinates that are still live with plans — an executable removal set, which must be confluent. */
  executableRemovals: { ids: string[]; confluent: boolean; nonConfluentPairs: string[] };
  derivedVocabulary: { checked: number; problems: string[] };
  primitives: { checked: number; problems: string[] };
}

/** Every specimen the frozen oracle adjudicates, plus every witness and closure stimulus, name-blind. */
export function groundedSpecimens(oracle: Oracle = loadOracle()): Specimen[] {
  const out: Specimen[] = [];
  const seen = new Set<string>();
  const add = (id: string, fixture: Fixture, outcome?: Outcome) => {
    const renamed = alphaRename(fixture, nameBlindMap(fixture));
    const key = JSON.stringify(renamed);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id, renamed, outcome });
  };
  for (const [id, f] of oracle.fixtures) add(id, f, oracle.outcomeOf(id)?.outcome);
  const sides = [
    ...loadWitnesses().witnesses.flatMap((w, i) => [[`witness[${i}].a`, w.a] as const, [`witness[${i}].b`, w.b] as const]),
    ...loadClosures().closures.flatMap((c) => (c.a && c.b ? ([[`closure(${c.carrier}).a`, c.a], [`closure(${c.carrier}).b`, c.b]] as const) : [])),
  ];
  for (const [label, side] of sides) {
    try {
      const r = resolveSide(side, oracle);
      add(label, r.fixture, r.outcome);
    } catch {
      // A stimulus whose base is gone is a witness problem, reported by checkWitness.
    }
  }
  return out;
}

export function loadQuotientContext(spec = "REL-VIEW-ALGEBRA-01", oracle: Oracle = loadOracle()): QuotientContext {
  const census = loadCensus();
  const verdicts = new Map<string, SubtractionDisposition>();
  for (const { ledger } of basesForSpec(spec)) {
    for (const id of ledger.basis.candidates) verdicts.set(id, ledger.verdicts[id]?.disposition ?? "unresolved");
  }
  return {
    census,
    live: new Set(census.map((c) => c.id)),
    plans: loadPlans(),
    locators: loadLocators(),
    verdicts,
    derived: loadDerivedPresence(),
    signatures: loadBranchSignatures(),
    specimens: groundedSpecimens(oracle),
  };
}

export function checkFinalQuotient(spec = "REL-VIEW-ALGEBRA-01", oracle: Oracle = loadOracle(), ctx: QuotientContext = loadQuotientContext(spec, oracle)): FinalQuotientCheck {
  const problems: string[] = [];
  const out = [...ctx.verdicts].filter(([, d]) => OUT.has(d)).map(([id]) => id).sort();
  const artifacts = [...ctx.verdicts]
    .filter(([, d]) => d === "representation-artifact")
    .map(([id]) => checkArtifact(id, ctx));
  for (const a of artifacts) problems.push(...a.problems);

  // 1. Anything adjudicated out that is still executable must compose confluently.
  const executable = out.filter((id) => ctx.plans.has(id));
  const nonConfluentPairs: string[] = [];
  for (let i = 0; i < executable.length; i++) {
    for (let j = i + 1; j < executable.length; j++) {
      const pair = [ctx.plans.get(executable[i])!, ctx.plans.get(executable[j])!];
      if (ctx.specimens.some((s) => distinctListingImages(s.renamed, pair).length > 1)) nonConfluentPairs.push(`${executable[i]} + ${executable[j]}`);
    }
  }
  if (nonConfluentPairs.length > 0) problems.push(`executable removal set is not confluent: ${nonConfluentPairs.join("; ")}; refused rather than normalized through one order`);

  // 2. No grounded collapse.
  const separation = checkSeparation(ctx);
  for (const c of separation.collapsed) {
    problems.push(`grounded collapse: ${c.a} (${c.outcomeA.status}) and ${c.b} (${c.outcomeB.status}) read identically on every retained coordinate and on instance evidence`);
  }

  // 3. Primitive evidence survives.
  const primitiveProblems: string[] = [];
  // The primitive set comes from the ONE classifier, not from a third copy of
  // `coordinates.length === 1`: a witness that destroys a sibling facet of a
  // surviving slot does not ratify, and this check must not disagree with the
  // audit about which coordinates those are.
  const holding = loadWitnesses().witnesses.filter((w) => checkWitness(w, ctx.census, oracle).ok);
  const primitive = primitiveRatified(holding);
  for (const c of primitive) {
    if (!ctx.live.has(c)) primitiveProblems.push(`${c}: ratified by a holding witness but not in the kernel`);
    else if (OUT.has(ctx.verdicts.get(c) ?? "unresolved")) primitiveProblems.push(`${c}: ratified by a holding witness and adjudicated out (${ctx.verdicts.get(c)})`);
  }
  problems.push(...primitiveProblems);

  // 4. Required derived vocabulary stays recoverable from live retained coordinates.
  const rdvProblems: string[] = [];
  let rdvChecked = 0;
  for (const { ledger } of basesForSpec(spec)) {
    for (const [id, v] of Object.entries(ledger.verdicts)) {
      if (v.disposition !== "required-derived-vocabulary") continue;
      rdvChecked++;
      const named = [...ctx.live].filter((c) => retained(c, ctx) && (v.derivableFrom ?? "").includes(c));
      if (named.length === 0) rdvProblems.push(`${id}: required-derived-vocabulary derivable from no live retained coordinate (derivableFrom: ${JSON.stringify(v.derivableFrom ?? "")})`);
    }
  }
  problems.push(...rdvProblems);

  return {
    ok: problems.length === 0,
    spec,
    problems,
    artifacts,
    separation,
    executableRemovals: { ids: executable, confluent: nonConfluentPairs.length === 0, nonConfluentPairs },
    derivedVocabulary: { checked: rdvChecked, problems: rdvProblems },
    primitives: { checked: primitive.size, problems: primitiveProblems },
  };
}

export function summarizeFinalQuotient(r: FinalQuotientCheck): string {
  const held = r.artifacts.filter((a) => a.held).length;
  const forms = new Map<string, number>();
  for (const a of r.artifacts) forms.set(a.form ?? "unrecognized", (forms.get(a.form ?? "unrecognized") ?? 0) + 1);
  const lines = [
    `final-quotient (${r.spec}): ${r.ok ? "OK" : `${r.problems.length} problem(s)`}`,
    `  artifacts: ${held}/${r.artifacts.length} held (${[...forms].map(([f, n]) => `${f} ${n}`).join(", ")})`,
    `  executable removals: ${r.executableRemovals.ids.length}${r.executableRemovals.ids.length > 0 ? ` (${r.executableRemovals.confluent ? "confluent" : "NOT confluent"})` : " (nothing to compose)"}`,
    `  separation: ${r.separation.grounded} grounded of ${r.separation.specimens} specimens; ${r.separation.differingPairs} differing pairs; ${r.separation.collapsed.length} collapsed; ${r.separation.instanceOnly} separated by rows alone; ${r.separation.retainedCoordinates} retained coordinates read`,
    `  primitives: ${r.primitives.checked} single-coordinate witnesses, ${r.primitives.problems.length} problem(s)`,
    `  required derived vocabulary: ${r.derivedVocabulary.checked} checked, ${r.derivedVocabulary.problems.length} problem(s)`,
  ];
  if (!r.ok) lines.push(...r.problems.map((p) => `  ! ${p}`));
  return lines.join("\n");
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  const r = checkFinalQuotient();
  console.log(summarizeFinalQuotient(r));
  if (process.argv.includes("--check") && !r.ok) process.exit(1);
}
