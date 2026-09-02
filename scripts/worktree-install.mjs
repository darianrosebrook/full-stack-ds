#!/usr/bin/env node
/**
 * Replace caws's symlinked dependency artifacts inside a bound worktree with a
 * real frozen install — and verify the isolation a worktree test run needs.
 *
 * Root cause this fixes: `caws worktree create` links the canonical checkout's
 * `node_modules` (root and every per-package one under `packages/`) into the
 * worktree as *relative symlinks that share the canonical directory*. Vite/vitest key
 * module graph entries by resolved id, and resolution through the link yields
 * ids on both sides of the symlink boundary (worktree-relative for files the
 * worktree imports directly, canonical-realpath for transitive deps), so two
 * copies of the same package load in one process. The visible symptom in this
 * repo is svelte duplicated that way: components compiled by one instance are
 * rendered against the other and every test fails with `rune_outside_svelte`
 * (14 failed / 3 passed across the three sensitive files on 2026-09-02, while
 * canonical passed 17/17). A real frozen install inside the worktree keeps
 * every resolved id under the worktree root, so exactly one instance exists.
 *
 * The shared `.pnpm-store` link is deliberately KEPT: the store is a
 * content-addressed cache designed to be shared across projects, so a
 * worktree install hardlinks out of it instead of re-downloading.
 *
 * Usage:
 *   pnpm run worktree:install   # unlink symlinked node_modules + pnpm install --frozen-lockfile
 *   pnpm run worktree:check     # verify isolation without mutating anything
 *
 * Exit codes: 0 isolated/installed, 1 isolation violated (check mode), 2 usage
 * or environment error (not inside a bound worktree, pnpm missing, install
 * failed).
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  realpathSync,
  unlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const WORKTREE_ANCHOR = `${sep}.caws${sep}worktrees${sep}`;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const worktreeRoot = dirname(scriptDir);

function fail(message) {
  console.error(`worktree-install: ${message}`);
  process.exit(2);
}

if (!worktreeRoot.includes(WORKTREE_ANCHOR)) {
  fail(
    `not inside a caws worktree (expected ${WORKTREE_ANCHOR} in ${worktreeRoot}); ` +
      "refusing to touch a canonical checkout",
  );
}

/** Expand the per-package glob (packages/<pkg>/node_modules) against the real tree. */
function dependencyArtifacts() {
  const root = join(worktreeRoot, "node_modules");
  const nested = existsSync(join(worktreeRoot, "packages"))
    ? readdirSync(join(worktreeRoot, "packages")).map((pkg) =>
        join(worktreeRoot, "packages", pkg, "node_modules"),
      )
    : [];
  return [root, ...nested];
}

function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * The A3 root-cause probe: svelte and vitest must resolve to paths whose
 * REALPATH is inside this worktree. When node_modules is still caws's
 * symlink, both realpath into the canonical checkout — two resolution paths,
 * two module instances, `rune_outside_svelte`.
 */
function verifyIsolation() {
  const stale = dependencyArtifacts().filter((path) => isSymlink(path));
  if (stale.length > 0) {
    console.error(
      "worktree-install: ISOLATION VIOLATED — dependency artifacts are still " +
        "symlinks into the canonical checkout (duplicate module instances: a " +
        "second svelte/vitest resolves through the shared tree and produces " +
        "rune_outside_svelte / cross-instance mismatches):",
    );
    for (const path of stale) console.error(`  symlink: ${path}`);
    console.error("worktree-install: run `pnpm run worktree:install`.");
    return false;
  }
  const requireFromFigma = createRequire(
    join(worktreeRoot, "packages", "ds-figma-plugin", "package.json"),
  );
  const requireFromRoot = createRequire(join(worktreeRoot, "package.json"));
  const probes = [
    ["svelte", requireFromFigma],
    ["vitest", requireFromRoot],
  ];
  let ok = true;
  for (const [name, req] of probes) {
    let resolved;
    try {
      resolved = realpathSync(req.resolve(name));
    } catch {
      console.error(
        `worktree-install: ${name} does not resolve from the worktree — install is incomplete.`,
      );
      ok = false;
      continue;
    }
    if (!resolved.startsWith(worktreeRoot + sep)) {
      console.error(
        `worktree-install: ISOLATION VIOLATED — ${name} realpaths OUTSIDE the worktree:\n` +
          `  ${resolved}\n` +
          "duplicate module instances through symlinked node_modules are the " +
          "root cause of rune_outside_svelte in worktree test runs. " +
          "Run `pnpm run worktree:install`.",
      );
      ok = false;
    } else {
      console.log(`worktree-install: ${name} resolves inside the worktree ✓`);
    }
  }
  return ok;
}

if (process.argv.includes("--check")) {
  process.exit(verifyIsolation() ? 0 : 1);
}

const symlinks = dependencyArtifacts().filter((path) => isSymlink(path));
if (symlinks.length === 0 && existsSync(join(worktreeRoot, "node_modules"))) {
  console.log(
    "worktree-install: node_modules is already a real tree — nothing to unlink.",
  );
} else {
  for (const path of symlinks) {
    // Unlink the symlink itself, never a recursive delete: the target is the
    // canonical checkout's real node_modules.
    unlinkSync(path);
    console.log(`worktree-install: unlinked ${path}`);
  }
  const result = spawnSync("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], {
    cwd: worktreeRoot,
    stdio: "inherit",
  });
  if (result.error?.code === "ENOENT") {
    fail("pnpm not found on PATH");
  }
  if (result.status !== 0) {
    fail(`pnpm install exited ${result.status}`);
  }
}

process.exit(verifyIsolation() ? 0 : 1);
