#!/usr/bin/env node
/**
 * @full-stack-ds/tokens — top-level build entry.
 *
 * Two modes:
 *   --validate-only  Walks `src/**\/*.tokens.json`, validates each against the
 *                    strict W3C DTCG schema, exits 1 on any failure.
 *   (default)        Delegates to `runners/build.ts` which runs compose →
 *                    global CSS → TypeScript types.
 *
 * The `--prefix` flag is accepted for invocation parity but the CSS-var
 * prefix is settled at `tokenPathToCSSVar` in core/index.ts (currently `--fsds-`).
 * To change it system-wide, edit that default — flag-injection at build time
 * would have to thread through every emitter and isn't worth the surface area.
 *
 * Invocation:
 *   pnpm -F @full-stack-ds/tokens build
 *   pnpm -F @full-stack-ds/tokens validate
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  setDefaultSchema,
  validateDesignTokensFromFile,
  type ValidationResult,
} from "./w3c/w3c-index.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const PACKAGE_ROOT = join(HERE, "..");
const SRC_DIR = join(PACKAGE_ROOT, "src");

interface CliOptions {
  validateOnly: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { validateOnly: false };
  for (const arg of argv) {
    if (arg === "--validate-only") opts.validateOnly = true;
    // --prefix=… is accepted (and ignored) for backward-compat with prior scripts
  }
  return opts;
}

function findTokenFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...findTokenFiles(full));
    } else if (stat.isFile() && entry.endsWith(".tokens.json")) {
      out.push(full);
    }
  }
  return out;
}

function loadStrictSchema(): object {
  const schemaPath = join(HERE, "w3c", "w3c-schema-strict.json");
  return JSON.parse(readFileSync(schemaPath, "utf8"));
}

function reportResult(file: string, result: ValidationResult): void {
  const rel = relative(PACKAGE_ROOT, file);
  if (result.isValid) {
    console.log(`  VALID    ${rel}`);
    return;
  }
  console.error(`  INVALID  ${rel}`);
  for (const err of result.errors) {
    console.error(`    - ${err.path}: ${err.message}`);
  }
}

async function runValidate(): Promise<void> {
  console.log(`@full-stack-ds/tokens — validate`);
  setDefaultSchema(loadStrictSchema());

  const files = findTokenFiles(SRC_DIR);
  if (files.length === 0) {
    console.log(
      "  (no DTCG token files found under src/; validator pass is a no-op)",
    );
    console.log("Done. 0 file(s) validated.");
    return;
  }

  let failed = 0;
  for (const file of files) {
    const result = await validateDesignTokensFromFile(file);
    reportResult(file, result);
    if (!result.isValid) failed += 1;
  }
  console.log(
    `\nDone. ${files.length - failed}/${files.length} file(s) passed validation.`,
  );
  if (failed > 0) process.exit(1);
}

async function runBuild(): Promise<void> {
  // Lazy import keeps validate-only fast and avoids loading the generator chain
  // for a path that only touches the W3C validator.
  const { buildTokens } = await import("./runners/build.js");
  const success = await buildTokens(false); // non-incremental for now; incremental cache lives under .cache/
  if (!success) process.exit(1);
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.validateOnly) {
    await runValidate();
    return;
  }
  await runBuild();
}

void main();
