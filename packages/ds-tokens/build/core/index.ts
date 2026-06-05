/**
 * Design Tokens Core API
 *
 * Consolidated utility functions for reading, processing, and generating
 * design tokens across all output formats.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Common types and interfaces
export interface TokenValue {
  $value: unknown;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

export interface TokenGroup {
  [key: string]: TokenValue | TokenGroup;
}

export interface GenerationOptions {
  inputPath: string;
  outputPath: string;
  format: "scss" | "css" | "js" | "ts" | "json";
  theme?: "light" | "dark" | "auto";
  prefix?: string;
  banner?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: string;
    path: string;
    message: string;
    data?: unknown;
  }>;
  warnings: Array<{
    type: string;
    path: string;
    message: string;
    data?: unknown;
  }>;
}

// Resolve project paths.
//
// __dirname here is `<repo>/packages/ds-tokens/build/core`. The repo root is
// 4 levels up. Anchoring on the file location rather than process.cwd() means
// `pnpm -F @full-stack-ds/tokens build` works the same whether invoked from
// the workspace root or from inside the package.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

const PACKAGE_ROOT = path.join(PROJECT_ROOT, "packages", "ds-tokens");
const SRC_DIR = path.join(PACKAGE_ROOT, "src");
const GENERATED_DIR = path.join(PACKAGE_ROOT, "generated");

export const PATHS = {
  // Source layout: 156 DTCG shards under src/<category>/{core,semantic}/<subtree>.tokens.json
  srcDir: SRC_DIR,
  brandsDir: path.join(SRC_DIR, "brands"),
  densityDir: path.join(SRC_DIR, "density"),
  // Composed-tree intermediate (compose.ts writes, global.ts/types.ts read)
  tokens: path.join(GENERATED_DIR, "composed.tokens.json"),
  // Legacy aliases retained for cache.ts predicates; point at SRC_DIR so existence checks pass
  coreTokens: SRC_DIR,
  semanticTokens: SRC_DIR,
  // Output artifacts
  outputTypes: path.join(PACKAGE_ROOT, "src", "types", "designTokens.ts"),
  outputCSS: path.join(GENERATED_DIR, "tokens.css"),
  // Fully-resolved token tree — every {ref} dereferenced down to a literal
  // value (hex string for colors, "<n>px" for dimensions, etc.). Consumed
  // by contrast / accessibility validators that need concrete colors to
  // compute ratios.
  outputResolved: path.join(GENERATED_DIR, "resolved.tokens.json"),
  // global.ts (lines 1174/1318/1324) reads `outputScss`; keep an alias so the
  // dropped portfolio code links without edits at every call site.
  outputScss: path.join(GENERATED_DIR, "tokens.css"),
} as const;

/**
 * Reads and parses a design token file with comprehensive error handling.
 *
 * @param filePath - Absolute path to the token file to read
 * @returns Parsed token data as TokenGroup, or null if file doesn't exist or parsing fails
 * @throws No exceptions thrown - all errors are logged and handled gracefully
 *
 * @example
 * ```typescript
 * const tokens = readTokenFile('/path/to/core.tokens.json');
 * if (tokens) {
 *   console.log('Loaded', Object.keys(tokens).length, 'token groups');
 * }
 * ```
 */
export function readTokenFile(filePath: string): TokenGroup | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(
        `[tokens] File not found: ${path.relative(PROJECT_ROOT, filePath)}`,
      );
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);

    console.log(`[tokens] Loaded: ${path.relative(PROJECT_ROOT, filePath)}`);
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        `[tokens] JSON parse error in ${path.relative(PROJECT_ROOT, filePath)}:`,
      );
      console.error(`  ${error.message}`);
    } else {
      console.error(
        `[tokens] Error reading ${path.relative(PROJECT_ROOT, filePath)}:`,
        error,
      );
    }
    return null;
  }
}

/**
 * Writes content to a file, creating directories as needed.
 *
 * @param filePath - Absolute path where the file should be written
 * @param content - String content to write to the file
 * @param description - Optional description for logging purposes
 * @throws Throws an error if the file cannot be written
 *
 * @example
 * ```typescript
 * writeOutputFile('/path/to/output.css', ':root { --color: red; }', 'CSS variables');
 * ```
 */
export function writeOutputFile(
  filePath: string,
  content: string,
  description?: string,
): void {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    // Write file
    fs.writeFileSync(filePath, content, "utf8");

    const relativePath = path.relative(PROJECT_ROOT, filePath);
    const desc = description ? ` (${description})` : "";
    console.log(`[tokens] Generated: ${relativePath}${desc}`);
  } catch (error) {
    console.error(
      `[tokens] Failed to write ${path.relative(PROJECT_ROOT, filePath)}:`,
      error,
    );
    throw error;
  }
}

/**
 * Determine if a token path belongs to semantic or core namespace based on patterns
 */
