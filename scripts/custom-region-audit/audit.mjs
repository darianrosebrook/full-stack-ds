/**
 * Custom-region occupancy rail (RAIL-CUSTOM-REGION-GATE-01).
 *
 * WHAT THIS GATES, AND WHY NOTHING ELSE DID.
 *
 * This repo's whole method rests on one constraint: a component's durable
 * semantics live in its contract, and every framework artifact is emitted from
 * it. `packages/ds-codegen/src/preserve.ts` opens `@custom:start` /
 * `@custom:end` regions so a genuinely un-generatable detail survives the next
 * regeneration. That escape hatch is load-bearing — and, until this rail, it
 * was the only part of the method with no mechanical check at all. Thirty-odd
 * hooks gate naming, LOC deltas, secrets and worktree writes; the one
 * invariant that defines the project was honour-system.
 *
 * The failure it admits is quiet by construction. Filling a region does not
 * break typecheck, does not drift the committed bytes (preserve.ts re-emits
 * the region verbatim, so `governed:rail`'s `git diff --exit-code` stays
 * green), and does not fail a single test. The artifact simply stops being
 * derivable from its contract, and every other framework silently misses
 * whatever was added. The corpus already carried one instance of exactly that:
 * React's Popover.css hand-implemented the enter animation its own contract
 * declares, while Vue/Svelte/Lit/Angular got nothing.
 *
 * WHAT COUNTS AS A FINDING. Any non-blank line inside a region. Codegen emits
 * an unoccupied region as marker / blank / marker with no scaffolding comment,
 * so "non-blank" needs no comment-stripping heuristic — and an authored
 * comment IS an authored edit, so stripping them would be the wrong oracle
 * anyway.
 *
 * WHERE IT LOOKS. The six emitted trees. It does NOT scan `ds-codegen`, whose
 * emitters and tests carry the marker strings as literals — those are the
 * machinery, not its output.
 *
 * TWO CLASSES, REPORTED APART. A region in a generated component (`.tsx`,
 * `.css`, `.vue`, `.svelte`) and a region in a generated `__tests__` file are
 * not the same finding, and collapsing them buries the signal. An occupied
 * component region means the artifact stopped being derivable from its
 * contract — that is the method breaking, and the target is zero. An occupied
 * test region is the hatch working as designed: codegen emits a baseline suite
 * and opens `tests` for the hostile-path coverage no contract implies. Both
 * are ledgered so neither grows silently; only the `source` count is a debt to
 * burn down. The split is reported first because the aggregate is misleading —
 * 85 occupied regions sounds like a collapsed constraint; 6 source and 79 test
 * is the actual state.
 *
 * NON-CLAIM. This proves regions are unoccupied, not that the artifacts are
 * correct, nor that the contract layer is expressive enough to have avoided
 * every region. A component whose detail truly cannot be expressed in a
 * contract yet is a real finding here — the ledger entry is where that gets
 * named and owned, not waved through.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { diffLedger, loadLedger, reportRatchet } from "../lib/ledger-ratchet.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const LEDGER_PATH = resolve(HERE, "known-authored-regions.json");

/** The emitted trees. `ds-codegen` is excluded on purpose — see the header. */
export const EMITTED_TREES = [
  "packages/ds-react/src",
  "packages/ds-vue/src",
  "packages/ds-svelte/src",
  "packages/ds-lit/src",
  "packages/ds-angular/src",
  "packages/ds-react-native/src",
];

const MARKER_TEXT = "@custom:";

/**
 * Mirrored VERBATIM from `packages/ds-codegen/src/preserve.ts` (`MARKER_RE`).
 *
 * A gate whose parser disagrees with the machinery it gates is a gate that
 * lies, so this must not be an independent re-derivation. The anchoring is the
 * whole point: the marker has to BE the line, not appear in it. A looser
 * `includes("@custom:start")` scan reported a false positive on
 * `ds-angular/.../Table.realization.test.ts:8`, a hand-authored file that is
 * not codegen-managed at all and merely names the marker in a prose comment.
 * If preserve.ts's regex changes, this one changes with it.
 */
const MARKER_RE =
  /^\s*(?:\/\/|\/\*)\s*@(?<kind>generated|custom):(?<state>start|end)(?:\s+(?<id>[\w:-]+))?\s*(?:\*\/)?\s*$/;

/**
 * Parse every `@custom` region out of one file's text.
 *
 * `@generated` regions match MARKER_RE too and are skipped: those are codegen's
 * own output and are supposed to have bodies.
 *
 * An unterminated `@custom:start` yields a region whose body runs to EOF, and
 * is reported rather than skipped: a lost end marker means preserve.ts is no
 * longer round-tripping the file, and silence would be the worst possible
 * response to that.
 */
