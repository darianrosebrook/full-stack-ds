#!/usr/bin/env node
/**
 * PREPUSH-SCOPED-GATE-01 — pure changed-files -> step-group classifier for the
 * pre-push gate (.githooks/pre-push).
 *
 * Reads newline-separated changed paths on stdin (or `--full`) and prints
 * shell-evalable RUN_* flags the hook `eval`s. CI (.github/workflows/ci.yml)
 * stays the AUTHORITATIVE full gate; this only scopes the LOCAL pre-flight so a
 * docs/scripts-only push doesn't pay for regenerating every framework.
 *
 * Conservative: `--full` (indeterminate range / PREPUSH_FULL=1) sets every flag
 * true, and any input whose path matches a group activates that group — the
 * classifier never skips a group whose input is present.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const PATTERNS = {
  tokens: /^packages\/ds-tokens\//,
  codegen: /^packages\/ds-(contracts|codegen)\//,
  generated: /^packages\/ds-(react|vue|svelte|angular|lit)\//,
  // eslint runs over the whole repo, so ANY lintable file (incl. scripts/*.mjs)
  lintable: /\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte)$/,
  // tsc / vue-tsc only cover the packages|src trees — loose scripts/*.mjs aren't
  // typechecked, so a scripts-only change must NOT trigger typecheck.
  typed: /^(packages|src)\/.*\.(ts|tsx|vue|svelte)$/,
  // vitest only discovers tests under packages|src
  testable: /^(packages|src)\/.*\.(ts|tsx|js|jsx|mjs|vue|svelte)$/,
  docs: /\.(md|mdx)$/,
};

export function classify(files, opts = {}) {
  const full = !!opts.full;
  const has = (key) => files.some((f) => PATTERNS[key].test(f));
  const tokens = full || has("tokens");
  const codegen = full || has("codegen");
  const generated = full || has("generated");
  const lintable = full || has("lintable");
  const typed = full || has("typed");
  const testable = full || has("testable");
  const docs = full || has("docs");

  // generate:check + governed:rail run when a contract/codegen/token/generated
  // input could change emitted output or the resolvesTo graph.
  const genGroup = tokens || codegen || generated;

  const flags = {
    // shared prerequisite: build tokens once for BOTH generate:check and the gates
    RUN_TOKEN_BUILD: genGroup,
    RUN_TOKEN_GATES: tokens,
    RUN_GENERATE_CHECK: genGroup,
    RUN_DOCS_CLAIMS: codegen || docs,
    RUN_LINT: lintable,
    RUN_TYPECHECK: typed,
    // a contract/codegen JSON change (no .ts) still exercises codegen tests
    RUN_TESTS: testable || codegen || generated,
    RUN_RAIL: genGroup,
  };
  const active = Object.entries(flags)
    .filter(([, v]) => v)
    .map(([k]) => k.replace("RUN_", ""));
  const reason = full
    ? "FULL gate (indeterminate range or PREPUSH_FULL=1)"
    : files.length === 0
      ? "no file changes in range — skipping all"
      : `scoped to: ${active.join(", ") || "nothing (no gate-relevant inputs)"}`;
  return { ...flags, REASON: reason };
}

function main() {
  const argv = process.argv.slice(2);
  const full = argv.includes("--full");
  let files = [];
  if (!full) {
    let input = "";
    try {
      input = readFileSync(0, "utf8");
    } catch {
      input = "";
    }
    files = input.split("\n").map((s) => s.trim()).filter(Boolean);
  }
  const r = classify(files, { full });
  const lines = Object.entries(r).map(([k, v]) =>
    typeof v === "boolean" ? `${k}=${v}` : `${k}=${JSON.stringify(String(v))}`,
  );
  process.stdout.write(lines.join("\n") + "\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