function determineNamespace(tokenPath: string): "core" | "semantic" | null {
  // Already prefixed
  if (tokenPath.startsWith("core.")) return "core";
  if (tokenPath.startsWith("semantic.")) return "semantic";

  // Core token patterns (these are primitives/palettes)
  // Note: typography.lineHeight and typography.letterSpacing are semantic (body, collapse, heading, etc.)
  // while typography.ramp, typography.weight, typography.fontFamily are core primitives
  const corePatterns = [
    /^color\.(mode|palette|datavis)/, // color.mode.*, color.palette.*, color.datavis.*
    /^typography\.(fontFamily|weight|ramp|features)/, // typography.fontFamily.*, typography.weight.*, typography.ramp.*, etc.
    /^spacing\.size/, // spacing.size.*
    /^elevation\.(level|offset|blur|spread)/, // elevation.level.*, elevation.offset.*, etc.
    /^opacity\.(50|100|200|300|400|500|600|700|800|900|full)/, // opacity.50, opacity.100, etc.
    /^dimension\.(breakpoint|tapTarget|actionMinHeight)/, // dimension.breakpoint.*, etc.
    /^shape\.(radius|borderWidth|borderStyle|border\.width|border\.style)/, // shape.radius.*, shape.borderWidth.*, shape.border.width.*, etc.
    /^motion\.(duration|easing|keyframes|delay|stagger|translate)/, // motion.duration.*, motion.easing.*, etc.
    /^scale\./, // scale.*
    /^density\./, // density.*
    /^layer\./, // layer.*
    /^layout\./, // layout.*
    /^icon\./, // icon.*
    /^effect\./, // effect.*
  ];

  // If it matches core patterns, it's core
  if (corePatterns.some((pattern) => pattern.test(tokenPath))) {
    return "core";
  }

  // Unknown namespace — emit without prefix rather than guessing 'semantic'.
  // Tokens not under core.* / semantic.* / a recognized core pattern (e.g. brand.*,
  // custom application namespaces) should appear as their own --<path> var. The
  // previous default-to-semantic produced misleading --semantic-brand-* names.
  return null;
}

/**
 * Convert token path to CSS custom property name with namespace prefix
 */
export function tokenPathToCSSVar(
  tokenPath: string,
  prefix = "--fsds-",
): string {
  // Determine namespace
  const namespace = determineNamespace(tokenPath);

  // Remove namespace prefix if present (we'll add it back)
  const pathWithoutNamespace = tokenPath.replace(/^(core|semantic)\./, "");

  // Convert path to CSS variable format
  const cssVarName = pathWithoutNamespace
    .replace(/\./g, "-") // Convert dots to hyphens first
    .replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) // Convert camelCase
    .replace(/[\s_]/g, "-") // Convert spaces and underscores
    .replace(/[^a-z0-9-]/g, "") // Remove any remaining invalid characters
    .replace(/-+/g, "-"); // Collapse multiple hyphens into one

  // Add namespace prefix if determined
  const namespacePrefix = namespace ? `${namespace}-` : "";

  return prefix + namespacePrefix + cssVarName;
}

/**
 * Extract all token paths from a token tree
 */
export function extractTokenPaths(obj: TokenGroup, prefix = ""): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // Skip metadata

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object") {
      if ("$value" in value) {
        // This is a token
        paths.push(currentPath);
      } else {
        // This is a group, recurse
        paths.push(...extractTokenPaths(value as TokenGroup, currentPath));
      }
    }
  }

  return paths;
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  if (!source) return target;

  const result: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (
        key in result &&
        typeof result[key] === "object" &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(
          result[key] as Record<string, unknown>,
          value as Record<string, unknown>,
        );
      } else {
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Format CSS block with proper indentation
 */
export function formatCSSBlock(
  selector: string,
  properties: Record<string, string>,
): string {
  const lines = Object.entries(properties)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join("\n");

  return `${selector} {\n${lines}\n}`;
}

/**
 * Generate standard banner comment
 */
export function generateBanner(sourcePath?: string): string {
  const source = sourcePath
    ? `\n * Source: ${path.relative(PROJECT_ROOT, sourcePath)}`
    : "";
  return `/* AUTO-GENERATED: Do not edit directly.${source}\n */`;
}

/**
 * Log generation summary
 */
export function logSummary(stats: {
  totalTokens?: number;
  referencedTokens?: number;
  generatedFiles?: number;
  errors?: number;
}): void {
  const { totalTokens, referencedTokens, generatedFiles, errors } = stats;

  console.log("\n[tokens] Generation Summary:");
  if (totalTokens !== undefined) {
    console.log(`  - Total tokens: ${totalTokens}`);
  }
  if (referencedTokens !== undefined) {
    console.log(`  - Referenced tokens: ${referencedTokens}`);
  }
  if (generatedFiles !== undefined) {
    console.log(`  - Generated files: ${generatedFiles}`);
  }
  if (errors !== undefined && errors > 0) {
    console.log(`  - Errors: ${errors}`);
  }
}
