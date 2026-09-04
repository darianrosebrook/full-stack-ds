/**
 * The Stage-2 erasure freeze: what the quotient DOES, recorded before the
 * erasure-plan authority replaces the hand-maintained walker.
 *
 * This is not a second baseline. `baseline-stage1.json` freezes ENGINE output
 * (what the kernel judges); this freezes QUOTIENT output (what an erasure makes
 * unobservable) and the subtraction verdict population that rests on it. The
 * two answer different questions and neither can catch the other's drift: a
 * walker that stops reaching a label leaves every judgment intact and silently
 * turns "no witness holds for it" into a statement about the walk.
 *
 * Three things are recorded per coordinate:
 *
 * - `reach`  — how many corpus fixtures its erasure actually changes. A
 *              coordinate with reach 0 is un-erasable: no witness naming it can
 *              collide anything, so its unwitnessed-ness is a walk fact, not a
 *              semantic one. Reach is the property that must never silently
 *              shrink.
 * - `digest` — sha256 over the canonical form of every erased fixture, in
 *              corpus order. Equal digests prove the new executor produces
 *              BYTE-IDENTICAL representations, which reach alone cannot: a
 *              locator could reach the same count of fixtures and erase
 *              different things in them.
 * - the verdict population, per disposition, across every basis the spec opened.
 *
 * `--check` reports every divergence. A divergence is not automatically a
 * failure and is never automatically fine: `adjudicated` carries one reason per
 * diverging key, and the ratchet runs both ways — an adjudication naming a key
 * that no longer diverges fails too, so a stale exemption cannot outlive the
 * finding it was written for.
 *
 *   pnpm run analytical:freeze          # print the live record
 *   pnpm run analytical:freeze --record # rewrite the frozen file
 *   pnpm run analytical:freeze:check    # fail on an unadjudicated divergence
 */
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { authorityIdentities, type AuthorityIdentities } from "./authority.js";
import { loadCensus, loadPlans, type Coordinate } from "./census.js";
import { ruleSurfaceDigest } from "./corpus-integrity.js";
import { FIXTURES_DIR, RULE_SOURCES } from "./necessity.js";
import { QUOTIENT_SCHEMA_VERSION } from "./quotient-image.js";
import { canonical, erase } from "./quotient.js";
import { parseFixtures, type Fixture } from "./structure.js";
import { basesForSpec, DISPOSITIONS, type SubtractionDisposition } from "./subtraction.js";

export const FREEZE_FILE = path.join(FIXTURES_DIR, "stage2-freeze.json");
export const FIXTURES_JSONL = path.join(FIXTURES_DIR, "fixtures.jsonl");

/** The spec whose subtraction bases this freeze covers. */
export const SPEC = "REL-VIEW-ALGEBRA-01";

export interface ErasureFact {
  /** Corpus fixtures whose canonical form the erasure changes. */
  reach: number;
  /** sha256 over `canonical(erase(f, c))` for every fixture, in corpus order. */
  digest: string;
}

