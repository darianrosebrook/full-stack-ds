/**
 * W3C Design Tokens Validator - Main Entry Point
 *
 * Re-export all public APIs from the validator module
 */

export {
  validateDesignTokens,
  validateDesignTokensFromFile,
  formatValidationResult,
  setDefaultSchema,
  getDefaultSchema,
  loadDefaultSchema,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationOptions,
} from './w3c-validator';

export type {
  DesignTokens,
  Token,
  TokenGroup,
  TokenType,
  TokenValue,
  ColorValue,
  DimensionValue,
  FontWeightValue,
  TokenReference,
  ShadowValue,
  TypographyValue,
  BorderValue,
  StrokeStyleValue,
  GradientValue,
  TransitionValue,
  ColorSpace,
  SingleShadowValue,
  GradientStop,
} from './w3c-types';

export { isTokenReference, isColorValue, isDimensionValue } from './w3c-types';

// Contrast validation (optional)
export {
  validateTokenContrast,
  validateContrastPair,
  contrastRatioHex,
  formatContrastReport,
  WCAG_LEVELS,
  type WCAGLevel,
  type ContrastValidationOptions,
  type ContrastValidationResult,
  type ContrastValidationReport,
} from './w3c-contrast-validator';

export {
  validateDesignTokensWithContrast,
  formatExtendedValidationResult,
  type ExtendedValidationOptions,
  type ExtendedValidationResult,
} from './w3c-validator-with-contrast';
