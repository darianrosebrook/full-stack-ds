#!/usr/bin/env node
/**
 * TypeScript Types Generator
 *
 * Generates TypeScript types for design tokens to enable
 * IntelliSense and type safety in token usage.
 */

import prettier from "prettier";
import {
  PATHS,
  readTokenFile,
  writeOutputFile,
  extractTokenPaths,
  generateBanner,
  logSummary,
} from "../core/index.js";

/**
 * Generate TypeScript types for token paths.
 * Output is piped through Prettier so the emitted file always satisfies
 * the project's lint config; previously the generator produced trailing
 * spaces in doc comments and over-long unions that drifted from
 * prettier's expected format on every regeneration.
 */
export async function generateTokenTypes(): Promise<boolean> {
  console.log("[tokens] Generating TypeScript types...");

  // Read composed tokens
  const tokens = readTokenFile(PATHS.tokens);
  if (!tokens) {
    console.error("[tokens] Failed to read composed tokens");
    return false;
  }

  // Extract all token paths
  const allPaths = extractTokenPaths(tokens);

  if (allPaths.length === 0) {
    console.warn("[tokens] No token paths found");
    return false;
  }

  // Group paths by namespace for better organization
  const pathsByNamespace: Record<string, string[]> = {};

  allPaths.forEach((path) => {
    const namespace = path.split(".")[0];
    if (!pathsByNamespace[namespace]) {
      pathsByNamespace[namespace] = [];
    }
    pathsByNamespace[namespace].push(path);
  });

  // Generate type definitions
  const banner = generateBanner(PATHS.tokens);

  const typeDefinitions: string[] = [
    banner,
    "",
    "/**",
    " * Design Token Paths",
    " * ",
    " * Auto-generated TypeScript types for design token paths.",
    " * Use these types to ensure type safety when referencing tokens.",
    " */",
    "",
  ];

  // Generate union type for all token paths
  const pathLiterals = allPaths.map((path) => `  | '${path}'`);
  typeDefinitions.push(
    "/**",
    " * All available design token paths",
    " */",
    "export type TokenPath =",
    pathLiterals.join("\n") + ";",
    "",
  );

  // Generate namespace-specific types
  Object.entries(pathsByNamespace).forEach(([namespace, paths]) => {
    const namespacePaths = paths.map((path) => `  | '${path}'`);
    const typeName = `${namespace.charAt(0).toUpperCase() + namespace.slice(1)}TokenPath`;

    typeDefinitions.push(
      `/**`,
      ` * ${namespace} token paths`,
      ` */`,
      `export type ${typeName} =`,
      namespacePaths.join("\n") + ";",
      "",
    );
  });

  // Generate helper function types
  typeDefinitions.push(
    "/**",
    " * Token reference string (with curly braces)",
    " */",
    "export type TokenReference = `{${TokenPath}}`;",
    "",
    "/**",
    " * CSS Custom Property name",
    " */",
    "export type CSSVariableName = `--${string}`;",
    "",
    "/**",
    " * Helper type for token resolution functions",
    " */",
    "export interface TokenResolver {",
    "  resolve: (path: TokenPath) => string;",
    "  toCSSVar: (path: TokenPath) => CSSVariableName;",
    "  reference: (path: TokenPath) => TokenReference;",
    "}",
    "",
  );

  // Generate token metadata interface
  typeDefinitions.push(
    "/**",
    " * Token metadata structure",
    " */",
    "export interface TokenMetadata {",
    "  $value: unknown;",
    "  $type?: string;",
    "  $description?: string;",
    "}",
    "",
    "/**",
    " * Token group structure",
    " */",
    "export interface TokenGroup {",
    "  [key: string]: TokenMetadata | TokenGroup;",
    "}",
    "",
  );

  // Add usage examples in comments
  typeDefinitions.push(
    "/**",
    " * Usage Examples:",
    " * ",
    " * ```typescript",
    ' * import type { TokenPath, CoreTokenPath } from "@/types/designTokens";',
    " * ",
    " * // Type-safe token references",
    ' * const primaryColor: TokenPath = "core.color.blue.500";',
    ' * const semanticBg: TokenPath = "semantic.color.background.primary";',
    " * ",
    " * // In token resolution functions",
    " * function resolveToken(path: TokenPath): string {",
    " *   // implementation...",
    " * }",
    " * ```",
    " */",
    "",
  );

  // Combine and format. Resolving the project's prettier config picks up
  // the same rules the lint rule enforces, so the output is byte-equal to
  // what `eslint --fix` would produce on the same string.
  const rawContent = typeDefinitions.join("\n");
  const prettierConfig = await prettier.resolveConfig(PATHS.outputTypes);
  const content = await prettier.format(rawContent, {
    ...prettierConfig,
    filepath: PATHS.outputTypes,
    parser: "typescript",
  });

  writeOutputFile(PATHS.outputTypes, content, "TypeScript token types");

  // Log summary
  logSummary({
    totalTokens: allPaths.length,
    generatedFiles: 1,
  });

  return true;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTokenTypes()
    .then((success) => process.exit(success ? 0 : 1))
    .catch((err) => {
      console.error("[tokens] Type generation failed:", err);
      process.exit(1);
    });
}
