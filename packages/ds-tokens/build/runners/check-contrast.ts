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
import { overlayBrand } from "../w3c/brand-overlay.js";
import { loadBrandTokens } from "../generators/global.js";
import { PATHS } from "../core/index.js";

interface Failure {
  /** Brand instantiation this pair was evaluated in; "base" is the un-branded tree. */
  brand: string;
  theme: "light" | "dark";
  context: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  level: string;
}

export async function main(): Promise<void> {
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

  // Every registered brand is a distinct instantiation of the semantic layer.
  // Checking only the base tree leaves 9 of 10 unproven — see brand-overlay.ts.
  const brands = loadBrandTokens();
  const instantiations: Array<{ brand: string; tree: unknown }> = [
    { brand: "base", tree },
  ];

  for (const theme of ["light", "dark"] as const) {
    for (const inst of instantiations) {
      const pairs = extractCanonicalPairs(inst.tree, theme);
      collect(pairs, inst.brand, theme);
    }
    for (const [brandId, overrides] of brands) {
      const branded = overlayBrand(tree, overrides, theme);
      collect(extractCanonicalPairs(branded, theme), brandId, theme);
    }
  }

  function collect(
    pairs: ReturnType<typeof extractCanonicalPairs>,
    brand: string,
    theme: "light" | "dark",
  ): void {
    for (const p of pairs) {
      const result = validateContrastPair(p.foreground, p.background, {
        level: p.level,
      });
      if (!result) continue;
      totalChecks++;
      if (!result.isValid) {
        failures.push({
          brand,
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

  console.log(
    `🎨 Contrast check — ${totalChecks} pair(s) evaluated across ${
      brands.size + 1
    } instantiation(s) (base + ${brands.size} brand(s)) x 2 theme(s)`,
  );
  if (failures.length === 0) {
    console.log(`  ✅ All pairs meet their declared WCAG level.`);
    process.exit(0);
  }

  console.error(`  ❌ ${failures.length} pair(s) fail:`);
  for (const f of failures) {
    console.error(
      `    [${f.brand} / ${f.theme}] ${f.context}`,
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("[contrast] Fatal:", err);
    process.exit(2);
  });
}