export interface Stage2Freeze {
  $comment: string;
  /** Digests of the inputs the record is a function of. A moved digest names which input moved. */
  digests: Record<string, string>;
  /**
   * The authority the record was taken under, by CAUSE.
   *
   * The flat `digests` map above answered "an input moved" and left the reader
   * to work out which kind of move it was. These four name it: the coordinates
   * changed, or what an erasure does changed, or what admits a witness changed,
   * or a rule changed. Re-recording a freeze because the rule surface moved is
   * a different act from re-recording it because the executor moved, and only
   * one of them requires re-verifying erasure behaviour by hand.
   */
  authority: AuthorityIdentities & { ruleDigest: string };
  /**
   * The fixtures the record was taken over, in order.
   *
   * Recorded so a corpus ADDITION cannot masquerade as a walker regression. A
   * new fixture changes what every erasure reaches, which would make the freeze
   * fire on work that neither caused nor could discharge it — the same reason
   * `analytical:check-baseline` runs with `--ignore-additions`. A fixture that
   * DISAPPEARS is still a finding, and is reported.
   */
  fixtures: string[];
  /** Candidate ids per disposition, sorted, unioned across every basis the spec opened. */
  verdicts: Record<string, string[]>;
  /** Coordinate id -> what its erasure does to the corpus. */
  erasure: Record<string, ErasureFact>;
  /**
   * Divergences accepted as corrections rather than regressions. Keyed by
   * coordinate id, `census:<id>`, or `verdict:<id>`; the value is why.
   */
  adjudicated: Record<string, string>;
  /**
   * The record this one replaces, when it was taken under a DIFFERENT erasure
   * authority.
   *
   * `adjudicated` is the mechanism for a divergence within one authority: a
   * key diverges, and the record says why that particular key may. It is the
   * wrong instrument when the authority itself moved, because then every key
   * diverges for one reason and adjudicating them one at a time turns the
   * ratchet into the ritual the identities exist to prevent.
   *
   * So a superseding record states the classes instead — what changed, how many
   * coordinates it reached, and what the change does — and the previous
   * authority it is measured against. The old record's numbers are not lost:
   * they are in git, under a digest that says which behaviour produced them.
   */
  supersedes?: {
    /** The predecessor's erasure authority, or null where it recorded none. */
    erasureAuthorityDigest: string | null;
    /** One entry per operation whose behaviour changed. */
    divergences: { operation: string; coordinates: number; effect: string }[];
  };
}

const sha = (bytes: string | Buffer) => createHash("sha256").update(bytes).digest("hex");
const shaFile = (p: string) => sha(fs.readFileSync(p));

/**
 * The DATA inputs the erasure record is a function of.
 *
 * Source modules left this map when the authority identities arrived: naming
 * `census.ts`, `quotient.ts` and `structure.ts` one file at a time under-claimed
 * in the way a hand-maintained list always can — `erasure-plan.ts` executes
 * every plan and was never listed, so an executor change moved every digest in
 * the record while every recorded input read as unchanged. The identities cover
 * the closure instead, and say which cause moved.
 */
const INPUTS: Record<string, string> = {
  "fixtures.jsonl": FIXTURES_JSONL,
};

function authorityBlock(): AuthorityIdentities & { ruleDigest: string } {
  return { ...authorityIdentities(QUOTIENT_SCHEMA_VERSION), ruleDigest: ruleSurfaceDigest(RULE_SOURCES) };
}

export function corpus(): Fixture[] {
  return parseFixtures(fs.readFileSync(FIXTURES_JSONL, "utf-8"));
}

/**
 * What each coordinate's erasure does to the corpus.
 *
 * Exported because it is the dual-run oracle: run it against the old walker and
 * the new plan executor and compare, coordinate by coordinate.
 */
export function erasureRecord(census: Coordinate[] = loadCensus(), fixtures: Fixture[] = corpus()): Record<string, ErasureFact> {
  const before = fixtures.map(canonical);
  const out: Record<string, ErasureFact> = {};
  for (const c of census) {
    const h = createHash("sha256");
    let reach = 0;
    fixtures.forEach((f, i) => {
      const after = canonical(erase(f, c));
      if (after !== before[i]) reach++;
      h.update(after).update("\u0000");
    });
    out[c.id] = { reach, digest: h.digest("hex") };
  }
  return out;
}

/** Candidate ids per disposition across every basis the spec opened. */
export function verdictPopulation(spec = SPEC): Record<string, string[]> {
  const out: Record<string, string[]> = Object.fromEntries(DISPOSITIONS.map((d) => [d, [] as string[]]));
  for (const { ledger } of basesForSpec(spec)) {
    for (const id of ledger.basis.candidates) {
      const d: SubtractionDisposition = ledger.verdicts[id]?.disposition ?? "unresolved";
      out[d].push(id);
    }
  }
  for (const d of Object.keys(out)) out[d] = out[d].sort();
  return out;
}

