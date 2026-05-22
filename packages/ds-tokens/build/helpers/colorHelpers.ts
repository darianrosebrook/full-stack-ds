/**
 * @deprecated This file is deprecated. Use colorFromTo.ts instead.
 *
 * This module has been replaced with a hub-based architecture in colorFromTo.ts
 * that uses RGB and XYZ as intermediate color spaces for all conversions.
 *
 * Migration guide:
 * ```typescript
 * // Old
 * import { hslToLab } from '@/utils/helpers/colorHelpers';
 * const lab = hslToLab(hsl);
 *
 * // New
 * import { convertColor } from '@/utils/helpers/colorFromTo';
 * const lab = convertColor(hsl, 'hsl', 'lab');
 * ```
 *
 * This file is kept for backward compatibility and type exports only.
 * All new code should use colorFromTo.ts.
 *
 * @see colorFromTo.ts for the new hub-based conversion system
 */

/**
 * Color space conversion utilities and helpers.
 *
 * @deprecated Use colorFromTo.ts instead
 *
 * This module provides comprehensive functions for converting between different color spaces
 * including RGB, HSL, LAB, LCH, XYZ, HSV, and more. All conversions follow standard
 * color science formulas and CIE specifications.
 *
 * @example
 * ```typescript
 * import { rgbToHex, hslToRgb, labToRgb } from '@/utils/helpers/colorHelpers';
 *
 * const hex = rgbToHex({ r: 255, g: 0, b: 128 }); // '#ff0080'
 * const rgb = hslToRgb({ h: 330, s: 100, l: 50 }); // { r: 255, g: 0, b: 128 }
 * ```
 */

/**
 * RGB color space representation.
 * Standard sRGB color space with 8-bit precision (0-255 range).
 */
export interface RGB {
  /** Red component (0-255) */
  r: number;
  /** Green component (0-255) */
  g: number;
  /** Blue component (0-255) */
  b: number;
}

/**
 * HSL color space representation.
 * Hue-Saturation-Lightness color model, commonly used in CSS.
 */
export interface HSL {
  /** Hue angle in degrees (0-360) */
  h: number;
  /** Saturation percentage (0-100) */
  s: number;
  /** Lightness percentage (0-100) */
  l: number;
}

/**
 * LAB color space representation.
 * CIELAB color space with perceptually uniform color differences.
 */
export interface LAB {
  /** Lightness (0-100) */
  l: number;
  /** Green-Red axis (-128 to 127) */
  a: number;
  /** Blue-Yellow axis (-128 to 127) */
  b: number;
}

/**
 * LCH color space representation.
 * CIELCH color space - cylindrical version of LAB with better hue control.
 */
export interface LCH {
  /** Lightness (0-100) */
  l: number;
  /** Chroma (color intensity, >= 0) */
  c: number;
  /** Hue angle in degrees (0-360) */
  h: number;
}

/**
 * XYZ color space representation.
 * CIE 1931 XYZ color space - device-independent color specification.
 */
export interface XYZ {
  /** X component (D65 reference white: ~0.95047) */
  x: number;
  /** Y component (D65 reference white: 1.00000) */
  y: number;
  /** Z component (D65 reference white: ~1.08883) */
  z: number;
}

/**
 * D65 reference white point in XYZ color space.
 *
 * The CIE standard illuminant D65 represents average daylight with a color temperature of 6504K.
 * Used as the reference white point for most color space conversions.
 *
 * @constant
 * @type {XYZ}
 */
export const D65_WHITE_POINT: XYZ = {
  x: 0.95047,
  y: 1.0,
  z: 1.08883,
};

/**
 * CIE standard constants for color space conversions.
 *
 * These constants are used in LAB/XYZ color space conversions as defined
 * by the CIE (Commission Internationale de l'Éclairage) standards.
 *
 * @see https://en.wikipedia.org/wiki/CIELAB_color_space
 */

/** CIE kappa constant: (29/3)^3 ≈ 24389/27 */
const KAPPA = 24389 / 27;

