/**
 * Color Space Conversion Utilities (Hub-Based Architecture)
 *
 * This module provides a hub-based color space conversion system using RGB and XYZ
 * as intermediate color spaces. All conversions go through these hubs for consistency
 * and maintainability.
 *
 * Architecture:
 * - RGB Hub: Hex, HSL, HSV, OKLab, OKLCh
 * - XYZ Hub: LAB, LCH (perceptual color spaces)
 *
 * @example
 * ```typescript
 * import { convertColor } from '@/utils/helpers/colorFromTo';
 * import type { RGB, HSL, LAB } from '@/utils/helpers/colorHelpers';
 *
 * const rgb: RGB = { r: 255, g: 0, b: 128 };
 * const hsl = convertColor(rgb, 'rgb', 'hsl');
 * const lab = convertColor(hsl, 'hsl', 'lab');
 * ```
 *
 * @author @darianrosebrook
 */

import type { RGB, HSL, LAB, LCH, XYZ } from './colorHelpers';
import {
  D65_WHITE_POINT,
  sRgbToLinearRgbChannel,
  linearRgbToSRgbChannel,
} from './colorHelpers';

// CIE constants
const KAPPA = 24389 / 27;
const EPSILON = 216 / 24389;

/**
 * Supported color space identifiers
 */
export type ColorSpace =
  | 'rgb'
  | 'hex'
  | 'hsl'
  | 'hsv'
  | 'xyz'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch';

/**
 * Color value union type
 */
export type ColorValue<T extends ColorSpace> = T extends 'rgb'
  ? RGB
  : T extends 'hex'
    ? string
    : T extends 'hsl'
      ? HSL
      : T extends 'hsv'
        ? { h: number; s: number; v: number }
        : T extends 'xyz'
          ? XYZ
          : T extends 'lab'
            ? LAB
            : T extends 'lch'
              ? LCH
              : T extends 'oklab'
                ? { L: number; a: number; b: number }
                : T extends 'oklch'
                  ? { L: number; c: number; h: number }
                  : never;

// ============================================================================
// RGB Hub Conversions
// ============================================================================

/**
 * Convert Hex to RGB (RGB Hub)
 */
export function hexToRgb(hex: string): RGB | null {
  if (!hex || typeof hex !== 'string') {
    return null;
  }
  const sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;

  if (sanitizedHex.length === 3) {
    const r = parseInt(sanitizedHex[0] + sanitizedHex[0], 16);
    const g = parseInt(sanitizedHex[1] + sanitizedHex[1], 16);
    const b = parseInt(sanitizedHex[2] + sanitizedHex[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  if (sanitizedHex.length === 6) {
    const r = parseInt(sanitizedHex.substring(0, 2), 16);
    const g = parseInt(sanitizedHex.substring(2, 4), 16);
    const b = parseInt(sanitizedHex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  return null;
}

/**
 * Convert RGB to Hex (RGB Hub)
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const toHex = (c: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSL to RGB (RGB Hub)
 */
export function hslToRgb({ h, s, l }: HSL): RGB {
  h = (((h % 360) + 360) % 360) / 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSL (RGB Hub)
 */
export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSV to RGB (RGB Hub)
 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h = ((h % 360) + 360) / 360;
  s = Math.max(0, Math.min(1, s / 100));
  v = Math.max(0, Math.min(1, v / 100));

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let R = 0,
    G = 0,
    B = 0;
  switch (i % 6) {
    case 0:
      R = v;
      G = t;
      B = p;
      break;
    case 1:
      R = q;
      G = v;
      B = p;
      break;
    case 2:
      R = p;
      G = v;
      B = t;
      break;
    case 3:
      R = p;
      G = q;
      B = v;
      break;
    case 4:
      R = t;
      G = p;
      B = v;
      break;
    case 5:
      R = v;
      G = p;
      B = q;
      break;
  }

  return {
    r: Math.round(R * 255),
    g: Math.round(G * 255),
    b: Math.round(B * 255),
  };
}

/**
 * Convert RGB to HSV (RGB Hub)
 */
export function rgbToHsv(
  r: number,
  g: number,
  b: number
): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h, s: s * 100, v: v * 100 };
}

/**
 * Convert OKLab to RGB (RGB Hub)
 */
export function oklabToRgb(L: number, a: number, b: number): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const Lp = l_ ** 3;
  const Mp = m_ ** 3;
  const Sp = s_ ** 3;

  const R = +4.0767416621 * Lp - 3.3077115913 * Mp + 0.2309699292 * Sp;
  const G = -1.2684380046 * Lp + 2.6097574011 * Mp - 0.3413193965 * Sp;
  const B = -0.0041960863 * Lp - 0.7034186147 * Mp + 1.707614701 * Sp;

  const to255 = (v: number) => {
    v = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, v)) * 255);
  };
  return { r: to255(R), g: to255(G), b: to255(B) };
}

