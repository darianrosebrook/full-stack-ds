/**
 * WORKTREE-INSTALL-WORKSPACE-ISOLATION-01 — contract test for worktree
 * dependency isolation. Pure fs fixtures (no pnpm run); run with:
 *   node --test scripts/worktree-install.test.mjs
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  install,
  installPreflight,
  isolationViolations,
  parseWorkspaceGlobs,
  symlinkedNodeModules,
  unlinkSymlinkedNodeModules,
  workspaceImporters,
  WorkspaceError,
} from "./worktree-install.mjs";

const WORKSPACE = `packages:
  - "packages/*"
  - "examples/*/*"
  - "!packages/ds-unity"
`;

function pkg(dir) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), "{}\n");
}

function layout(root) {
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "pnpm-workspace.yaml"), WORKSPACE);
  pkg(root);
  pkg(join(root, "packages", "ds-lit"));
  pkg(join(root, "packages", "ds-unity"));
  pkg(join(root, "examples", "spatial-console", "web"));
  mkdirSync(join(root, "examples", "spatial-console", "notes"), { recursive: true });
}

/**
 * A canonical checkout with one packages/* importer, one examples/*\/*
 * importer and a negated package, plus a caws worktree inside it whose every
 * importer node_modules is a symlink to canonical's — the layout
 * `caws worktree create` produced on 2026-09-22.
 */
function sharedFixture() {
  const canonical = realpathSync(mkdtempSync(join(tmpdir(), "wt-install-")));
  const worktree = join(canonical, ".caws", "worktrees", "wt");
  layout(canonical);
  layout(worktree);
  for (const rel of ["", "packages/ds-lit", "examples/spatial-console/web"]) {
    const target = join(canonical, rel, "node_modules");
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, "marker"), "canonical\n");
    symlinkSync(target, join(worktree, rel, "node_modules"));
  }
  return { canonical, worktree };
}

test("importers come from pnpm-workspace.yaml: root, packages/*, examples/*/*, minus negations and dirs without package.json", () => {
  const { worktree } = sharedFixture();
  assert.deepEqual(workspaceImporters(worktree), [
    worktree,
    join(worktree, "examples", "spatial-console", "web"),
    join(worktree, "packages", "ds-lit"),
  ]);
});

test("an examples/*/* importer's symlinked node_modules is found, not only packages/*", () => {
  const { worktree } = sharedFixture();
  assert.deepEqual(symlinkedNodeModules(worktree), [
    join(worktree, "node_modules"),
    join(worktree, "examples", "spatial-console", "web", "node_modules"),
    join(worktree, "packages", "ds-lit", "node_modules"),
  ]);
});

test("unlinking removes only the links; canonical's directories and contents survive", () => {
  const { canonical, worktree } = sharedFixture();
  unlinkSymlinkedNodeModules(worktree);
  assert.deepEqual(symlinkedNodeModules(worktree), []);
  for (const rel of ["", "packages/ds-lit", "examples/spatial-console/web"]) {
    assert.equal(existsSync(join(worktree, rel, "node_modules")), false);
    assert.equal(readFileSync(join(canonical, rel, "node_modules", "marker"), "utf8"), "canonical\n");
  }
  assert.deepEqual(installPreflight(worktree), []);
});

test("preflight refuses while an importer node_modules is still a symlink, naming it", () => {
  const { worktree } = sharedFixture();
  const problems = installPreflight(worktree);
  assert.deepEqual(problems, [
    `${join(worktree, "node_modules")} is a symlink; pnpm would write through it`,
    `${join(worktree, "examples", "spatial-console", "web", "node_modules")} is a symlink; pnpm would write through it`,
    `${join(worktree, "packages", "ds-lit", "node_modules")} is a symlink; pnpm would write through it`,
  ]);
});

test("install never spawns pnpm when an importer directory itself realpaths outside the worktree", () => {
  const { canonical, worktree } = sharedFixture();
  const outside = join(canonical, "elsewhere", "web");
  pkg(outside);
  // An examples/*/* importer that is itself a link to a directory outside the worktree.
  const linked = join(worktree, "examples", "linked");
  mkdirSync(linked);
  symlinkSync(outside, join(linked, "web"));
  let spawned = 0;
  const errors = [];
  const code = install(worktree, {
    spawn: () => {
      spawned++;
      return { status: 0 };
    },
    log: () => {},
    error: (line) => errors.push(line),
  });
  assert.equal(code, 2);
  assert.equal(spawned, 0);
  assert.ok(
    errors.some((line) => line.includes(join(linked, "web")) && line.includes("realpaths outside")),
    errors.join("\n"),
  );
});

test("install unlinks shared node_modules and then spawns the frozen install in the worktree", () => {
  const { worktree } = sharedFixture();
  const calls = [];
  const code = install(worktree, {
    spawn: (cmd, args, opts) => {
      calls.push([cmd, args, opts.cwd, symlinkedNodeModules(worktree).length]);
      return { status: 0 };
    },
    log: () => {},
    error: () => {},
  });
  assert.equal(code, 0);
  assert.deepEqual(calls, [["pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], worktree, 0]]);
});

test("canonical check flags a dependency link repointed into a worktree, and passes a local one", () => {
  const { canonical, worktree } = sharedFixture();
  const scope = join(canonical, "examples", "spatial-console", "web", "node_modules", "@full-stack-ds");
  mkdirSync(scope, { recursive: true });
  symlinkSync(join(canonical, "packages", "ds-lit"), join(scope, "react"));
  assert.deepEqual(isolationViolations(canonical), []);
  symlinkSync(join(worktree, "packages", "ds-lit"), join(scope, "lit"));
  assert.deepEqual(isolationViolations(canonical), [
    `${join(scope, "lit")} -> ${join(worktree, "packages", "ds-lit")} (inside another worktree)`,
  ]);
});

test("worktree check flags a shared node_modules and a dependency link that realpaths into canonical", () => {
  const { canonical, worktree } = sharedFixture();
  assert.ok(
    isolationViolations(worktree).includes(
      `${join(worktree, "examples", "spatial-console", "web", "node_modules")} is a symlink (shared with another tree)`,
    ),
  );
  unlinkSymlinkedNodeModules(worktree);
  const nodeModules = join(worktree, "node_modules");
  mkdirSync(nodeModules);
  symlinkSync(join(canonical, "node_modules", "marker"), join(nodeModules, "vite"));
  assert.deepEqual(isolationViolations(worktree), [
    `${join(nodeModules, "vite")} -> ${join(canonical, "node_modules", "marker")} (outside ${worktree})`,
  ]);
});

test("a dangling dependency link is a violation, not a silent pass", () => {
  const { canonical } = sharedFixture();
  const link = join(canonical, "node_modules", "gone");
  symlinkSync(join(canonical, "missing"), link);
  assert.deepEqual(isolationViolations(canonical), [`${link} is a dangling link`]);
});

test("workspace parsing accepts quoted and plain entries and comments", () => {
  assert.deepEqual(
    parseWorkspaceGlobs(`# top\npackages:\n  - packages/*   # libs\n  - 'examples/*/*'\n  - "!packages/ds-unity"\nonlyBuiltDependencies:\n  - esbuild\n`),
    ["packages/*", "examples/*/*", "!packages/ds-unity"],
  );
});

test("workspace forms this parser cannot expand fail loudly instead of shortening the importer list", () => {
  assert.throws(() => parseWorkspaceGlobs(`packages: ["packages/*"]\n`), WorkspaceError);
  assert.throws(() => parseWorkspaceGlobs(`catalog:\n  react: 19\n`), WorkspaceError);
  const { worktree } = sharedFixture();
  writeFileSync(join(worktree, "pnpm-workspace.yaml"), `packages:\n  - "apps/**"\n`);
  assert.throws(() => workspaceImporters(worktree), /unsupported workspace glob segment "\*\*"/);
});

test("the repo's own pnpm-workspace.yaml yields the examples/*/* importers", () => {
  const repoRoot = join(import.meta.dirname, "..");
  const importers = workspaceImporters(repoRoot);
  assert.ok(importers.includes(join(repoRoot, "examples", "spatial-console", "web")));
  assert.ok(importers.includes(join(repoRoot, "packages", "ds-lit")));
  assert.ok(!importers.includes(join(repoRoot, "packages", "ds-unity")));
});
