/**
 * Design Token Usage Analytics
 *
 * Tracks token usage across the codebase to identify:
 * - Unused tokens
 * - Most used tokens
 * - Token adoption patterns
 * - Breaking change impact
 *
 * @author Darian Rosebrook <hello@darianrosebrook.com>
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { PROJECT_ROOT, PATHS } from '../core/index';
import type { TokenGroup } from '../core/index';

export interface TokenUsage {
  tokenPath: string;
  usedIn: string[];
  usageCount: number;
  lastUsed: Date | null;
  deprecated: boolean;
}

export interface UsageReport {
  totalTokens: number;
  usedTokens: number;
  unusedTokens: number;
  deprecatedTokens: number;
  usageByToken: TokenUsage[];
  usageByFile: Map<string, string[]>;
  recommendations: string[];
}

/**
 * Extract all token paths from a token tree
 */
function extractAllTokenPaths(
  obj: TokenGroup,
  prefix = '',
  paths: string[] = []
): string[] {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object') {
      if ('$value' in value) {
        paths.push(currentPath);

        // Check if deprecated
        const extensions = (value as any).$extensions;
        if (extensions?.design?.deprecated) {
          paths.push(`${currentPath}@deprecated`);
        }
      } else {
        extractAllTokenPaths(value as TokenGroup, currentPath, paths);
      }
    }
  }

  return paths;
}

/**
 * Scan file for token references
 */
function scanFileForTokens(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const found: string[] = [];

  // Match {token.path} references
  const jsonRefs = content.matchAll(/\{([a-zA-Z0-9_.-]+)\}/g);
  for (const match of jsonRefs) {
    found.push(match[1]);
  }

  // Match var(--token-name) usage
  const cssVarRefs = content.matchAll(
    /var\(--([a-zA-Z0-9_-]+(?:-[a-zA-Z0-9_-]+)*)\)/g
  );
  for (const match of cssVarRefs) {
    // Convert CSS var name back to token path
    const tokenPath = match[1].replace(/-/g, '.');
    found.push(tokenPath);
  }

  // Match designTokens.usage patterns in TypeScript
  const tsRefs = content.matchAll(/designTokens\[['"]([^'"]+)['"]\]/g);
  for (const match of tsRefs) {
    found.push(match[1]);
  }

  return found;
}

/**
 * Analyze token usage across codebase
 */
