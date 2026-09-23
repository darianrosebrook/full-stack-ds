#!/usr/bin/env node
/**
 * Tests for the attribution guard.
 *
 * The pure-function cases pin the matching rules. The integration cases are the
 * ones that actually matter: they run `git commit` in a throwaway repository
 * with `core.hooksPath` pointed at this repo's real `.githooks`, so a green run
 * is evidence that the *hook* refuses the commit — not merely that a regex
 * matches. If the hook were unwired, non-executable, or silent, the
 * "refuses" cases would fail because the commit would succeed.
 *
 * Run: node --test scripts/attribution-guard.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  classifyCoauthor,
  classifyIdentity,
  emailDomain,
  scanIdentities,
  scanMessage,
} from "./attribution-guard.mjs";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const GUARD = join(REPO_ROOT, "scripts", "attribution-guard.mjs");
const HOOKS = join(REPO_ROOT, ".githooks");

const clean = "darianrosebrook <hello@darianrosebrook.com>";

// ---------------------------------------------------------------------------
// pure matching rules
// ---------------------------------------------------------------------------

test("emailDomain splits on the last @", () => {
  assert.equal(emailDomain("noreply@anthropic.com"), "anthropic.com");
  assert.equal(emailDomain("a@b@c.example"), "c.example");
  assert.equal(emailDomain("no-at-sign"), "");
});

test("a known agent co-author trailer is refused and named", () => {
  const violations = scanMessage(
    "feat(x): thing\n\nCo-authored-by: Claude <noreply@anthropic.com>\n",
  );
  assert.equal(violations.length, 1);
  assert.equal(violations[0].kind, "co-author");
  assert.equal(violations[0].line, 3);
  assert.match(violations[0].reason, /known AI agent identity/);
  assert.match(violations[0].reason, /noreply@anthropic\.com/);
});

test("an unknown address is STILL refused — default-deny survives address rotation", () => {
  const violations = scanMessage(
    "feat(x): thing\n\nCo-authored-by: Some Agent <agent@brand-new-vendor.example>\n",
  );
  assert.equal(violations.length, 1);
  assert.match(violations[0].reason, /not admitted by this repository's policy/);
});

test("a known agent name is flagged even when the address is unfamiliar", () => {
  const reason = classifyCoauthor("rotated@unknown.example", "Qwen-Coder");
  assert.match(reason, /known AI agent identity/);
});

test("an allowlisted co-author is admitted", () => {
  const allowed = ["human@example.com"];
  assert.equal(classifyCoauthor("human@example.com", "A Human", allowed), null);
  assert.deepEqual(
    scanMessage("feat: x\n\nCo-authored-by: A Human <human@example.com>\n", allowed),
    [],
  );
});

test("trailer parsing is line-anchored and case-insensitive", () => {
  assert.equal(scanMessage("Co-authored-by: Claude <noreply@anthropic.com>").length, 1);
  assert.equal(scanMessage("CO-AUTHORED-BY: Claude <noreply@anthropic.com>").length, 1);
  // Prose mentioning the trailer mid-line must not trip the guard.
  assert.deepEqual(scanMessage("docs: explain that Co-authored-by: lines are refused"), []);
});

test("the guard does not false-positive on this repo's own Claude-Session trailer", () => {
  // 48 commits in this repo carry it; GitHub ignores it, and it names no
  // account. If this ever starts failing, the guard has become over-broad.
  assert.deepEqual(
    scanMessage(
      "feat(x): thing\n\nClaude-Session: https://claude.ai/code/session_01PZjxDwKMghGSUBEg9hgeZC\n",
    ),
    [],
  );
});

test("an obviously clean message passes", () => {
  assert.deepEqual(scanMessage("feat(x): a normal commit\n\nBody text.\n"), []);
});

test("AI commit identities are refused; human identities are not", () => {
  assert.match(classifyIdentity("Claude <noreply@anthropic.com>"), /AI agent commit identity/);
  // Domain rule: a rotated address on a known agent domain is still caught.
  assert.match(
    classifyIdentity("Claude <agent@anthropic.com>"),
    /AI agent commit identity .*agent@anthropic\.com/,
  );
  assert.equal(classifyIdentity(clean), null);
  assert.deepEqual(scanIdentities({ author: clean, committer: clean }), []);
  assert.equal(
    scanIdentities({ author: "Claude <noreply@anthropic.com>", committer: clean }).length,
    1,
  );
});

// ---------------------------------------------------------------------------
// the real hook, in a throwaway repository
// ---------------------------------------------------------------------------

/** A temp repo whose hooks are this repo's real `.githooks`. */
function scratchRepo(t, { email = "hello@darianrosebrook.com" } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "attribution-guard-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  git("init", "-q", "-b", "main");
  git("config", "user.name", "Test Human");
  git("config", "user.email", email);
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", HOOKS);
  writeFileSync(join(dir, "file.txt"), "one\n");
  git("add", "file.txt");
  return { dir, git };
}

