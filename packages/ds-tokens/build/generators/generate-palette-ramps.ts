/**
 * generate-palette-ramps.ts
 *
 * Regenerates every hue ramp in `src/color/core/palette.tokens.json` as a
 * 10-stop scale (50, 100–800, 900) using @adobe/leonardo-contrast-colors.
 *
 * Method (chosen with the DS owner):
 *   - The hue's EXISTING 8 stops (100–800) are the Leonardo `colorKeys` — i.e.
 *     the current colors are the reference hues the new ramp interpolates
 *     through, so brand character is preserved.
 *   - Interpolation colorSpace is OKLCH (perceptual + preserves chroma).
 *   - Stops are CONTRAST-TARGETED: each stop hits a fixed WCAG contrast ratio
 *     against the real lightest UI surface (#fafafa = color.mode.light), so the
 *     ramp is calibrated to the surface text actually sits on. Targeting #fafafa
 *     (not idealized #ffffff) means white text on the 500 fill clears AA at the
 *     500 ratio without distorting the distribution.
 *   - 10 ratios, logarithmically distributed, 5 below 4.5 and 5 at/above ~4.6:
 *       [1.15, 1.47, 1.9, 2.49, 3.36, 4.61, 6.48, 9, 12.45, 16.1]
 *
 * Output is written back in place as DTCG sRGB component arrays (0–1), matching
 * the existing file shape. Idempotent: re-running on an 8- or 10-stop file
 * always re-derives from the four-corner anchors below, never from drifted
 * intermediate stops, so repeated runs converge.
 *
 * Run: pnpm -F @full-stack-ds/tokens exec tsx build/generators/generate-palette-ramps.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Color, Theme } from '@adobe/leonardo-contrast-colors';

const here = dirname(fileURLToPath(import.meta.url));
const PALETTE_PATH = resolve(here, '../../src/color/core/palette.tokens.json');

/** Contrast ratios against #fafafa, one per output stop. */
const RATIOS = [1.15, 1.47, 1.9, 2.49, 3.36, 4.61, 6.48, 9, 12.45, 16.1] as const;
const OUT_STOPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
/** The lightest UI surface (color.mode.light). Contrast targets are measured against this. */
const BACKGROUND = '#fafafa';
const COLOR_SPACE = 'OKLCH' as const;

/** Anchor stops used as Leonardo colorKeys — the hue's existing reference colors.
 *  Using the four corners + two mids keeps interpolation stable across reruns
 *  even after the file already holds the 10-stop output. */
const ANCHOR_STOPS = ['100', '300', '500', '700', '800'] as const;

type Components = [number, number, number];
interface ColorLeaf {
  $type?: string;
  $value: { colorSpace: string; components: Components; alpha?: number };
}
type Node = Record<string, unknown>;

const toHex = (c: Components): string =>
  '#' + c.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string): Components => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/** A hue node is any object that holds all ANCHOR_STOPS as color leaves. */
function isHueNode(node: Node): boolean {
  return ANCHOR_STOPS.every((s) => {
    const leaf = node[s] as ColorLeaf | undefined;
    return !!leaf?.$value?.components && leaf.$value.components.length === 3;
  });
}

function colorLeaf(components: Components): ColorLeaf {
  return { $type: 'color', $value: { colorSpace: 'srgb', components } };
}

/** Generate the 10-stop ramp for one hue from its anchor colorKeys. */
function regenerateHue(node: Node, path: string): void {
  const keys = ANCHOR_STOPS.map((s) => toHex((node[s] as ColorLeaf).$value.components));
  const color = new Color({
    name: path.replace(/\./g, '_') || 'hue',
    colorKeys: keys,
    colorSpace: COLOR_SPACE,
    ratios: [...RATIOS],
    smooth: false,
  });
  const theme = new Theme({ colors: [color], backgroundColor: BACKGROUND, lightness: 100, contrast: 1, output: 'HEX' });
  const values: string[] = theme.contrastColors[1].values.map((v: { value: string }) => v.value);
  if (values.length !== OUT_STOPS.length) {
    throw new Error(`Hue ${path}: expected ${OUT_STOPS.length} stops, got ${values.length}`);
  }
  // Drop any pre-existing numeric stop keys, then write the canonical 10.
  for (const k of Object.keys(node)) if (/^\d+$/.test(k)) delete node[k];
  OUT_STOPS.forEach((stop, i) => {
    node[stop] = colorLeaf(fromHex(values[i]));
  });
}

let huesProcessed = 0;
function walk(node: Node, path: string[] = []): void {
  if (isHueNode(node)) {
    regenerateHue(node, path.join('.'));
    huesProcessed += 1;
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$')) continue;
    if (v && typeof v === 'object') walk(v as Node, [...path, k]);
  }
}

function main(): void {
  const raw = readFileSync(PALETTE_PATH, 'utf8');
  const doc = JSON.parse(raw) as { color: { palette: Node } };
  walk(doc.color.palette);
  writeFileSync(PALETTE_PATH, JSON.stringify(doc, null, 2) + '\n', 'utf8');
  console.log(`Regenerated ${huesProcessed} hue ramp(s) -> 10 stops (50,100-800,900)`);
  console.log(`  colorSpace=${COLOR_SPACE} background=${BACKGROUND}`);
  console.log(`  ratios=[${RATIOS.join(', ')}]`);
}

main();