export function computeFreeze(
  adjudicated: Record<string, string> = {},
  over?: string[],
  supersedes?: Stage2Freeze["supersedes"],
): Stage2Freeze {
  const all = corpus();
  const byId = new Map(all.map((f) => [f.id, f]));
  // Scoped to the recorded fixtures when there are any, so a later fixture
  // cannot move a record it played no part in.
  const fixtures = over === undefined ? all : over.map((id) => byId.get(id)).filter((f): f is Fixture => f !== undefined);
  return {
    $comment:
      "Stage-2 erasure freeze, recorded before the erasure-plan authority replaced the hand-maintained quotient walker. `erasure` is what each coordinate's erasure does to the corpus (reach = fixtures changed; digest = sha256 over every erased fixture's canonical form, in corpus order); `verdicts` is the subtraction population resting on it. Compared against, not refreshed: a divergence is a finding, and `adjudicated` must carry a reason for each accepted one. Distinct from baseline-stage1.json, which freezes engine judgments and cannot see a walk that stops reaching a label.",
    digests: Object.fromEntries(Object.entries(INPUTS).map(([k, p]) => [k, shaFile(p)])),
    authority: authorityBlock(),
    fixtures: fixtures.map((f) => f.id),
    verdicts: verdictPopulation(),
    erasure: erasureRecord(loadCensus(), fixtures),
    adjudicated,
    ...(supersedes ? { supersedes } : {}),
  };
}

export function loadFreeze(file = FREEZE_FILE): Stage2Freeze {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Stage2Freeze;
}

/**
 * What each operation's change DOES, written by hand, one entry per class.
 *
 * The counts below are derived; these are not. A supersession that could
 * generate its own explanation would explain anything, so recording one is
 * refused for a divergence class nobody has written a sentence about — which is
 * what makes the mechanism a statement rather than a rubber stamp.
 */
const SUPERSESSION_EFFECT: Record<string, string> = {
  "merge-enum-members": [
    "A merge now writes a member CLASS at every occurrence of either member, and saturates: merging a~b and b~c leaves all three in one class.",
    "The old rewrite of `from` to `into` touched only the fixtures carrying `from`, which is why reach was small and why two merges of overlapping pairs",
    "did not compose. Reach grows to every fixture carrying any member of the saturated class.",
  ].join(" "),
  "forget-value": [
    "A required leaf becomes a typed hole instead of being deleted. Reach is unchanged — the same fixtures are touched — and the erased representation",
    "differs at every one, because the slot now exists and says `forgotten` where it used to be absent. Deleting it produced images the representation",
    "cannot express, and identified `forgotten` with `absent`, which are different facts.",
  ].join(" "),
  "forget-reference-arity": [
    "Arity truncates to the declaration's own minItems rather than to one element. The short side of the old pair was schema-invalid wherever the floor",
    "exceeded one. Corpus reach falls to zero because every corpus occurrence of these two lists is already AT its floor — a fact about the corpus, not",
    "about the coordinate, and the synthesized separating pairs do exercise it.",
  ].join(" "),
};

/**
 * The classes a re-record supersedes, counted from the divergences it clears.
 *
 * Throws where a class has no authored effect: an unexplained divergence must
 * not be absorbed by a re-record.
 */
export function supersessionOf(prior: Stage2Freeze, check: FreezeCheck = checkFreeze(prior)): NonNullable<Stage2Freeze["supersedes"]> {
  const plans = loadPlans();
  const counts = new Map<string, number>();
  for (const d of check.divergences) {
    const prefixed = /^(census|verdict|fixture):/.exec(d.key);
    const op = prefixed ? prefixed[1] : (plans.get(d.key)?.operation.kind ?? "(no plan)");
    counts.set(op, (counts.get(op) ?? 0) + 1);
  }
  const unexplained = [...counts.keys()].filter((op) => SUPERSESSION_EFFECT[op] === undefined).sort();
  if (unexplained.length > 0) {
    throw new Error(
      `freeze: refusing to supersede — ${unexplained.length} divergence class(es) with no authored effect: ${unexplained.join(", ")}. ` +
        "Add an entry to SUPERSESSION_EFFECT saying what changed, or adjudicate the keys individually.",
    );
  }
  return {
    erasureAuthorityDigest: prior.authority?.erasureAuthorityDigest ?? null,
    divergences: [...counts]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([operation, coordinates]) => ({ operation, coordinates, effect: SUPERSESSION_EFFECT[operation] })),
  };
}

