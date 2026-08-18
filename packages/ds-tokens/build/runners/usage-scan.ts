#!/usr/bin/env node
/**
 * Pure-JSON consumption scan (RAIL-TOKEN-CONSUMPTION-AUDIT-01).
 *
 * Wraps `analyzeTokenUsage` — the same consumption authority behind
 * usage-baseline.json — and prints ONLY a JSON array of
 * `{ tokenPath, usageCount }` rows, so audits can consume it without
 * parsing the report runner's human banners.
 *
 * `analyzeTokenUsage` logs to stdout while it works; those writes are
 * suppressed for the duration so the byte stream stays parseable.
 * Read-only: changes no token, baseline, or report file.
 */
import { analyzeTokenUsage } from '../analytics/usageTracker';

async function main(): Promise<void> {
  const originalLog = console.log;
  console.log = () => {};
  let rows: { tokenPath: string; usageCount: number }[];
  try {
    const report = await analyzeTokenUsage();
    rows = report.usageByToken.map((u) => ({
      tokenPath: u.tokenPath,
      usageCount: u.usageCount,
    }));
  } finally {
    console.log = originalLog;
  }
  process.stdout.write(JSON.stringify(rows));
}

main();
