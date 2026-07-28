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
  // generated framework src trees — matches CI's six-tree drift diff exactly
  // (react-native was added to CI by 289058a4 but missing here; this closes
  // that latent gap the hook's own lockstep comment warns about).
  generated: /^packages\/ds-(react|vue|svelte|angular|lit|react-native)\//,
  // iconography has its own emission ledger gate (ledger-icons.mjs --check),
  // separate from the codegen rail's generated-tree drift diff.
  iconography: /^packages\/ds-iconography\//,
  // styling-realization ledgers (dead slots + pseudo-state gaps). Their inputs
  // are the contract corpus, the generated React CSS/TSX they classify against,
  // and the audits themselves — so a change to any of those can move a verdict.
  stylingAudits: /^(packages\/ds-(contracts|react)\/|scripts\/(dead-slot|pseudo-state)-audit\/|scripts\/lib\/ledger-ratchet)/,
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
  const iconography = full || has("iconography");
  const stylingAudits = full || has("stylingAudits");
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
    // iconography ledger gate: separate emission model from the codegen rail,
    // so it has its own flag rather than riding genGroup.
    RUN_ICONOGRAPHY: iconography,
    // styling-realization ledgers: the gate of record for the dead-slot and
    // pseudo-state ratchets (RAIL-STYLING-REALIZATION-LEDGERS-01). Its own flag
    // rather than genGroup — it classifies committed generated output, so it is
    // meaningful even when nothing regenerates.
    RUN_STYLING_AUDITS: stylingAudits,
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
