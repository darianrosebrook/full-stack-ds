#!/usr/bin/env node
/**
 * Token contrast gate — loads resolved.tokens.json, walks the curated
 * canonical foreground × background pairs from the contrast validator,
 * and exits non-zero if any AA-level pair fails.
 *
 * Runs in light + dark themes by default. CI/pre-push consume this as
 * `pnpm tokens:check-contrast`.
 */

import fs from "node:fs";
import {
  extractCanonicalPairs,
  validateContrastPair,
} from "../w3c/w3c-contrast-validator.js";
import { PATHS } from "../core/index.js";

interface Failure {
  theme: "light" | "dark";
  context: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  level: string;
}

async function main(): Promise<void> {
  if (!fs.existsSync(PATHS.outputResolved)) {
    console.error(
      `[contrast] ❌ resolved.tokens.json not found at ${PATHS.outputResolved}`,
    );
    console.error(`[contrast]    Run \`pnpm tokens:build\` first.`);
    process.exit(2);
  }

  const tree = JSON.parse(fs.readFileSync(PATHS.outputResolved, "utf-8"));
  const failures: Failure[] = [];
  let totalChecks = 0;

  for (const theme of ["light", "dark"] as const) {
    const pairs = extractCanonicalPairs(tree, theme);
    for (const p of pairs) {
      const result = validateContrastPair(p.foreground, p.background, {
        level: p.level,
      });
      if (!result) continue;
      totalChecks++;
      if (!result.isValid) {
        failures.push({
          theme,
          context: p.context,
          foreground: p.foreground,
          background: p.background,
          ratio: result.contrastRatio,
          required: result.requiredRatio,
          level: p.level,
        });
      }
    }
  }

  console.log(`🎨 Contrast check — ${totalChecks} pair(s) evaluated`);
  if (failures.length === 0) {
    console.log(`  ✅ All pairs meet their declared WCAG level.`);
    process.exit(0);
  }

  console.error(`  ❌ ${failures.length} pair(s) fail:`);
  for (const f of failures) {
    console.error(
      `    [${f.theme}] ${f.context}`,
    );
    console.error(
      `      ratio ${f.ratio.toFixed(2)}:1 < required ${f.required}:1 (${f.level})`,
    );
    console.error(`      fg=${f.foreground}  bg=${f.background}`);
  }
  console.error(``);
  console.error(
    `  The validator enforces the curated pair list in build/w3c/w3c-contrast-validator.ts`,
  );
  console.error(
    `  (extractCanonicalPairs). Edit there to add or remove the contract.`,
  );
  process.exit(1);
}

main().catch((err) => {
  console.error("[contrast] Fatal:", err);
  process.exit(2);
});
