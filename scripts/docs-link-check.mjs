#!/usr/bin/env node
/**
 * Relative markdown link checker for tracked docs.
 *
 * Why this exists: docs/ was reorganised into architecture/, specifications/,
 * and architecture/design/ subfolders, but the sibling-relative `./foo.md`
 * links were never re-pointed. Twenty links across tracked docs resolved to
 * nothing, including several between the repo's own authority documents. No
 * gate caught it, because nothing walks doc links.
 *
 * Scope, deliberately narrow:
 *   - Only files tracked by git. Untracked machine-local docs (docs/internal/,
 *     CLAUDE.md) are per-contributor and intentionally not gated.
 *   - Link TARGETS that git ignores are skipped too, and counted separately.
 *     A tracked doc may legitimately point at per-machine state that a given
 *     clone materialises later (`.claude/hooks/CLAUDE.md`, `.Codex/hooks/`,
 *     both produced by `caws init`). Their absence in a bare clone is by
 *     design, not drift, so failing on them would make the gate cry wolf.
 *     This gate governs tracked-doc -> tracked-doc links.
 *   - Only relative links whose target ends in `.md`. External URLs, bare
 *     anchors, and non-markdown assets are out of scope.
 *   - A link with a fragment (`./foo.md#section`) is checked for the file
 *     only; anchor existence is not validated.
 *
 * Exit codes: 0 = every checked link resolves. 1 = at least one broken link,
 * each printed as `file:line -> target`. 2 = could not enumerate tracked files.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";

const repoRoot = process.cwd();

/** Inline links `[text](target)` and reference definitions `[label]: target`. */
const INLINE_LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const REF_DEFINITION = /^\s*\[[^\]]+\]:\s+(\S+)/;

function trackedMarkdownFiles() {
  try {
    return execFileSync("git", ["ls-files", "-z", "*.md"], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    })
      .split("\0")
      .filter(Boolean);
  } catch (err) {
    console.error(`docs-link-check: could not list tracked files — ${err.message}`);
    process.exit(2);
  }
}

/** True for targets this checker deliberately does not resolve. */
function isOutOfScope(target) {
  if (!target) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return true; // http:, mailto:, etc.
  if (target.startsWith("#")) return true; // same-page anchor
  if (target.startsWith("<")) return true; // autolink syntax
  return false;
}

/** Strip the fragment; we validate the file, not the anchor. */
function targetPath(target) {
  const hash = target.indexOf("#");
  return hash === -1 ? target : target.slice(0, hash);
}

/**
 * True when git ignores this repo-relative path. Batched per run would be
 * faster, but the link count here is in the dozens and correctness beats
 * cleverness. `git check-ignore` exits 1 for "not ignored", which is not an
 * error condition, so a non-zero exit is read as "not ignored".
 */
function isGitIgnored(relPath) {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", relPath], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const broken = [];
let checked = 0;
let skippedIgnored = 0;

for (const file of trackedMarkdownFiles()) {
  const abs = resolve(repoRoot, file);
  let text;
  try {
    text = readFileSync(abs, "utf8");
  } catch {
    continue; // listed but absent (sparse checkout) — not this gate's business
  }

  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const targets = [];
    for (const m of line.matchAll(INLINE_LINK)) targets.push(m[1]);
    const refMatch = line.match(REF_DEFINITION);
    if (refMatch) targets.push(refMatch[1]);

    for (const raw of targets) {
      if (isOutOfScope(raw)) continue;
      const path = targetPath(raw);
      if (!path.endsWith(".md")) continue;

      // Root-relative links are repo-root-relative; everything else is
      // relative to the citing file's directory.
      const resolved = path.startsWith("/")
        ? resolve(repoRoot, `.${path}`)
        : resolve(dirname(abs), path);

      const relToRoot = relative(repoRoot, resolved);

      // Per-machine targets (produced by `caws init`, or ignored by a bare
      // `CLAUDE.md` pattern that matches at any depth) are out of scope.
      if (isGitIgnored(relToRoot)) {
        skippedIgnored += 1;
        continue;
      }

      checked += 1;
      if (!existsSync(resolved)) {
        broken.push({ file, line: i + 1, target: raw, expected: relToRoot });
      }
    }
  });
}

if (broken.length > 0) {
  console.error(`docs-link-check: ${broken.length} broken relative link(s):\n`);
  for (const b of broken) {
    console.error(`  ${b.file}:${b.line} -> ${b.target}`);
    console.error(`      resolves to ${b.expected} (does not exist)`);
  }
  console.error(
    `\nChecked ${checked} relative .md link(s) across tracked markdown files.`,
  );
  process.exit(1);
}

console.log(
  `docs-link-check: OK — ${checked} relative .md link(s) resolve across tracked markdown files` +
    (skippedIgnored > 0
      ? ` (${skippedIgnored} skipped: target is machine-local/gitignored).`
      : "."),
);
