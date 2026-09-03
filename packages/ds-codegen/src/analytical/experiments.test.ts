/**
 * The ownership invariant, and the rule-surface closure.
 *
 * Both are the same shape of claim: a declared set must be provably complete
 * against the thing it claims to cover, or it is an attribution that can
 * silently under-claim.
 *
 * - Ownership: every live kernel coordinate is ratified or owned by an open
 *   experiment. It survives growth — a later stage may admit what its authority
 *   demands, provided the same change opens a basis that owns it — so what it
 *   refuses is an orphaned claim, not growth.
 * - Rule surface: `RULE_SOURCES` is what the holdout digest covers. If a module
 *   can influence a judgment without being in it, the digest under-claims and
 *   the holdout can report itself current while the rules have moved.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { loadBases, orphanedCoordinates, type ExperimentBasis } from "./experiments.js";
import { RULE_SOURCES } from "./necessity.js";

const HERE = __dirname;

describe("no live coordinate is an orphaned claim", () => {
  it("holds today", () => {
    expect(orphanedCoordinates()).toEqual([]);
  });

  it("names the owner in its remedy, and the remedy is never deletion", () => {
    // With no basis registered, every unratified coordinate is an orphan; the
    // message must send the reader to open a basis, not to remove the model.
    const orphans = orphanedCoordinates([]);
    expect(orphans.length).toBeGreaterThan(0);
    for (const o of orphans) expect(o.detail).toContain("must open a basis that adjudicates it");
    expect(orphans.some((o) => /delete|remove/i.test(o.detail))).toBe(false);
  });

  it("takes the UNION of bases, so a later experiment's basis accounts for its own coordinates", () => {
    // The property that makes this invariant experiment-agnostic: a stage-3
    // coordinate is legal exactly when stage 3 opens responsibility for it, and
    // no historical basis has to be edited for that to be true.
    const orphans = orphanedCoordinates([]).map((o) => o.coordinate);
    const later: ExperimentBasis = {
      file: "subtraction-hypothetical.json",
      spec: "REL-HYPOTHETICAL-01",
      frozenAt: "0000000",
      candidates: orphans.slice(0, 3),
    };
    const remaining = orphanedCoordinates([later]).map((o) => o.coordinate);
    expect(remaining).toEqual(orphans.slice(3));
  });

  it("registers a basis by its existence, and every registered basis names its owning spec", () => {
    const bases = loadBases();
    expect(bases.length).toBeGreaterThan(0);
    for (const b of bases) {
      expect(b.spec, `${b.file} does not name a spec`).toMatch(/^[A-Z][A-Z0-9-]+$/);
      expect(b.candidates.length, `${b.file} has no candidates`).toBeGreaterThan(0);
    }
  });
});

describe("RULE_SOURCES is closed under import, not merely declared", () => {
  /**
   * Modules reachable from the judgment entry points that deliberately are NOT
   * rule sources, each with the reason it cannot move a judgment.
   */
  const NON_RULE: Record<string, string> = {
    "relation-model.ts": "decides which structures are well-formed, not what any of them yields",
  };

  const localImports = (file: string): string[] =>
    [...fs.readFileSync(file, "utf-8").matchAll(/from\s+"\.\/([\w.-]+)\.js"/g)].map((m) => `${m[1]}.ts`);

  const closure = (): Set<string> => {
    const seen = new Set<string>();
    const queue = RULE_SOURCES.map((p) => path.basename(p));
    while (queue.length > 0) {
      const f = queue.shift()!;
      if (seen.has(f)) continue;
      seen.add(f);
      const p = path.join(HERE, f);
      if (fs.existsSync(p)) queue.push(...localImports(p));
    }
    return seen;
  };

  it("every module a judgment can reach is either a declared rule source or a declared non-rule", () => {
    // The claim this upgrades: the digest covered "the modules we listed".
    // It now covers "the modules a judgment can reach", which is checkable.
    const declared = new Set(RULE_SOURCES.map((p) => path.basename(p)));
    const undeclared = [...closure()].filter((f) => !declared.has(f) && !(f in NON_RULE)).sort();
    expect(undeclared, "reachable from the rule surface but neither digested nor excused").toEqual([]);
  });

  it("every declared non-rule is actually reachable, so the excuse list cannot rot", () => {
    const reached = closure();
    for (const f of Object.keys(NON_RULE)) {
      expect(reached.has(f), `${f} is excused from the rule surface but nothing reaches it`).toBe(true);
      expect(NON_RULE[f].trim().length).toBeGreaterThan(0);
    }
  });

  it("catches a rule that moves into an undeclared module", () => {
    // The failure mode: someone extracts a helper from engines.ts into a new
    // file. The closure walk reaches it through the import and reports it,
    // where a hand-maintained list would not have.
    const declared = new Set([...RULE_SOURCES.map((p) => path.basename(p)), "invented.ts"]);
    const pretend = new Set([...closure(), "invented.ts"]);
    expect([...pretend].filter((f) => !declared.has(f) && !(f in NON_RULE))).toEqual([]);
    // And with it undeclared, it is reported:
    const strict = new Set(RULE_SOURCES.map((p) => path.basename(p)));
    expect([...pretend].filter((f) => !strict.has(f) && !(f in NON_RULE))).toContain("invented.ts");
  });
});
