/**
 * @full-stack-ds/tokens — build pipeline (stub, step 1)
 *
 * This stub validates whatever DTCG-format token files live under `core/`.
 * Subsequent steps add: compose → deprecation-check → brand emit → global CSS
 * emit → bridge artifacts → types → CDN artifacts.
 *
 * Invocation:
 *   pnpm -F @full-stack-ds/tokens build
 *   tsx build/build.ts --prefix=fsds [--validate-only]
 *
 * Exit code 1 on any validation failure.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  setDefaultSchema,
  validateDesignTokensFromFile,
  type ValidationResult,
} from "./w3c/w3c-index.js";

// Load schemas via fs (resolveJsonModule won't reach .json next to .ts cleanly across runners)
const HERE = fileURLToPath(new URL(".", import.meta.url));
const PACKAGE_ROOT = join(HERE, "..");
const CORE_DIR = join(PACKAGE_ROOT, "core");

interface BuildOptions {
  prefix: string;
  validateOnly: boolean;
}

function parseArgs(argv: string[]): BuildOptions {
  const opts: BuildOptions = { prefix: "fsds", validateOnly: false };
  for (const arg of argv) {
    if (arg.startsWith("--prefix=")) opts.prefix = arg.slice("--prefix=".length);
    else if (arg === "--validate-only") opts.validateOnly = true;
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

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  console.log(`@full-stack-ds/tokens — build (prefix=${opts.prefix})`);

  setDefaultSchema(loadStrictSchema());

  const files = findTokenFiles(CORE_DIR);
  if (files.length === 0) {
    console.log("  (no DTCG token files found under core/; validator pass is a no-op)");
    console.log("Done. 0 file(s) validated.");
    return;
  }

  let failed = 0;
  for (const file of files) {
    const result = validateDesignTokensFromFile(file);
    reportResult(file, result);
    if (!result.isValid) failed += 1;
  }
  console.log(
    `\nDone. ${files.length - failed}/${files.length} file(s) passed validation.`
  );

  if (failed > 0) process.exit(1);

  if (opts.validateOnly) return;

  // Future steps land here: compose, brand emit, global CSS, types.
}

main();