/**
 * Convert RGB to OKLab (RGB Hub)
 */
export function rgbToOklab(
  r: number,
  g: number,
  b: number
): { L: number; a: number; b: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  r = r <= 0.04045 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4;
  g = g <= 0.04045 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4;
  b = b <= 0.04045 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4;

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/**
 * Convert OKLCh to OKLab (cylindrical transform)
 */
export function oklchToOklab(
  L: number,
  c: number,
  h: number
): { L: number; a: number; b: number } {
  const rad = (h * Math.PI) / 180;
  return {
    L,
    a: c * Math.cos(rad),
    b: c * Math.sin(rad),
  };
}

/**
 * Convert OKLab to OKLCh (cylindrical transform)
 */
export function oklabToOklch(
  L: number,
  a: number,
  b: number
): { L: number; c: number; h: number } {
  const c = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, c, h };
}

// ============================================================================
// XYZ Hub Conversions
// ============================================================================

/**
 * Convert RGB to XYZ (XYZ Hub)
 */
export function rgbToXyz({ r, g, b }: RGB): XYZ {
  const R_linear = sRgbToLinearRgbChannel(r);
  const G_linear = sRgbToLinearRgbChannel(g);
  const B_linear = sRgbToLinearRgbChannel(b);

  const x = R_linear * 0.4124564 + G_linear * 0.3575761 + B_linear * 0.1804375;
  const y = R_linear * 0.2126729 + G_linear * 0.7151522 + B_linear * 0.072175;
  const z = R_linear * 0.0193339 + G_linear * 0.119192 + B_linear * 0.9503041;

  return { x, y, z };
}

/**
 * Convert XYZ to RGB (XYZ Hub)
 */
export function xyzToRgb({ x, y, z }: XYZ): RGB {
  const R_linear = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const G_linear = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const B_linear = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  const r = linearRgbToSRgbChannel(R_linear);
  const g = linearRgbToSRgbChannel(G_linear);
  const b = linearRgbToSRgbChannel(B_linear);

  return { r, g, b };
}

/**
 * Convert XYZ to LAB (XYZ Hub)
 */
export function xyzToLab({ x, y, z }: XYZ): LAB {
  const x_n = x / D65_WHITE_POINT.x;
  const y_n = y / D65_WHITE_POINT.y;
  const z_n = z / D65_WHITE_POINT.z;

  const f = (t: number): number =>
    t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;

  const fx = f(x_n);
  const fy = f(y_n);
  const fz = f(z_n);

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_lab = 200 * (fy - fz);

  return { l, a, b: b_lab };
}

/**
 * Convert LAB to XYZ (XYZ Hub)
 */
export function labToXyz({ l, a, b }: LAB): XYZ {
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const f_inv = (t: number): number =>
    Math.pow(t, 3) > EPSILON ? Math.pow(t, 3) : (116 * t - 16) / KAPPA;

  const x_n = f_inv(fx);
  const y_n = l > KAPPA * EPSILON ? Math.pow(fy, 3) : l / KAPPA;
  const z_n = f_inv(fz);

  const x = x_n * D65_WHITE_POINT.x;
  const y = y_n * D65_WHITE_POINT.y;
  const z = z_n * D65_WHITE_POINT.z;

  return { x, y, z };
}

/**
 * Convert LAB to LCH (cylindrical transform)
 */
export function labToLch({ l, a, b }: LAB): LCH {
  const c = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * (180 / Math.PI);
  if (h < 0) {
    h += 360;
  }
  return { l, c, h };
}

/**
 * Convert LCH to LAB (cylindrical transform)
 */
export function lchToLab({ l, c, h }: LCH): LAB {
  const rad = (h * Math.PI) / 180;
  return {
    l,
    a: c * Math.cos(rad),
    b: c * Math.sin(rad),
  };
}

// ============================================================================
// Generic Conversion Function
// ============================================================================

