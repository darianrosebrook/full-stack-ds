/**
 * The derivation boundary (REL-VIEW-ALGEBRA-01, A1).
 *
 * `derivedBy` on its own is provenance: an annotation saying what supposedly
 * happened. Before this module, a structure could declare
 *
 *   source.grain = [store, day]
 *   result.derivedBy = aggregate-to-grain(from=source, toGrain=[store])
 *   result.grain     = [day]
 *
 * and nothing objected, along with a derivation naming a missing input, a
 * `project` whose result carries a field the input never had, and two
 * relations each declaring the other as its source. All four were accepted.
 *
 * This module supplies the one authority for the transition:
 *
 *   (input relation(s), derivation declaration, declared output relation)
 *                            -> valid | diagnostic
 *
 * It is a VALIDATOR, not a transformer: it does not manufacture the result,
 * it certifies that the declared result is a lawful one for that operator over
 * those inputs. That is enough, and it is what makes the assertion engine's
 * blindness to base-versus-derived sound rather than a laundering mechanism —
 * an assertion may treat a derived relation as authoritative only because the
 * boundary has already certified it.
 *
 * Findings here are DERIVATION occurrences, not assertion occurrences: a
 * malformed join is a defect of the derivation whether or not any assertion
 * happens to read it, and forcing it through an assertion would both invent a
 * dummy assertion in every fixture and emit the same structural defect once per
 * reader.
 */
import { DERIVATION_DIAG, DIAG, OBLIGATION } from "./codes.js";
import type { Engine, EvidenceClass } from "./judgment.js";
import type { DerivationDecl, Evidence, RelationDecl, RelationalStructure } from "./relation-model.js";
import { normalizeObservation, type Observation } from "./structure.js";

export { DERIVATION_DIAG } from "./codes.js";

/**
 * What the boundary emits.
 *
 * `diagnostic` = the declared result is refuted. `obligation` = it is not
 * refuted and not proven, and the missing premise is named.
 *
 * The distinction those two carry is the whole point of the module. Silence
 * must mean "the declared result is provably a member of this operator's
 * admissible result set", never "no contradiction was found". The second
 * collapses the doctrine's three values into `not disproven => admitted`, at
 * precisely the authority boundary stage 2 exists to establish — and "no
 * contradiction found" cannot be what upgrades provenance into analytical
 * authority. A derivation may lawfully admit MANY results; proving membership
 * is enough and the operator need not be a function. What is not enough is
 * lacking the facts to decide.
 */
export interface BoundaryFinding {
  kind: "diagnostic" | "obligation";
  /** Set when kind is `diagnostic`. */
  code?: string;
  /** Set when kind is `obligation`: the missing premise, as a vocabulary term. */
  term?: string;
  /** The derived relation's name — the locus of a derivation finding. */
  subject: string;
  /** `derivationKey` — stable identity independent of which assertions read it. */
  derivation: string;
  /**
   * Which checkability engine the finding belongs to. The boundary is one
   * module but not one engine: a bin with no declared closure is a
   * `declaration-missing` defect, normalizing a non-additive measure is an
   * `additivity` defect, and unchecked flow conservation is `task-invariant`.
   * Provenance is per rule, so it is carried per finding rather than stamped on
   * the whole domain.
   */
  engine: Engine;
  /** Whether rows were needed to reach it. */
  evidenceClass: EvidenceClass;
  detail: string;
}

/**
 * Stable identity for a derivation occurrence, the analogue of `assertionKey`.
 * Built from the operator and its operand ARITY, never operand spelling, so it
 * survives alpha-renaming exactly as the assertion key does.
 */
export function derivationKey(d: DerivationDecl): string {
  switch (d.kind) {
    case "aggregate-to-grain":
      return `aggregate-to-grain(toGrain=${d.toGrain.length})`;
    case "join":
      return `join(${d.cardinality})`;
    case "nest":
      return `nest(levels=${d.levels.length})`;
    case "bin":
      return d.closure ? `bin(${d.closure})` : "bin";
    case "normalize":
      return "normalize";
    case "project":
      return `project(keep=${d.keep.length})`;
    case "graph":
      return d.requiresConservation ? "graph(requiresConservation)" : "graph";
  }
}

/** The relations a derivation reads. */
export function inputsOf(d: DerivationDecl): string[] {
  return d.kind === "join" ? [d.from, d.with] : [d.from];
}

const fieldNames = (r: RelationDecl) => Object.keys(r.fields);
const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join(" ") === [...b].sort().join(" ");

