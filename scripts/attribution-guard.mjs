#!/usr/bin/env node
/**
 * Attribution guard — refuse AI-agent attribution at the moment it would be
 * created, rather than paying to remove it afterwards.
 *
 * WHY THIS EXISTS
 * GitHub derives a repository's "Contributors" list from commit authors *and*
 * from `Co-authored-by:` trailers whose email address maps to a GitHub
 * account. One agent-written trailer is therefore enough to publish an AI
 * account as a permanent contributor: GitHub exposes no UI to remove one, and
 * clearing it afterwards requires rewriting every descendant commit. Measured
 * on this repo on 2026-09-23 — removing the three `Qwen-Coder` trailers already
 * in `main` would re-SHA 3,826 of 5,702 commits, across 14 branches.
 *
 * TWO INDEPENDENT RULES
 *   1. `Co-authored-by` is DEFAULT-DENY. The trailer is the only mechanism that
 *      has ever attributed a non-human account here, so any trailer whose email
 *      is not explicitly allowlisted is refused. This is the rule that survives
 *      a vendor rotating its agent's address: it does not need to know the new
 *      address to reject it. The allowlist is empty by design — this is a
 *      single-author repository, and admitting a co-author is a deliberate,
 *      reviewable act.
 *   2. Author/committer identities are deny-listed by email and domain. This is
 *      the rule that would have caught the seven commits authored *and*
 *      committed as `Claude <noreply@anthropic.com>` which had to be
 *      `git filter-repo`'d out of history on 2026-05-25 — a cost the trailer
 *      rule alone cannot see.
 *
 * SCOPE IS A REVISION RANGE, NEVER FULL HISTORY
 * Three grandfathered `Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>`
 * trailers remain in `main`'s history (2026-08-15: fde10305, 204e86de,
 * 54cf2680) and cannot be removed without that 3,826-commit rewrite. A
 * full-history scan would red *every* push until someone performs it — this
 * guard must not force that decision, so it never scans more than the range it
 * is handed. A range is exactly what a push adds: the only surface that can
 * still be corrected for free.
 *
 * USAGE
 *   node scripts/attribution-guard.mjs --message-file <path>   # commit-msg hook
 *   node scripts/attribution-guard.mjs --range 'A..B'          # pre-push / CI
 *   node scripts/attribution-guard.mjs --range 'HEAD^!'        # one commit
 *
 * The commit-msg path also checks the author/committer identities git is about
 * to record (`git var GIT_AUTHOR_IDENT` / `GIT_COMMITTER_IDENT`); pass
 * `--no-identity` to scan the message alone.
 *
 * EXIT: 0 clean, 1 violation(s) — fail closed, including on an unreadable
 * range; 2 usage error.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/**
 * Co-author emails this repo permits. Empty by design: admitting a co-author
 * means editing this list, which makes a new non-human contributor a reviewed
 * act rather than an accident of which CLI wrote the commit.
 */
export const ALLOWED_COAUTHOR_EMAILS = [];

/** Author/committer identities refused outright (exact address, lowercased). */
export const BLOCKED_IDENTITY_EMAILS = [
  // Anthropic Claude Code — the identity that authored 7 commits here before
  // the 2026-05-25 filter-repo run.
  "noreply@anthropic.com",
  // Alibaba Qwen Code — the `Co-authored-by` identity still in history.
  "qwen-coder@alibabacloud.com",
  // OpenAI Codex.
  "noreply@openai.com",
];

/**
 * Author/committer domains refused outright. A domain rule catches the
 * address-rotation case without a code change; the vendor may move from
 * `noreply@` to `agent@` but rarely leaves its own domain.
 */
export const BLOCKED_IDENTITY_DOMAINS = [
  "anthropic.com",
  "alibabacloud.com",
  "openai.com",
  "moonshot.cn",
  "kimi.com",
  "cursor.com",
];

/** Additional co-author-only addresses (a human may legitimately use these
 * domains, but an agent trailer naming one is still refused). */
export const BLOCKED_COAUTHOR_EMAILS = [
  "copilot@github.com",
  "devin-ai-integration[bot]@users.noreply.github.com",
];

/**
 * Agent display names. These never trigger a refusal on their own — the
 * default-deny rule already covers every co-author trailer, and matching a bare
 * human name would risk a false positive. They exist so the failure message can
 * say *which* agent was detected instead of a generic policy complaint.
 */
export const KNOWN_AGENT_NAMES = [
  "claude",
  "qwen-coder",
  "qwen coder",
  "codex",
  "kimi",
  "github copilot",
  "copilot",
  "cursor agent",
  "devin",
  "devin ai",
];

