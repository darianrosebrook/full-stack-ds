/**
 * TypeScript type definitions for W3C Design Tokens
 *
 * These types correspond to the W3C Design Tokens Community Group (DTCG) 1.0 specification.
 */

/**
 * Standard DTCG 1.0 token types
 */
export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'border'
  | 'transition'
  | 'shadow'
  | 'gradient'
  | 'typography'
  | 'strokeStyle';

/**
 * Color space values supported by DTCG 1.0
 */
export type ColorSpace =
  | 'srgb'
  | 'srgb-linear'
  | 'display-p3'
  | 'a98-rgb'
  | 'prophoto-rgb'
  | 'rec2020'
  | 'xyz-d50'
  | 'xyz-d65'
  | 'oklab'
  | 'oklch'
  | 'lab'
  | 'lch';

/**
 * DTCG 1.0 color value structure
 */
export interface ColorValue {
  colorSpace: ColorSpace;
  components: [number, number, number] | [number, number, number, number];
  alpha?: number;
}

/**
 * DTCG 1.0 dimension value structure
 */
export interface DimensionValue {
  value: number;
  unit: 'px' | 'rem';
}

/**
 * Font weight value (numeric or named)
 */
export type FontWeightValue =
  | number
  | 'thin'
  | 'extra-light'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semi-bold'
  | 'bold'
  | 'extra-bold'
  | 'black'
  | 'extra-black';

/**
 * Token reference (alias) format: {token.path}
 */
export type TokenReference = `{${string}}`;

/**
 * Single shadow value structure
 */
export interface SingleShadowValue {
  offsetX: DimensionValue | TokenReference;
  offsetY: DimensionValue | TokenReference;
  blur: DimensionValue | TokenReference;
  spread: DimensionValue | TokenReference;
  color: ColorValue | TokenReference;
  inset?: boolean;
}

/**
 * Shadow value (single or array)
 */
export type ShadowValue =
  | SingleShadowValue
  | SingleShadowValue[]
  | TokenReference;

/**
 * Typography composite value
 */
export interface TypographyValue {
  fontFamily: string | TokenReference;
  fontSize: DimensionValue | TokenReference;
  fontWeight?: FontWeightValue | TokenReference;
  letterSpacing?: DimensionValue | TokenReference;
  lineHeight?: number | TokenReference;
}

/**
 * Border composite value
 */
export interface BorderValue {
  color: ColorValue | TokenReference;
  width: DimensionValue | TokenReference;
  style: StrokeStyleValue | TokenReference;
}

/**
 * Stroke style value
 */
export type StrokeStyleValue =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | {
      dashArray: DimensionValue[];
      lineCap?: 'butt' | 'round' | 'square';
      miterLimit?: number;
    }
  | TokenReference;

/**
 * Gradient stop
 */
export interface GradientStop {
  color: ColorValue | TokenReference;
  position?: number | TokenReference;
}

/**
 * Gradient value (array of stops)
 */
export type GradientValue = GradientStop[];

/**
 * Transition composite value
 */
export interface TransitionValue {
  duration: number | TokenReference;
  delay?: number | TokenReference;
  timingFunction: [number, number, number, number] | TokenReference;
}

/**
 * Token value union type
 */
export type TokenValue =
  | ColorValue
  | DimensionValue
  | string
  | FontWeightValue
  | number
  | [number, number, number, number]
  | ShadowValue
  | TypographyValue
  | BorderValue
  | GradientValue
  | StrokeStyleValue
  | TransitionValue
  | TokenReference;

/**
 * Base token structure
 */
export interface BaseToken {
  $type?: TokenType;
  $value: TokenValue;
  $description?: string;
  $extensions?: Record<string, unknown>;
}

/**
 * Token group structure
 */
export interface TokenGroup {
  $type?: TokenType;
  $description?: string;
  [key: string]: Token | TokenGroup | TokenType | string | undefined;
}

/**
 * Design token (can be a token or a group)
 */
export type Token = BaseToken | TokenGroup;

/**
 * Design tokens file structure
 */
export interface DesignTokens {
  [key: string]: Token | TokenGroup;
}

/**
 * Type guard to check if a value is a token reference
 */
export function isTokenReference(value: unknown): value is TokenReference {
  return typeof value === 'string' && /^\{[^}]+\}$/.test(value);
}

/**
 * Type guard to check if a value is a color value
 */
export function isColorValue(value: unknown): value is ColorValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'colorSpace' in value &&
    'components' in value &&
    Array.isArray((value as ColorValue).components) &&
    (value as ColorValue).components.length >= 3 &&
    (value as ColorValue).components.length <= 4
  );
}

/**
 * Type guard to check if a value is a dimension value
 */
export function isDimensionValue(value: unknown): value is DimensionValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'unit' in value &&
    typeof (value as DimensionValue).value === 'number' &&
    ((value as DimensionValue).unit === 'px' ||
      (value as DimensionValue).unit === 'rem')
  );
}
