/**
 * Built-in Design Token Transforms
 *
 * Common transformation functions for different token types.
 * Supports DTCG 1.0 structured values.
 */

import {
  parseCssColorToRgb,
  formatHsl,
  formatOklch,
} from '../helpers/colorFormat';
import { rgbToHex, rgbToHsl, rgbToOklch } from '../helpers/colorHelpers';
import type { Transform } from './types';

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };
type OKLCH = { L: number; c: number; h: number };
type OKLAB = { L: number; a: number; b: number };
/**
 * Type guard to check if a value is a DTCG 1.0 structured color value.
 *
 * @param value - The value to check
 * @returns True if the value is a structured color object with colorSpace and components
 *
 * @example
 * ```typescript
 * if (isStructuredColorValue(tokenValue)) {
 *   // tokenValue has colorSpace: 'srgb', components: [r, g, b], alpha?: number
 * }
 * ```
 */
export function isStructuredColorValue(
  value: unknown
): value is { colorSpace: string; components: number[]; alpha?: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'colorSpace' in value &&
    'components' in value &&
    Array.isArray((value as { components: unknown }).components)
  );
}

/**
 * Type guard to check if a value is a DTCG 1.0 structured dimension value.
 *
 * @param value - The value to check
 * @returns True if the value is a structured dimension object with value and unit
 *
 * @example
 * ```typescript
 * if (isStructuredDimensionValue(tokenValue)) {
 *   // tokenValue has value: number, unit: 'px' | 'rem'
 * }
 * ```
 */
export function isStructuredDimensionValue(
  value: unknown
): value is { value: number; unit: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'value' in value &&
    'unit' in value &&
    typeof (value as { value: unknown }).value === 'number' &&
    typeof (value as { unit: unknown }).unit === 'string'
  );
}

/**
 * Convert DTCG 1.0 structured color value to CSS string.
 *
 * Supports multiple color spaces and formats including srgb, display-p3, oklch, lab, lch.
 * Automatically handles alpha channels and converts to the most appropriate CSS format.
 *
 * @param colorValue - DTCG 1.0 structured color value
 * @param targetFormat - Preferred output format ('hex', 'rgb', 'hsl', etc.)
 * @returns CSS color string (e.g., '#ff0000', 'rgba(255, 0, 0, 0.5)')
 *
 * @example
 * ```typescript
 * const color = { colorSpace: 'srgb', components: [1, 0, 0], alpha: 0.8 };
 * const css = colorValueToCSS(color); // 'rgba(255, 0, 0, 0.8)'
 * ```
 */
export function colorValueToCSS(
  colorValue: { colorSpace: string; components: number[]; alpha?: number },
  targetFormat: string = 'hex'
): string {
  const { colorSpace, components, alpha } = colorValue;

  // Handle alpha channel
  const hasAlpha = alpha !== undefined && alpha < 1;

  // Convert to RGB first for most color spaces
  let rgb: RGB | null = null;

  switch (colorSpace) {
    case 'srgb':
      if (components.length >= 3) {
        rgb = {
          r: Math.round(components[0] * 255),
          g: Math.round(components[1] * 255),
          b: Math.round(components[2] * 255),
        };
      }
      break;
    case 'oklch':
      if (components.length >= 3) {
        // Convert oklch to rgb via helper
        const oklch: OKLCH = {
          L: components[0],
          c: components[1],
          h: components[2],
        };
        const rgbFromOklch = parseCssColorToRgb(
          `oklch(${oklch.L} ${oklch.c} ${oklch.h})`
        );
        if (rgbFromOklch) rgb = rgbFromOklch;
      }
      break;
    case 'oklab':
      if (components.length >= 3) {
        const oklab: OKLAB = {
          L: components[0],
          a: components[1],
          b: components[2],
        } as OKLAB;
        const rgbFromOklab = parseCssColorToRgb(
          `oklab(${oklab.L} ${oklab.a} ${oklab.b})`
        );
        if (rgbFromOklab) rgb = rgbFromOklab;
      }
      break;
    // Add more color space conversions as needed
    default: {
      // Fallback: try to parse as CSS color string
      const cssString = `${colorSpace}(${components.join(' ')})`;
      const parsed = parseCssColorToRgb(cssString);
      if (parsed) rgb = parsed;
      break;
    }
  }

  if (!rgb) {
    // Fallback: construct CSS color string directly
    return `${colorSpace}(${components.join(' ')}${hasAlpha ? ` / ${alpha}` : ''})`;
  }

  // Convert to target format
  switch (targetFormat) {
    case 'rgb':
      return hasAlpha
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl: HSL = rgbToHsl(rgb);
      return hasAlpha
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
        : formatHsl(hsl);
    }
    case 'oklch': {
      const oklch: OKLCH = rgbToOklch(rgb);
      return hasAlpha
        ? `oklch(${oklch.L} ${oklch.c} ${oklch.h} / ${alpha})`
        : formatOklch(oklch.L, oklch.c, oklch.h);
    }
    case 'hex':
    default: {
      const hex: string = rgbToHex(rgb as RGB);
      return hasAlpha && alpha !== undefined
        ? hex +
            Math.round(alpha * 255)
              .toString(16)
              .padStart(2, '0')
        : hex;
    }
  }
}