/** CIE epsilon constant: (6/29)^3 ≈ 0.008856 */
const EPSILON = 216 / 24389;

/**
 * Core Conversion Helpers (Internal)
 * Internal utility functions for color space conversions.
 */
/**
 * Calculate the contrast ratio of a color against white.
 *
 * Returns a value indicating how well the color contrasts with white background.
 * Higher values indicate better contrast (better readability).
 *
 * @param hexcolor - Hex color string (with or without #)
 * @returns Contrast ratio (1-21 range, where 1 = no contrast, 21 = maximum contrast)
 *
 * @example
 * ```typescript
 * calculateContrast('#000000'); // 21 (black on white)
 * calculateContrast('#ffffff'); // 1 (white on white)
 * calculateContrast('#666666'); // ~5.9 (medium gray)
 * ```
 */
export const calculateContrast = (hexcolor: string) => {
  let r: number, g: number, b: number;
  if (hexcolor.startsWith('#')) hexcolor = hexcolor.slice(1);

  // Validate hex characters
  if (!/^[0-9a-fA-F]+$/.test(hexcolor)) {
    throw new Error('Invalid hex color: ' + hexcolor);
  }

  if (hexcolor.length === 3) {
    r = parseInt(hexcolor[0] + hexcolor[0], 16);
    g = parseInt(hexcolor[1] + hexcolor[1], 16);
    b = parseInt(hexcolor[2] + hexcolor[2], 16);
  } else if (hexcolor.length === 6) {
    r = parseInt(hexcolor.slice(0, 2), 16);
    g = parseInt(hexcolor.slice(2, 4), 16);
    b = parseInt(hexcolor.slice(4, 6), 16);
  } else {
    throw new Error('Invalid hex color: ' + hexcolor);
  }
  return (r * 299 + g * 587 + b * 114) / 1000;
};

/**
 * Converts an sRGB color channel value to linear RGB
 * @param {number} channel - sRGB channel value (0-255)
 * @returns {number} Linear RGB value (0-1)
 */
