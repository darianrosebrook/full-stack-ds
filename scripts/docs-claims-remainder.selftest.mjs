#!/usr/bin/env node
/**
 * Remainder-claim self-test — falsifies docs-claims-check.mjs's
 * `target-component-remainder:<id>` family against fixture repositories.
 *
 * The gate under test is the REAL script, copied byte-for-byte into a
 * throwaway git fixture per scenario (the script derives REPO_ROOT from its
 * own location, so the copy gates the fixture).
 *
 * The claim exists because the admission-criteria doc kept stating how many
 * contracts a native target had left to admit as a hand count, and that count
 * was wrong in both directions across slices. It is now the complement of the
 * `target-component-count` marker over the same two authorities.
 *
 * Scenario map (both directions + the invariants):
 *   remainder-pass       corpus 3 − allowlist 2 = 1, doc states 1   -> exit 0
 *   remainder-drift      doc states 2 where 1 derives               -> exit 1, names the marker
 *   remainder-fixed      --fix rewrites 2 to the derived 1          -> exit 0, doc states 1
 *   no-allowlist-zero    a target with no allowlist admits the corpus -> exit 0 at 0
 *   unknown-target       an unregistered id derives nothing         -> exit 2
 *   typo-marker          an unknown marker name is never ignored    -> exit 2
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_SRC = join(dirname(fileURLToPath(import.meta.url)), "docs-claims-check.mjs");
const SCRIPT_TEXT = readFileSync(SCRIPT_SRC, "utf8");
const FIXTURES = [];

/** Three corpus contracts and a registry whose `alpha` allowlist admits two. */
function fixture(name, registry = { targets: [{ id: "alpha", components: ["Alpha", "Beta"] }] }) {
  const root = mkdtempSync(join(tmpdir(), `claims-remainder-${name}-`));
  FIXTURES.push(root);
  mkdirSync(join(root, "scripts"), { recursive: true });
  mkdirSync(join(root, "docs"), { recursive: true });
  writeFileSync(join(root, "scripts/docs-claims-check.mjs"), SCRIPT_TEXT);
  writeFileSync(join(root, "fsds.targets.json"), `${JSON.stringify(registry, null, 2)}\n`);
  for (const component of ["Alpha", "Beta", "Gamma"]) {
    const dir = join(root, "packages/ds-contracts/components", component);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${component}.contract.json`), "{}\n");
  }
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

function docPath(root) {
  return join(root, "docs/remaining.md");
}

function writeDoc(root, body) {
  writeFileSync(docPath(root), ["# Fixture doc", "", body, ""].join("\n"));
  git(root, "init");
  git(root, "add", "-A");
  git(root, "commit", "-m", "fixture");
}

const results = [];
function check(name, condition, detail) {
  results.push({ name, ok: Boolean(condition), detail });
}

{
  const root = fixture("pass");
  writeDoc(root, "<!-- target-component-remainder:alpha -->1 remaining.");
  const { code, out } = run(root);
  check(
    "remainder-pass",
    code === 0 && /match derived values/.test(out),
    `exit ${code}: ${out.trim().split("\n").pop()}`,
  );
}

{
  const root = fixture("drift");
  writeDoc(root, "<!-- target-component-remainder:alpha -->2 remaining.");
  const { code, out } = run(root);
  check(
    "remainder-drift",
    code === 1 && /target-component-remainder:alpha.*stated "2".*derived value is "1"/.test(out),
    `exit ${code}: ${out.trim().split("\n").pop()}`,
  );
  const fixed = run(root, "--fix");
  const after = readFileSync(docPath(root), "utf8");
  check(
    "remainder-fixed",
    fixed.code === 0 && after.includes("<!-- target-component-remainder:alpha -->1"),
    `exit ${fixed.code}, doc says ${after.match(/remainder:alpha -->(\d+)/)?.[1]}`,
  );
}

{
  // A target that declares no allowlist admits the whole corpus, so the
  // complement is zero rather than a negative count.
  const root = fixture("unbounded", { targets: [{ id: "alpha" }] });
  writeDoc(root, "<!-- target-component-remainder:alpha -->0 remaining.");
  const { code, out } = run(root);
  check("no-allowlist-zero", code === 0, `exit ${code}: ${out.trim().split("\n").pop()}`);
}

{
  const root = fixture("unknown");
  writeDoc(root, "<!-- target-component-remainder:beta -->1 remaining.");
  const { code, out } = run(root);
  check(
    "unknown-target",
    code === 2 && /target "beta" is not registered/.test(out),
    `exit ${code}: ${out.trim().split("\n").pop()}`,
  );
}

{
  // The nearest plausible typo must fail loudly rather than sit unchecked.
  const root = fixture("typo");
  writeDoc(root, "<!-- target-component-remainders:alpha -->1 remaining.");
  const { code, out } = run(root);
  check(
    "typo-marker",
    code === 2 && /unknown claim marker "target-component-remainders:alpha"/.test(out),
    `exit ${code}: ${out.trim().split("\n").pop()}`,
  );
}

for (const root of FIXTURES) rmSync(root, { recursive: true, force: true });

let failed = 0;
for (const { name, ok, detail } of results) {
  if (ok) {
    console.log(`  ok  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${name} — ${detail}`);
  }
}
console.log(`remainder selftest: ${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
