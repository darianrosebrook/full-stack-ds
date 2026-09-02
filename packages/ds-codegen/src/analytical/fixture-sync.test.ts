/**
 * The showcase fixture dump is a derived artifact (REL-FIELD-ALGEBRA-02,
 * invariant 14): `fixtures:sync --check` must pass on the committed dump and
 * fail on a mutated one. This is the CI gate; pre-push runs the same command.
 */
import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "../../../..");
const SCRIPT = path.join(ROOT, "scripts/sync-analytical-fixtures.mjs");
const DUMP = path.join(ROOT, "src/data/analytical-fixtures/fixtures.ts");

const check = (env: Record<string, string> = {}) =>
  spawnSync(process.execPath, [SCRIPT, "--check"], { cwd: ROOT, encoding: "utf-8", env: { ...process.env, ...env } });

describe("fixtures:sync --check", () => {
  it("passes on the committed dump", () => {
    const r = check();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toContain("OK");
  });

  it("fails on a mutated dump without touching it", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fsds-fixtures-"));
    const copy = path.join(dir, "fixtures.ts");
    fs.writeFileSync(copy, fs.readFileSync(DUMP, "utf-8").replace('"id": "FX_', '"id": "FY_'));
    const r = check({ ANALYTICAL_FIXTURES_TARGET: copy });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("DRIFT");
    expect(fs.readFileSync(copy, "utf-8")).toContain('"id": "FY_');
  });

  it("fails when the dump is missing", () => {
    const r = check({ ANALYTICAL_FIXTURES_TARGET: path.join(os.tmpdir(), "fsds-no-such-dump.ts") });
    expect(r.status).toBe(1);
  });
});