/**
 * Convert a color from one color space to another using hub-based routing.
 *
 * All conversions go through RGB or XYZ hubs for consistency:
 * - RGB Hub: hex, hsl, hsv, oklab, oklch
 * - XYZ Hub: lab, lch (perceptual spaces)
 *
 * @param color - The color value to convert
 * @param from - Source color space
 * @param to - Target color space
 * @returns Converted color value
 *
 * @example
 * ```typescript
 * const rgb: RGB = { r: 255, g: 0, b: 128 };
 * const hsl = convertColor(rgb, 'rgb', 'hsl');
 * const lab = convertColor(hsl, 'hsl', 'lab');
 * ```
 */
export function convertColor<TFrom extends ColorSpace, TTo extends ColorSpace>(
  color: ColorValue<TFrom>,
  from: TFrom,
  to: TTo
): ColorValue<TTo> {
  // Same color space, return as-is
  if ((from as string) === (to as string)) {
    return color as unknown as ColorValue<TTo>;
  }

  // Determine which hub to use
  const rgbHubSpaces: ColorSpace[] = [
    'rgb',
    'hex',
    'hsl',
    'hsv',
    'oklab',
    'oklch',
  ];
  const xyzHubSpaces: ColorSpace[] = ['xyz', 'lab', 'lch'];

  const fromIsRgbHub = rgbHubSpaces.includes(from);
  const toIsRgbHub = rgbHubSpaces.includes(to);
  const fromIsXyzHub = xyzHubSpaces.includes(from);
  const toIsXyzHub = xyzHubSpaces.includes(to);

  // Convert to RGB hub if needed
  let rgb: RGB | null = null;
  if (fromIsRgbHub) {
    if (from === 'rgb') {
      rgb = color as RGB;
    } else if (from === 'hex') {
      rgb = hexToRgb(color as string);
      if (!rgb) throw new Error(`Invalid hex color: ${color}`);
    } else if (from === 'hsl') {
      rgb = hslToRgb(color as HSL);
    } else if (from === 'hsv') {
      const hsv = color as { h: number; s: number; v: number };
      rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
    } else if (from === 'oklab') {
      const oklab = color as { L: number; a: number; b: number };
      rgb = oklabToRgb(oklab.L, oklab.a, oklab.b);
    } else if (from === 'oklch') {
      const oklch = color as { L: number; c: number; h: number };
      const oklab = oklchToOklab(oklch.L, oklch.c, oklch.h);
      rgb = oklabToRgb(oklab.L, oklab.a, oklab.b);
    }
  } else if (fromIsXyzHub) {
    // Convert through XYZ → RGB
    let xyz: XYZ;
    if (from === 'xyz') {
      xyz = color as XYZ;
    } else if (from === 'lab') {
      xyz = labToXyz(color as LAB);
    } else if (from === 'lch') {
      const lab = lchToLab(color as LCH);
      xyz = labToXyz(lab);
    } else {
      throw new Error(`Unsupported color space: ${from}`);
    }
    rgb = xyzToRgb(xyz);
  } else {
    throw new Error(`Unsupported color space: ${from}`);
  }

  if (!rgb) {
    throw new Error(`Failed to convert ${from} to RGB`);
  }

  // Convert from RGB hub to target
  if (toIsRgbHub) {
    if (to === 'rgb') {
      return rgb as ColorValue<TTo>;
    } else if (to === 'hex') {
      return rgbToHex(rgb) as ColorValue<TTo>;
    } else if (to === 'hsl') {
      return rgbToHsl(rgb) as ColorValue<TTo>;
    } else if (to === 'hsv') {
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      return hsv as ColorValue<TTo>;
    } else if (to === 'oklab') {
      const oklab = rgbToOklab(rgb.r, rgb.g, rgb.b);
      return oklab as ColorValue<TTo>;
    } else if (to === 'oklch') {
      const oklab = rgbToOklab(rgb.r, rgb.g, rgb.b);
      const oklch = oklabToOklch(oklab.L, oklab.a, oklab.b);
      return oklch as ColorValue<TTo>;
    }
  } else if (toIsXyzHub) {
    // Convert through RGB → XYZ
    const xyz = rgbToXyz(rgb);
    if (to === 'xyz') {
      return xyz as ColorValue<TTo>;
    } else if (to === 'lab') {
      return xyzToLab(xyz) as ColorValue<TTo>;
    } else if (to === 'lch') {
      const lab = xyzToLab(xyz);
      return labToLch(lab) as ColorValue<TTo>;
    }
  }

  throw new Error(`Unsupported color space: ${to}`);
}
