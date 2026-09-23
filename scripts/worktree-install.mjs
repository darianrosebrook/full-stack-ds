#!/usr/bin/env node
/**
 * Replace caws's symlinked dependency artifacts inside a bound worktree with a
 * real frozen install — and verify the isolation a worktree test run needs.
 *
 * Root cause this fixes: `caws worktree create` links the canonical checkout's
 * `node_modules` (root and every per-importer one) into the worktree as
 * *relative symlinks that share the canonical directory*. Two failures follow:
 *
 * 1. Duplicate module instances. Vite/vitest key module graph entries by
 *    resolved id, and resolution through the link yields ids on both sides of
 *    the symlink boundary (worktree-relative for files the worktree imports
 *    directly, canonical-realpath for transitive deps), so two copies of the
 *    same package load in one process. The visible symptom in this repo is
 *    svelte duplicated that way: every test fails with `rune_outside_svelte`
 *    (14 failed / 3 passed across the three sensitive files on 2026-09-02,
 *    while canonical passed 17/17).
 * 2. Write-through. `pnpm install` inside the worktree writes each importer's
 *    links through any `node_modules` that is still a symlink, repointing the
 *    CANONICAL checkout's dependencies at the worktree. Witnessed 2026-09-22:
 *    the importer list here was hardcoded to `packages/*`, the five
 *    `examples/*\/*` importers stayed symlinked, and canonical
 *    `examples/spatial-console/web` resolved `@full-stack-ds/lit` into a
 *    worktree whose `ds-lit` had no `dist/`.
 *
 * The importer set is therefore derived from `pnpm-workspace.yaml` — the same
 * authority pnpm uses to decide where it writes — and `pnpm install` refuses
 * to run while any importer's `node_modules` could still write outside the
 * worktree.
 *
 * The shared `.pnpm-store` link is deliberately KEPT: the store is a
 * content-addressed cache designed to be shared across projects, so a
 * worktree install hardlinks out of it instead of re-downloading.
 *
 * This script must stay dependency-free: it runs after the worktree's
 * `node_modules` has been unlinked and before the install replaces it.
 *
 * Usage:
 *   pnpm run worktree:install   # unlink symlinked node_modules + pnpm install --frozen-lockfile
 *   pnpm run worktree:check     # verify isolation without mutating anything
 *                               # (also valid in the canonical checkout, where it
 *                               # catches dependency links pointing into a worktree)
 *
 * Exit codes: 0 isolated/installed, 1 isolation violated, 2 usage or
 * environment error (install outside a worktree, pnpm missing, install
 * failed, unparseable workspace file).
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const WORKTREE_ANCHOR = `${sep}.caws${sep}worktrees${sep}`;

export class WorkspaceError extends Error {}

/**
 * Parse the `packages:` sequence of a pnpm-workspace.yaml. Only the shape pnpm
 * workspaces use here is accepted (a block sequence of plain or quoted
 * scalars); anything else throws rather than silently yielding a short list,
 * because a short list is exactly the defect this script exists to prevent.
 */
