/**
 * The Stage-2 subtraction gate (REL-VIEW-ALGEBRA-01).
 *
 * What this is, precisely, because the difference decides whether it is
 * admissible at all under ADR-0001:
 *
 *   It is a SLICE-COMPLETION PROOF OBLIGATION over a frozen experimental
 *   basis. "You may not close this experiment while questions you opened
 *   remain unanswered."
 *
 *   It is NOT a freeze over the live kernel. It does not say the kernel must
 *   forever contain exactly these coordinates, it is not derived from the
 *   current census, and a coordinate a later stage admits does not reopen it.
 *
 * Three consequences follow, and each is load-bearing:
 *
 * 1. The candidate ids come from `basis.candidates` — a frozen list — never
 *    from `loadCensus()`. A gate that re-derived its own candidate set from the
 *    live census would be a shrink-only ledger keyed to an evolving population,
 *    which is the shape the doctrine forbids.
 * 2. Zero is TERMINAL for the slice, not a standing repository invariant. Once
 *    Stage 2 closes, this ledger is historical evidence; the gate must not be
 *    wired into ordinary repo admission, where a later stage's growth would
 *    make it fire against work that did not cause it.
 * 3. Removal is an adjudicated verdict, not a syntactic discharge. `witnessed`,
 *    `representation-artifact` and `not-yet-admitted` each demand a reason, so
 *    118 -> 0 means "every proposition has a verdict", not "the schema got
 *    smaller". Without that, this gate would reward deletion.
 *
 * Constructor necessity is deliberately NOT computed here. A constructor may
 * leave the admitted algebra only through its own governed disposition; no
 * coordinate verdict can reach it.
 *
 *   pnpm run analytical:subtraction          # report, exit 0
 *   pnpm run analytical:subtraction --gate   # exit 1 unless every candidate has a verdict
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { orphanedCoordinates } from "./experiments.js";
import { FIXTURES_DIR } from "./necessity.js";

export type SubtractionDisposition = "unresolved" | "witnessed" | "representation-artifact" | "not-yet-admitted";

export interface CoordinateVerdict {
  disposition: SubtractionDisposition;
  /** Why, in the terms of the authority that decides it. Required for every verdict but `unresolved`. */
  reason?: string;
  /** For `not-yet-admitted`: the earliest stage allowed to re-earn it with its own witness. */
  reintroducibleAt?: number;
}

/**
 * Why a constructor SURVIVED Stage-2 necessity — never what it means.
 *
 * `authorityRef` points at where the law actually lives, because a ledger that
 * defined its operators would become a second authority for their semantics,
 * and the `kind` experiment would then be discovering the necessity of operator
 * identity from definitions the subtraction itself authored.
 */
export interface ConstructorEntry {
  disposition: "required" | "retired";
  authorityRef: { vocabulary: string; signature: string; law: string };
  retentionRationale: string;
  evidenceCases: string[];
  removableWhen: string;
}

/**
 * The rule the subtraction is adjudicated under, recorded before any verdict
 * cites it. Deliberately NOT part of `dispositions`: a disposition says what a
 * verdict means, this says what may be concluded at all.
 */
export interface AdjudicationPolicy {
  $comment?: string;
  retention: string;
  independentlyGrounded: string[];
  constructorSeparation: string;
  kindInterpretation: { proves: string; doesNotProve: string; openQuestion: string };
}

/** A condition on the VALIDITY of the experiment, not on any single verdict. */
export interface CloseCondition {
  id: string;
  condition: string;
  why: string;
}

export interface SubtractionLedger {
  $comment?: string;
  $authorityNote?: string;
  /** The slice that opened this obligation. */
  spec?: string;
  dispositions: Record<string, string>;
  /** Present on the ledger that OWNS the policy; a derived basis carries `policyRef` instead. */
  adjudicationPolicy?: AdjudicationPolicy;
  closeConditions?: CloseCondition[];
  /** Path#anchor of the ledger whose `adjudicationPolicy` governs this basis. */
  policyRef?: string;
  basis: { frozenAt: string; reason: string; digest?: string; count: number; candidates: string[]; supersedes?: string[] };
  constructors: Record<string, ConstructorEntry>;
  verdicts: Record<string, CoordinateVerdict>;
}

export const SUBTRACTION_FILE = path.join(FIXTURES_DIR, "subtraction-stage2.json");

export function loadSubtraction(file = SUBTRACTION_FILE): SubtractionLedger {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as SubtractionLedger;
}

export interface GateResult {
  ok: boolean;
  unresolved: string[];
  problems: string[];
  message: string;
}

/**
 * Coordinates of the FROZEN basis that the live kernel no longer carries.
 *
 * Reported, never failed: a candidate leaving the kernel is what several
 * verdicts MEAN. It is here so the report can say which verdicts have already
 * taken effect.
 */