const COAUTHOR_RE = /^[ \t]*co-authored-by[ \t]*:[ \t]*(.*?)[ \t]*<([^>]+)>[ \t]*$/i;
const IDENT_RE = /^(.*?)\s*<([^>]+)>/;

/** Everything after the last `@`, lowercased. `""` when there is no `@`. */
export function emailDomain(email) {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).toLowerCase();
}

/** Reason a co-author trailer is refused, or `null` when it is admitted. */
export function classifyCoauthor(email, name, allowed = ALLOWED_COAUTHOR_EMAILS) {
  const address = email.trim().toLowerCase();
  const label = name.trim();

  if (allowed.some((entry) => entry.toLowerCase() === address)) return null;

  const domain = emailDomain(address);
  const known =
    BLOCKED_COAUTHOR_EMAILS.includes(address) ||
    BLOCKED_IDENTITY_EMAILS.includes(address) ||
    BLOCKED_IDENTITY_DOMAINS.includes(domain) ||
    KNOWN_AGENT_NAMES.includes(label.toLowerCase());
  if (known) {
    return `known AI agent identity (${label} <${address}>)`;
  }

  return (
    `co-author trailers are not admitted by this repository's policy ` +
    `(${label} <${address}>) — add the address to ALLOWED_COAUTHOR_EMAILS in ` +
    `scripts/attribution-guard.mjs if this is a human collaborator`
  );
}

/**
 * Pure scan of one commit message. Returns one violation per offending
 * `Co-authored-by` line, carrying the 1-based line number so the report can
 * point at the exact text to delete.
 */
export function scanMessage(message, allowed = ALLOWED_COAUTHOR_EMAILS) {
  const violations = [];
  const lines = String(message).split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const match = COAUTHOR_RE.exec(lines[i]);
    if (!match) continue;
    const reason = classifyCoauthor(match[2], match[1], allowed);
    if (reason === null) continue;
    violations.push({
      kind: "co-author",
      line: i + 1,
      raw: lines[i].trim(),
      name: match[1].trim(),
      email: match[2].trim().toLowerCase(),
      reason,
    });
  }
  return violations;
}

/** Reason an author/committer identity is refused, or `null` when admitted. */
export function classifyIdentity(ident) {
  const match = IDENT_RE.exec(String(ident).trim());
  if (!match) return null;
  const name = match[1].trim();
  const address = match[2].trim().toLowerCase();
  const domain = emailDomain(address);
  if (
    BLOCKED_IDENTITY_EMAILS.includes(address) ||
    BLOCKED_IDENTITY_DOMAINS.includes(domain)
  ) {
    return `AI agent commit identity (${name} <${address}>)`;
  }
  return null;
}

/** Scan an `{ author, committer }` pair of raw `git var ..._IDENT` strings. */
export function scanIdentities(idents) {
  const violations = [];
  for (const [kind, raw] of Object.entries(idents)) {
    if (!raw) continue;
    const reason = classifyIdentity(raw);
    if (reason === null) continue;
    violations.push({ kind, raw: String(raw).trim(), reason });
  }
  return violations;
}

// ---------------------------------------------------------------------------
// git plumbing
// ---------------------------------------------------------------------------

const NUL = "\u0000";
const RECORD = "\u001e";

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

/**
 * Read every commit in a revspec range. `%B` is the raw body — the trailer must
 * be parsed from the same bytes git will record, not from a summary that could
 * normalise it away.
 */
export function readRange(range) {
  const format = ["%H", "%an", "%ae", "%cn", "%ce", "%B"].join("%x00") + "%x1e";
  const out = git(["log", `--format=${format}`, range]);
  return out
    .split(RECORD)
    .map((record) => record.replace(/^\n/, ""))
    .filter((record) => record.trim() !== "")
    .map((record) => {
      const [sha, an, ae, cn, ce, ...rest] = record.split(NUL);
      return {
        sha: (sha ?? "").trim(),
        subject: (rest.join(NUL).split("\n")[0] ?? "").trim(),
        message: rest.join(NUL),
        author: `${an} <${ae}>`,
        committer: `${cn} <${ce}>`,
      };
    });
}

// ---------------------------------------------------------------------------
// reporting
// ---------------------------------------------------------------------------

const FIX_HINT = [
  "What to do:",
  "  • Drop the `Co-authored-by:` line from the commit message and re-commit.",
  "  • If an agent CLI added it automatically, turn that off in the CLI's config",
  "    — the trailer is the whole mechanism; nothing else attributes an account.",
  "  • A human co-author needs their address added to ALLOWED_COAUTHOR_EMAILS in",
  "    scripts/attribution-guard.mjs (a reviewed edit, not an env override).",
  "",
  "Why: GitHub publishes every `Co-authored-by:` trailer as a repository",
  "contributor, and removing one afterwards means rewriting every descendant",
  "commit — 3,826 of main's 5,702 commits, as measured on 2026-09-23.",
].join("\n");

