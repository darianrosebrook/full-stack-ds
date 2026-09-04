/**
 * The identities are a partition of the code that can move a recorded verdict,
 * and this is what keeps that claim from being a hand-maintained assertion.
 *
 * The failure it exists to catch is under-claiming. A helper extracted into a
 * new file leaves every declared list intact and every digest computable, so a
 * list checked only against itself stays green while the identity has stopped
 * covering the thing it names. The walk over the import graph is the only part
 * of this that cannot be satisfied by editing a list.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  COORDINATE_BASIS,
  digestOf,
  ERASURE_AUTHORITY,
  footprintBasisDigest,
  IDENTITIES,
  moduleClosure,
  ownerOf,
  WITNESS_AUTHORITY,
  authorityIdentities,
} from "./authority.js";
import { CONTRACTS_DIR, RULE_SOURCES } from "./necessity.js";
import { QUOTIENT_SCHEMA_VERSION } from "./quotient-image.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ruleModules = new Set(RULE_SOURCES.map((p) => path.basename(p)));

describe("the identities partition the code that can move a verdict", () => {
  it("no module is owned twice, so a moved digest names exactly one cause", () => {
    const seen = new Map<string, string>();
    for (const i of IDENTITIES) {
      for (const f of i.owns) {
        expect(seen.get(f), `${f} is owned by both ${seen.get(f)} and ${i.name}`).toBeUndefined();
        seen.set(f, i.name);
      }
    }
    // And no identity claims a rule source: a changed rule and a changed
    // erasure are different invalidation causes and must stay distinguishable.
    for (const [f, owner] of seen) expect(ruleModules.has(f), `${f} is claimed by ${owner} and by RULE_SOURCES`).toBe(false);
  });

  it("every module an identity can REACH is owned by some identity, is a rule source, or is excluded with a reason", () => {
    for (const i of IDENTITIES) {
      const unaccounted = [...moduleClosure(i.entryPoints)].filter((f) => ownerOf(f) === undefined && !ruleModules.has(f) && !(f in i.excluded)).sort();
      expect(unaccounted, `reachable from ${i.name} but neither digested nor excused`).toEqual([]);
    }
  });

  it("every exclusion is actually reachable, so the excuse list cannot rot", () => {
    for (const i of IDENTITIES) {
      const reached = moduleClosure(i.entryPoints);
      for (const [f, reason] of Object.entries(i.excluded)) {
        expect(reached.has(f), `${i.name} excuses ${f}, which nothing it imports reaches`).toBe(true);
        expect(reason.trim().length, `${i.name}/${f} is excused with no reason`).toBeGreaterThan(10);
      }
    }
  });

  it("an owned module is reachable from its own identity's entry points", () => {
    // The other direction: a list may not name a module the identity does not
    // actually depend on, which would bind evidence to unrelated churn.
    for (const i of IDENTITIES) {
      const reached = moduleClosure(i.entryPoints);
      for (const f of i.owns) expect(reached.has(f), `${i.name} owns ${f} but does not reach it`).toBe(true);
    }
  });

  it("catches a rule or helper that moves into an undeclared module", () => {
    // Falsification. `moduleClosure` is given a directory whose graph contains a
    // module no identity declares, and the same check that passes above fails.
    const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "authority-"));
    fs.writeFileSync(path.join(dir, "entry.ts"), 'import { x } from "./extracted.js";\nexport const y = x;\n');
    fs.writeFileSync(path.join(dir, "extracted.ts"), "export const x = 1;\n");
    const reached = moduleClosure(["entry.ts"], dir);
    expect([...reached].sort()).toEqual(["entry.ts", "extracted.ts"]);
    expect([...reached].filter((f) => ownerOf(f) === undefined && !ruleModules.has(f))).toEqual(["entry.ts", "extracted.ts"]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe("a digest is an identity, not a checksum of a pile of bytes", () => {
  it("distinguishes the same bytes arranged under different names", () => {
    // Two identities over the same file set but different names must differ, or
    // the digest is over a concatenation and a rename is invisible to it.
    const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "authority-"));
    fs.writeFileSync(path.join(dir, "a.ts"), "one");
    fs.writeFileSync(path.join(dir, "b.ts"), "two");
    fs.writeFileSync(path.join(dir, "c.ts"), "onetwo");
    fs.writeFileSync(path.join(dir, "d.ts"), "");
    const id = (owns: string[]) => ({ ...COORDINATE_BASIS, owns, artifacts: [] });
    expect(digestOf(id(["a.ts", "b.ts"]), dir)).not.toBe(digestOf(id(["c.ts", "d.ts"]), dir));
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("moves when an owned source moves, and only then", () => {
    const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "authority-"));
    fs.writeFileSync(path.join(dir, "a.ts"), "one");
    fs.writeFileSync(path.join(dir, "unowned.ts"), "three");
    const id = { ...ERASURE_AUTHORITY, owns: ["a.ts"], artifacts: [] };
    const before = digestOf(id, dir);
    fs.writeFileSync(path.join(dir, "unowned.ts"), "changed");
    expect(digestOf(id, dir)).toBe(before);
    fs.writeFileSync(path.join(dir, "a.ts"), "one!");
    expect(digestOf(id, dir)).not.toBe(before);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("moves when a committed ARTIFACT moves, though no source did", () => {
    // The case a source-only digest misses: the emitted schema is a second
    // place the same decision lives, and evidence bound only to the generator
    // would not notice it going stale.
    const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "authority-"));
    const contracts = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "contracts-"));
    fs.writeFileSync(path.join(dir, "a.ts"), "one");
    fs.writeFileSync(path.join(contracts, "s.json"), "{}");
    const id = { ...ERASURE_AUTHORITY, owns: ["a.ts"], artifacts: ["s.json"] };
    const before = digestOf(id, dir, contracts);
    fs.writeFileSync(path.join(contracts, "s.json"), '{"x":1}');
    expect(digestOf(id, dir, contracts)).not.toBe(before);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(contracts, { recursive: true, force: true });
  });

  it("the three live digests are distinct, and each is a sha256", () => {
    const ids = authorityIdentities(QUOTIENT_SCHEMA_VERSION);
    const values = [ids.coordinateBasisDigest, ids.erasureAuthorityDigest, ids.witnessAuthorityDigest];
    for (const v of values) expect(v).toMatch(/^[0-9a-f]{64}$/);
    expect(new Set(values).size).toBe(3);
    expect(ids.quotientSchemaVersion).toBe(QUOTIENT_SCHEMA_VERSION);
  });

  it("every identity is over at least one owned source, and names what it invalidates", () => {
    for (const i of IDENTITIES) {
      expect(i.owns.length, `${i.name} owns nothing`).toBeGreaterThan(0);
      expect(i.invalidates.trim().length, `${i.name} does not say what it invalidates`).toBeGreaterThan(30);
      for (const f of i.owns) expect(fs.existsSync(path.join(HERE, f)), `${i.name} owns ${f}, which does not exist`).toBe(true);
    }
  });
});

describe("the specimen population is a SEPARATE identity", () => {
  it("is order-independent, since a population is a set and not a listing", () => {
    expect(footprintBasisDigest(["b", "a", "c"])).toBe(footprintBasisDigest(["a", "b", "c"]));
  });

  it("moves when the population changes, in either direction", () => {
    const base = footprintBasisDigest(["a", "b"]);
    expect(footprintBasisDigest(["a", "b", "c"])).not.toBe(base);
    expect(footprintBasisDigest(["a"])).not.toBe(base);
  });

  it("is not the erasure identity: growing the population must not reject a witness", () => {
    // The reason the two are apart. A footprint claim is population-sensitive —
    // "no specimen separates this" is a statement about the specimens — while a
    // witness is existential and survives the population growing.
    const ids = authorityIdentities(QUOTIENT_SCHEMA_VERSION);
    expect(footprintBasisDigest(["a", "b"])).not.toBe(ids.erasureAuthorityDigest);
    expect(footprintBasisDigest(["a", "b"])).not.toBe(ids.witnessAuthorityDigest);
  });
});

describe("the witness identity covers ADMISSION, not only image production", () => {
  it("owns the module that decides a witness holds and the module that decides a closure is discharged", () => {
    expect(WITNESS_AUTHORITY.owns).toContain("necessity.ts");
    expect(WITNESS_AUTHORITY.owns).toContain("closure.ts");
  });

  it("changing the isolation boundary moves the witness digest while every image is untouched", () => {
    // The property the erasure digest alone cannot have. `isolationViolation`
    // lives in `necessity.ts` and produces no image at all; a change to it moves
    // every witness verdict and would leave an erasure-only identity unmoved.
    //
    // Demonstrated over a COPY of the two identities' owned files. Editing the
    // real `necessity.ts` would prove the same thing and leave the tree
    // corrupted if the run were interrupted, which is not a trade worth making
    // for a test about bookkeeping.
    const dir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "authority-"));
    const contracts = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "contracts-"));
    for (const f of [...WITNESS_AUTHORITY.owns, ...ERASURE_AUTHORITY.owns]) fs.copyFileSync(path.join(HERE, f), path.join(dir, f));
    for (const a of ERASURE_AUTHORITY.artifacts) fs.copyFileSync(path.join(CONTRACTS_DIR, a), path.join(contracts, path.basename(a)));
    const erasureHere = { ...ERASURE_AUTHORITY, artifacts: ERASURE_AUTHORITY.artifacts.map((a) => path.basename(a)) };

    const witnessBefore = digestOf(WITNESS_AUTHORITY, dir, contracts);
    const erasureBefore = digestOf(erasureHere, dir, contracts);
    fs.appendFileSync(path.join(dir, "necessity.ts"), "\n// the isolation boundary moved\n");
    expect(digestOf(WITNESS_AUTHORITY, dir, contracts), "the witness identity did not notice its admission code move").not.toBe(witnessBefore);
    expect(digestOf(erasureHere, dir, contracts), "the erasure identity moved although no image can have changed").toBe(erasureBefore);

    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(contracts, { recursive: true, force: true });
  });
});
