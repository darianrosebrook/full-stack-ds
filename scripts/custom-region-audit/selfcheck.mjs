/**
 * Falsification probe for the custom-region rail (RAIL-CUSTOM-REGION-GATE-01).
 *
 * A gate that has never been observed to fail is indistinguishable from a gate
 * that cannot fail, and this one guards a constraint that produced no visible
 * symptom for however long it was being violated — so the bar is higher than
 * usual. Each check below pins one way the rail MUST fire and, where it
 * matters, one way it must stay silent. A rail that flagged all ~2100 regions
 * would be exactly as useless as one that flagged none.
 *
 * The prose-mention checks earn their place: the first revision of this audit
 * matched `line.includes("@custom:start")` and reported
 * `ds-angular/.../Table.realization.test.ts:8` — a hand-authored file that
 * merely NAMES the marker in a comment — as an unterminated region. Mirroring
 * preserve.ts's anchored `MARKER_RE` fixed it, and these checks exist so the
 * looser form cannot creep back.
 *
 * Standalone Node, matching the sibling audits' probes.
 */
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { diffLedger } from "../lib/ledger-ratchet.mjs";
import { artifactKind, isOccupied, parseRegions, regionId, scanTree } from "./audit.mjs";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL ${name}\n       ${err.message}`);
  }
}

const EMPTY_REGION = ["/* @custom:start overrides */", "", "/* @custom:end */"].join("\n");
const OCCUPIED_REGION = [
  "/* @custom:start overrides */",
  ".widget { color: hotpink; }",
  "/* @custom:end */",
].join("\n");

console.log("RAIL-CUSTOM-REGION-GATE-01 selfcheck\n");

// --- the marker oracle -----------------------------------------------------

check("recognizes the line-comment marker form", () => {
  const regions = parseRegions("// @custom:start imports\nimport x from 'y';\n// @custom:end");
  assert.equal(regions.length, 1);
  assert.equal(regions[0].label, "imports");
  assert.equal(regions[0].terminated, true);
});

check("recognizes the block-comment marker form", () => {
  const regions = parseRegions(EMPTY_REGION);
  assert.equal(regions.length, 1);
  assert.equal(regions[0].label, "overrides");
});

check("a prose mention of the marker opens NO region", () => {
  // The exact shape that produced the false positive: text before the marker.
  const text = [
    "// Companion runtime proof in React lives in",
    "//   (inside the @custom:start tests block).",
    "import { describe } from 'vitest';",
  ].join("\n");
  assert.deepEqual(parseRegions(text), []);
});

check("a marker inside a string literal opens NO region", () => {
  // Why ds-codegen is out of scan scope — its emitters carry these as data.
  const text = 'const marker = "// @custom:start overrides";\nconst other = 1;';
  assert.deepEqual(parseRegions(text), []);
});

check("@generated regions are not @custom findings", () => {
  const text = "// @generated:start imports\nimport a from 'b';\n// @generated:end";
  assert.deepEqual(parseRegions(text), []);
});

check("an unterminated @custom:start is reported, not swallowed", () => {
  const regions = parseRegions("// @custom:start trailing\nleft dangling");
  assert.equal(regions.length, 1);
  assert.equal(regions[0].terminated, false);
});

// --- occupancy -------------------------------------------------------------

check("the canonical emitted-empty region is unoccupied", () => {
  assert.equal(isOccupied(parseRegions(EMPTY_REGION)[0].body), false);
});

check("a region whose body is only whitespace is unoccupied", () => {
  const text = "/* @custom:start overrides */\n   \n\t\n\n/* @custom:end */";
  assert.equal(isOccupied(parseRegions(text)[0].body), false);
});

check("one authored declaration makes a region occupied", () => {
  assert.equal(isOccupied(parseRegions(OCCUPIED_REGION)[0].body), true);
});

check("a comment-only body counts as occupied (an authored comment is an edit)", () => {
  const text = "/* @custom:start overrides */\n/* keep this */\n/* @custom:end */";
  assert.equal(isOccupied(parseRegions(text)[0].body), true);
});

// --- classification --------------------------------------------------------

check("component source and generated tests are classified apart", () => {
  assert.equal(artifactKind("packages/ds-react/src/components/Card/Card.css"), "source");
  assert.equal(
    artifactKind("packages/ds-react/src/components/Card/__tests__/Card.test.tsx"),
    "test",
  );
});

// --- end to end, over a real tree ------------------------------------------

check("scanning a synthetic tree names the occupied file and only that file", () => {
  const root = mkdtempSync(join(tmpdir(), "fsds-custom-region-"));
  try {
    const dir = join(root, "components", "Widget");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "Clean.css"), EMPTY_REGION);
    writeFileSync(join(dir, "Widget.css"), OCCUPIED_REGION);

    const { findings, regionCount } = scanTree(root);
    assert.equal(regionCount, 2, "both regions are counted");
    assert.equal(findings.length, 1, "only the occupied one is a finding");
    assert.ok(
      findings[0].file.endsWith("Widget.css"),
      `expected the finding to name Widget.css, got ${findings[0].file}`,
    );
    assert.equal(findings[0].label, "overrides");
    assert.equal(findings[0].preview, ".widget { color: hotpink; }");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

check("emptying the region clears the finding", () => {
  const root = mkdtempSync(join(tmpdir(), "fsds-custom-region-"));
  try {
    mkdirSync(join(root, "components"), { recursive: true });
    writeFileSync(join(root, "components", "Widget.css"), EMPTY_REGION);
    assert.deepEqual(scanTree(root).findings, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// --- this audit's identity function, against the shared ratchet -------------
// reportRatchet's diff -> exit-code mapping is pinned once, for all six audits,
// in scripts/lib/ledger-ratchet.test.mjs (which `audit:custom-regions` runs
// first). What is audit-SPECIFIC, and so belongs here, is `regionId`: the
// ratchet can only be as precise as the identity it is handed.

const row = (file, label) => ({ file, label, kind: "source" });

check("region identity is (file, label), so two regions in one file stay distinct", () => {
  // A file-only id would collapse a component's `imports` and `trailing`
  // regions into one, and an edit to the second would inherit the first's
  // ledger entry instead of failing.
  assert.notEqual(regionId(row("a.tsx", "imports")), regionId(row("a.tsx", "trailing")));
});

check("region identity ignores the class, so a region cannot be relabelled out of the ledger", () => {
  assert.equal(
    regionId({ ...row("a.tsx", "tests"), kind: "test" }),
    regionId({ ...row("a.tsx", "tests"), kind: "source" }),
  );
});

check("this audit's ids flow through the ratchet unchanged", () => {
  const current = [row("a.css", "overrides")];
  const { unledgered, stale } = diffLedger({
    current,
    ledger: [{ ...current[0], spec: "X-01", note: "n" }],
    idOf: regionId,
  });
  assert.deepEqual([unledgered, stale], [[], []], "a ledgered region must match itself");
});

console.log(
  failures === 0
    ? "\nselfcheck PASS — every check held"
    : `\nselfcheck FAIL — ${failures} check(s) failed`,
);
if (failures > 0) process.exit(1);
