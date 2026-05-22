#!/usr/bin/env node
/**
 * Design Token Usage Analytics CLI
 *
 * Analyzes token usage across the codebase and generates reports
 */

import {
  analyzeTokenUsage,
  generateUsageReport,
} from '../analytics/usageTracker';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../core/index';

async function main() {
  const args = process.argv.slice(2);
  const outputFile = args
    .find((arg) => arg.startsWith('--output='))
    ?.split('=')[1];
  const format = args.includes('--json') ? 'json' : 'markdown';

  console.log('🔍 Analyzing design token usage...\n');

  try {
    const report = await analyzeTokenUsage();

    console.log('\n📊 Usage Summary:');
    console.log(`  Total Tokens: ${report.totalTokens}`);
    console.log(`  Used Tokens: ${report.usedTokens}`);
    console.log(`  Unused Tokens: ${report.unusedTokens}`);
    console.log(`  Deprecated Tokens: ${report.deprecatedTokens}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec) => {
        console.log(`  - ${rec}`);
      });
    }

    let output: string;
    if (format === 'json') {
      // Convert Map to plain object for JSON serialization
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
        2
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