/**
 * Convert DTCG 1.0 structured dimension value to CSS string.
 *
 * @param dimensionValue - DTCG 1.0 structured dimension value
 * @returns CSS dimension string (e.g., '16px', '1.5rem')
 *
 * @example
 * ```typescript
 * const dimension = { value: 16, unit: 'px' };
 * const css = dimensionValueToCSS(dimension); // '16px'
 * ```
 */
export function dimensionValueToCSS(dimensionValue: {
  value: number;
  unit: string;
}): string {
  return `${dimensionValue.value}${dimensionValue.unit}`;
}

/**
 * Built-in transforms for common token types
 * Supports both legacy string/number values and DTCG 1.0 structured values
 */
export const builtInTransforms: Transform[] = [
  // Dimension transform: structured DTCG 1.0 values or legacy numbers to CSS units
  {
    match: ({ type }) => type === 'dimension',
    apply: (value, ctx) => {
      // Handle DTCG 1.0 structured dimension value
      if (isStructuredDimensionValue(value)) {
        return dimensionValueToCSS(value);
      }
      // Handle legacy number values
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.dimension ?? 'px';
        return `${value}${unit}`;
      }
      // Handle legacy string values (e.g., "10px")
      if (typeof value === 'string') {
        return value;
      }
      return value;
    },
  },

  // Duration transform: numbers to time units
  {
    match: ({ type }) => type === 'duration',
    apply: (value, ctx) => {
      if (typeof value === 'number') {
        const unit = ctx.config.unitPreferences?.duration ?? 'ms';
        return unit === 's' ? `${value / 1000}s` : `${value}ms`;
      }
      return value;
    },
  },

  // Color transform: normalize color formats (supports DTCG 1.0 structured values)
  {
    match: ({ type }) => type === 'color',
    apply: (value, ctx) => {
      // Handle DTCG 1.0 structured color value
      if (isStructuredColorValue(value)) {
        const target = ctx.config.unitPreferences?.color ?? 'hex';
        return colorValueToCSS(
          value as { colorSpace: string; components: number[]; alpha?: number },
          target
        );
      }
      // Handle legacy string values (hex, rgb, hsl, etc.)
      if (typeof value !== 'string') return value;
      const target = ctx.config.unitPreferences?.color ?? 'hex';
      const rgb = parseCssColorToRgb(value);
      if (!rgb) return value; // leave unknown formats intact
      switch (target) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl': {
          const hsl = rgbToHsl(rgb);
          return formatHsl(hsl as { h: number; s: number; l: number });
        }
        case 'oklch': {
          const oklch = rgbToOklch(rgb);
          return formatOklch(oklch.L, oklch.c, oklch.h);
        }
        case 'hex':
        default:
          return rgbToHex(rgb as { r: number; g: number; b: number });
      }
    },
  },

  // Border transform: add default border style
  {
    match: ({ path }) => path.endsWith('.border'),
    apply: (value) => {
      if (typeof value === 'string' && !value.includes(' ')) {
        return `1px solid ${value}`;
      }
      return value;
    },
  },

  // Typography transform: convert typography objects to CSS (supports DTCG 1.0 structured values)
  {
    match: ({ type }) => type === 'typography',
    apply: (value) => {
      if (typeof value === 'object' && value !== null) {
        const typo = value as Record<string, unknown>;
        const parts: string[] = [];

        if (typo.fontFamily) {
          const fontFamily =
            typeof typo.fontFamily === 'string'
              ? typo.fontFamily
              : String(typo.fontFamily);
          parts.push(`font-family: ${fontFamily}`);
        }
        if (typo.fontSize) {
          const fontSize = isStructuredDimensionValue(typo.fontSize)
            ? dimensionValueToCSS(typo.fontSize)
            : String(typo.fontSize);
          parts.push(`font-size: ${fontSize}`);
        }
        if (typo.fontWeight) {
          parts.push(`font-weight: ${typo.fontWeight}`);
        }
        if (typo.lineHeight) {
          const lineHeight = isStructuredDimensionValue(typo.lineHeight)
            ? dimensionValueToCSS(typo.lineHeight)
            : String(typo.lineHeight);
          parts.push(`line-height: ${lineHeight}`);
        }
        if (typo.letterSpacing) {
          const letterSpacing = isStructuredDimensionValue(typo.letterSpacing)
            ? dimensionValueToCSS(typo.letterSpacing)
            : String(typo.letterSpacing);
          parts.push(`letter-spacing: ${letterSpacing}`);
        }

        return parts.join('; ');
      }
      return value;
    },
  },

  // Shadow transform: convert shadow objects to CSS (supports DTCG 1.0 structured values)
  {
    match: ({ type }) => type === 'shadow',
    apply: (value) => {
      if (Array.isArray(value)) {
        return value
          .map((shadow) => {
            if (typeof shadow === 'string') return shadow;
            return shadowValueToCSS(shadow as Record<string, unknown>);
          })
          .join(', ');
      }
      if (typeof value === 'object' && value !== null) {
        return shadowValueToCSS(value as Record<string, unknown>);
      }
      return value;
    },
  },
];