export interface FreezeDivergence {
  /** `<coordinate>`, `census:<id>`, `verdict:<id>` or `authority:<identity>` — the readable class. */
  key: string;
  detail: string;
  /**
   * WHAT CHANGED, exactly. The class alone is not an identity.
   *
   * `adjudicated` used to be matched on `key`, so one written reason excused
   * every subsequent movement of that class. Reproduced against this consumer:
   * record under A, review a comment-only change to B, then move to C without
   * re-recording — `authority:witnessAuthorityDigest` still named a live
   * divergence, so the A->B reason certified the unreviewed A->C. The same
   * matcher accepted a D->B comparison under an A->B review.
   *
   * Full values, never truncated display digests: a prefix is a different
   * claim, and `detail` is prose that moves for reasons of its own.
   */
  transition: { from: string; to: string };
}

/**
 * The key an `adjudicated` entry must carry to excuse a divergence.
 *
 * Readable class, then the exact endpoints. A reason is a review of one
 * transition; it cannot be a standing permission for a class.
 */
export function adjudicationKey(d: FreezeDivergence): string {
  return `${d.key}@${d.transition.from}->${d.transition.to}`;
}

/** Neither endpoint exists — an appearance or a disappearance, not a change. */
const NOTHING = "(absent)";

export interface FreezeCheck {
  ok: boolean;
  divergences: FreezeDivergence[];
  /** Divergences an `adjudicated` entry accounts for, with its reason. */
  accepted: { key: string; detail: string; reason: string }[];
  /** `adjudicated` entries with nothing to adjudicate — the other direction of the ratchet. */
  stale: string[];
  movedInputs: string[];
  /**
   * Which AUTHORITY moved, named by cause, with what it invalidates.
   *
   * Reported separately from `movedInputs` because the two ask different
   * questions of the reader. A moved data input says the corpus changed; a
   * moved authority says the meaning of every entry in the record changed, and
   * says which kind of meaning.
   */
  movedAuthority: { identity: string; invalidates: string }[];
  message: string;
}

/** What a change to each identity invalidates, for the freeze's own reporting. */
const AUTHORITY_MEANING: Record<string, string> = {
  coordinateBasisDigest: "which coordinates exist and where they live; every reach and digest below names a coordinate",
  erasureAuthorityDigest: "what an erasure does; every recorded erased representation may differ",
  witnessAuthorityDigest: "what admits a witness; the verdict population resting on this record may differ",
  ruleDigest: "what the engine judges; the subtraction verdicts may differ though no erasure did",
  quotientSchemaVersion: "which quotient language the images are written in",
};

