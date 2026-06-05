#!/usr/bin/env node
// Stale-dist guard for the Figma plugin.
//
// Why this exists: `dist/plugin.js` is gitignored build output, and Figma
// Desktop loads it *directly* from disk (via manifest.json `main`). Nothing
// runs between "edit a source file" and "Figma reads dist", so a source change
// that isn't rebuilt silently ships the OLD bytes. That is exactly how the
// "in combineAsVariants: Grouped nodes must be in the same page as the parent"
// error resurfaced after the fix had already landed in `src/plugin.ts`.
//
// This check compares the mtime of `dist/plugin.js` against every build-input
// file under `src/` (plus the Vite config). If any input is newer than the
// built bundle — or the bundle is missing — it fails with a remediation line.
//
// HONEST LIMITATION: this is mtime-based, so it is a best-effort *local* dev
// guard, not a content-hash proof. Git checkouts/clones do not preserve mtime
// ordering, so a fresh clone (no dist) fails correctly ("run build"), but a
// branch switch that rewinds source without touching dist could read as fresh.
// It reliably catches the case that actually bites: "I edited src and forgot
// to rebuild before loading the plugin." For a cryptographic guarantee you
// would hash inputs into a committed manifest — out of proportion for a
// gitignored, workspace-only dev artifact.

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(scriptDir);
const distFile = join(packageDir, "dist", "plugin.js");
const srcDir = join(packageDir, "src");

const REBUILD = "pnpm --filter @full-stack-ds/figma-plugin build";
const WATCH = "pnpm --filter @full-stack-ds/figma-plugin dev";

/** Files that feed the Vite bundle. Test files do not affect dist output. */
function isBuildInput(name) {
  if (name.endsWith(".test.ts") || name.endsWith(".test.tsx")) return false;
  return /\.(ts|tsx|js|jsx|mjs|cjs|json)$/.test(name);
}

/** Recursively collect build-input files under a directory. */
function collectInputs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectInputs(full));
    } else if (entry.isFile() && isBuildInput(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function fail(message) {
  console.error(`\n  ✖ figma-plugin dist freshness check FAILED\n`);
  console.error(`  ${message}\n`);
  console.error(`  Rebuild once:        ${REBUILD}`);
  console.error(`  Or watch on save:    ${WATCH}\n`);
  process.exit(1);
}

if (!existsSync(distFile)) {
  fail(
    "dist/plugin.js does not exist. Figma cannot load the plugin until it is built.",
  );
}

const distMtime = statSync(distFile).mtimeMs;

const inputs = [];
if (existsSync(srcDir)) inputs.push(...collectInputs(srcDir));
for (const cfg of ["vite.config.ts", "vite.config.mts", "vite.config.js"]) {
  const full = join(packageDir, cfg);
  if (existsSync(full)) inputs.push(full);
}

let newest = null;
let newestMtime = -Infinity;
for (const file of inputs) {
  const m = statSync(file).mtimeMs;
  if (m > newestMtime) {
    newestMtime = m;
    newest = file;
  }
}

if (newest && newestMtime > distMtime) {
  const rel = relative(packageDir, newest);
  fail(
    `dist/plugin.js is STALE. Source file is newer than the built bundle:\n` +
      `    ${rel}\n` +
      `  Loading the current dist into Figma would run pre-edit bytes.`,
  );
}

console.log(
  `✔ figma-plugin dist is fresh (built after ${inputs.length} tracked source input(s)).`,
);
