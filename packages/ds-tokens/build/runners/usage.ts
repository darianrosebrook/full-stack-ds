#!/usr/bin/env node
/**
 * Design Token Usage Analytics CLI
 *
 * Three modes:
 *   - default (no flag): write a human/JSON report of unused tokens
 *   - --write-baseline: snapshot the current unused-token set to
 *     `usage-baseline.json`; subsequent --check-baseline runs gate
 *     against this floor
 *   - --check-baseline: fail (exit 1) if any token unused today was not
 *     in the baseline (i.e. a previously-used token became dead), or if
 *     the total unused count grew. Used by pre-push + CI to catch new
 *     dead tokens without forcing an immediate full cleanup of the 398
 *     unused tokens that exist at baseline time.
 *
 * Exit codes:
 *   0  — success (or report-only mode)
 *   1  — usage regression detected (--check-baseline) or analysis error
 *   2  — baseline file missing under --check-baseline
 */

import {
  analyzeTokenUsage,
  generateUsageReport,
} from '../analytics/usageTracker';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../core/index';

interface Baseline {
  /** ISO timestamp when the baseline was last written. */
  generatedAt: string;
  /** Total unused-token count at baseline time. */
  unusedCount: number;
  /** Token paths considered unused at baseline time. */
  unusedTokens: string[];
}

const BASELINE_PATH = path.join(
  PROJECT_ROOT,
  'packages/ds-tokens/usage-baseline.json',
);

function loadBaseline(): Baseline | null {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  const raw = fs.readFileSync(BASELINE_PATH, 'utf8');
  return JSON.parse(raw) as Baseline;
}

function writeBaseline(baseline: Baseline): void {
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const outputFile = args
    .find((arg) => arg.startsWith('--output='))
    ?.split('=')[1];
  const format = args.includes('--json') ? 'json' : 'markdown';
  const writeBaselineMode = args.includes('--write-baseline');
  const checkBaselineMode = args.includes('--check-baseline');

  console.log('🔍 Analyzing design token usage...\n');

  try {
    const report = await analyzeTokenUsage();
    const currentUnused = report.usageByToken
      .filter((u) => u.usageCount === 0)
      .map((u) => u.tokenPath)
      .sort();

    console.log('📊 Usage Summary:');
    console.log(`  Total Tokens: ${report.totalTokens}`);
    console.log(`  Used Tokens: ${report.usedTokens}`);
    console.log(`  Unused Tokens: ${report.unusedTokens}`);
    console.log(`  Deprecated Tokens: ${report.deprecatedTokens}`);

    if (writeBaselineMode) {
      const baseline: Baseline = {
        generatedAt: new Date().toISOString(),
        unusedCount: currentUnused.length,
        unusedTokens: currentUnused,
      };
      writeBaseline(baseline);
      console.log(
        `\n✅ Baseline written: ${path.relative(PROJECT_ROOT, BASELINE_PATH)}`,
      );
      console.log(`   ${baseline.unusedCount} tokens recorded as unused.`);
      console.log(
        `   Future --check-baseline runs will fail if any new token becomes unused`,
      );
      console.log(
        `   or if the unused count grows beyond this floor.`,
      );
      process.exit(0);
    }

    if (checkBaselineMode) {
      const baseline = loadBaseline();
      if (!baseline) {
        console.error(
          `\n❌ Baseline file not found: ${path.relative(PROJECT_ROOT, BASELINE_PATH)}`,
        );
        console.error(
          `   Run \`pnpm run tokens:write-usage-baseline\` to create it.`,
        );
        process.exit(2);
      }

      const baselineSet = new Set(baseline.unusedTokens);
      const newlyUnused = currentUnused.filter((t) => !baselineSet.has(t));
      const newlyUsed = baseline.unusedTokens.filter(
        (t) => !currentUnused.includes(t),
      );
      const grew = currentUnused.length > baseline.unusedCount;

      console.log('\n🚦 Baseline check:');
      console.log(`   Baseline (${baseline.generatedAt.slice(0, 10)}): ${baseline.unusedCount} unused`);
      console.log(`   Current:               ${currentUnused.length} unused`);
      if (newlyUsed.length > 0) {
        console.log(
          `   ✅ ${newlyUsed.length} previously-unused token(s) are now consumed — consider re-baselining`,
        );
      }

      if (newlyUnused.length === 0 && !grew) {
        console.log('\n✅ No usage regression. (Tokens may need re-baselining after cleanup.)');
        process.exit(0);
      }

      console.error('\n❌ Usage regression detected:');
      if (newlyUnused.length > 0) {
        console.error(
          `   ${newlyUnused.length} token(s) became unused since baseline:`,
        );
        for (const t of newlyUnused.slice(0, 20)) {
          console.error(`     - ${t}`);
        }
        if (newlyUnused.length > 20) {
          console.error(`     ... and ${newlyUnused.length - 20} more`);
        }
      }
      if (grew) {
        console.error(
          `   Total unused count grew: ${baseline.unusedCount} → ${currentUnused.length}`,
        );
      }
      console.error(
        '\n   Fix options:',
      );
      console.error(
        '     1. Delete the new dead token(s) from packages/ds-tokens/src/',
      );
      console.error(
        '     2. Add a consumer for the token in a contract or component CSS',
      );
      console.error(
        '     3. If intentional (e.g. token added ahead of consumer), re-baseline:',
      );
      console.error(
        '        pnpm run tokens:write-usage-baseline',
      );
      process.exit(1);
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec) => {
        console.log(`  - ${rec}`);
      });
    }

    let output: string;
    if (format === 'json') {
      const usageByFileObj: Record<string, string[]> = {};
      report.usageByFile.forEach((tokens, file) => {
        usageByFileObj[file] = tokens;
      });

      output = JSON.stringify(
        {
          ...report,
          usageByFile: usageByFileObj,
          usageByToken: report.usageByToken.map((u) => ({
            ...u,
            lastUsed: u.lastUsed?.toISOString() || null,
          })),
        },
        null,
        2,
      );
    } else {
      output = generateUsageReport(report);
    }

    if (outputFile) {
      const outputPath = path.join(PROJECT_ROOT, outputFile);
      fs.writeFileSync(outputPath, output, 'utf8');
      console.log(`\n✅ Report written to: ${outputFile}`);
    } else {
      console.log('\n' + output);
    }
  } catch (error) {
    console.error('❌ Error analyzing token usage:', error);
    process.exit(1);
  }
}

main();
