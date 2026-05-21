/**
 * W3C Design Tokens Contrast Validator
 *
 * Optional accessibility validation for color contrast ratios.
 * This module validates color tokens against WCAG 2.1 contrast requirements.
 *
 * @author Darian Rosebrook (@darianrosebrook)
 * @see https://github.com/darianrosebrook
 */

/**
 * WCAG 2.1 contrast ratio requirements
 */
export const WCAG_LEVELS = {
  /** WCAG AA for normal text (14pt and smaller) */
  AA_NORMAL: 4.5,
  /** WCAG AA for large text (18pt+ or 14pt+ bold) */
  AA_LARGE: 3.0,
  /** WCAG AAA for normal text (enhanced accessibility) */
  AAA_NORMAL: 7.0,
  /** WCAG AAA for large text (enhanced accessibility) */
  AAA_LARGE: 4.5,
} as const;

export type WCAGLevel = keyof typeof WCAG_LEVELS;

export interface ContrastValidationOptions {
  /**
   * Minimum contrast ratio required (default: WCAG AA_NORMAL)
   */
  minContrast?: number;
  /**
   * WCAG level to validate against
   */
  level?: WCAGLevel;
  /**
   * Whether to validate all color pairs found in tokens
   */
  validatePairs?: boolean;
  /**
   * Custom color pair definitions to validate
   */
  colorPairs?: Array<{
    foreground: string;
    background: string;
    context?: string;
    level?: WCAGLevel;
  }>;
}

export interface ContrastValidationResult {
  isValid: boolean;
  contrastRatio: number;
  requiredRatio: number;
  foreground: string;
  background: string;
  level: WCAGLevel;
  context?: string;
  suggestion?: string;
}

export interface ContrastValidationReport {
  totalPairs: number;
  validPairs: number;
  invalidPairs: number;
  results: ContrastValidationResult[];
}

/**
 * Convert sRGB channel to linear RGB (for relative luminance calculation)
 */
function sRgbToLinearRgbChannel(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance of an RGB color (WCAG 2.1)
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const rLinear = sRgbToLinearRgbChannel(r);
  const gLinear = sRgbToLinearRgbChannel(g);
  const bLinear = sRgbToLinearRgbChannel(b);
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) {
    // Try 3-digit hex
    const shortMatch = hex.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
    if (shortMatch) {
      return {
        r: parseInt(shortMatch[1] + shortMatch[1], 16),
        g: parseInt(shortMatch[2] + shortMatch[2], 16),
        b: parseInt(shortMatch[3] + shortMatch[3], 16),
      };
    }
    return null;
  }
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

/**
 * Convert DTCG color value to hex string
 */
function colorValueToHex(colorValue: unknown): string | null {
  if (typeof colorValue === 'string') {
    // Already a hex string or token reference
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    // Token reference - can't resolve here
    return null;
  }

  if (typeof colorValue === 'object' && colorValue !== null) {
    const cv = colorValue as Record<string, unknown>;

    // DTCG structured color value
    if ('colorSpace' in cv && 'components' in cv) {
      const colorSpace = cv.colorSpace as string;
      const components = cv.components as number[];

      // Only support srgb for now (most common)
      if (colorSpace === 'srgb' && components.length >= 3) {
        const r = Math.round(components[0] * 255);
        const g = Math.round(components[1] * 255);
        const b = Math.round(components[2] * 255);
        return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
      }
    }
  }

  return null;
}

/**
 * Calculate contrast ratio between two colors
 */
function contrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number }
): number {
  const L1 = relativeLuminance(foreground.r, foreground.g, foreground.b);
  const L2 = relativeLuminance(background.r, background.g, background.b);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate contrast ratio between two hex colors
 */
export function contrastRatioHex(
  foreground: string,
  background: string
): number | null {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return null;
  return contrastRatio(fg, bg);
}

/**
 * Validate a single color pair for contrast
 */
export function validateContrastPair(
  foreground: string,
  background: string,
  options: ContrastValidationOptions = {}
): ContrastValidationResult | null {
  const level = options.level || 'AA_NORMAL';
  const requiredRatio = options.minContrast || WCAG_LEVELS[level];
  const context = options.colorPairs?.find(
    (p) => p.foreground === foreground && p.background === background
  )?.context;

  const ratio = contrastRatioHex(foreground, background);
  if (ratio === null) {
    return null;
  }

  const isValid = ratio >= requiredRatio;

  return {
    isValid,
    contrastRatio: ratio,
    requiredRatio,
    foreground,
    background,
    level,
    context,
    suggestion: isValid
      ? undefined
      : generateContrastSuggestion(ratio, requiredRatio),
  };
}

/**
 * Generate suggestion for improving contrast
 */
function generateContrastSuggestion(
  currentRatio: number,
  requiredRatio: number
): string {
  const improvement = ((requiredRatio / currentRatio) * 100 - 100).toFixed(0);
  return `Contrast ratio ${currentRatio.toFixed(
    2
  )} is below required ${requiredRatio}. Consider adjusting colors by ~${improvement}% luminance.`;
}

/**
 * Extract color pairs from design tokens
 */
function extractColorPairsFromTokens(tokens: unknown): Array<{
  foreground: string;
  background: string;
  context?: string;
  level?: WCAGLevel;
}> {
  const pairs: Array<{
    foreground: string;
    background: string;
    context?: string;
  }> = [];

  if (typeof tokens !== 'object' || tokens === null) {
    return pairs;
  }

  const tokensObj = tokens as Record<string, unknown>;

  // Look for common semantic color patterns
  const semanticColors = (tokensObj.semantic as Record<string, unknown>)
    ?.color as Record<string, unknown> | undefined;

  if (semanticColors) {
    // Text on background patterns
    const foreground = semanticColors.foreground as
      | Record<string, unknown>
      | undefined;
    const background = semanticColors.background as
      | Record<string, unknown>
      | undefined;

    if (foreground && background) {
      const fgPrimary = colorValueToHex(foreground.primary);
      const bgPrimary = colorValueToHex(background.primary);

      if (fgPrimary && bgPrimary) {
        pairs.push({
          foreground: fgPrimary,
          background: bgPrimary,
          context: 'Primary text on primary background',
        });
      }
    }
  }

  return pairs;
}

/**
 * Validate contrast for design tokens
 */
export function validateTokenContrast(
  tokens: unknown,
  options: ContrastValidationOptions = {}
): ContrastValidationReport {
  const results: ContrastValidationResult[] = [];

  // Use provided color pairs or extract from tokens
  const colorPairs = options.colorPairs || extractColorPairsFromTokens(tokens);

  colorPairs.forEach((pair) => {
    const level =
      ('level' in pair ? pair.level : undefined) ||
      options.level ||
      'AA_NORMAL';
    const result = validateContrastPair(pair.foreground, pair.background, {
      ...options,
      level,
      colorPairs: [
        pair as {
          foreground: string;
          background: string;
          context?: string;
          level?: WCAGLevel;
        },
      ],
    });

    if (result) {
      results.push(result);
    }
  });

  const validPairs = results.filter((r) => r.isValid).length;
  const invalidPairs = results.length - validPairs;

  return {
    totalPairs: results.length,
    validPairs,
    invalidPairs,
    results,
  };
}

/**
 * Format contrast validation report
 */
export function formatContrastReport(report: ContrastValidationReport): string {
  const lines: string[] = [];
  lines.push('\n🎨 Contrast Validation Report');
  lines.push('═'.repeat(50));
  lines.push('');
  lines.push(`📊 Summary:`);
  lines.push(`   Total pairs: ${report.totalPairs}`);
  lines.push(`   ✅ Passing: ${report.validPairs}`);
  lines.push(`   ❌ Failing: ${report.invalidPairs}`);
  lines.push('');

  const failing = report.results.filter((r) => !r.isValid);
  if (failing.length > 0) {
    lines.push('❌ Failing pairs:');
    failing.forEach((result, i) => {
      lines.push(`   ${i + 1}. ${result.context || 'Color pair'}`);
      lines.push(`      Foreground: ${result.foreground}`);
      lines.push(`      Background: ${result.background}`);
      lines.push(
        `      Contrast: ${result.contrastRatio.toFixed(2)} (required: ${result.requiredRatio})`
      );
      if (result.suggestion) {
        lines.push(`      💡 ${result.suggestion}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}
