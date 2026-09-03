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

/**
 * The gate's BEHAVIOUR is tested against synthetic kernels, never against the
 * live debt. Otherwise finishing the slice — driving 118 pending coordinates to
 * zero — would require editing a green falsifier test, and the definition of
 * "the gate works" would move with the data it is supposed to judge. Going to
 * zero should change data only. The live state is certified by the command
 * `pnpm run analytical:pending:gate`, not by these tests.
 */
describe("the pending close gate", () => {
  it("refuses when a coordinate carries no witness", () => {
    const r = checkPending(tmpLedger({ count: 2, pending: ["synthetic.a", "synthetic.b"] }), () => ["synthetic.a", "synthetic.b"]);
    expect(r.ok).toBe(false);
    expect(r.message).toContain("carry no necessity witness");
    expect(r.message).toContain("cannot close");
  });

  it("passes when the ledger is empty AND the kernel agrees", () => {
    const r = checkPending(tmpLedger({ count: 0, pending: [] }), () => []);
    expect(r.ok).toBe(true);
    expect(r.message).toContain("every kernel coordinate carries a necessity witness");
  });

  it("refuses an empty ledger while the kernel still has outstanding coordinates", () => {
    // A stale file saying zero must not pass a gate whose whole purpose is to
    // refuse that; the mismatch is reported as drift, not success.
    const r = checkPending(tmpLedger({ count: 0, pending: [] }), () => ["synthetic.a"]);
    expect(r.ok).toBe(false);
    expect(r.message).toContain("LEDGER DRIFT");
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
