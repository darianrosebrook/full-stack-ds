/**
 * The close gate for REL-VIEW-ALGEBRA-01 (A3/A4).
 *
 * `pending-stage2.json` enumerates kernel coordinates admitted without a
 * necessity witness. The spec says the slice may not close while it is
 * non-empty, but "the spec says so" is weaker than every other guard in this
 * repository. This is the command whose success condition is literally
 * `count == 0`, so acceptance evidence cannot be produced with one outstanding
 * coordinate.
 *
 * It also re-derives the ledger rather than trusting it: a stale file that
 * happened to say zero would otherwise pass a gate whose whole purpose is to
 * refuse that.
 *
 *   pnpm run analytical:pending          # report, exit 0
 *   pnpm run analytical:pending --gate   # exit 1 unless the ledger is empty
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { loadCensus } from "./census.js";
import { checkWitness, FIXTURES_DIR, loadOracle, loadWitnesses, ratifiedSet } from "./necessity.js";

export interface PendingLedger {
  $comment?: string;
  count: number;
  pending: string[];
}

export const PENDING_FILE = path.join(FIXTURES_DIR, "pending-stage2.json");

/** Coordinates the live kernel carries that no holding witness ratifies. */
export function derivePending(): string[] {
  const kernel = loadCensus();
  const oracle = loadOracle();
  const ratified = ratifiedSet(loadWitnesses().witnesses.filter((w) => checkWitness(w, kernel, oracle).ok));
  return kernel
    .filter((c) => c.kind !== "reference")
    .filter((c) => !ratified.has(c.id))
    .map((c) => c.id)
    .sort();
}

export function loadPending(file = PENDING_FILE): PendingLedger {
  return JSON.parse(fs.readFileSync(file, "utf-8")) as PendingLedger;
}

export interface GateResult {
  ok: boolean;
  live: string[];
  drift: string[];
  message: string;
}

export function checkPending(file = PENDING_FILE): GateResult {
  const live = derivePending();
  const ledger = loadPending(file);
  const recorded = new Set(ledger.pending);
  const drift = [
    ...live.filter((id) => !recorded.has(id)).map((id) => `+${id}`),
    ...ledger.pending.filter((id) => !live.includes(id)).map((id) => `-${id}`),
  ].sort();

  if (drift.length > 0) {
    return {
      ok: false,
      live,
      drift,
      message: `pending --gate: LEDGER DRIFT — ${drift.length} coordinate(s) differ between the live kernel and ${path.basename(file)}:\n  ${drift.join("\n  ")}`,
    };
  }
  if (ledger.count !== ledger.pending.length) {
    return { ok: false, live, drift, message: `pending --gate: ledger count ${ledger.count} != ${ledger.pending.length} entries` };
  }
  if (live.length > 0) {
    return {
      ok: false,
      live,
      drift,
      message: `pending --gate: ${live.length} kernel coordinate(s) carry no necessity witness; REL-VIEW-ALGEBRA-01 cannot close until each earns one or leaves the kernel:\n  ${live.join("\n  ")}`,
    };
  }
  return { ok: true, live, drift, message: "pending --gate: OK — every kernel coordinate carries a necessity witness" };
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  const gate = process.argv.includes("--gate");
  const r = checkPending();
  console.log(gate ? r.message : `pending: ${r.live.length} coordinate(s) awaiting a witness`);
  if (gate && !r.ok) process.exit(1);
}
