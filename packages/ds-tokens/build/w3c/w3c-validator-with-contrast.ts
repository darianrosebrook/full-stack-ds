/**
 * W3C Design Tokens Validator with Contrast Validation
 *
 * Extended validator that includes optional contrast/accessibility validation.
 */

import {
  validateDesignTokens,
  type ValidationResult,
  type ValidationOptions,
} from './w3c-validator';
import {
  validateTokenContrast,
  formatContrastReport,
  type ContrastValidationOptions,
  type ContrastValidationReport,
} from './w3c-contrast-validator';

export interface ExtendedValidationOptions extends ValidationOptions {
  /**
   * Enable contrast validation
   */
  contrastValidation?: boolean | ContrastValidationOptions;
}

export interface ExtendedValidationResult extends ValidationResult {
  contrast?: ContrastValidationReport;
}

/**
 * Validate design tokens with optional contrast validation
 */
export function validateDesignTokensWithContrast(
  tokens: unknown,
  options: ExtendedValidationOptions = {}
): ExtendedValidationResult {
  // Standard validation
  const result = validateDesignTokens(tokens, options);

  // Add contrast validation if enabled
  if (options.contrastValidation) {
    const contrastOptions =
      typeof options.contrastValidation === 'boolean'
        ? {}
        : options.contrastValidation;

    const contrastReport = validateTokenContrast(tokens, contrastOptions);

    // Add contrast errors to main result if any failures
    if (contrastReport.invalidPairs > 0) {
      result.isValid = false;
      contrastReport.results
        .filter((r) => !r.isValid)
        .forEach((contrastResult) => {
          result.errors.push({
            type: 'custom',
            path: contrastResult.context || 'contrast',
            message: `Contrast ratio ${contrastResult.contrastRatio.toFixed(
              2
            )} is below required ${contrastResult.requiredRatio} for ${contrastResult.foreground} on ${contrastResult.background}`,
          });
        });
    }

    return {
      ...result,
      contrast: contrastReport,
    };
  }

  return result;
}

/**
 * Format extended validation results including contrast
 */
export function formatExtendedValidationResult(
  result: ExtendedValidationResult
): string {
  const lines: string[] = [];

  // Standard validation results
  if (result.isValid && result.warnings.length === 0 && !result.contrast) {
    lines.push('✅ Design tokens are valid');
  } else {
    if (result.warnings.length > 0) {
      lines.push(`⚠️  ${result.warnings.length} warning(s):`);
      result.warnings.forEach((warning) => {
        lines.push(
          `  Warning [${warning.type}] ${warning.path}: ${warning.message}`
        );
      });
    }

    if (!result.isValid) {
      lines.push(`❌ ${result.errors.length} error(s):`);
      result.errors.forEach((error) => {
        lines.push(`  Error [${error.type}] ${error.path}: ${error.message}`);
      });
    }
  }

  // Contrast validation results
  if (result.contrast) {
    lines.push(formatContrastReport(result.contrast));
  }

  return lines.join('\n');
}
