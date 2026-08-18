#!/usr/bin/env node
/**
 * Token-consumption rail (RAIL-TOKEN-CONSUMPTION-AUDIT-01).
 *
 * THE QUESTION THIS ASKS. The token-resolvability rail (this family's sibling)
 * dropped a signal on purpose and recorded the loss as a non-claim: "a token
 * that loses its last consumer is no longer detected by any blocking gate."
 * This rail restores that direction — without repeating the mistake that got
 * it dropped the first time.
 *
 * The mistake: the original usage gate asked "is every declared token
 * referenced?" — and fired on vocabulary. Per
 * docs/architecture/tokens-architecture.md, the base and semantic scopes are
 * vocabulary layers that exist to be drawn from; a ramp shipped ahead of its
 * consumer is unreferenced by design, so reference-COUNT gating makes a stated
 * purpose of the layer fail the build.
 *
 * The health question that survives that doctrine is NAMESPACE-level death: a
 * semantic subtree of which EVERY token is unconsumed. Individual dead leaves
 * inside a live namespace are vocabulary drift (the count-floor ratchet in
 * `tokens:check-usage:gate` already fails on growth); a whole dead concept —
 * like the stale pre-repair `semantic.color.syntax.*` duplicate that survived
 * a repair slice because a count floor cannot say WHICH item regressed and one
 * sanctioned re-baseline absorbs all drift — is an orphan, and it now fails
 * unless ledgered with an owning spec.
 *
 * GRANULARITY (minTokens = 2). Single-token subtrees are deliberately below
 * the finding threshold: a lone dead leaf is exactly the vocabulary shape the
 * doctrine protects, and it stays the count floor's jurisdiction. This rail
 * owns concept-level death. The layering is recorded, not implied: neither
 * ratchet subsumes the other.
 *
 * DERIVATION DISCIPLINE. Consumption comes from the SAME authority the usage
 * baseline uses — `analyzeTokenUsage` in the tokens package, spawned via the
 * pure-JSON `usage-scan.ts` runner (var(--fsds-*) reads, DTCG brace refs in
 * .tokens.json, designTokens['path'] lookups, scanned repo-wide). This script
 * never re-implements scanning: two divergent copies of a consumption
 * definition is how a gate stops meaning the same thing as the baseline it
 * complements. The path set comes from that same scan (it enumerates every
 * token in the composed graph), so the audit cannot disagree with itself about
 * which tokens exist.
 *
 * NON-CLAIMS. (1) The consumption definition is textual reference scanning,
 * not semantic understanding — a var() read from a dead namespace's own
 * $value alias chain credits the TARGET, never the source, so alias-heavy
 * namespaces are not self-consuming. (2) Core-layer tokens are never findings
 * (vocabulary-by-doctrine). (3) Single-token orphans are invisible here by the
 * threshold above. (4) This rail cannot see intent: a ledgered dead namespace
 * is an explicitly-owned decision, not a verified plan.
 *
 * READ-ONLY over the graph. Writes only its own report under
 * docs/token-consumption-audit/. The ledger (known-dead-namespaces.json) was
 * machine-seeded once at introduction and ships with no re-seed command:
 * post-introduction entries are hand-authored with owning spec + note, and the
 * two-directional ratchet (unledgered = fail, stale = fail) makes the ledger
 * shrink-only.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { diffLedger, loadLedger, reportRatchet } from "../lib/ledger-ratchet.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../..");
const OUT_DIR = resolve(REPO, "docs/token-consumption-audit");
const LEDGER_PATH = resolve(HERE, "known-dead-namespaces.json");

/** Findings live in the semantic layer; core is vocabulary-by-doctrine. */
export const LAYER_PREFIX = "semantic.";
/** Concept-level threshold: lone dead leaves are the count floor's jurisdiction. */
export const MIN_TOKENS = 2;

/**
 * Maximal fully-dead subtrees of a layer.
 *
 * A subtree rooted at node N is dead when every token at or under N is unused.
 * N reports only when it is MAXIMAL — its parent is not also dead — so a deep
 * orphan collapses to its highest dead ancestor instead of spamming one
 * finding per internal node. Pure; the selfcheck drives it with fixtures.
 */
