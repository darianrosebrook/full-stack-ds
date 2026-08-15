/**
 * Alpha preservation in the resolved-token serializer (FIX-CONTRAST-DEBT-01).
 *
 * The resolver and the CSS emitter must serialize DTCG alpha by the SAME
 * rule (`hex + two-digit alpha hex when alpha < 1`). Before this landed,
 * `colorToHex` dropped alpha, so `core.color.mode.transparent` resolved to
 * OPAQUE `#000000` in resolved.tokens.json while tokens.css correctly
 * emitted `#00000000` — the divergence made the component-contrast gate
 * measure text against a phantom opaque black.
 */
import { afterAll, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { resolveAndWrite } from "./resolve.js";

const dir = mkdtempSync(join(tmpdir(), "fsds-resolve-test-"));
const composedPath = join(dir, "composed.tokens.json");
const outputPath = join(dir, "resolved.tokens.json");

afterAll(() => rmSync(dir, { recursive: true, force: true }));

function resolveTree(composed: unknown): Record<string, any> {
  writeFileSync(composedPath, JSON.stringify(composed));
  resolveAndWrite(composedPath, outputPath);
  return JSON.parse(readFileSync(outputPath, "utf-8"));
}

describe("resolveAndWrite — color alpha preservation", () => {
  it("serializes alpha 0 as an 8-digit transparent hex", () => {
    const out = resolveTree({
      color: {
        transparent: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
        },
      },
    });
    expect(out.color.transparent.$value).toBe("#00000000");
  });

  it("serializes fractional alpha as two hex digits (same rule as the CSS emitter)", () => {
    const out = resolveTree({
      color: {
        scrim: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.4 },
        },
      },
    });
    // 0.4 * 255 = 102 = 0x66 — the exact byte generateCSSTokens.mjs emits.
    expect(out.color.scrim.$value).toBe("#00000066");
  });

  it("keeps opaque tokens 6-digit (alpha absent or alpha === 1)", () => {
    const out = resolveTree({
      color: {
        opaque: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [1, 0.4, 0.4] },
        },
        alphaOne: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 1 },
        },
      },
    });
    expect(out.color.opaque.$value).toBe("#ff6666");
    expect(out.color.alphaOne.$value).toBe("#000000");
  });

  it("preserves alpha across {ref} chains", () => {
    const out = resolveTree({
      color: {
        transparent: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
        },
        alias: { $type: "color", $value: "{color.transparent}" },
      },
    });
    expect(out.color.alias.$value).toBe("#00000000");
  });

  it("preserves alpha in theme-extension variants", () => {
    const out = resolveTree({
      color: {
        themed: {
          $type: "color",
          $value: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
          $extensions: {
            "fsds.light": { colorSpace: "srgb", components: [0, 0, 0], alpha: 0 },
            "fsds.dark": { colorSpace: "srgb", components: [1, 1, 1], alpha: 0.5 },
          },
        },
      },
    });
    expect(out.color.themed.$value).toEqual({
      light: "#00000000",
      dark: "#ffffff80",
    });
  });
});
