#!/usr/bin/env node
/**
 * Freshness-gate self-test — falsifies docs-claims-check.mjs's
 * verified_at_commit pass against fixture repositories.
 *
 * The gate under test is the REAL script, copied byte-for-byte into a
 * throwaway git fixture per scenario (the script derives REPO_ROOT from its
 * own location, so the copy gates the fixture). Each scenario builds the
 * minimal honest history — a doc stamped at some commit, a governed file
 * changed at another — and asserts the verdict, exit code, and the
 * no-auto-fix property. Runs as part of `pnpm run docs:check-claims`.
 *
 * Scenario map (both ratchet directions + the invariants):
 *   fresh-pass          governs unchanged since the stamp          -> exit 0
 *   stale-fail          governs changed after the stamp            -> exit 1, names doc + commit
 *   ledgered-pass       stale but ledgered at the exact stamp      -> exit 0
 *   ledger-mismatch     stale, ledgered at a DIFFERENT stamp       -> exit 1
 *   obsolete-entry      fresh doc still ledgered                   -> exit 1, "now fresh"
 *   dangling-entry      ledger names a doc that opted out          -> exit 1, "dangles"
 *   no-governs-match    governs globs match nothing tracked        -> exit 0 (skipped)
 *   unresolvable-stamp  stamp that resolves to no commit          -> exit 1, never ledgerable
 *   fix-never-restamps  --fix leaves the stamp byte-identical      -> exit 1, "not auto-fixable"
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_SRC = join(dirname(fileURLToPath(import.meta.url)), "docs-claims-check.mjs");
const SCRIPT_TEXT = readFileSync(SCRIPT_SRC, "utf8");
const FIXTURES = [];

function fixture(name) {
  const root = mkdtempSync(join(tmpdir(), `claims-freshness-${name}-`));
  FIXTURES.push(root);
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  mkdirSync(join(root, "packages/ds-contracts/components/Foo"), { recursive: true });
  writeFileSync(join(root, "scripts/docs-claims-check.mjs"), SCRIPT_TEXT);
  // One honest contract so the component-count marker derives 1 — the
  // marker pass must keep working in every fixture (exit 2 otherwise).
  writeFileSync(join(root, "packages/ds-contracts/components/Foo/Foo.contract.json"), "{}\n");
  return root;
}

function git(root, ...args) {
  return execFileSync(
    "git",
    ["-c", "user.email=self@test", "-c", "user.name=selftest", ...args],
    { cwd: root, encoding: "utf8" },
  ).trim();
}

function run(root, ...args) {
  try {
    const stdout = execFileSync("node", ["scripts/docs-claims-check.mjs", ...args], {
      cwd: root,
      encoding: "utf8",
    });
    return { code: 0, out: stdout };
  } catch (err) {
    return { code: err.status ?? -1, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

function docWith(verified, governs) {
  return [
    "---",
    `verified_at_commit: ${verified}`,
    "governs:",
    `  - ${governs}`,
    "---",
    "",
    "# Fixture doc",
    "",
    "<!-- component-count -->1 component contracts.",
    "",
  ].join("\n");
}

/** Commit the doc + a governed file at c1, then change the governed file at c2. */
function baseHistory(root, verifiedAtC2) {
  git(root, "init");
  writeFileSync(join(root, "docs/a.md"), docWith("placeholder", "packages/ds-contracts/**/*.contract.json"));
  git(root, "add", "-A");
  git(root, "commit", "-m", "c1: doc + governed file");
  const c1 = git(root, "rev-parse", "HEAD");
  writeFileSync(join(root, "packages/ds-contracts/components/Foo/Foo.contract.json"), '{ "bump": 1 }\n');
  git(root, "add", "-A");
  git(root, "commit", "-m", "c2: governed file changes");
  const c2 = git(root, "rev-parse", "HEAD");
  const stamp = verifiedAtC2 ? c2 : c1;
  writeFileSync(join(root, "docs/a.md"), docWith(stamp, "packages/ds-contracts/**/*.contract.json"));
  git(root, "add", "-A");
  git(root, "commit", "-m", "c3: stamp the doc");
  return { c1, c2, stamp };
}

