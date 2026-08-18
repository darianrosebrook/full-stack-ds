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
  stylingAudits: /^(packages\/ds-(contracts|react)\/|scripts\/(dead-slot|pseudo-state|state-suppression)-audit\/|scripts\/lib\/ledger-ratchet)/,
  // token-reference resolvability. Its verdict is a diff between two name
  // spaces, so BOTH sides are inputs: the generated React CSS that reads a
  // --fsds-* name, and the ds-tokens source that decides which names the graph
  // declares. Renaming a token is exactly how a previously-resolving reference
  // goes dangling, so ds-tokens must be in this group even though the finding
  // surfaces in ds-react.
  resolvability:
    /^(packages\/ds-(react|tokens)\/|scripts\/token-resolvability-audit\/|scripts\/lib\/ledger-ratchet)/,
  // token-consumption rail (RAIL-TOKEN-CONSUMPTION-AUDIT-01): namespace-level
  // dead-weight ledger over the semantic layer. The scanner counts var()/
  // DTCG/designTokens references repo-wide, so EVERY generated tree is a
  // consumption input alongside the graph itself; contract sidecars are
  // scanned too (.tokens.json brace refs). Wired in lockstep with ci.yml.
  tokenConsumption:
    /^(packages\/ds-(contracts|react|vue|svelte|angular|lit|react-native|tokens)\/|scripts\/token-consumption-audit\/|scripts\/lib\/ledger-ratchet)/,
  // native token realization (FEAT-TOKEN-REALIZATION-AUDIT-001). Inputs are
  // BOTH sides of the scoreboard: the contract sidecars that declare slots,
  // the three native carrier trees that realize them, the target allowlists
  // in fsds.targets.json (admission is a verdict input), and the audit's own
  // scripts. Wired in lockstep with ci.yml like its siblings.
  tokenRealization:
    /^(packages\/ds-(contracts|react-native|swiftui|jetpack-compose)\/|fsds\.targets\.json$|scripts\/token-realization-audit\/|scripts\/lib\/ledger-ratchet)/,
  // behavior-realization rail (RAIL-BEHAVIOR-REALIZATION-AUDIT-01). Derives
  // interactivity obligations from the LIVE contract corpus and asserts them in
  // the five WEB generated trees (the audit's FRAMEWORKS list excludes
  // react-native — so a react-native-only change must NOT fire this group). It
  // imports the compiled codegen IR, so contracts, codegen, and the classified
  // trees are inputs, alongside the audit's own scripts. Wired in lockstep with
  // ci.yml by PREPUSH-LOCKSTEP-01 — previously only CI ran this audit.
  behaviorAudit:
    /^(packages\/ds-(contracts|codegen|react|vue|svelte|angular|lit)\/|scripts\/behavior-realization-audit\/)/,
  // a11y-realization rail (RAIL-A11Y-REALIZATION-01). Same shape, but the
  // family surface is iterated from the AdmissionDescriptor registry — all SIX
  // admitted families INCLUDING react-native — and the known-gaps ledger lives
  // in the audit's own directory, so an entry added or removed there moves a
  // verdict too. Tokens move neither interactivity nor ARIA bytes, so
  // ds-tokens is deliberately NOT an input (styling-audit precedent).
  a11yAudit:
    /^(packages\/ds-(contracts|codegen|react|vue|svelte|angular|lit|react-native)\/|scripts\/a11y-realization-audit\/)/,
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
  const resolvability = full || has("resolvability");
  const tokenConsumption = full || has("tokenConsumption");
  const tokenRealization = full || has("tokenRealization");
  const behaviorAudit = full || has("behaviorAudit");
  const a11yAudit = full || has("a11yAudit");
  const lintable = full || has("lintable");
  const typed = full || has("typed");
  const testable = full || has("testable");
  const docs = full || has("docs");

  // generate:check + governed:rail run when a contract/codegen/token/generated
  // input could change emitted output or the resolvesTo graph.
  const genGroup = tokens || codegen || generated;

  const flags = {
    // shared prerequisite: build tokens once for BOTH generate:check and the gates
    // `|| resolvability || tokenConsumption`: both token-direction audits read
    // the composed graph, so they are only meaningful once it is built.
    RUN_TOKEN_BUILD: genGroup || resolvability || tokenConsumption,
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
    // realization audits wired in lockstep with ci.yml (PREPUSH-LOCKSTEP-01).
    // Own flags rather than genGroup: each fires on that audit's EXACT input
    // surface — behavior classifies five web trees, a11y all six admitted
    // families — and a tokens-only change moves neither verdict.
    RUN_BEHAVIOR_AUDIT: behaviorAudit,
    RUN_A11Y_AUDIT: a11yAudit,
    // styling-realization ledgers: the gate of record for the dead-slot and
    // pseudo-state ratchets (RAIL-STYLING-REALIZATION-LEDGERS-01). Its own flag
    // rather than genGroup — it classifies committed generated output, so it is
    // meaningful even when nothing regenerates.
    RUN_STYLING_AUDITS: stylingAudits,
    // token-reference resolvability (RAIL-TOKEN-REFERENCE-RESOLVABILITY-01):
    // the blocking token gate, replacing the count-based usage gate. Its own
    // flag rather than riding `tokens`, because a change to EITHER side of the
    // name diff can move the verdict.
    RUN_TOKEN_RESOLVABILITY: resolvability,
    // dead semantic namespace ledger (RAIL-TOKEN-CONSUMPTION-AUDIT-01): the
    // consumption-direction sibling of resolvability — restores the
    // lost-consumer signal at namespace granularity under the stricter
    // per-token ledger ratchet instead of the absorb-everything count floor.
    RUN_TOKEN_CONSUMPTION: tokenConsumption,
    // native carrier parity scoreboard (FEAT-TOKEN-REALIZATION-AUDIT-001):
    // own flag for the same reason as resolvability — a change to either
    // side (sidecar slots or carrier emission or allowlist) moves the verdict.
    RUN_TOKEN_REALIZATION: tokenRealization,
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