/**
 * Convert DTCG 1.0 structured shadow value to CSS string
 */
export function shadowValueToCSS(shadow: Record<string, unknown>): string {
  const parts: string[] = [];

  // Handle offsetX and offsetY
  const offsetX = shadow.offsetX;
  const offsetY = shadow.offsetY;
  if (offsetX !== undefined && offsetY !== undefined) {
    const x =
      typeof offsetX === 'string'
        ? offsetX
        : isStructuredDimensionValue(offsetX)
          ? dimensionValueToCSS(offsetX)
          : String(offsetX);
    const y =
      typeof offsetY === 'string'
        ? offsetY
        : isStructuredDimensionValue(offsetY)
          ? dimensionValueToCSS(offsetY)
          : String(offsetY);
    parts.push(`${x} ${y}`);
  }

  // Handle blur
  if (shadow.blur !== undefined) {
    const blur =
      typeof shadow.blur === 'string'
        ? shadow.blur
        : isStructuredDimensionValue(shadow.blur)
          ? dimensionValueToCSS(shadow.blur)
          : String(shadow.blur);
    parts.push(blur);
  }

  // Handle spread
  if (shadow.spread !== undefined) {
    const spread =
      typeof shadow.spread === 'string'
        ? shadow.spread
        : isStructuredDimensionValue(shadow.spread)
          ? dimensionValueToCSS(shadow.spread)
          : String(shadow.spread);
    parts.push(spread);
  }

  // Handle color
  if (shadow.color !== undefined) {
    const color =
      typeof shadow.color === 'string'
        ? shadow.color
        : isStructuredColorValue(shadow.color)
          ? colorValueToCSS(
              shadow.color as {
                colorSpace: string;
                components: number[];
                alpha?: number;
              }
            )
          : String(shadow.color);
    parts.push(color);
  }

  // Handle inset
  if (shadow.inset === true) {
    parts.unshift('inset');
  }

  return parts.join(' ');
}