export function parseRegions(text) {
  const regions = [];
  let open = null;

  text.split("\n").forEach((line, index) => {
    const match = line.match(MARKER_RE);
    if (!match) {
      if (open !== null) open.body.push(line);
      return;
    }
    const { kind, state, id } = match.groups;
    if (kind !== "custom") {
      if (open !== null) open.body.push(line);
      return;
    }
    if (state === "start" && open === null) {
      open = { label: id ?? "(unlabelled)", startLine: index + 1, body: [] };
      return;
    }
    if (state === "end" && open !== null) {
      regions.push({ ...open, body: open.body.join("\n"), terminated: true });
      open = null;
      return;
    }
    if (open !== null) open.body.push(line);
  });

  if (open !== null) {
    regions.push({ ...open, body: open.body.join("\n"), terminated: false });
  }
  return regions;
}

/**
 * Which class of artifact a region sits in. See the header: an occupied
 * component region is the method breaking; an occupied test region is the
 * hatch doing its job.
 */
export function artifactKind(file) {
  return file.includes("/__tests__/") ? "test" : "source";
}

/** Occupied = at least one non-blank line. See the header on why not "non-comment". */
export function isOccupied(body) {
  return body.split("\n").some((line) => line.trim().length > 0);
}

/** Stable identity for the ratchet: one region is (file, label). */
export function regionId(row) {
  return `${row.file}::${row.label}`;
}

function walk(dir, out) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir).sort()) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function scanTree(treeRelPath) {
  const findings = [];
  let regionCount = 0;

  for (const absPath of walk(resolve(REPO, treeRelPath), [])) {
    const text = readFileSync(absPath, "utf-8");
    if (!text.includes(MARKER_TEXT)) continue;
    const file = relative(REPO, absPath);
    for (const region of parseRegions(text)) {
      regionCount += 1;
      if (region.terminated && !isOccupied(region.body)) continue;
      const preview =
        region.body
          .split("\n")
          .map((line) => line.trim())
          .find(Boolean) ?? "";
      findings.push({
        file,
        kind: artifactKind(file),
        label: region.label,
        line: region.startLine,
        reason: region.terminated
          ? "authored body in a generated artifact"
          : "unterminated region — preserve.ts is not round-tripping this file",
        preview: preview.length > 72 ? `${preview.slice(0, 69)}…` : preview,
      });
    }
  }
  return { findings, regionCount };
}

export function runAudit(trees = EMITTED_TREES) {
  const findings = [];
  let regionCount = 0;
  for (const tree of trees) {
    const result = scanTree(tree);
    findings.push(...result.findings);
    regionCount += result.regionCount;
  }
  findings.sort((a, b) => regionId(a).localeCompare(regionId(b)));
  return { findings, regionCount };
}

const RUN_DIRECTLY =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const { findings, regionCount } = runAudit();
  const source = findings.filter((row) => row.kind === "source");
  const tests = findings.filter((row) => row.kind === "test");

  console.log(
    `\nRAIL-CUSTOM-REGION-GATE-01 — ${regionCount} region(s) across ${EMITTED_TREES.length} emitted tree(s)`,
  );
  console.log(
    `  occupied: ${source.length} in component source (target: 0) · ${tests.length} in generated tests (by design)\n`,
  );
  console.log("  component source — an artifact that stopped being derivable from its contract:");
  for (const row of source) {
    console.log(`    ${row.file}:${row.line} [${row.label}] ${row.reason}`);
    if (row.preview) console.log(`        ${row.preview}`);
  }
  if (source.length === 0) console.log("    (none)");

  // The test class is summarised, not enumerated: it is 78 rows of expected
  // state, and printing it in full at pre-push buries the source rows above —
  // which are the ones that mean something is wrong. The ledger holds the
  // per-file detail.
  const byPackage = new Map();
  for (const row of tests) {
    const pkg = row.file.split("/")[1];
    byPackage.set(pkg, (byPackage.get(pkg) ?? 0) + 1);
  }
  const summary = [...byPackage.entries()]
    .sort()
    .map(([pkg, n]) => `${pkg} ${n}`)
    .join(" · ");
  console.log(`\n  generated tests — hand-authored coverage, by package: ${summary || "(none)"}`);
  console.log("");

  const ledger = loadLedger(LEDGER_PATH, ["file", "label"]);
  const { unledgered, stale } = diffLedger({ current: findings, ledger, idOf: regionId });
  const code = reportRatchet({
    label: "custom-region",
    current: findings,
    unledgered,
    stale,
    idOf: regionId,
  });
  if (code !== 0) process.exit(code);
}