/**
 * Grain the operator determines for its result, or `undefined` when the
 * declaration does not determine it. Kept separate from refutation so the two
 * epistemic states cannot be confused: a wrong grain is a diagnostic, an
 * undetermined one is an obligation.
 */
function determinedGrain(d: DerivationDecl, inputs: RelationDecl[]): RelationDecl["grain"] | undefined {
  const [a, b] = inputs;
  switch (d.kind) {
    case "aggregate-to-grain":
      return d.toGrain;
    case "join":
      // Cardinality names which side survives at row granularity. `from` is the
      // left operand, `with` the right.
      if (d.cardinality === "one-to-many") return b?.grain;
      if (d.cardinality === "many-to-one") return a?.grain;
      if (d.cardinality === "one-to-one") return a?.grain;
      // many-to-many: neither side's grain survives and the declaration says
      // nothing about what replaces it.
      return undefined;
    case "project": {
      // Keeping every grain column preserves the grain. Dropping one may or
      // may not collapse duplicate rows, which the declaration cannot say.
      if (a?.grain === "unknown") return "unknown";
      const kept = a?.grain?.every?.((g) => d.keep.includes(g));
      return kept ? a.grain : undefined;
    }
    case "nest":
      // Imposing a hierarchy reorganises without combining rows.
      return a?.grain;
    case "normalize":
      // Rescaling a measure leaves the row set alone.
      return a?.grain;
    case "graph":
      // Reading a relation as edges does not change which rows exist.
      return a?.grain;
    case "bin":
      // If the binned field is not part of the grain, the row set is
      // untouched. If it is, binning coarsens it in a way the declaration does
      // not pin down.
      if (a?.grain === "unknown") return "unknown";
      return a?.grain?.includes?.(d.field) ? undefined : a?.grain;
  }
}

const sameGrain = (x: RelationDecl["grain"], y: RelationDecl["grain"]) =>
  x === "unknown" || y === "unknown" ? x === y : sameSet(x, y);

/**
 * Is the declared result a lawful output of `d` over `inputs`?
 *
 * Returns a refutation string, or undefined when nothing is refuted. Whether
 * "nothing refuted" also means "proven" is decided by `determinedGrain`, whose
 * `undefined` becomes an obligation rather than silence.
 */
function resultIsDerivable(d: DerivationDecl, inputs: RelationDecl[], out: RelationDecl): string | undefined {
  const [a, b] = inputs;
  switch (d.kind) {
    case "aggregate-to-grain": {
      // The result's grain IS the target grain: that is what the operator does.
      if (out.grain === "unknown") return "the result of an aggregate-to-grain has the target grain, not unknown grain";
      if (!sameSet(out.grain, d.toGrain)) {
        return `declared result grain [${out.grain.join(", ")}] is not the target grain [${d.toGrain.join(", ")}]`;
      }
      // The target grain must be drawn from the input: aggregating cannot
      // invent a dimension to group by.
      const missing = d.toGrain.filter((g) => !fieldNames(a).includes(g));
      if (missing.length > 0) return `target grain names ${missing.join(", ")}, which the input does not declare`;
      // Every surviving field must come from the input.
      const invented = fieldNames(out).filter((f) => !fieldNames(a).includes(f));
      if (invented.length > 0) return `result declares ${invented.join(", ")}, which the input does not carry`;
      return undefined;
    }
    case "project": {
      if (!sameSet(fieldNames(out), d.keep)) {
        return `a projection keeping [${d.keep.join(", ")}] cannot yield fields [${fieldNames(out).join(", ")}]`;
      }
      const invented = d.keep.filter((f) => !fieldNames(a).includes(f));
      if (invented.length > 0) return `projection keeps ${invented.join(", ")}, which the input does not carry`;
      return undefined;
    }
    case "join": {
      if (!b) return "a join reads two relations";
      const available = [...fieldNames(a), ...fieldNames(b)];
      const invented = fieldNames(out).filter((f) => !available.includes(f));
      if (invented.length > 0) return `result declares ${invented.join(", ")}, which neither input carries`;
      return undefined;
    }
    case "nest": {
      const missing = d.levels.filter((l) => !fieldNames(a).includes(l));
      if (missing.length > 0) return `nest levels ${missing.join(", ")} are not fields of the input`;
      // Nesting imposes a hierarchy; it does not drop the membership that
      // defines it, which is the whole point of the level declaration.
      const lost = d.levels.filter((l) => !fieldNames(out).includes(l));
      if (lost.length > 0) return `result drops nest level(s) ${lost.join(", ")}, so its own hierarchy is unrecoverable`;
      return undefined;
    }
    case "bin": {
      if (!fieldNames(a).includes(d.field)) return `binned field ${d.field} is not a field of the input`;
      if (!fieldNames(out).includes(d.field)) return `result drops the binned field ${d.field}`;
      return undefined;
    }
    case "normalize": {
      if (!fieldNames(a).includes(d.field)) return `normalized field ${d.field} is not a field of the input`;
      if (!fieldNames(out).includes(d.field)) return `result drops the normalized field ${d.field}`;
      return undefined;
    }
    case "graph": {
      for (const [slot, name] of [
        ["edgeFrom", d.edgeFrom],
        ["edgeTo", d.edgeTo],
        ...(d.value ? ([["value", d.value]] as [string, string][]) : []),
      ] as [string, string][]) {
        if (!fieldNames(a).includes(name)) return `${slot} names ${name}, which the input does not carry`;
      }
      if (d.edgeFrom === d.edgeTo) return "edgeFrom and edgeTo name the same field, so the edge has no direction";
      return undefined;
    }
  }
}

