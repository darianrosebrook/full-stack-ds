#!/usr/bin/env node
/**
 * VARIANT-STYLE-REALIZATION-AUDIT-01 — locked discriminator test.
 *
 * Locks the audit's classification on REAL contracts/CSS:
 *   - Batch 1 (VARIANT-STYLE-VAR-RESCOPE-BATCH-01) realized Spinner.thickness,
 *     Stat.trend, Select.size; Batch 2 (VARIANT-STYLE-SIZE-INTENT-BATCH-02)
 *     realized Spinner.size, Avatar.size, Stat.size and Progress.intent via
 *     per-value tokens — all now fully realized (regression lock for the fixes);
 *   - the canary remainder is still flagged: Spinner.variant (ring/dots/bars →
 *     contract decision) and List.size (still unrealized — no visual styles
 *     authored yet; VARIANT-CLASS-NAMESPACE-COLLISION-01 fixed the AMBIGUITY by
 *     namespacing the class, but realization is a later slice);
 *   - a fully-realized component (Button: `.button--primary` etc. scope vars in
 *     tokens.css) is NOT flagged (false-positive control);
 *   - a behavioral axis (Calendar `mode`, NavList `orientation`) has no styling
 *     intent and is NOT flagged (behavioral false-positive control).
 *
 * VARIANT-CLASS-NAMESPACE-COLLISION-01 also locks here:
 *   - collision detection: List's variant/marker/spacing/size axes are tainted
 *     (size × spacing share sm/md/lg — the locked fixture); Image's size/radius
 *     are tainted; `as` (and clean components) are not;
 *   - namespaced emission across react/vue/svelte/angular/lit: colliding axes
 *     emit `.<prefix>--<axis>-<value>` and never the bare ambiguous form, while
 *     the non-colliding `as` keeps `.list--<as>`.
 *
 * Standalone (named *.test.mjs → exempt from the shortcut-language guard).
 * Run: node scripts/variant-style-audit/realization.test.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { classify } from "./audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const readGen = (p) => readFileSync(resolve(REPO, p), "utf8");

let pass = 0;
let fail = 0;
const check = (name, fn) => {
  try {
    fn();
    console.log(`  ok  ${name}`);
    pass++;
  } catch (e) {
    console.error(`  XX  ${name}: ${e.message}`);
    fail++;
  }
};
const dim = (c, d) => classify(c).dims.find((x) => x.dim === d);

console.log("Batch 1 + Batch 2 — per-value-token axes now fully realized:");
for (const [c, d] of [
  ["Spinner", "thickness"], ["Stat", "trend"], ["Select", "size"],
  ["Spinner", "size"], ["Avatar", "size"], ["Stat", "size"], ["Progress", "intent"],
]) {
  check(`${c}.${d} is fully realized (styling axis, no gaps)`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.stylingIntent, true, `expected styling intent for ${c}.${d}`);
    assert.equal(x.gaps.length, 0, `unexpected gaps: ${JSON.stringify(x.gaps)}`);
    // realizedCount can be total-1 when the axis has a declared default that the
    // base rule realizes (e.g. Stat.size default=md), so assert >=1, not ==total.
    assert.ok(x.realizedCount >= 1, `expected >=1 consuming selector, got ${x.realizedCount}`);
  });
}

console.log("\nstill unrealized — Spinner.variant (contract decision) + List.size (collision now namespaced; visual realization is a later slice):");
for (const [c, d] of [["Spinner", "variant"], ["List", "size"]]) {
  check(`${c}.${d} is still an unrealized axis`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.realizedCount, 0, `realizedCount=${x.realizedCount} (expected 0)`);
  });
}

console.log("\nfalse-positive control — a fully-realized component is NOT flagged:");
check("Button has no realization gaps (variants scope vars in tokens.css)", () => {
  const gaps = classify("Button").dims.flatMap((d) => d.gaps);
  assert.deepEqual(gaps, [], `Button unexpectedly flagged: ${JSON.stringify(gaps)}`);
});

console.log("\nbehavioral false-positive control — behavioral axes have no styling intent:");
for (const [c, d] of [["Calendar", "mode"], ["NavList", "orientation"], ["OTP", "mode"]]) {
  check(`${c}.${d} is behavioral (no styling intent) -> not flagged`, () => {
    const x = dim(c, d);
    assert.ok(x, `no ${c}.${d} axis`);
    assert.equal(x.stylingIntent, false, `expected no styling intent for behavioral ${c}.${d}`);
    assert.deepEqual(x.gaps, [], `${c}.${d} should not be flagged`);
  });
}

console.log("\nVARIANT-CLASS-NAMESPACE-COLLISION-01 — collision detection (A1):");
check("List: size × spacing collide on sm/md/lg (locked fixture); variant/marker/spacing/size tainted, as clean", () => {
  const L = classify("List");
  assert.deepEqual(L.taintedAxes, ["marker", "size", "spacing", "variant"], `taintedAxes=${JSON.stringify(L.taintedAxes)}`);
  for (const v of ["sm", "md", "lg"]) {
    const col = L.collisions.find((c) => c.value === v);
    assert.ok(col, `no collision recorded for List value '${v}'`);
    assert.deepEqual(col.axes, ["size", "spacing"], `'${v}' collision axes=${JSON.stringify(col?.axes)}`);
  }
  // the wider collision web is also detected
  assert.deepEqual(L.collisions.find((c) => c.value === "default")?.axes, ["marker", "variant"]);
  assert.deepEqual(L.collisions.find((c) => c.value === "none")?.axes, ["marker", "spacing"]);
});
check("Image: size × radius tainted (second proof case, proves generality not List-lore)", () => {
  const I = classify("Image");
  assert.deepEqual(I.taintedAxes, ["radius", "size"], `taintedAxes=${JSON.stringify(I.taintedAxes)}`);
});
check("a clean component (Button) reports zero collisions / no tainted axes", () => {
  const B = classify("Button");
  assert.equal(B.collisions.length, 0, `Button collisions=${JSON.stringify(B.collisions)}`);
  assert.deepEqual(B.taintedAxes, []);
});

console.log("\nVARIANT-CLASS-NAMESPACE-COLLISION-01 — namespaced emission across frameworks (A2/A4):");
// accessor shape per framework for a bare colliding-axis class literal `prefix--${<acc>}`
const ACC = {
  react: (a) => a,
  vue: (a) => `props.${a}`,
  svelte: (a) => a,
  angular: (a) => `this.${a}`,
  lit: (a) => `this.${a}`,
};
const FILE = {
  react: (n) => `packages/ds-react/src/components/${n}/${n}.tsx`,
  vue: (n) => `packages/ds-vue/src/components/${n}/${n}.vue`,
  svelte: (n) => `packages/ds-svelte/src/components/${n}/${n}.svelte`,
  angular: (n) => `packages/ds-angular/src/components/${n}/${n}.component.ts`,
  lit: (n) => `packages/ds-lit/src/components/${n}/${n}.ts`,
};
// component → { prefix, colliding axes, clean axes }
const CASES = [
  { name: "List", prefix: "list", colliding: ["variant", "marker", "spacing", "size"], clean: ["as"] },
  { name: "Image", prefix: "image", colliding: ["radius", "size"], clean: [] },
];
for (const fw of ["react", "vue", "svelte", "angular", "lit"]) {
  for (const cse of CASES) {
    check(`${fw}: ${cse.name} colliding axes emit \`${cse.prefix}--<axis>-\` and never the bare ambiguous form`, () => {
      const src = readGen(FILE[fw](cse.name));
      for (const axis of cse.colliding) {
        assert.ok(
          src.includes(`${cse.prefix}--${axis}-`),
          `${fw} ${cse.name}: missing namespaced class \`${cse.prefix}--${axis}-\``,
        );
        const bare = `${cse.prefix}--\${${ACC[fw](axis)}}`;
        assert.ok(
          !src.includes(bare),
          `${fw} ${cse.name}: still emits ambiguous bare class \`${bare}\``,
        );
      }
      for (const axis of cse.clean) {
        const bare = `${cse.prefix}--\${${ACC[fw](axis)}}`;
        assert.ok(src.includes(bare), `${fw} ${cse.name}: clean axis '${axis}' should stay bare \`${bare}\``);
        assert.ok(
          !src.includes(`${cse.prefix}--${axis}-`),
          `${fw} ${cse.name}: clean axis '${axis}' was unnecessarily namespaced`,
        );
      }
    });
  }
}

console.log(`\nlocked test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