export function appliedRemovals(ledger: SubtractionLedger, live: Set<string>): string[] {
  return ledger.basis.candidates.filter((id) => !live.has(id)).sort();
}

export function checkSubtraction(file = SUBTRACTION_FILE, ledger = loadSubtraction(file)): GateResult {
  const problems: string[] = [];
  const basis = ledger.basis.candidates;

  if (basis.length !== ledger.basis.count) {
    problems.push(`basis records count ${ledger.basis.count} but lists ${basis.length} candidates`);
  }
  for (const id of basis) {
    if (!(id in ledger.verdicts)) problems.push(`candidate ${id} has no verdict entry`);
  }
  for (const id of Object.keys(ledger.verdicts)) {
    if (!basis.includes(id)) problems.push(`verdict ${id} is not in the frozen basis`);
  }
  for (const [id, v] of Object.entries(ledger.verdicts)) {
    if (v.disposition === "unresolved") continue;
    if (!(v.disposition in ledger.dispositions)) problems.push(`${id}: unknown disposition "${v.disposition}"`);
    // A verdict with no reason is a bare enumeration whose only message is
    // that the code changed, which cannot discharge anything.
    if (!v.reason?.trim()) problems.push(`${id}: ${v.disposition} with no reason`);
    if (v.disposition === "not-yet-admitted" && typeof v.reintroducibleAt !== "number") {
      problems.push(`${id}: not-yet-admitted with no reintroducibleAt stage`);
    }
  }

  const unresolved = basis.filter((id) => (ledger.verdicts[id]?.disposition ?? "unresolved") === "unresolved").sort();
  const ok = unresolved.length === 0 && problems.length === 0;
  const message = ok
    ? `subtraction --gate: OK — every one of the ${basis.length} candidates opened at ${ledger.basis.frozenAt} carries a verdict`
    : [
        problems.length > 0 ? `subtraction --gate: ${problems.length} ledger problem(s):\n  ${problems.join("\n  ")}` : "",
        unresolved.length > 0
          ? `subtraction --gate: ${unresolved.length} of ${basis.length} candidate(s) are unadjudicated; REL-VIEW-ALGEBRA-01 cannot claim ratification until each has a verdict:\n  ${unresolved.join("\n  ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
  return { ok, unresolved, problems, message };
}

/**
 * Verdicts that are not true of the live tree.
 *
 * This is the live half of the ledger's honesty, and it is keyed to the FROZEN
 * basis rather than to the census: it never asks what the kernel contains, only
 * whether each verdict this experiment recorded has actually taken effect. A
 * `witnessed` coordinate must really be ratified; a coordinate ruled out must
 * really be gone; a coordinate that quietly earned a witness must not still be
 * recorded as unresolved.
 */
export function verdictDrift(ledger: SubtractionLedger, live: Set<string>, ratified: Set<string>): string[] {
  const out: string[] = [];
  for (const id of ledger.basis.candidates) {
    const d = ledger.verdicts[id]?.disposition ?? "unresolved";
    if (d === "witnessed" && !ratified.has(id)) out.push(`${id}: recorded witnessed, but no holding witness ratifies it`);
    if ((d === "not-yet-admitted" || d === "representation-artifact") && live.has(id)) {
      out.push(`${id}: recorded ${d}, but the kernel still carries it`);
    }
    if (d === "unresolved" && ratified.has(id)) out.push(`${id}: is ratified but still recorded unresolved`);
  }
  return out.sort();
}

// The "is every live coordinate owned?" invariant deliberately does NOT live
// here. It is not a fact about this experiment — a coordinate a later stage
// admits is that stage's obligation — so it belongs above any single basis, in
// experiments.ts. Keeping it here would make a closed experiment fire against
// work that neither caused it nor could discharge it.

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  const ledger = loadSubtraction();
  const r = checkSubtraction(SUBTRACTION_FILE, ledger);
  const counts = new Map<string, number>();
  for (const id of ledger.basis.candidates) {
    const d = ledger.verdicts[id]?.disposition ?? "unresolved";
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  if (process.argv.includes("--gate")) {
    console.log(r.message);
    if (!r.ok) process.exit(1);
  } else {
    console.log(`subtraction: ${ledger.basis.count} candidates frozen at ${ledger.basis.frozenAt}`);
    for (const [d, n] of [...counts].sort()) console.log(`  ${String(n).padStart(4)}  ${d}`);
    const later = orphanedCoordinates();
    if (later.length > 0) {
      console.log(`\n${later.length} live kernel coordinate(s) with no ratification and no owning experiment:`);
      for (const o of later) console.log(`  ${o.coordinate}`);
    }
  }
}
