#!/usr/bin/env node

/**
 * TypeScript Type Generator for Design Tokens
 *
 * Generates TypeScript types for token paths to enable IntelliSense
 * in code that imports and uses design tokens.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const TYPES_OUTPUT_PATH = path.join(PROJECT_ROOT, "types", "designTokens.ts");

/**
 * Extract token paths from a token object
 */
function extractTokenPaths(obj, prefix = "") {
  const paths = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue; // Skip metadata keys

    const currentPath = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && value.$value !== undefined) {
      // This is a token
      paths.push(currentPath);
    } else if (value && typeof value === "object") {
      // This is a group, recurse
      paths.push(...extractTokenPaths(value, currentPath));
    }
  }

  return paths;
}

/**
 * Generate TypeScript types for token paths
 */
function generateTokenTypes() {
  const coreTokensPath = path.join(
    PROJECT_ROOT,
    "ui",
    "designTokens",
    "core.tokens.json",
  );
  const semanticTokensPath = path.join(
    PROJECT_ROOT,
    "ui",
    "designTokens",
    "semantic.tokens.json",
  );

  let allPaths = [];

  // Extract paths from core tokens
  if (fs.existsSync(coreTokensPath)) {
    const coreTokens = JSON.parse(fs.readFileSync(coreTokensPath, "utf8"));
    const corePaths = extractTokenPaths(coreTokens).map((p) => `core.${p}`);
    allPaths.push(...corePaths);
  }

  // Extract paths from semantic tokens
  if (fs.existsSync(semanticTokensPath)) {
    const semanticTokens = JSON.parse(
      fs.readFileSync(semanticTokensPath, "utf8"),
    );
    const semanticPaths = extractTokenPaths(semanticTokens).map(
      (p) => `semantic.${p}`,
    );
    allPaths.push(...semanticPaths);
  }

  // Sort paths for better organization
  allPaths.sort();

  // Generate TypeScript types
  const typeContent = `/**
 * Design Token Paths
 * 
 * Auto-generated TypeScript types for design token paths.
 * Use these for type-safe token access in your code.
 * 
 * @example
 * \`\`\`typescript
 * import { TokenPath } from '@/types/designTokens';
 * 
 * const tokenPath: TokenPath = 'semantic.color.foreground.primary';
 * const cssVar = \`var(--\${tokenPath.replace(/\\./g, '-')})\`;
 * \`\`\`
 */

export type TokenPath = 
${allPaths.map((path) => `  | '${path}'`).join("\n")};

/**
 * CSS Custom Property Name
 * 
 * Converts a token path to a CSS custom property name.
 * 
 * @example
 * \`\`\`typescript
 * const cssVar = toCSSVar('semantic.color.foreground.primary');
 * // Result: '--fsds-semantic-color-foreground-primary'
 * \`\`\`
 */
export type CSSVarName = \`--\${string}\`;

/**
 * Convert a token path to a CSS custom property name
 */
export function toCSSVar(tokenPath: TokenPath): CSSVarName {
  return \`--\${tokenPath.replace(/\\./g, '-')}\` as CSSVarName;
}

/**
 * Token namespace prefixes
 */
export type CoreTokenPath = Extract<TokenPath, \`core.\${string}\`>;
export type SemanticTokenPath = Extract<TokenPath, \`semantic.\${string}\`>;

/**
 * Token type categories
 */
export type ColorTokenPath = Extract<TokenPath, \`\${string}.color.\${string}\`>;
export type SpacingTokenPath = Extract<TokenPath, \`\${string}.spacing.\${string}\`>;
export type TypographyTokenPath = Extract<TokenPath, \`\${string}.typography.\${string}\`>;
export type MotionTokenPath = Extract<TokenPath, \`\${string}.motion.\${string}\`>;
export type ElevationTokenPath = Extract<TokenPath, \`\${string}.elevation.\${string}\`>;
export type ShapeTokenPath = Extract<TokenPath, \`\${string}.shape.\${string}\`>;
export type DimensionTokenPath = Extract<TokenPath, \`\${string}.dimension.\${string}\`>;
`;

  return typeContent;
}

/**
 * Main function to generate and write types
 */
function generateTypes() {
  console.log("[types] Generating TypeScript types for design tokens...");

  const typeContent = generateTokenTypes();

  // Ensure output directory exists
  const outputDir = path.dirname(TYPES_OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write types file
  fs.writeFileSync(TYPES_OUTPUT_PATH, typeContent);

  console.log(
    `[types] Generated types at ${path.relative(PROJECT_ROOT, TYPES_OUTPUT_PATH)}`,
  );
  console.log(
    `[types] Generated ${typeContent.split("|").length - 1} token paths`,
  );

  return typeContent;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTypes();
}

export { generateTypes };