function ledger(root, entries) {
  writeFileSync(join(root, "doc-freshness-baseline.json"), `${JSON.stringify(entries, null, 2)}\n`);
  git(root, "add", "-A");
  git(root, "commit", "-m", "ledger");
}

const scenarios = [
  {
    name: "fresh-pass",
    build(root) {
      baseHistory(root, true);
      return { code: 0, expect: "fresh" };
    },
  },
  {
    name: "stale-fail",
    build(root) {
      baseHistory(root, false);
      return { code: 1, expect: 'is stale' };
    },
  },
  {
    name: "ledgered-pass",
    build(root) {
      const { stamp } = baseHistory(root, false);
      ledger(root, { "docs/a.md": stamp });
      return { code: 0, expect: "fresh" };
    },
  },
  {
    name: "ledger-mismatch",
    build(root) {
      baseHistory(root, false);
      ledger(root, { "docs/a.md": "0000000000000000000000000000000000000000" });
      return { code: 1, expect: "ledgered at" };
    },
  },
  {
    name: "obsolete-entry",
    build(root) {
      const { stamp } = baseHistory(root, true);
      ledger(root, { "docs/a.md": stamp });
      return { code: 1, expect: "now fresh" };
    },
  },
  {
    name: "dangling-entry",
    build(root) {
      baseHistory(root, true);
      ledger(root, { "docs/gone.md": "0123456" });
      return { code: 1, expect: "dangles" };
    },
  },
  {
    name: "no-governs-match",
    build(root) {
      git(root, "init");
      writeFileSync(
        join(root, "docs/a.md"),
        docWith("4b825dc642cb6eb9a060e54bf8d69288fbee4904", "packages/nowhere/**/*.json"),
      );
      git(root, "add", "-A");
      git(root, "commit", "-m", "c1");
      return { code: 0, expect: "fresh" };
    },
  },
  {
    name: "unresolvable-stamp",
    build(root) {
      writeFileSync(join(root, "docs/a.md"), docWith("1234567", "packages/ds-contracts/**/*.contract.json"));
      git(root, "init");
      git(root, "add", "-A");
      git(root, "commit", "-m", "c1");
      return { code: 1, expect: "does not resolve" };
    },
  },
];

let failed = 0;
for (const { name, build } of scenarios) {
  const root = fixture(name);
  const expected = build(root);
  const got = run(root);
  const ok = got.code === expected.code && got.out.includes(expected.expect);
  if (ok) {
    console.log(`  ok  ${name}: exit ${got.code}, matched "${expected.expect}"`);
  } else {
    failed += 1;
    console.error(`  FAIL ${name}: expected exit ${expected.code} + "${expected.expect}", got exit ${got.code}`);
    console.error(`  output: ${got.out.trim().split("\n").slice(0, 4).join(" | ")}`);
  }
}

// fix-never-restamps: a stale stamp must survive --fix byte-identical.
{
  const root = fixture("fix-never-restamps");
  const { stamp } = baseHistory(root, false);
  const before = readFileSync(join(root, "docs/a.md"), "utf8");
  const got = run(root, "--fix");
  const after = readFileSync(join(root, "docs/a.md"), "utf8");
  const ok =
    got.code === 1 &&
    got.out.includes("not auto-fixable") &&
    readFileSync(join(root, "docs/a.md"), "utf8") === before &&
    after.includes(stamp);
  if (ok) {
    console.log("  ok  fix-never-restamps: --fix kept the stamp and still failed");
  } else {
    failed += 1;
    console.error(`  FAIL fix-never-restamps: exit ${got.code}, stamp ${after.includes(stamp) ? "kept" : "REWRITTEN"}`);
    console.error(`  output: ${got.out.trim().split("\n").slice(0, 4).join(" | ")}`);
  }
}

for (const root of FIXTURES) {
  try {
    rmSync(root, { recursive: true, force: true });
  } catch {
    // best-effort cleanup; mkdtemp dirs sit under os.tmpdir()
  }
}

const total = scenarios.length + 1;
if (failed > 0) {
  console.error(`freshness selftest: ${failed} of ${total} scenarios FAILED`);
  process.exit(1);
}
console.log(`freshness selftest: ${total} passed, 0 failed`);
