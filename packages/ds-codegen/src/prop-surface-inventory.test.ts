import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { inventoryCorpus, summarize } from "./prop-surface-inventory.js";

// CONTRACT-PROP-SURFACE-CORPUS-INVENTORY-01, contract `prop-surface-harness`.
// Advisory-first: this suite fails on INTERNAL INCONSISTENCY, never on "still
// on styled". The 46 legacy contracts must pass as legitimately-legacy; the hard
// corpus gate is the later CERTIFY spec.

const CONTRACTS_ROOT = resolve(__dirname, "../../ds-contracts");
const reports = inventoryCorpus(CONTRACTS_ROOT);
const sum = summarize(reports);

// Runtime artifact: print the scoreboard so a reader sees the real corpus state.
console.log("\n=== prop-surface corpus scoreboard ===\n" + JSON.stringify(sum, null, 2));
console.log(
  "\nmigrated: " + reports.filter((r) => r.migrated).map((r) => r.component).join(", "),
);
console.log(
  "legacy:   " + reports.filter((r) => !r.migrated).map((r) => r.component).join(", ") + "\n",
);

describe("prop-surface inventory — scanner (A1)", () => {
  it("reports the full corpus with internally consistent per-component facts", () => {
    expect(reports.length).toBeGreaterThanOrEqual(47);
    for (const r of reports) {
      expect(typeof r.component).toBe("string");
      // propType + legacy type coverage accounts for every consumer prop
      expect(r.propTypeCoverage + r.legacyTypeCoverage).toBe(r.propCount);
      expect(r.propNames.length).toBe(r.propCount);
    }
  });
});

describe("prop-surface harness — internal consistency (A2)", () => {
  it("no styled member authors a propType (legacy lane stays type-only)", () => {
    const offenders = reports
      .filter((r) => r.styledWithPropType.length > 0)
      .map((r) => `${r.component}: ${r.styledWithPropType.join()}`);
    expect(offenders).toEqual([]);
  });

  it("no member authors BOTH type and propType (exactly one source)", () => {
    const offenders = reports
      .filter((r) => r.doubleAuthored.length > 0)
      .map((r) => `${r.component}: ${r.doubleAuthored.join()}`);
    expect(offenders).toEqual([]);
  });

  it("every propType.ref resolves to a contract.types alias", () => {
    const unresolved = reports.flatMap((r) =>
      r.refs.filter((x) => !x.resolves).map((x) => `${r.component}.${x.prop}->${x.to}`),
    );
    expect(unresolved).toEqual([]);
  });
});

describe("prop-surface harness — migrated components are A2UI structured-source (A3)", () => {
  it("every migrated component has zero A2UI legacy-fallback props", () => {
    const offenders = reports
      .filter((r) => r.migrated && (!r.a2uiStructuredSource || r.fallbackCount > 0))
      .map((r) => r.component);
    expect(offenders).toEqual([]);
  });

  it("legacy components legitimately retain fallback{raw} and are NOT failed (advisory posture)", () => {
    const legacyWithFallback = reports.filter((r) => !r.migrated && r.fallbackCount > 0);
    expect(legacyWithFallback.length).toBeGreaterThan(0);
  });
});

describe("Button is the reference migrated component (A4)", () => {
  it("Button: migrated, full propType coverage, zero legacy type, resolved refs, structured A2UI", () => {
    const b = reports.find((r) => r.component === "Button");
    expect(b).toBeDefined();
    if (!b) return;
    expect(b.migrated).toBe(true);
    expect(b.legacyTypeCoverage).toBe(0);
    expect(b.propTypeCoverage).toBe(b.propCount);
    expect(b.propCount).toBeGreaterThan(0);
    expect(b.refs.every((x) => x.resolves)).toBe(true);
    expect(b.a2uiStructuredSource).toBe(true);
  });
});

describe("advisory mode: an unmigrated corpus does not fail the suite (A5)", () => {
  it("most components are still legacy and that is reported, not failed", () => {
    expect(sum.migrated).toBeGreaterThanOrEqual(1); // Button
    expect(sum.legacy).toBeGreaterThan(0); // 46 today
  });
});