export function deadSubtrees({ paths, usedPaths, layerPrefix = LAYER_PREFIX, minTokens = MIN_TOKENS }) {
  const used = new Set(usedPaths);
  const layer = paths.filter((p) => p === layerPrefix || p.startsWith(layerPrefix));

  // Group tokens by their candidate subtree roots: every dotted prefix of a
  // path inside the layer, including the layer root itself (an entirely dead
  // layer reports as one root finding, not thousands).
  const membersOf = new Map();
  for (const p of layer) {
    const segments = p.split(".");
    for (let depth = 1; depth <= segments.length; depth += 1) {
      const node = segments.slice(0, depth).join(".");
      if (!membersOf.has(node)) membersOf.set(node, []);
      membersOf.get(node).push(p);
    }
  }

  const isDead = (node) => membersOf.get(node).every((p) => !used.has(p));

  const findings = [];
  for (const node of membersOf.keys()) {
    const members = membersOf.get(node);
    if (members.length < minTokens) continue;
    if (!isDead(node)) continue;
    const parent = node.includes(".") ? node.slice(0, node.lastIndexOf(".")) : null;
    if (parent && membersOf.has(parent) && isDead(parent)) continue;
    findings.push({
      namespace: node,
      tokenCount: members.length,
      tokens: [...members].sort(),
    });
  }
  findings.sort((a, b) => a.namespace.localeCompare(b.namespace));
  return findings;
}

export function findingId(row) {
  return row.namespace;
}

/** Spawn the tokens package's scanner; the sole consumption authority. */
export function scanConsumption() {
  const result = spawnSync(
    "pnpm",
    ["--filter", "@full-stack-ds/tokens", "exec", "tsx", "build/runners/usage-scan.ts"],
    { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0 || !result.stdout) {
    throw new Error(
      `usage-scan failed (status ${result.status}).\n${result.stderr}\n` +
        "The scan reads the composed token graph — run `pnpm -F @full-stack-ds/tokens build` first.",
    );
  }
  let rows;
  try {
    rows = JSON.parse(result.stdout);
  } catch {
    throw new Error("usage-scan printed unparseable output — refusing to guess at consumption.");
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(
      "usage-scan returned zero tokens — the composed graph is missing.\n" +
        "Run `pnpm -F @full-stack-ds/tokens build` before this audit.",
    );
  }
  return rows;
}

export function runAudit() {
  const rows = scanConsumption();
  const paths = rows.map((r) => r.tokenPath);
  const usedPaths = rows.filter((r) => r.usageCount > 0).map((r) => r.tokenPath);
  const findings = deadSubtrees({ paths, usedPaths });
  return { findings, totalTokens: rows.length, usedCount: usedPaths.length };
}

const RUN_DIRECTLY =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (RUN_DIRECTLY) {
  const { findings, totalTokens, usedCount } = runAudit();

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    resolve(OUT_DIR, "consumption-matrix.json"),
    JSON.stringify(
      {
        spec: "RAIL-TOKEN-CONSUMPTION-AUDIT-01",
        scannedTokens: totalTokens,
        consumedTokens: usedCount,
        deadSemanticNamespaces: findings.length,
        deadTokensInFindings: findings.reduce((n, f) => n + f.tokenCount, 0),
        findings,
      },
      null,
      2,
    ) + "\n",
  );

  const md = [
    "# Dead semantic token namespace matrix",
    "",
    "`RAIL-TOKEN-CONSUMPTION-AUDIT-01` — the consumption-direction ratchet the token-resolvability rail recorded as a dropped signal. Findings are maximal fully-dead semantic subtrees with at least 2 tokens: concept-level orphans, not vocabulary drift. Core is excluded by doctrine; single dead leaves stay the count floor's jurisdiction.",
    "",
    `Scanned: **${totalTokens}** tokens · consumed: **${usedCount}** · dead namespaces: **${findings.length}** holding **${findings.reduce((n, f) => n + f.tokenCount, 0)}** tokens`,
    "",
    "| namespace | dead tokens |",
    "|---|---|",
  ];
  for (const f of findings) md.push(`| \`${f.namespace}\` | ${f.tokenCount} |`);
  writeFileSync(resolve(OUT_DIR, "consumption-matrix.md"), md.join("\n") + "\n");

  const ledger = loadLedger(LEDGER_PATH, ["namespace"]);
  const { unledgered, stale } = diffLedger({ current: findings, ledger, idOf: findingId });
  const code = reportRatchet({
    label: "token-consumption",
    current: findings,
    unledgered,
    stale,
    idOf: findingId,
  });
  console.log(`\nReport: ${resolve(OUT_DIR, "consumption-matrix.md")}`);
  if (code !== 0) process.exit(code);
}