/**
 * Is `toGrain` one of the grains the nest hierarchy declares?
 *
 * A hierarchy [country, state, city] declares exactly its prefixes as grains:
 * one row per country, per country×state, per country×state×city. A subtotal
 * at [state] alone is not one of them — two states in different countries are
 * different groups, and nothing in the declaration says which the subtotal
 * meant. That is the sense in which a subtotal off the declared grain is
 * undefined rather than merely unusual.
 */
const isDeclaredNestGrain = (toGrain: string[], levels: string[]) =>
  toGrain.length <= levels.length && toGrain.every((g, i) => g === levels[i]);

/** Rows for one relation, normalised, or undefined when none were supplied. */
const rowsOf = (evidence: Evidence | undefined, relation: string): Record<string, Observation>[] | undefined =>
  evidence?.rows?.[relation]?.map((row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, normalizeObservation(v)])));

const numberOf = (o: Observation | undefined): number | undefined => (typeof o?.value === "number" ? o.value : undefined);
const nodeOf = (o: Observation | undefined): string | undefined => (o?.value === undefined ? undefined : String(o.value));

/**
 * Does the graph's flow balance at every node that is neither a source nor a
 * sink? A node with no inflow is where flow enters and one with no outflow is
 * where it leaves; conservation is a claim about the nodes in between.
 */
function conservationFindings(
  name: string,
  d: Extract<DerivationDecl, { kind: "graph" }>,
  key: string,
  rows: Record<string, Observation>[] | undefined,
  out: BoundaryFinding[],
): void {
  if (!d.requiresConservation) return;
  // The declaration is a REQUIREMENT, never evidence. Without edge values
  // there is nothing to check it against, so it stays outstanding rather than
  // being discharged by its own assertion.
  if (!rows || d.value === undefined) {
    out.push({
      kind: "obligation",
      term: OBLIGATION.CONSERVATION,
      subject: name,
      derivation: key,
      engine: "task-invariant",
      evidenceClass: "instance",
      detail: d.value === undefined ? "declares conserved flow but no edge value to conserve" : "declares conserved flow, but no edge values have been seen",
    });
    return;
  }
  const inflow = new Map<string, number>();
  const outflow = new Map<string, number>();
  const add = (m: Map<string, number>, k: string, v: number) => m.set(k, (m.get(k) ?? 0) + v);
  for (const r of rows) {
    const from = nodeOf(r[d.edgeFrom]);
    const to = nodeOf(r[d.edgeTo]);
    const v = numberOf(r[d.value]);
    if (from === undefined || to === undefined || v === undefined) continue;
    add(outflow, from, v);
    add(inflow, to, v);
  }
  for (const node of [...inflow.keys()].sort()) {
    if (!outflow.has(node)) continue; // a sink: flow arrives and stops
    const into = inflow.get(node)!;
    const outOf = outflow.get(node)!;
    if (into !== outOf) {
      out.push({
        kind: "diagnostic",
        code: DIAG.FLOW_NOT_CONSERVED,
        subject: `${name}.${node}`,
        derivation: key,
        engine: "task-invariant",
        evidenceClass: "instance",
        detail: `flow into ${node} is ${into} but flow out is ${outOf}, and no leakage is declared`,
      });
    }
  }
}

/**
 * Rules about a derivation that IS well-formed: the operator can produce the
 * declared result, and the operation it declares is still not meaningful.
 *
 * These run only for derivations the well-formedness pass admitted, for the
 * same reason assertions do: a semantic complaint about a result the operator
 * could not have produced is a finding about nothing.
 */
