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
import { PROJECT_ROOT, PATHS, tokenPathToCSSVar } from '../core/index';
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
        const extensions = (
          value as { $extensions?: { design?: { deprecated?: boolean } } }
        ).$extensions;
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
 * Reference forms a file can contain:
 *   - DTCG dotted path inside braces: `{core.color.palette.red.500}`.
 *     ONLY meaningful in `.tokens.json` source files — in JS/TS files,
 *     `{x}` is template-literal syntax and would produce false positives.
 *   - CSS custom property: `var(--fsds-core-color-palette-red-500)` or
 *     `var(--fsds-core-color-palette-red-500, fallback)`. The fallback
 *     form is critical because the codegen emits fallbacks on every
 *     reference.
 *   - TypeScript dictionary lookup: `designTokens['core.color...']`.
 */
interface ScanContext {
  /** Map from CSS var name (e.g. `--fsds-core-color-...`) → token path. */
  cssVarToPath: Map<string, string>;
  /** All known token paths as a Set, for exact-match lookup of DTCG refs. */
  pathSet: Set<string>;
}

/**
 * Scan a single file for token references. Returns the set of matched
 * token paths (already resolved against the known token set, so the
 * caller doesn't need to do another lookup).
 *
 * Strict matching only — no substring fallback. A reference matches a
 * token when (a) its CSS var name resolves through `cssVarToPath`, or
 * (b) the dotted path appears literally in the token set, or (c) the
 * `designTokens[...]` key matches a token path.
 */
function scanFileForTokens(
  filePath: string,
  ctx: ScanContext,
): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const found = new Set<string>();
  const isTokenJson = filePath.endsWith('.tokens.json');

  // (a) `var(--fsds-...)` — handles optional ", fallback" tail.
  // Capture the var name up to the first `,` or `)`.
  const cssVarRefs = content.matchAll(
    /var\((--[a-zA-Z0-9_-]+)(?:\s*,[^)]*)?\)/g,
  );
  for (const match of cssVarRefs) {
    const tokenPath = ctx.cssVarToPath.get(match[1]);
    if (tokenPath) found.add(tokenPath);
  }

  // (b) `{a.b.c}` DTCG references — only in token JSON files. In JS/TS
  // files this regex would match template-literal interpolations like
  // `{id}`, which are NOT token references.
  if (isTokenJson) {
    const jsonRefs = content.matchAll(/\{([a-zA-Z0-9_.-]+)\}/g);
    for (const match of jsonRefs) {
      const ref = match[1];
      if (!ref.includes('.')) continue; // single-word — not a token path
      if (ctx.pathSet.has(ref)) found.add(ref);
    }
  }

  // (c) `designTokens['path']` lookups in TypeScript.
  const tsRefs = content.matchAll(/designTokens\[['"]([^'"]+)['"]\]/g);
  for (const match of tsRefs) {
    if (ctx.pathSet.has(match[1])) found.add(match[1]);
  }

  return [...found];
}

/**
 * Build a CSS-var → token-path lookup map by walking every token and
 * computing its canonical CSS variable name with `tokenPathToCSSVar`.
 * This lets the scanner resolve `var(--fsds-foo-bar-baz)` to a token
 * path without trying to invert the slug, which is ambiguous (slugs
 * collapse dots and hyphens).
 */
function buildCssVarLookup(
  paths: Iterable<string>,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of paths) {
    map.set(tokenPathToCSSVar(p), p);
  }
  return map;
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

  // Pre-compute scan context: CSS var → token-path lookup, plus the
  // canonical path set for exact-match against DTCG references.
  const scanCtx: ScanContext = {
    cssVarToPath: buildCssVarLookup(tokenSet),
    pathSet: tokenSet,
  };

  // Scan files — strict exact-match. scanFileForTokens already returns
  // only paths that exist in the token set, so we credit each one once
  // per file.
  for (const filePath of filesToScan) {
    try {
      const foundTokens = scanFileForTokens(filePath, scanCtx);
      if (foundTokens.length === 0) continue;
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      usageByFile.set(relativePath, foundTokens);

      for (const foundToken of foundTokens) {
        const usage = usageByToken.get(foundToken);
        if (!usage) continue;
        usage.usageCount++;
        if (!usage.usedIn.includes(relativePath)) {
          usage.usedIn.push(relativePath);
        }
        usage.lastUsed = new Date();
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