/**
 * `--range` takes a raw git revspec, so `--range HEAD` walks all of HEAD's
 * ancestry rather than just the tip. On a range wider than a push that surfaces
 * violations which are already published and cannot be removed without
 * rewriting history — reporting them is honest, but silently letting the reader
 * assume they are actionable would not be.
 */
const RANGE_NOTE = [
  "Note: this range may reach further back than the commits you are about to",
  "push. Three grandfathered `Qwen-Coder` trailers from 2026-08-15 are already",
  "in main and cannot be removed without rewriting history — narrow the range to",
  "what the push actually adds (`--range '<base>..<tip>'`, or `<tip>^!`).",
].join("\n");

function reportCommitViolations(commits, { rangeNote = false } = {}) {
  const lines = ["", "[attribution-guard] REFUSED — AI-agent attribution detected", ""];
  for (const { commit, violations } of commits) {
    // `sha` is a real object name on the range path and a prose placeholder on
    // the commit-msg path, which has no commit object to name yet.
    const label = /^[0-9a-f]{7,40}$/i.test(commit.sha) ? commit.sha.slice(0, 9) : commit.sha;
    lines.push(`  commit ${label}  ${commit.subject}`);
    for (const v of violations) {
      if (v.kind === "co-author") {
        lines.push(`    line ${v.line}: ${v.raw}`);
        lines.push(`      → ${v.reason}`);
      } else {
        lines.push(`    ${v.kind}: ${v.raw}`);
        lines.push(`      → ${v.reason}`);
      }
    }
    lines.push("");
  }
  lines.push(FIX_HINT);
  if (rangeNote) lines.push("", RANGE_NOTE);
  lines.push("");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function usage(message) {
  if (message) process.stderr.write(`[attribution-guard] ${message}\n`);
  process.stderr.write(
    "usage: attribution-guard.mjs --message-file <path> [--no-identity]\n" +
      "       attribution-guard.mjs --range <revspec>\n",
  );
  return 2;
}

export function run(argv = process.argv.slice(2)) {
  let messageFile = "";
  let range = "";
  let withIdentity = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--message-file") messageFile = argv[++i] ?? "";
    else if (arg === "--range") range = argv[++i] ?? "";
    else if (arg === "--no-identity") withIdentity = false;
    else if (arg === "--help" || arg === "-h") return usage();
    else return usage(`unknown argument: ${arg}`);
  }

  if (!messageFile && !range) return usage("one of --message-file or --range is required");
  if (messageFile && range) return usage("--message-file and --range are mutually exclusive");

  const offenders = [];

  if (messageFile) {
    let message;
    try {
      message = readFileSync(messageFile, "utf8");
    } catch (error) {
      process.stderr.write(`[attribution-guard] cannot read ${messageFile}: ${error.message}\n`);
      // Fail closed: an unreadable message file means the guard did not run.
      return 1;
    }
    const violations = scanMessage(message);
    if (withIdentity) {
      let idents = {};
      try {
        idents = {
          author: git(["var", "GIT_AUTHOR_IDENT"]),
          committer: git(["var", "GIT_COMMITTER_IDENT"]),
        };
      } catch {
        idents = {};
      }
      violations.push(...scanIdentities(idents));
    }
    if (violations.length > 0) {
      const firstLine = message.split(/\r?\n/)[0]?.trim() ?? "";
      offenders.push({ commit: { sha: "(staged)", subject: firstLine }, violations });
    }

    if (offenders.length > 0) {
      process.stderr.write(reportCommitViolations(offenders));
      return 1;
    }
    return 0;
  }

  let commits;
  try {
    commits = readRange(range);
  } catch (error) {
    process.stderr.write(
      `[attribution-guard] cannot read range '${range}': ${error.message}\n` +
        "  Failing closed — an unreadable range means attribution was not checked.\n",
    );
    return 1;
  }

  for (const commit of commits) {
    const violations = [
      ...scanMessage(commit.message),
      ...scanIdentities({ author: commit.author, committer: commit.committer }),
    ];
    if (violations.length > 0) offenders.push({ commit, violations });
  }

  // A range that resolves to nothing is a real answer only when git says so;
  // an empty result from a typo'd revspec is already an error above.
  if (offenders.length > 0) {
    process.stderr.write(reportCommitViolations(offenders, { rangeNote: true }));
    return 1;
  }

  const scanned = commits.length;
  process.stdout.write(
    `[attribution-guard] clean — ${scanned} commit${scanned === 1 ? "" : "s"} checked in '${range}' (${withIdentity ? "messages + identities" : "messages only"})\n`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(run());
}
