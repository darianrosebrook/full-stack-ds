import {
  hexToRgb,
  hslToRgb,
  oklchToRgb,
  type RGB,
  type HSL,
} from './colorHelpers';

// Simple parsers/formatters for common CSS color syntaxes used in our DS

export function parseHex(input: string): RGB | null {
  return hexToRgb(input);
}

export function formatHex(rgb: RGB): string {
  const toHex = (c: number) => {
    const v = Math.max(0, Math.min(255, Math.round(c)));
    const s = v.toString(16).padStart(2, '0');
    return s;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function parseRgb(input: string): RGB | null {
  const m = input
    .trim()
    .match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!m) return null;
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  if ([r, g, b].some((v) => isNaN(v) || v < 0 || v > 255)) return null;
  return { r, g, b };
}

export function formatRgb(rgb: RGB): string {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

export function parseHsl(input: string): HSL | null {
  const m = input
    .trim()
    .match(
      /^hsl\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i
    );
  if (!m) return null;
  const h = Number(m[1]);
  const s = Number(m[2]);
  const l = Number(m[3]);
  if ([s, l].some((v) => isNaN(v) || v < 0 || v > 100) || isNaN(h)) return null;
  return { h, s, l };
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

export function parseOklch(
  input: string
): { L: number; c: number; h: number } | null {
  // oklch( L c h ) where L is 0..1 (allow 0..100 too), c >= 0, h in degrees
  const m = input
    .trim()
    .match(
      /^oklch\(\s*([0-9]*\.?[0-9]+)\s+([0-9]*\.?[0-9]+)\s+(-?[0-9]*\.?[0-9]+)\s*\)$/i
    );
  if (!m) return null;
  let L = Number(m[1]);
  const c = Number(m[2]);
  const h = Number(m[3]);
  if ([L, c, h].some((v) => isNaN(v))) return null;
  // Support authoring L in 0..100; normalize to 0..1 if needed
  if (L > 1) L = L / 100;
  return { L, c, h };
}

export function formatOklch(L: number, c: number, h: number): string {
  return `oklch(${Number(L.toFixed(4))} ${Number(c.toFixed(4))} ${Number(h.toFixed(2))})`;
}

// High-level convenience: parse a CSS color string into RGB
export function parseCssColorToRgb(input: string): RGB | null {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  // try hex
  const hex = parseHex(s);
  if (hex) return hex;
  // try rgb()
  const rgb = parseRgb(s);
  if (rgb) return rgb;
  // try hsl()
  const hsl = parseHsl(s);
  if (hsl) return hslToRgb(hsl as HSL);
  // try oklch()
  const oklch = parseOklch(s);
  if (oklch) return oklchToRgb(oklch.L, oklch.c, oklch.h);
  return null;
}