function semanticFindings(
  name: string,
  d: DerivationDecl,
  key: string,
  inputs: RelationDecl[],
  evidence: Evidence | undefined,
  out: BoundaryFinding[],
): void {
  const [a] = inputs;
  switch (d.kind) {
    case "bin":
      // Which side of a boundary owns its own value is not a detail: with no
      // closure, a value exactly on a boundary belongs to two bins or none.
      if (d.closure === undefined) {
        out.push({
          kind: "diagnostic",
          code: DIAG.BIN_CLOSURE_UNDECLARED,
          subject: `${name}.${d.field}`,
          derivation: key,
          engine: "declaration-missing",
          evidenceClass: "schema",
          detail: `bins ${d.field} without declaring which side of each boundary is closed, so boundary membership is ambiguous`,
        });
      }
      return;
    case "normalize":
      // Normalizing to a whole presumes the parts sum to that whole. A
      // non-additive measure has no such sum, so the resulting share is a
      // number with no referent.
      if (a?.fields[d.field]?.additivity?.kind === "non-additive") {
        out.push({
          kind: "diagnostic",
          code: DIAG.NORMALIZE_NONADDITIVE,
          subject: `${name}.${d.field}`,
          derivation: key,
          engine: "additivity",
          evidenceClass: "schema",
          detail: `normalizes ${d.field}, which is non-additive, so the whole it is normalized against does not exist`,
        });
      }
      return;
    case "project": {
      // Dropping the levels of a nested input discards the membership every
      // later projection needs to rebuild the hierarchy. The loss is upstream
      // of any choice of projection, so no projection made afterwards can be
      // lawful — which is why this is a derivation finding and not a
      // realization one.
      const nest = a?.derivedBy;
      if (nest?.kind !== "nest") return;
      const lost = nest.levels.filter((l) => !d.keep.includes(l));
      if (lost.length > 0) {
        out.push({
          kind: "diagnostic",
          code: DIAG.DISCARDS_MEMBERSHIP,
          subject: name,
          derivation: key,
          engine: "derivation-typing",
          evidenceClass: "schema",
          detail: `drops nest level(s) ${lost.join(", ")} of its input, so the hierarchy cannot be reconstructed downstream`,
        });
      }
      return;
    }
    case "aggregate-to-grain": {
      const nest = a?.derivedBy;
      if (nest?.kind !== "nest") return;
      if (!isDeclaredNestGrain(d.toGrain, nest.levels)) {
        out.push({
          kind: "diagnostic",
          code: DIAG.SUBTOTAL_MISMATCH,
          subject: name,
          derivation: key,
          engine: "additivity",
          evidenceClass: "schema",
          detail: `subtotals to [${d.toGrain.join(", ")}], which is not a declared grain of the hierarchy [${nest.levels.join(", ")}]`,
        });
      }
      return;
    }
    case "graph":
      conservationFindings(name, d, key, rowsOf(evidence, d.from), out);
      return;
    default:
      return;
  }
}

/** Stable identity for a peer-set finding: arity-bearing and spelling-blind, like `derivationKey`. */
const peerKey = (members: readonly string[]) => `peers(members=${members.length})`;

/**
 * Two relations declared to carry the same claim must actually be co-registered.
 *
 * A peer declaration is the only thing that makes a difference between two
 * relations a DEFECT rather than a choice: without it, one relation at daily
 * grain and another at monthly grain are simply two relations. With it, they
 * claim to speak for the same thing, and then their grains have to agree.
 */