export async function analyzeTokenUsage(): Promise<UsageReport> {
  console.log('[analytics] Analyzing token usage...');

  // Load all tokens
  const tokensContent = fs.readFileSync(PATHS.tokens, 'utf8');
  const tokens = JSON.parse(tokensContent) as TokenGroup;

  // Extract all token paths
  const allTokenPaths = extractAllTokenPaths(tokens);
  const tokenSet = new Set(
    allTokenPaths.filter((p) => !p.endsWith('@deprecated'))
  );

  // Find all files to scan
  const scanPatterns = [
    '**/*.tokens.json',
    '**/*.tsx',
    '**/*.ts',
    '**/*.scss',
    '**/*.css',
  ];

  const filesToScan: string[] = [];
  for (const pattern of scanPatterns) {
    const files = await glob(pattern, {
      cwd: PROJECT_ROOT,
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.cache/**',
        '**/dist/**',
        '**/build/**',
      ],
    });
    filesToScan.push(...files.map((f) => path.join(PROJECT_ROOT, f)));
  }

  // Track usage
  const usageByToken = new Map<string, TokenUsage>();
  const usageByFile = new Map<string, string[]>();

  // Initialize all tokens
  for (const tokenPath of tokenSet) {
    usageByToken.set(tokenPath, {
      tokenPath,
      usedIn: [],
      usageCount: 0,
      lastUsed: null,
      deprecated: allTokenPaths.includes(`${tokenPath}@deprecated`),
    });
  }

  // Scan files
  for (const filePath of filesToScan) {
    try {
      const foundTokens = scanFileForTokens(filePath);
      const relativePath = path.relative(PROJECT_ROOT, filePath);

      if (foundTokens.length > 0) {
        usageByFile.set(relativePath, foundTokens);

        for (const foundToken of foundTokens) {
          // Try exact match first
          if (usageByToken.has(foundToken)) {
            const usage = usageByToken.get(foundToken)!;
            usage.usageCount++;
            if (!usage.usedIn.includes(relativePath)) {
              usage.usedIn.push(relativePath);
            }
            usage.lastUsed = new Date();
          } else {
            // Try partial matches (for CSS var names that might not match exactly)
            for (const [tokenPath, usage] of usageByToken.entries()) {
              if (
                tokenPath.includes(foundToken) ||
                foundToken.includes(tokenPath)
              ) {
                usage.usageCount++;
                if (!usage.usedIn.includes(relativePath)) {
                  usage.usedIn.push(relativePath);
                }
                usage.lastUsed = new Date();
              }
            }
          }
        }
      }
    } catch {
      // Skip files that can't be read
      continue;
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  const unusedTokens = Array.from(usageByToken.values()).filter(
    (u) => u.usageCount === 0 && !u.deprecated
  );

  if (unusedTokens.length > 0) {
    recommendations.push(
      `Found ${unusedTokens.length} unused tokens. Consider removing: ${unusedTokens
        .slice(0, 5)
        .map((u) => u.tokenPath)
        .join(', ')}`
    );
  }

  const deprecatedUsage = Array.from(usageByToken.values()).filter(
    (u) => u.deprecated && u.usageCount > 0
  );

  if (deprecatedUsage.length > 0) {
    recommendations.push(
      `Found ${deprecatedUsage.length} deprecated tokens still in use. Plan migration: ${deprecatedUsage
        .slice(0, 5)
        .map((u) => u.tokenPath)
        .join(', ')}`
    );
  }

  const usageArray = Array.from(usageByToken.values()).sort(
    (a, b) => b.usageCount - a.usageCount
  );

  return {
    totalTokens: tokenSet.size,
    usedTokens: usageArray.filter((u) => u.usageCount > 0).length,
    unusedTokens: unusedTokens.length,
    deprecatedTokens: usageArray.filter((u) => u.deprecated).length,
    usageByToken: usageArray,
    usageByFile,
    recommendations,
  };
}

/**
 * Generate usage report as markdown
 */
export function generateUsageReport(report: UsageReport): string {
  const lines: string[] = [
    '# Design Token Usage Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- **Total Tokens:** ${report.totalTokens}`,
    `- **Used Tokens:** ${report.usedTokens}`,
    `- **Unused Tokens:** ${report.unusedTokens}`,
    `- **Deprecated Tokens:** ${report.deprecatedTokens}`,
    '',
  ];

  if (report.recommendations.length > 0) {
    lines.push('## Recommendations', '');
    report.recommendations.forEach((rec) => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }

  // Top 10 most used tokens
  lines.push('## Top 10 Most Used Tokens', '');
  report.usageByToken
    .slice(0, 10)
    .filter((u) => u.usageCount > 0)
    .forEach((usage) => {
      lines.push(`- **${usage.tokenPath}**: ${usage.usageCount} usages`);
    });
  lines.push('');

  // Unused tokens
  if (report.unusedTokens > 0) {
    lines.push('## Unused Tokens', '');
    lines.push(
      `Found ${report.unusedTokens} unused tokens. Consider removing:`
    );
    lines.push('');
    report.usageByToken
      .filter((u) => u.usageCount === 0 && !u.deprecated)
      .slice(0, 20)
      .forEach((usage) => {
        lines.push(`- ${usage.tokenPath}`);
      });
    lines.push('');
  }

  // Deprecated tokens in use
  const deprecatedInUse = report.usageByToken.filter(
    (u) => u.deprecated && u.usageCount > 0
  );
  if (deprecatedInUse.length > 0) {
    lines.push('## Deprecated Tokens Still In Use', '');
    deprecatedInUse.forEach((usage) => {
      lines.push(`- **${usage.tokenPath}**: ${usage.usageCount} usages`);
      lines.push(`  - Used in: ${usage.usedIn.slice(0, 3).join(', ')}`);
      if (usage.usedIn.length > 3) {
        lines.push(`  - ... and ${usage.usedIn.length - 3} more files`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}