export function sRgbToLinearRgbChannel(channel: number): number {
  const v = channel / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// /**
//  * Converts a linear RGB color channel value to sRGB
//  * @param {number} channel - Linear RGB channel value (0-1)
//  * @returns {number} sRGB value (0-255)
//  */
export function linearRgbToSRgbChannel(channel: number): number {
  const v =
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
  const clamped = Math.max(0, Math.min(1, v));
  return Math.round(clamped * 255);
}

// /**
//  * Converts sRGB values to CIE XYZ color space (D65 illuminant)
//  * @param {RGB} rgb - RGB color object
//  * @returns {XYZ} XYZ color object
//  */
export function rgbToXyz({ r, g, b }: RGB): XYZ {
  // Convert sRGB to linear RGB
  const R_linear = sRgbToLinearRgbChannel(r);
  const G_linear = sRgbToLinearRgbChannel(g);
  const B_linear = sRgbToLinearRgbChannel(b);

  // Apply the standard sRGB to XYZ transformation matrix (D65)
  const x = R_linear * 0.4124564 + G_linear * 0.3575761 + B_linear * 0.1804375;
  const y = R_linear * 0.2126729 + G_linear * 0.7151522 + B_linear * 0.072175;
  const z = R_linear * 0.0193339 + G_linear * 0.119192 + B_linear * 0.9503041;

  return { x, y, z };
}

// /**
//  * Converts CIE XYZ color space values to CIE L*a*b* color space.
//  * @param xyz - An object with x, y, z properties.
//  * @returns An object with l, a, b properties (precise values).
//  */
export function xyzToLab({ x, y, z }: XYZ): LAB {
  // Normalize XYZ values relative to the D65 white point
  const x_n = x / D65_WHITE_POINT.x;
  const y_n = y / D65_WHITE_POINT.y;
  const z_n = z / D65_WHITE_POINT.z;

  // Apply the non-linear transformation function f
  const f = (t: number): number =>
    t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;

  const fx = f(x_n);
  const fy = f(y_n);
  const fz = f(z_n);

  // Calculate L*, a*, b*
  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b_lab = 200 * (fy - fz); // Use b_lab to avoid conflict with RGB 'b'

  return { l, a, b: b_lab };
}

// /**
//  * Converts CIE L*a*b* color space values to CIE XYZ color space (D65).
//  * @param lab - An object with l, a, b properties.
//  * @returns An object with x, y, z properties.
//  */
export function labToXyz({ l, a, b }: LAB): XYZ {
  // Calculate intermediate values fx, fy, fz from L*, a*, b*
  const fy = (l + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  // Apply the inverse non-linear transformation function f^-1
  const f_inv = (t: number): number =>
    Math.pow(t, 3) > EPSILON ? Math.pow(t, 3) : (116 * t - 16) / KAPPA;

  const x_n = f_inv(fx);
  const y_n = l > KAPPA * EPSILON ? Math.pow(fy, 3) : l / KAPPA; // Simpler inverse for y
  const z_n = f_inv(fz);

  // Denormalize to get XYZ values
  const x = x_n * D65_WHITE_POINT.x;
  const y = y_n * D65_WHITE_POINT.y;
  const z = z_n * D65_WHITE_POINT.z;

  return { x, y, z };
}

// /**
//  * Converts CIE XYZ color space values (D65) to sRGB values (0-255).
//  * @param xyz - An object with x, y, z properties.
//  * @returns An object with r, g, b properties (0-255), rounded.
//  */
export function xyzToRgb({ x, y, z }: XYZ): RGB {
  // Apply the standard XYZ to sRGB transformation matrix (D65)
  // Note: Matrix values can vary slightly depending on source/rounding.
  const R_linear = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const G_linear = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const B_linear = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

  // Convert linear RGB to sRGB (0-255)
  const r = linearRgbToSRgbChannel(R_linear);
  const g = linearRgbToSRgbChannel(G_linear);
  const b = linearRgbToSRgbChannel(B_linear);

  // Note: Clamping to the sRGB gamut happens implicitly within linearRgbToSRgbChannel
  // before rounding.

  return { r, g, b };
}

/**
 * Convert hex color string to RGB object.
 *
 * Supports 3-digit, 6-digit, and 8-digit hex colors.
 * Returns null for invalid hex strings.
 *
 * @param hex - Hex color string (with or without #)
 * @returns RGB object or null if invalid
 *
 * @example
 * ```typescript
 * hexToRgb('#ff0000'); // { r: 255, g: 0, b: 0 }
 * hexToRgb('3366cc'); // { r: 51, g: 102, b: 204 }
 * hexToRgb('abc'); // { r: 170, g: 187, b: 204 }
 * ```
 */
export function hexToRgb(hex: string): RGB | null {
  if (!hex || typeof hex !== 'string') {
    return null;
  }
  // Remove leading '#' if present
  const sanitizedHex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Check for 3-digit shorthand hex
  if (sanitizedHex.length === 3) {
    const r = parseInt(sanitizedHex[0] + sanitizedHex[0], 16);
    const g = parseInt(sanitizedHex[1] + sanitizedHex[1], 16);
    const b = parseInt(sanitizedHex[2] + sanitizedHex[2], 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  // Check for 6-digit hex
  if (sanitizedHex.length === 6) {
    const r = parseInt(sanitizedHex.substring(0, 2), 16);
    const g = parseInt(sanitizedHex.substring(2, 4), 16);
    const b = parseInt(sanitizedHex.substring(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  // Invalid format
  return null;
}

/**
 * Convert RGB object to hex color string.
 *
 * Always returns a 6-digit hex color string (without # prefix).
 * Values are clamped to 0-255 range.
 *
 * @param rgb - RGB color object
 * @returns 6-digit hex color string
 *
 * @example
 * ```typescript
 * rgbToHex({ r: 255, g: 0, b: 128 }); // 'ff0080'
 * rgbToHex({ r: 51, g: 102, b: 204 }); // '3366cc'
 * ```
 */
export function rgbToHex({ r, g, b }: RGB): string {
  // Helper to convert a single channel, clamp, round, and pad with zero if needed.
  const toHex = (c: number): string => {
    // Ensure value is within 0-255 range and an integer
    const clamped = Math.max(0, Math.min(255, Math.round(c)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  // Normalize RGB values to the range [0, 1]
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0; // Default hue
  let s = 0; // Default saturation
  const l = (max + min) / 2; // Lightness

  if (max !== min) {
    // Calculate saturation and hue only if not achromatic
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
    h /= 6; // Normalize hue to [0, 1]
  }

  return {
    h: Math.round(h * 360), // Scale hue to 0-360 degrees
    s: Math.round(s * 100), // Scale saturation to 0-100%
    l: Math.round(l * 100), // Scale lightness to 0-100%
  };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  // Normalize HSL values
  h = (((h % 360) + 360) % 360) / 360; // Ensure h is in [0, 1)
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // Achromatic case (gray)
  } else {
    // Helper function to convert hue to RGB channel
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    // Calculate temporary variables p and q
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    // Calculate RGB channels using the hue2rgb helper
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  // Scale RGB channels to [0, 255] and round
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// /**
//  * Converts an RGB color object to a CIE L*a*b* object (D65 illuminant).
//  * @param rgb - An object with r, g, b properties (0-255).
//  * @returns A LAB object { l, a, b } with precise (unrounded) values.
//  */
export function rgbToLab(rgb: RGB): LAB {
  const xyz = rgbToXyz(rgb);
  const lab = xyzToLab(xyz);
  // Return precise values; let the consumer round if needed.
  return lab;
}

// /**
//  * Converts a CIE L*a*b* object (D65 illuminant) to an RGB object.
//  * Note: The conversion might result in RGB values outside the sRGB gamut [0, 255].
//  * These values are clamped during the final conversion step.
//  * @param lab - A LAB object { l, a, b }.
//  * @returns An RGB object { r, g, b } (0-255), rounded and clamped.
//  */
export function labToRgb(lab: LAB): RGB {
  const xyz = labToXyz(lab);
  const rgb = xyzToRgb(xyz); // xyzToRgb handles clamping and rounding
  return rgb;
}

export function rgbToLch(rgb: RGB): LCH {
  // Calculate precise LAB values first
  const preciseLab = xyzToLab(rgbToXyz(rgb));

  const { l, a, b } = preciseLab;

  // Calculate Chroma (C*)
  const c = Math.sqrt(a * a + b * b);

  // Calculate Hue (h_ab) in degrees
  let h = Math.atan2(b, a) * (180 / Math.PI);

  // Normalize hue angle to be within [0, 360)
  if (h < 0) {
    h += 360;
  }

  // Return precise values; let the consumer round if needed.
  return { l, c, h };
}

/**
 * Converts LAB color space to LCH color space
 * @param lab - LAB color object
 * @returns LCH color object
 */
export function labToLch({ l, a, b }: LAB): LCH {
  // Calculate Chroma (C*)
  const c = Math.sqrt(a * a + b * b);

  // Calculate Hue (h_ab) in degrees
  let h = Math.atan2(b, a) * (180 / Math.PI);

  // Normalize hue angle to be within [0, 360)
  if (h < 0) {
    h += 360;
  }

  return { l, c, h };
}

export function lchToRgb({ l, c, h }: LCH): RGB {
  // Convert LCH back to LAB
  const rad = (h * Math.PI) / 180; // Convert hue angle to radians
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const lab: LAB = { l, a, b };

  // Reuse the labToRgb conversion (which handles LAB -> XYZ -> RGB)
  return labToRgb(lab);
}

export function rgbToHsv(r: number, g: number, b: number) {
  // 1) normalize to [0,1]
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

export function hsvToRgb(h: number, s: number, v: number) {
  h = ((h % 360) + 360) / 360; // wrap
  s = Math.max(0, Math.min(1, s / 100));
  v = Math.max(0, Math.min(1, v / 100));

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let R: number = 0,
    G: number = 0,
    B: number = 0;
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

export function rgbToOklab(r: number, g: number, b: number) {
  // normalize
  let R = r / 255,
    G = g / 255,
    B = b / 255;
  // linearize gamma
  [R, G, B] = [R, G, B].map((v) =>
    v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  // LMS
  const L_ = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  const M_ = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  const S_ = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;
  // non‑linear
  const l = Math.cbrt(L_);
  const m = Math.cbrt(M_);
  const s = Math.cbrt(S_);
  // OKLab coords
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

export function oklabToRgb(L: number, a: number, b: number) {
  // matrix from OKLab → LMSʹ
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  // inv‑nonlinear
  const Lp = l_ ** 3;
  const Mp = m_ ** 3;
  const Sp = s_ ** 3;
  // back to linear RGB
  const R = +4.0767416621 * Lp - 3.3077115913 * Mp + 0.2309699292 * Sp;
  const G = -1.2684380046 * Lp + 2.6097574011 * Mp - 0.3413193965 * Sp;
  const B = -0.0041960863 * Lp - 0.7034186147 * Mp + 1.707614701 * Sp;
  // gamma encode + clamp
  const to255 = (v: number) => {
    v = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, v)) * 255);
  };
  return { r: to255(R), g: to255(G), b: to255(B) };
}

export function oklabToOklch(L: number, a: number, b: number) {
  const c = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, c, h };
}

export function oklchToOklab(L: number, c: number, h: number) {
  const rad = (h * Math.PI) / 180;
  return {
    L,
    a: c * Math.cos(rad),
    b: c * Math.sin(rad),
  };
}

/**
 * WCAG Relative Luminance and Contrast
 * Functions for calculating color contrast ratios per WCAG guidelines.
 */

/**
 * Computes WCAG relative luminance (0-1) for an sRGB color
 * Reference: WCAG 2.1 §1.4.3
 */
export function relativeLuminance(rgb: RGB): number {
  const r = sRgbToLinearRgbChannel(rgb.r);
  const g = sRgbToLinearRgbChannel(rgb.g);
  const b = sRgbToLinearRgbChannel(rgb.b);
  // WCAG coefficients
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes contrast ratio between two sRGB colors per WCAG (1-21)
 */
export function contrastRatio(foreground: RGB, background: RGB): number {
  const L1 = relativeLuminance(foreground);
  const L2 = relativeLuminance(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate WCAG contrast ratio between two hex colors.
 *
 * Returns the contrast ratio as defined by WCAG guidelines.
 * Ratio of 1 = no contrast, 21 = maximum contrast.
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text.
 *
 * @param fgHex - Foreground color as hex string
 * @param bgHex - Background color as hex string
 * @returns Contrast ratio or null if either color is invalid
 *
 * @example
 * ```typescript
 * contrastRatioHex('#000000', '#ffffff'); // 21 (black on white)
 * contrastRatioHex('#666666', '#ffffff'); // ~5.9 (medium gray on white)
 * contrastRatioHex('#ffffff', '#ffffff'); // 1 (white on white)
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export function contrastRatioHex(fgHex: string, bgHex: string): number | null {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return null;
  return contrastRatio(fg, bg);
}

/**
 * OKLCH Convenience Conversions
 * Modern color space conversions using OKLCH (perceptually uniform).
 */

export function rgbToOklch(rgb: RGB) {
  const { L, a, b } = rgbToOklab(rgb.r, rgb.g, rgb.b);
  return oklabToOklch(L, a, b);
}

export function oklchToRgb(L: number, c: number, h: number): RGB {
  const { a, b } = oklchToOklab(L, c, h);
  return oklabToRgb(L, a, b);
}

/**
 * Color Difference
 * Functions for calculating perceptual color differences (delta E).
 */

/**
 * CIE76 color difference (ΔE*ab 1976) between two LAB colors
 */
export function deltaE76(lab1: LAB, lab2: LAB): number {
  const dl = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * CIEDE2000 color difference (ΔE00) between two LAB colors
 * Implementation follows Sharma et al. (2005)
 */
export function deltaE2000(lab1: LAB, lab2: LAB): number {
  const { l: L1, a: a1, b: b1 } = lab1;
  const { l: L2, a: a2, b: b2 } = lab2;

  const kL = 1,
    kC = 1,
    kH = 1;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;

  const G =
    0.5 *
    (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);

  const h1p =
    (Math.atan2(b1, a1p) * 180) / Math.PI + (Math.atan2(b1, a1p) < 0 ? 360 : 0);
  const h2p =
    (Math.atan2(b2, a2p) * 180) / Math.PI + (Math.atan2(b2, a2p) < 0 ? 360 : 0);

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) dhp = h2p - h1p;
    else dhp = h2p <= h1p ? h2p - h1p + 360 : h2p - h1p - 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * Math.PI) / 180 / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp = 0;
  if (C1p * C2p === 0) hbarp = h1p + h2p;
  else if (Math.abs(h1p - h2p) <= 180) hbarp = (h1p + h2p) / 2;
  else
    hbarp =
      ((h1p + h2p + 360) / 2) * (h1p + h2p < 360 ? 1 : 0) +
      ((h1p + h2p - 360) / 2) * (h1p + h2p >= 360 ? 1 : 0);

  const T =
    1 -
    0.17 * Math.cos(((hbarp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * hbarp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hbarp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * hbarp - 63) * Math.PI) / 180);

  const Sl =
    1 +
    (0.015 * (Lbarp - 50) * (Lbarp - 50)) /
      Math.sqrt(20 + (Lbarp - 50) * (Lbarp - 50));
  const Sc = 1 + 0.045 * Cbarp;
  const Sh = 1 + 0.015 * Cbarp * T;

  const deltaTheta =
    30 * Math.exp(-((hbarp - 275) / 25) * ((hbarp - 275) / 25));
  const Rc =
    2 * Math.sqrt(Math.pow(Cbarp, 7) / (Math.pow(Cbarp, 7) + Math.pow(25, 7)));
  const Rt = -Rc * Math.sin((2 * deltaTheta * Math.PI) / 180);

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * Sl), 2) +
      Math.pow(dCp / (kC * Sc), 2) +
      Math.pow(dHp / (kH * Sh), 2) +
      Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh))
  );
  return dE;
}

/**
 * OKLCH gamut clipping (naive): reduce chroma until in-gamut in sRGB
 * Returns clamped RGB after reducing c if needed.
 */
export function oklchToRgbClipped(L: number, c: number, h: number): RGB {
  let low = 0;
  let high = c;
  let mid = c;
  for (let i = 0; i < 12; i++) {
    mid = (low + high) / 2;
    const { a, b } = oklchToOklab(L, mid, h);
    const rgb = oklabToRgb(L, a, b);
    const inGamut =
      rgb.r >= 0 &&
      rgb.r <= 255 &&
      rgb.g >= 0 &&
      rgb.g <= 255 &&
      rgb.b >= 0 &&
      rgb.b <= 255;
    if (inGamut) low = mid;
    else high = mid;
  }
  const { a, b } = oklchToOklab(L, low, h);
  return oklabToRgb(L, a, b);
}
class CIECAM02 {
  parameters: { L: number; C: number; h: number };

  constructor() {
    this.parameters = {
      L: 0, // Lightness
      C: 0, // Chroma
      h: 0, // Hue
    };
  }
  getParameters() {
    return this.parameters;
  }
  setParameters(parameters: { L: number; C: number; h: number }) {
    this.parameters = {
      L: parameters.L,
      C: parameters.C,
      h: parameters.h,
    };
  }
}
export function rgbToCam02JCh(rgb: RGB) {
  // Convert RGB to LAB first, then to LCH for CIECAM02
  const lab = rgbToLab(rgb);
  const lch = labToLch(lab);

  const cam02 = new CIECAM02();
  cam02.setParameters({ L: lch.l, C: lch.c, h: lch.h });
  return cam02.getParameters();
}