function peerFindings(structure: RelationalStructure, out: BoundaryFinding[]): void {
  const relations = structure.relations as Record<string, RelationDecl>;
  for (const members of structure.peers ?? []) {
    const key = peerKey(members);
    const subject = [...members].sort().join("+");
    const missing = members.filter((m) => !(m in relations));
    if (missing.length > 0) {
      out.push({
        kind: "diagnostic",
        code: DERIVATION_DIAG.INPUT_MISSING,
        subject,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail: `peer set names ${missing.join(", ")}, which the structure does not declare`,
      });
      continue;
    }
    const decls = members.map((m) => relations[m]);

    // Values resolved to different temporal grains are not co-registered: a
    // daily value and a monthly value are not two readings of one quantity.
    const grains = new Set<string>();
    for (const r of decls) for (const f of Object.values(r.fields)) if (f.temporality?.grain) grains.add(f.temporality.grain);
    if (grains.size > 1) {
      out.push({
        kind: "diagnostic",
        code: DIAG.TEMPORAL_GRAIN_MIXED,
        subject,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail: `peers resolve time to different grains (${[...grains].sort().join(", ")}) with no aggregate-to-grain reconciling them`,
      });
    }

    // Two aggregations of ONE relation to different target grains are two
    // different claims, however each is later realized.
    const aggs = decls
      .map((r) => r.derivedBy)
      .filter((d): d is Extract<DerivationDecl, { kind: "aggregate-to-grain" }> => d?.kind === "aggregate-to-grain");
    if (aggs.length === decls.length && aggs.length > 1 && new Set(aggs.map((d) => d.from)).size === 1) {
      const targets = new Set(aggs.map((d) => [...d.toGrain].sort().join(",")));
      if (targets.size > 1) {
        out.push({
          kind: "diagnostic",
          code: DIAG.PEER_GRAIN_DIVERGENCE,
          subject: aggs[0].from,
          derivation: key,
          engine: "derivation-typing",
          evidenceClass: "schema",
          detail: `peers aggregate ${aggs[0].from} to different target grains (${[...targets].sort().join(" | ")}), so they do not carry the same claim`,
        });
      }
    }
  }
}

/**
 * Certify every derivation in the structure. Order-independent and additive,
 * like the assertion rules: nothing here reads another finding's output.
 */
export function checkDerivations(structure: RelationalStructure, evidence?: Evidence): BoundaryFinding[] {
  const out: BoundaryFinding[] = [];
  const relations = structure.relations as Record<string, RelationDecl>;

  for (const [name, rel] of Object.entries(relations)) {
    const d = rel.derivedBy;
    if (!d) continue;
    const key = derivationKey(d);
    const inputNames = inputsOf(d);
    const missing = inputNames.filter((n) => !(n in relations));
    if (missing.length > 0) {
      out.push({
        kind: "diagnostic",
        code: DERIVATION_DIAG.INPUT_MISSING,
        subject: name,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail: `names input relation(s) ${missing.join(", ")}, which the structure does not declare`,
      });
      continue;
    }
    const inputs = inputNames.map((n) => relations[n]);
    const detail = resultIsDerivable(d, inputs, rel);
    if (detail) {
      out.push({
        kind: "diagnostic",
        code: DERIVATION_DIAG.RESULT_NOT_DERIVABLE,
        subject: name,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail,
      });
      continue;
    }
    // Nothing refuted. Is the result PROVEN admissible, or merely not
    // disproven? The grain is the fact that separates the two.
    const grain = determinedGrain(d, inputs);
    if (grain !== undefined && !sameGrain(grain, rel.grain)) {
      out.push({
        kind: "diagnostic",
        code: DERIVATION_DIAG.RESULT_NOT_DERIVABLE,
        subject: name,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail: `declared result grain ${JSON.stringify(rel.grain)} is not the grain this operator produces, ${JSON.stringify(grain)}`,
      });
      continue;
    }
    if (grain === undefined) {
      out.push({
        kind: "obligation",
        term: OBLIGATION.GRAIN_DECLARED,
        subject: name,
        derivation: key,
        engine: "derivation-typing",
        evidenceClass: "schema",
        detail: "this operator does not determine the result's grain from its declaration, so the declared grain is not refuted and not proven",
      });
    }
    // The derivation is well-formed. Whether the operation it declares is
    // MEANINGFUL is a separate question, and only now worth asking.
    semanticFindings(name, d, key, inputs, evidence, out);
  }

  peerFindings(structure, out);

  // A derivation graph with a cycle grounds nothing: every relation in it is
  // defined in terms of a relation that is defined in terms of it.
  for (const [name, rel] of Object.entries(relations)) {
    if (!rel.derivedBy) continue;
    const seen = new Set<string>();
    let frontier = inputsOf(rel.derivedBy);
    while (frontier.length > 0) {
      const next: string[] = [];
      for (const f of frontier) {
        if (f === name) {
          out.push({
            kind: "diagnostic",
            code: DERIVATION_DIAG.CYCLE,
            subject: name,
            derivation: derivationKey(rel.derivedBy),
            engine: "derivation-typing",
            evidenceClass: "schema",
            detail: "the derivation graph reaches this relation from itself, so nothing in the cycle is grounded",
          });
          frontier = [];
          break;
        }
        if (seen.has(f)) continue;
        seen.add(f);
        const d = relations[f]?.derivedBy;
        if (d) next.push(...inputsOf(d));
      }
      if (frontier.length === 0) break;
      frontier = next;
    }
  }
  return out;
}
