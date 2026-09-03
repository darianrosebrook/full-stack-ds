/**
 * The close gate (REL-VIEW-ALGEBRA-01 A3/A4).
 *
 * "The spec says the slice may not close with debt" is weaker than every other
 * guard here. These tests pin that the gate can actually fail — for an
 * outstanding coordinate, for a ledger that has drifted from the live kernel,
 * and for a count that disagrees with its own list — and that it passes only
 * on an empty ledger that matches.
 */
import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { checkPending, derivePending, loadPending, PENDING_FILE } from "./pending-gate.js";

const tmpLedger = (body: unknown): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pending-gate-"));
  const file = path.join(dir, "pending-stage2.json");
  fs.writeFileSync(file, JSON.stringify(body, null, 2));
  return file;
};

describe("the pending close gate", () => {
  it("refuses while any kernel coordinate carries no witness", () => {
    const live = derivePending();
    // This is the live state mid-slice; if it ever becomes empty the slice is
    // ready to close and the assertion below documents why this test changes.
    expect(live.length).toBeGreaterThan(0);
    const r = checkPending();
    expect(r.ok).toBe(false);
    expect(r.message).toContain("carry no necessity witness");
    expect(r.message).toContain("cannot close");
  });

  it("passes only when the ledger is empty AND the kernel agrees", () => {
    // An empty ledger against a kernel with outstanding coordinates is DRIFT,
    // not success: a stale file saying zero must not pass a gate whose whole
    // purpose is to refuse that.
    const empty = checkPending(tmpLedger({ count: 0, pending: [] }));
    expect(empty.ok).toBe(false);
    expect(empty.message).toContain("LEDGER DRIFT");
  });

  it("detects a coordinate quietly dropped from the ledger", () => {
    const live = derivePending();
    const r = checkPending(tmpLedger({ count: live.length - 1, pending: live.slice(1) }));
    expect(r.ok).toBe(false);
    expect(r.drift).toContain(`+${live[0]}`);
  });

  it("detects a coordinate invented in the ledger", () => {
    const live = derivePending();
    const r = checkPending(tmpLedger({ count: live.length + 1, pending: [...live, "field.not_a_real_coordinate"] }));
    expect(r.ok).toBe(false);
    expect(r.drift).toContain("-field.not_a_real_coordinate");
  });

  it("refuses a ledger whose count disagrees with its own list", () => {
    const live = derivePending();
    const r = checkPending(tmpLedger({ count: 0, pending: live }));
    expect(r.ok).toBe(false);
    expect(r.message).toContain("!=");
  });

  it("the committed ledger is exactly the live pending set", () => {
    const ledger = loadPending(PENDING_FILE);
    expect([...ledger.pending].sort()).toEqual(derivePending());
    expect(ledger.count).toBe(ledger.pending.length);
  });
});