test("the commit-msg hook is present and executable", () => {
  const mode = statSync(join(HOOKS, "commit-msg")).mode;
  assert.ok(mode & 0o111, "commit-msg must be executable or git silently skips it");
});

test("git commit is REFUSED when the message carries an agent co-author trailer", (t) => {
  const { dir, git } = scratchRepo(t);
  const result = git(
    "commit",
    "-m",
    "feat(scope): a change",
    "-m",
    "Co-authored-by: Claude <noreply@anthropic.com>",
  );
  assert.notEqual(result.status, 0, "the commit must not be created");
  assert.match(result.stderr, /attribution-guard/);
  assert.match(result.stderr, /noreply@anthropic\.com/);
  // The decisive check: nothing entered history.
  const count = git("rev-list", "--count", "--all");
  assert.equal((count.stdout ?? "").trim(), "0");
  assert.equal(dir.length > 0, true);
});

test("git commit is REFUSED when the author identity is an agent", (t) => {
  const { git } = scratchRepo(t, { email: "noreply@anthropic.com" });
  const result = git("commit", "-m", "feat(scope): a change");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AI agent commit identity/);
  assert.equal((git("rev-list", "--count", "--all").stdout ?? "").trim(), "0");
});

test("a clean commit goes through — the hook is not a blanket refusal", (t) => {
  const { git } = scratchRepo(t);
  const result = git("commit", "-m", "feat(scope): a change");
  assert.equal(result.status, 0, result.stderr);
  assert.equal((git("rev-list", "--count", "--all").stdout ?? "").trim(), "1");
});

test("the range scan catches a commit that bypassed the hook with --no-verify", (t) => {
  const { dir, git } = scratchRepo(t);
  const bypassed = git(
    "commit",
    "--no-verify",
    "-m",
    "feat(scope): smuggled",
    "-m",
    "Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>",
  );
  assert.equal(bypassed.status, 0, "precondition: --no-verify must bypass the hook");

  const scan = spawnSync("node", [GUARD, "--range", "HEAD^!"], { cwd: dir, encoding: "utf8" });
  assert.equal(scan.status, 1, "the backstop must still see it");
  assert.match(scan.stderr, /qwen-coder@alibabacloud\.com/);

  // Control: the same command on a clean commit exits 0.
  writeFileSync(join(dir, "file.txt"), "two\n");
  git("add", "file.txt");
  git("commit", "--no-verify", "-m", "feat(scope): clean");
  const ok = spawnSync("node", [GUARD, "--range", "HEAD^!"], { cwd: dir, encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /clean — 1 commit checked/);
});

test("--range takes a raw revspec: a wide range reaches grandfathered commits", (t) => {
  // Pinning the semantics that make the hook's fallback use `^!`. `--range HEAD`
  // walks all of HEAD's ancestry, so on a range wider than a push it reports
  // history that cannot be changed without a rewrite. The report says so.
  const { dir, git } = scratchRepo(t);
  git(
    "commit",
    "--no-verify",
    "-m",
    "feat(scope): old",
    "-m",
    "Co-authored-by: Qwen-Coder <qwen-coder@alibabacloud.com>",
  );
  writeFileSync(join(dir, "file.txt"), "two\n");
  git("add", "file.txt");
  git("commit", "--no-verify", "-m", "feat(scope): new and clean");

  const narrow = spawnSync("node", [GUARD, "--range", "HEAD^!"], { cwd: dir, encoding: "utf8" });
  assert.equal(narrow.status, 0, "the tip commit alone is clean");

  const wide = spawnSync("node", [GUARD, "--range", "HEAD"], { cwd: dir, encoding: "utf8" });
  assert.equal(wide.status, 1, "the full ancestry still contains the violation");
  assert.match(wide.stderr, /cannot be removed without rewriting history/);
});

test("an unreadable range FAILS CLOSED rather than reporting clean", (t) => {
  const { dir } = scratchRepo(t);
  const scan = spawnSync("node", [GUARD, "--range", "no-such-rev..HEAD"], {
    cwd: dir,
    encoding: "utf8",
  });
  assert.equal(scan.status, 1);
  assert.match(scan.stderr, /cannot read range/);
});

test("a usage error is distinguishable from a violation", () => {
  const nothing = spawnSync("node", [GUARD], { encoding: "utf8" });
  assert.equal(nothing.status, 2);
  const both = spawnSync("node", [GUARD, "--range", "HEAD", "--message-file", "/dev/null"], {
    encoding: "utf8",
  });
  assert.equal(both.status, 2);
});