export function parseWorkspaceGlobs(text) {
  const globs = [];
  let inPackages = false;
  let sawPackages = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "").replace(/^#.*$/, "");
    if (line.trim() === "") continue;
    if (/^\S/.test(line)) {
      inPackages = /^packages\s*:\s*$/.test(line);
      if (/^packages\s*:/.test(line)) {
        if (!inPackages) {
          throw new WorkspaceError(`unsupported packages: form (expected a block sequence): ${raw}`);
        }
        sawPackages = true;
      }
      continue;
    }
    if (!inPackages) continue;
    const item = line.match(/^\s+-\s+(.*?)\s*$/);
    if (!item) throw new WorkspaceError(`unsupported packages: entry: ${raw}`);
    const value = item[1].replace(/^(["'])(.*)\1$/, "$2");
    if (value === "") throw new WorkspaceError(`empty packages: entry: ${raw}`);
    globs.push(value);
  }
  if (!sawPackages) throw new WorkspaceError("no packages: sequence in pnpm-workspace.yaml");
  return globs;
}

function expandGlob(root, pattern) {
  const segments = pattern.replace(/\/+$/, "").split("/");
  for (const segment of segments) {
    if (segment === "**" || (/[*?[\]{}]/.test(segment) && segment !== "*")) {
      throw new WorkspaceError(
        `unsupported workspace glob segment "${segment}" in "${pattern}" (only literal and * segments)`,
      );
    }
  }
  let dirs = [root];
  for (const segment of segments) {
    const next = [];
    for (const dir of dirs) {
      if (segment === "*") {
        let entries;
        try {
          entries = readdirSync(dir, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
          const candidate = join(dir, entry.name);
          if (isDirectory(candidate)) next.push(candidate);
        }
      } else {
        const candidate = join(dir, segment);
        if (isDirectory(candidate)) next.push(candidate);
      }
    }
    dirs = next;
  }
  return dirs;
}

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Every pnpm importer under `root`: the root itself plus each directory with a
 * package.json matched by a positive workspace glob and not by a negated one.
 */
export function workspaceImporters(root) {
  const workspaceFile = join(root, "pnpm-workspace.yaml");
  const globs = existsSync(workspaceFile)
    ? parseWorkspaceGlobs(readFileSync(workspaceFile, "utf8"))
    : [];
  const included = new Set();
  const excluded = new Set();
  for (const glob of globs) {
    const negated = glob.startsWith("!");
    for (const dir of expandGlob(root, negated ? glob.slice(1) : glob)) {
      (negated ? excluded : included).add(dir);
    }
  }
  const importers = [...included].filter(
    (dir) => !excluded.has(dir) && existsSync(join(dir, "package.json")),
  );
  return [root, ...importers.sort()];
}

function isSymlink(path) {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch {
    return false;
  }
}

function isInside(path, dir) {
  return path === dir || path.startsWith(dir + sep);
}

/** Importer `node_modules` paths that are symlinks (caws's shared links). */
export function symlinkedNodeModules(root) {
  return workspaceImporters(root)
    .map((dir) => join(dir, "node_modules"))
    .filter(isSymlink);
}

/**
 * Remove each symlinked importer `node_modules`. Unlink the link itself, never
 * a recursive delete: the target is the canonical checkout's real directory.
 */
export function unlinkSymlinkedNodeModules(root, log = () => {}) {
  const links = symlinkedNodeModules(root);
  for (const path of links) {
    unlinkSync(path);
    log(`worktree-install: unlinked ${path}`);
  }
  return links;
}

/**
 * Reasons `pnpm install` in `root` would write outside it. Empty means safe:
 * no importer `node_modules` is a symlink, and no importer directory (hence
 * no `node_modules` pnpm will create in it) realpaths outside the root.
 */
export function installPreflight(root) {
  const realRoot = realpathSync(root);
  const problems = [];
  for (const dir of workspaceImporters(root)) {
    const nodeModules = join(dir, "node_modules");
    if (isSymlink(nodeModules)) {
      problems.push(`${nodeModules} is a symlink; pnpm would write through it`);
      continue;
    }
    const realDir = realpathSync(dir);
    if (!isInside(realDir, realRoot)) {
      problems.push(`${dir} realpaths outside the tree (${realDir}); pnpm would write there`);
    }
  }
  return problems;
}

function linkEntries(nodeModules) {
  let entries;
  try {
    entries = readdirSync(nodeModules, { withFileTypes: true });
  } catch {
    return [];
  }
  const links = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const path = join(nodeModules, entry.name);
    if (entry.name.startsWith("@") && entry.isDirectory()) {
      for (const scoped of readdirSync(path)) {
        const scopedPath = join(path, scoped);
        if (isSymlink(scopedPath)) links.push(scopedPath);
      }
    } else if (entry.isSymbolicLink()) {
      links.push(path);
    }
  }
  return links;
}

/**
 * Isolation violations for the tree at `root`, which may be a worktree or the
 * canonical checkout. An importer `node_modules` must be a real directory, and
 * each direct dependency link in it must realpath inside `root` and not into
 * any nested `.caws/worktrees/` tree (another tree's install).
 */
export function isolationViolations(root) {
  const realRoot = realpathSync(root);
  const nestedWorktrees = join(realRoot, ".caws", "worktrees");
  const violations = [];
  for (const dir of workspaceImporters(root)) {
    const nodeModules = join(dir, "node_modules");
    if (isSymlink(nodeModules)) {
      violations.push(`${nodeModules} is a symlink (shared with another tree)`);
      continue;
    }
    for (const link of linkEntries(nodeModules)) {
      let target;
      try {
        target = realpathSync(link);
      } catch {
        violations.push(`${link} is a dangling link`);
        continue;
      }
      if (!isInside(target, realRoot)) {
        violations.push(`${link} -> ${target} (outside ${realRoot})`);
      } else if (isInside(target, nestedWorktrees)) {
        violations.push(`${link} -> ${target} (inside another worktree)`);
      }
    }
  }
  return violations;
}

/**
 * The A3 root-cause probe from the original fix: svelte and vitest must
 * resolve to paths whose realpath is inside this tree.
 */
function resolutionProbes(root) {
  const realRoot = realpathSync(root);
  const probes = [
    ["svelte", join(root, "packages", "ds-figma-plugin", "package.json")],
    ["vitest", join(root, "package.json")],
  ];
  const failures = [];
  for (const [name, from] of probes) {
    if (!existsSync(from)) continue;
    let resolved;
    try {
      resolved = realpathSync(createRequire(from).resolve(name));
    } catch {
      failures.push(`${name} does not resolve from ${relative(root, from)} — install is incomplete`);
      continue;
    }
    if (!isInside(resolved, realRoot)) {
      failures.push(`${name} realpaths OUTSIDE the tree: ${resolved}`);
    } else {
      console.log(`worktree-install: ${name} resolves inside the tree ✓`);
    }
  }
  return failures;
}

function verify(root) {
  const failures = [...isolationViolations(root), ...resolutionProbes(root)];
  if (failures.length === 0) return true;
  console.error(
    "worktree-install: ISOLATION VIOLATED — dependency resolution crosses a tree " +
      "boundary (duplicate module instances, or one tree's install repointing another's):",
  );
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    root.includes(WORKTREE_ANCHOR)
      ? "worktree-install: run `pnpm run worktree:install`."
      : "worktree-install: from the canonical checkout, run `pnpm install --frozen-lockfile` " +
          "once no worktree still shares these directories (`pnpm run worktree:check` in each).",
  );
  return false;
}

/**
 * Unlink shared `node_modules`, refuse if the install could still write
 * outside `root`, then run the frozen install. Returns an exit code.
 */
export function install(root, { spawn = spawnSync, log = console.log, error = console.error } = {}) {
  unlinkSymlinkedNodeModules(root, log);
  const problems = installPreflight(root);
  if (problems.length > 0) {
    error("worktree-install: refusing to run pnpm install — it would write outside the worktree:");
    for (const problem of problems) error(`  ${problem}`);
    return 2;
  }
  const result = spawn("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error?.code === "ENOENT") {
    error("worktree-install: pnpm not found on PATH");
    return 2;
  }
  if (result.status !== 0) {
    error(`worktree-install: pnpm install exited ${result.status}`);
    return 2;
  }
  return 0;
}

function main() {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  try {
    if (process.argv.includes("--check")) {
      process.exit(verify(root) ? 0 : 1);
    }
    if (!root.includes(WORKTREE_ANCHOR)) {
      console.error(
        `worktree-install: not inside a caws worktree (expected ${WORKTREE_ANCHOR} in ${root}); ` +
          "refusing to touch a canonical checkout",
      );
      process.exit(2);
    }
    const code = install(root);
    if (code !== 0) process.exit(code);
    process.exit(verify(root) ? 0 : 1);
  } catch (err) {
    if (err instanceof WorkspaceError) {
      console.error(`worktree-install: ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