export function checkFreeze(
  frozen: Stage2Freeze = loadFreeze(),
  live: Omit<Stage2Freeze, "$comment" | "adjudicated"> = computeFreeze({}, frozen.fixtures),
): FreezeCheck {
  const divergences: FreezeDivergence[] = [];
  for (const id of frozen.fixtures.filter((f) => !live.fixtures.includes(f))) {
    divergences.push({ key: `fixture:${id}`, detail: "the fixture the record was taken over is gone from the corpus", transition: { from: "present", to: NOTHING } });
  }

  const movedInputs = Object.keys(frozen.digests)
    .filter((k) => frozen.digests[k] !== live.digests[k])
    .sort();

  // A record predating the identities has no `authority` block at all, and
  // that is itself the finding: it was taken under an authority nobody can name.
  const was = (frozen.authority ?? {}) as unknown as Record<string, string | number>;
  const now = live.authority as unknown as Record<string, string | number>;
  const movedAuthority = Object.keys(AUTHORITY_MEANING)
    .filter((k) => was[k] !== now[k])
    .sort()
    .map((identity) => ({ identity, invalidates: AUTHORITY_MEANING[identity] }));

  // A MOVED AUTHORITY IS A DIVERGENCE, not a footnote on an `ok` record.
  //
  // It used to be computed, reported in the message, and then dropped before
  // `ok` was decided. So a record taken under one acceptance authority could be
  // certified under a different one: `checkFreeze(...).ok === true` while
  // `movedAuthority` named `witnessAuthorityDigest`. Every programmatic
  // consumer reads `ok`; only a human reading the prose saw the move.
  //
  // Demonstrated rather than argued: weakening `checkWitness` so an unevaluated
  // isolation obligation stops failing a witness -- an acceptance change that
  // touches no stimulus and no erasure image -- left this consumer returning
  // `ok: true`, `divergences: []`, `movedAuthority: [witnessAuthorityDigest]`.
  //
  // Routed through the SAME ratchet as every other divergence rather than a new
  // rule: `adjudicated` can accept it with a reason, and an adjudication left
  // behind after a re-record shows up in `stale`. Re-recording clears it,
  // because `--record` recomputes the authority block.
  for (const { identity, invalidates } of movedAuthority) {
    divergences.push({ key: `authority:${identity}`, detail: `recorded under a different ${identity} — ${invalidates}`, transition: { from: String(was[identity]), to: String(now[identity]) } });
  }

  // Census population first: an erasure difference on a coordinate that no
  // longer exists is not a walk finding, it is the removal being reported twice.
  const frozenIds = new Set(Object.keys(frozen.erasure));
  const liveIds = new Set(Object.keys(live.erasure));
  for (const id of [...frozenIds].filter((x) => !liveIds.has(x)).sort()) {
    divergences.push({ key: `census:${id}`, detail: `coordinate left the census (was reach ${frozen.erasure[id].reach})`, transition: { from: frozen.erasure[id].digest, to: NOTHING } });
  }
  for (const id of [...liveIds].filter((x) => !frozenIds.has(x)).sort()) {
    divergences.push({ key: `census:${id}`, detail: `coordinate entered the census (reach ${live.erasure[id].reach})`, transition: { from: NOTHING, to: live.erasure[id].digest } });
  }

  for (const id of [...frozenIds].filter((x) => liveIds.has(x)).sort()) {
    const a = frozen.erasure[id];
    const b = live.erasure[id];
    if (a.digest === b.digest) continue;
    divergences.push({
      key: id,
      detail:
        a.reach === b.reach
          ? `same reach (${a.reach}) but a different erased representation: digest ${a.digest.slice(0, 12)} -> ${b.digest.slice(0, 12)}`
          : `reach ${a.reach} -> ${b.reach}`,
      transition: { from: a.digest, to: b.digest },
    });
  }

  const where = (pop: Record<string, string[]>) => {
    const m = new Map<string, string>();
    for (const [d, ids] of Object.entries(pop)) for (const id of ids) m.set(id, d);
    return m;
  };
  const wasIn = where(frozen.verdicts);
  const isIn = where(live.verdicts);
  for (const id of [...new Set([...wasIn.keys(), ...isIn.keys()])].sort()) {
    const a = wasIn.get(id) ?? "(not a candidate)";
    const b = isIn.get(id) ?? "(not a candidate)";
    if (a !== b) divergences.push({ key: `verdict:${id}`, detail: `${a} -> ${b}`, transition: { from: a, to: b } });
  }

  const accepted: FreezeCheck["accepted"] = [];
  const unaccounted: FreezeDivergence[] = [];
  for (const d of divergences) {
    const reason = frozen.adjudicated[adjudicationKey(d)];
    if (reason?.trim()) accepted.push({ ...d, reason });
    else unaccounted.push(d);
  }
  const diverging = new Set(divergences.map(adjudicationKey));
  const stale = Object.keys(frozen.adjudicated)
    .filter((k) => !diverging.has(k))
    .sort();

  const ok = unaccounted.length === 0 && stale.length === 0;
  const message = ok
    ? `freeze --check: OK — ${Object.keys(live.erasure).length} coordinate erasures and ${[...isIn.keys()].length} verdicts match the freeze` +
      (accepted.length > 0 ? ` (${accepted.length} adjudicated divergence(s))` : "")
    : [
        unaccounted.length > 0
          ? `freeze --check: ${unaccounted.length} unadjudicated divergence(s):\n  ${unaccounted.map((d) => `${d.key}: ${d.detail}\n    to accept, adjudicate: ${adjudicationKey(d)}`).join("\n  ")}`
          : "",
        stale.length > 0
          ? `freeze --check: ${stale.length} adjudication(s) with nothing to adjudicate — remove them or say what still diverges:\n  ${stale.join("\n  ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
  const authorityNote =
    movedAuthority.length === 0
      ? ""
      : `\nfreeze --check: recorded under a different authority — ${movedAuthority.map((m) => `${m.identity} (${m.invalidates})`).join("; ")}`;
  return { ok, divergences, accepted, stale, movedInputs, movedAuthority, message: message + authorityNote };
}

const invokedDirectly = process.argv[1] !== undefined && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  if (process.argv.includes("--record")) {
    const prior = fs.existsSync(FREEZE_FILE) ? loadFreeze() : undefined;
    const scoped = process.argv.includes("--rescope") ? undefined : prior?.fixtures;
    // `--supersede` records under a NEW erasure authority: the classes it
    // clears are stated, and the per-key adjudications of the old authority go
    // with the record they belonged to rather than being carried forward.
    const superseding = process.argv.includes("--supersede") && prior !== undefined;
    // A plain re-record CARRIES THE SUPERSESSION FORWARD when the erasure
    // authority has not moved. The block says what this record's erasure
    // behaviour replaced; re-recording because a DIFFERENT authority moved —
    // what admits a witness, say — does not undo that, and dropping it would
    // quietly delete the only statement of what the last behavioural change did.
    const erasureUnmoved = prior?.authority?.erasureAuthorityDigest === authorityBlock().erasureAuthorityDigest;
    const supersedes = superseding ? supersessionOf(prior) : erasureUnmoved ? prior?.supersedes : undefined;
    fs.writeFileSync(
      FREEZE_FILE,
      `${JSON.stringify(computeFreeze(superseding ? {} : (prior?.adjudicated ?? {}), scoped, supersedes), null, 2)}\n`,
    );
    console.log(`freeze: recorded ${FREEZE_FILE}`);
    for (const d of supersedes?.divergences ?? []) console.log(`  supersedes ${d.coordinates} ${d.operation} divergence(s)`);
  } else if (process.argv.includes("--check")) {
    const r = checkFreeze();
    if (r.movedInputs.length > 0) console.log(`freeze: inputs moved since the freeze: ${r.movedInputs.join(", ")}`);
    for (const a of r.accepted) console.log(`freeze: adjudicated ${a.key} (${a.detail}) — ${a.reason}`);
    console.log(r.message);
    if (!r.ok) process.exit(1);
  } else {
    const live = computeFreeze();
    // A `reference` coordinate is un-erasable BY CONSTRUCTION — spelling confers
    // no standing, so its erasure is defined as a no-op. Listing it beside a
    // coordinate the walk simply never reached would hide the second in the first.
    const byId = new Map(loadCensus().map((c) => [c.id, c]));
    const dead = Object.entries(live.erasure).filter(([, f]) => f.reach === 0);
    const nominal = dead.filter(([id]) => byId.get(id)?.kind === "reference");
    const unreached = dead.filter(([id]) => byId.get(id)?.kind !== "reference");
    console.log(`freeze: ${Object.keys(live.erasure).length} coordinates over ${corpus().length} fixtures`);
    console.log(`  ${nominal.length} reference coordinates, whose erasure is a no-op by construction`);
    console.log(`  ${unreached.length} with reach 0 — no corpus fixture distinguishes them:`);
    for (const [id] of unreached) console.log(`    ${id}`);
    console.log("");
    for (const [d, ids] of Object.entries(live.verdicts)) console.log(`  ${String(ids.length).padStart(4)}  ${d}`);
  }
}
