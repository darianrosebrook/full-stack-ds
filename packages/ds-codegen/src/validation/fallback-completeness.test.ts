/**
 * Tests for the fallback-completeness validator.
 *
 * The validator is pure-shape: it walks contract.tokens and contract.styles
 * and asserts that every resolvesTo entry carries a non-empty fallback. No
 * I/O, no token-graph dependency — so these are fast in-memory unit tests
 * over synthetic contract shapes.
 *
 * Cases mirror the rule's scope: both sidecars walked, literal entries
 * exempt, empty-string fallback treated as missing (a stray "" is the same
 * defect class as an absent field).
 */

import { afterEach, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentContract } from "../contract.js";
import {
  validateContractFallbackCompleteness,
  validateContractFallbackStale,
  lowerShadowComposite,
  _resetResolvedGraphCacheForTests,
} from "./fallback-completeness.js";

function base(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "Test",
    cssPrefix: "test",
    layer: "primitive",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}

describe("validateContractFallbackCompleteness — happy paths", () => {
  it("returns no issues when contract has neither tokens nor styles", () => {
    expect(validateContractFallbackCompleteness(base({}))).toEqual([]);
  });

  it("returns no issues when every tokens entry has resolvesTo + fallback", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.action.background.primary.default",
          fallback: "#d9292b",
          layer: "semantic",
        },
        "test.color.fg": {
          resolvesTo: "semantic.color.foreground.inverse",
          fallback: "#fafafa",
          layer: "semantic",
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });

  it("returns no issues for literal-only entries (no resolvesTo)", () => {
    const contract = base({
      tokens: {
        "test.bg.transparent": { literal: "transparent" },
      },
      styles: {
        "--ghost": {
          "test.color.background.default": { literal: "transparent" },
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });

  it("returns no issues when styles entries carry fallback", () => {
    const contract = base({
      styles: {
        "--primary": {
          "test.color.background.default": {
            resolvesTo: "semantic.color.action.background.primary.default",
            fallback: "#d9292b",
          },
        },
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });
});

describe("validateContractFallbackCompleteness — detects missing fallback", () => {
  it("flags a tokens entry with resolvesTo but no fallback", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.action.background.primary.default",
          // no fallback
          layer: "semantic",
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/tokens/test.color.bg");
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
    expect(issues[0].message).toContain("test.color.bg");
    expect(issues[0].message).toContain(
      "semantic.color.action.background.primary.default",
    );
  });

  it("flags a styles entry with resolvesTo but no fallback (the Button --primary case)", () => {
    const contract = base({
      styles: {
        "--primary": {
          "test.color.background.default": {
            resolvesTo: "semantic.color.action.background.primary.default",
            // no fallback — the bug this gate exists to catch
          },
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].pointer).toBe("/styles/--primary/test.color.background.default");
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
    expect(issues[0].message).toContain("--primary");
    expect(issues[0].message).toContain("test.color.background.default");
  });

  it("flags every offending entry across multiple blocks and sidecars", () => {
    const contract = base({
      tokens: {
        "test.a": { resolvesTo: "semantic.color.a" }, // missing
        "test.b": { resolvesTo: "semantic.color.b", fallback: "#000" }, // ok
        "test.c": { resolvesTo: "semantic.color.c" }, // missing
      },
      styles: {
        "--primary": {
          "test.x": { resolvesTo: "semantic.x" }, // missing
          "test.y": { resolvesTo: "semantic.y", fallback: "#fff" }, // ok
        },
        "--ghost": {
          "test.z": { resolvesTo: "semantic.z" }, // missing
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(4);
    const pointers = issues.map((i) => i.pointer).sort();
    expect(pointers).toEqual([
      "/styles/--ghost/test.z",
      "/styles/--primary/test.x",
      "/tokens/test.a",
      "/tokens/test.c",
    ]);
  });

  it("treats an empty-string fallback as missing (a stray \"\" is the same defect)", () => {
    const contract = base({
      tokens: {
        "test.color.bg": {
          resolvesTo: "semantic.color.bg",
          fallback: "",
        },
      },
    });
    const issues = validateContractFallbackCompleteness(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0].message).toContain("[FALLBACK_MISSING]");
  });

  it("does not flag entries with neither resolvesTo nor literal (out of scope)", () => {
    const contract = base({
      tokens: {
        "test.empty": {}, // malformed but not this validator's concern
      },
    });
    expect(validateContractFallbackCompleteness(contract)).toEqual([]);
  });
});

describe("validateContractFallbackStale — fallback must equal the graph value", () => {
  afterEach(() => {
    _resetResolvedGraphCacheForTests();
  });

  /** Install a fixture resolved-token graph in place of the on-disk one. */
  function withGraph(graph: Record<string, unknown>): void {
    _resetResolvedGraphCacheForTests(graph);
  }

  it("passes when the fallback equals the graph value", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("reports a stale fallback and names the graph-derived correct literal", () => {
    withGraph({
      semantic: { color: { border: { accent: { $value: "#d92d2e" } } } },
    });
    const contract = base({
      tokens: {
        "test.border": { resolvesTo: "semantic.color.border.accent", fallback: "#d9292b" },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/tokens/test.border");
    expect(issues[0]!.message).toContain("[FALLBACK_STALE]");
    expect(issues[0]!.message).toContain("#d9292b"); // what was authored
    expect(issues[0]!.message).toContain("#d92d2e"); // what it should be
  });

  it("detects a stale fallback in a styles variant block and points at it", () => {
    withGraph({ semantic: { shape: { radius: { $value: "6px" } } } });
    const contract = base({
      styles: {
        "--primary": {
          "test.radius": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/styles/--primary/test.radius");
    expect(issues[0]!.message).toContain("6px");
  });

  it("fires on a MAJORITY-authored literal that disagrees with the graph", () => {
    // Frequency is not evidence. Three sites agree on 8px; the graph says 6px;
    // all three are stale. This pins the anti-vote rule that motivated the gate.
    withGraph({ semantic: { shape: { radius: { $value: "6px" } } } });
    const contract = base({
      tokens: {
        "test.a": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        "test.b": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
        "test.c": { resolvesTo: "semantic.shape.radius", fallback: "8px" },
      },
    });
    expect(validateContractFallbackStale(contract)).toHaveLength(3);
  });

  it("follows a component-layer slot chain to the terminal graph value", () => {
    // styles → accordion.border.color (component layer, absent from the graph)
    // → semantic.color.border.light → #b8b8b8.
    withGraph({
      semantic: { color: { border: { light: { $value: "#b8b8b8" } } } },
    });
    const contract = base({
      tokens: {
        "accordion.border.color": {
          resolvesTo: "semantic.color.border.light",
          fallback: "#b8b8b8",
        },
      },
      styles: {
        root: {
          "border-color": { resolvesTo: "accordion.border.color", fallback: "#fceaea" },
        },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/styles/root/border-color");
    expect(issues[0]!.message).toContain("#b8b8b8");
  });

  it("collapses a theme-mode object to its light value", () => {
    withGraph({
      semantic: {
        color: { bg: { $value: { light: "#ffffff", dark: "#141414" } } },
      },
    });
    const ok = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    expect(validateContractFallbackStale(ok)).toEqual([]);

    // The DARK value is not accepted — a static fallback encodes light only.
    const dark = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#141414" } },
    });
    expect(validateContractFallbackStale(dark)).toHaveLength(1);
  });

  it("treats rem and px as equal at the 16px root", () => {
    withGraph({ semantic: { size: { $value: "16px" } } });
    const contract = base({
      tokens: { "test.size": { resolvesTo: "semantic.size", fallback: "1rem" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("treats 3-digit and 6-digit hex as equal", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#FFF" } },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("ignores whitespace drift inside a multi-part shadow value", () => {
    withGraph({
      semantic: { elevation: { $value: "0 1px 2px rgba(0,0,0,0.1)" } },
    });
    const contract = base({
      tokens: {
        "test.shadow": {
          resolvesTo: "semantic.elevation",
          fallback: "0 1px 2px rgba(0, 0, 0, 0.1)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("lowers an in-envelope shadow composite and flags a stale fallback (FALLBACK-SHADOW-LOWERING-01)", () => {
    // resolved.tokens.json stores $type:shadow as a JSON string of the
    // structured form. Since FALLBACK-SHADOW-LOWERING-01 the gate lowers
    // composites inside the srgb-shadow envelope via the mirrored emitter
    // lowering and COMPARES — a wrong fallback now fires with the lowered
    // literal as its repair.
    const composite =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},' +
      '"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"srgb",' +
      '"components":[0,0,0],"alpha":0.05}}]';
    withGraph({ semantic: { elevation: { overlay: { $value: composite } } } });
    const contract = base({
      tokens: {
        "test.elevation": {
          resolvesTo: "semantic.elevation.overlay",
          fallback: "0 1px 1px rgba(0,0,0,0.14)",
        },
      },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.pointer).toBe("/tokens/test.elevation");
    expect(issues[0]!.message).toContain("[FALLBACK_STALE]");
    expect(issues[0]!.message).toContain("0px 4px 6px #0000000d"); // graph-derived repair
  });

  it("accepts an authored rgba form of a lowered composite (representation drift)", () => {
    const composite =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},' +
      '"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"srgb",' +
      '"components":[0,0,0],"alpha":0.05}}]';
    withGraph({ semantic: { elevation: { overlay: { $value: composite } } } });
    const contract = base({
      tokens: {
        "test.elevation": {
          resolvesTo: "semantic.elevation.overlay",
          // rgba + bare-zero form canonicalizes equal to the hex8 lowering
          fallback: "0 4px 6px rgba(0,0,0,0.05)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("accepts a bare-zero component after a layer comma (Dialog/Popover form)", () => {
    // Regression for the canonicalizer bug this slice hit in the wild: after
    // comma-stripping, ", 0 25px…" must normalize its zero the same as " 0 25px…".
    const composite =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":12,"unit":"px"},' +
      '"blur":{"value":16,"unit":"px"},"color":{"colorSpace":"srgb",' +
      '"components":[0,0,0],"alpha":0.06}},{"offsetX":{"value":0,"unit":"px"},' +
      '"offsetY":{"value":25,"unit":"px"},"blur":{"value":50,"unit":"px"},' +
      '"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.15}}]';
    withGraph({ semantic: { elevation: { dialog: { $value: composite } } } });
    const contract = base({
      tokens: {
        "test.dialog": {
          resolvesTo: "semantic.elevation.dialog",
          fallback: "0 12px 16px rgba(0,0,0,0.06), 0 25px 50px rgba(0,0,0,0.15)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("still refuses composites OUTSIDE the shadow envelope (refuse-to-guess)", () => {
    // A non-srgb color space the mirror does not implement: skipped, not judged.
    const composite =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},' +
      '"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"oklch",' +
      '"components":[0.1,0.02,240],"alpha":0.05}}]';
    withGraph({ semantic: { elevation: { overlay: { $value: composite } } } });
    const contract = base({
      tokens: {
        "test.elevation": {
          resolvesTo: "semantic.elevation.overlay",
          fallback: "0 4px 6px rgba(0,0,0,0.05)",
        },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("still refuses non-shadow composites (typography) and string-typed dimensions", () => {
    const typography = JSON.stringify({
      fontFamily: "Inter",
      fontSize: { value: 16, unit: "px" },
    });
    withGraph({ semantic: { typo: { body: { $value: typography } } } });
    const typoContract = base({
      tokens: { "test.t": { resolvesTo: "semantic.typo.body", fallback: "16px" } },
    });
    expect(validateContractFallbackStale(typoContract)).toEqual([]);

    const stringDim =
      '[{"offsetX":"0","offsetY":{"value":4,"unit":"px"},' +
      '"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"srgb",' +
      '"components":[0,0,0],"alpha":0.05}}]';
    withGraph({ semantic: { elevation: { str: { $value: stringDim } } } });
    const strContract = base({
      tokens: {
        "test.s": { resolvesTo: "semantic.elevation.str", fallback: "0 4px 6px #0000000d" },
      },
    });
    expect(validateContractFallbackStale(strContract)).toEqual([]);
  });

  it("still compares normally when a CSS literal merely starts with a brace-like char", () => {
    // Guard the composite check against over-refusal: only values that PARSE
    // as JSON objects/arrays are refused, not any string starting with '['.
    withGraph({ semantic: { content: { marker: { $value: "[stale]" } } } });
    const contract = base({
      tokens: {
        "test.marker": { resolvesTo: "semantic.content.marker", fallback: "[fresh]" },
      },
    });
    expect(validateContractFallbackStale(contract)).toHaveLength(1);
  });

  it("skips a reading whose chain dead-ends rather than claiming it is wrong", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: {
        "test.mystery": { resolvesTo: "semantic.color.doesNotExist", fallback: "#123456" },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("terminates on a self-referential slot chain instead of recursing forever", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: {
        "test.loop": { resolvesTo: "test.loop", fallback: "#000000" },
      },
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });

  it("returns a loud instructional issue when the token graph is not built", () => {
    _resetResolvedGraphCacheForTests("missing");
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg", fallback: "#ffffff" } },
    });
    const issues = validateContractFallbackStale(contract);
    expect(issues).toHaveLength(1);
    expect(issues[0]!.message).toContain("token graph not built");
    expect(issues[0]!.message).toContain("@full-stack-ds/tokens build");
  });

  it("does not consult the graph at all when there are no fallback readings", () => {
    // An unbuilt graph must not fail a contract that declares no fallbacks.
    _resetResolvedGraphCacheForTests("missing");
    expect(validateContractFallbackStale(base({}))).toEqual([]);
  });

  it("ignores slots without fallbacks (the [FALLBACK_MISSING] gate owns those)", () => {
    withGraph({ semantic: { color: { bg: { $value: "#ffffff" } } } });
    const contract = base({
      tokens: { "test.bg": { resolvesTo: "semantic.color.bg" } }, // no fallback
    });
    expect(validateContractFallbackStale(contract)).toEqual([]);
  });
});

describe("lowerShadowComposite — the mirrored lowering (FALLBACK-SHADOW-LOWERING-01)", () => {
  it("lowers the three real surface composites to their emitted literals", () => {
    // Verbatim serializations from the committed resolved.tokens.json.
    const raised =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},"blur":{"value":2,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.06}},{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},"blur":{"value":3,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.1}}]';
    const floating =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":2,"unit":"px"},"blur":{"value":4,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.06}},{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},"blur":{"value":8,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.1}}]';
    const overlay =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":4,"unit":"px"},"blur":{"value":6,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.05}},{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":10,"unit":"px"},"blur":{"value":15,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.1}}]';
    // Emitted values from the committed tokens.css.
    expect(lowerShadowComposite(raised)).toBe(
      "0px 1px 2px #0000000f, 0px 1px 3px #0000001a",
    );
    expect(lowerShadowComposite(floating)).toBe(
      "0px 2px 4px #0000000f, 0px 4px 8px #0000001a",
    );
    expect(lowerShadowComposite(overlay)).toBe(
      "0px 4px 6px #0000000d, 0px 10px 15px #0000001a",
    );
  });

  it("rounds alpha the way the emitter does (0.06→0f, 0.1→1a, 0.05→0d)", () => {
    const layer = (alpha: number) =>
      `[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},` +
      `"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":${alpha}}}]`;
    expect(lowerShadowComposite(layer(0.06))).toBe("0px 1px #0000000f");
    expect(lowerShadowComposite(layer(0.1))).toBe("0px 1px #0000001a");
    expect(lowerShadowComposite(layer(0.05))).toBe("0px 1px #0000000d");
  });

  it("omits the alpha byte when alpha >= 1 or absent (mirrors hasAlpha)", () => {
    const opaque =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},' +
      '"color":{"colorSpace":"srgb","components":[0,0,0]}}]';
    expect(lowerShadowComposite(opaque)).toBe("0px 1px #000000");
    const one =
      '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},' +
      '"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":1}}]';
    expect(lowerShadowComposite(one)).toBe("0px 1px #000000");
  });

  it("lowers spread and inset when present (emitter component order)", () => {
    const withSpreadInset =
      '[{"inset":true,"offsetX":{"value":1,"unit":"px"},"offsetY":{"value":2,"unit":"px"},' +
      '"spread":{"value":3,"unit":"px"},"color":{"colorSpace":"srgb","components":[0,0,0],"alpha":0.5}}]';
    expect(lowerShadowComposite(withSpreadInset)).toBe("inset 1px 2px 3px #00000080");
  });

  it("refuses everything outside the envelope", () => {
    // oklch color space
    expect(
      lowerShadowComposite(
        '[{"offsetX":{"value":0,"unit":"px"},"offsetY":{"value":1,"unit":"px"},' +
          '"color":{"colorSpace":"oklch","components":[0.1,0.02,240]}}]',
      ),
    ).toBeUndefined();
    // string-typed dimension
    expect(
      lowerShadowComposite('[{"offsetX":"0","offsetY":{"value":1,"unit":"px"}}]'),
    ).toBeUndefined();
    // non-shadow composite
    expect(lowerShadowComposite('{"fontFamily":"Inter"}')).toBeUndefined();
    // unparseable
    expect(lowerShadowComposite("[not json")).toBeUndefined();
    // empty array
    expect(lowerShadowComposite("[]")).toBeUndefined();
  });
});

describe("shadow-lowering oracle — mirror ≡ emitter against committed artifacts", () => {
  // THE DRIFT LOCK. The lowering in fallback-completeness.ts is a mirror of
  // the tokens build's shadowValueToCSS (not importable: not exported, runs
  // via tsx with no compiled output). This test reads the COMMITTED
  // resolved.tokens.json + tokens.css, lowers every semantic.elevation.surface
  // composite via the mirror, and compares against the emitted CSS values
  // (following one var() alias hop). If the emitter's lowering ever changes
  // without the mirror, this fails — drift is loud, never silent.
  it.skipIf(!existsSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../../ds-tokens/generated/resolved.tokens.json")))(
    "mirror lowering equals the emitted tokens.css values for all surface elevation tokens",
    () => {
      const tokensDir = join(
        dirname(fileURLToPath(import.meta.url)),
        "../../../ds-tokens/generated",
      );
      const graph = JSON.parse(readFileSync(join(tokensDir, "resolved.tokens.json"), "utf8"));
      const css = readFileSync(join(tokensDir, "tokens.css"), "utf8");

      // Parse the emitted custom properties.
      const cssVars = new Map<string, string>();
      for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
        if (!cssVars.has(m[1]!)) cssVars.set(m[1]!, m[2]!.trim());
      }
      const resolveCss = (name: string, hops = 0): string | undefined => {
        const v = cssVars.get(name);
        if (v === undefined) return undefined;
        const alias = v.match(/^var\((--[\w-]+)\)$/);
        if (alias && hops < 2) return resolveCss(alias[1]!, hops + 1);
        return v;
      };

      const surfaces = graph.semantic.elevation.surface as Record<
        string,
        { $value: string }
      >;
      const checked: string[] = [];
      for (const [name, node] of Object.entries(surfaces)) {
        if (typeof node.$value !== "string") continue;
        const lowered = lowerShadowComposite(node.$value);
        // Every surface token today sits inside the envelope; if one ever
        // moves outside it, this assertion reminds you to extend the mirror
        // rather than silently skipping the oracle.
        expect(lowered, `surface token ${name} must lower inside the envelope`).toBeDefined();
        const slug = `--fsds-${["semantic", "elevation", "surface", name].join("-")}`;
        const emitted = resolveCss(slug);
        expect(emitted, `${slug} must exist in tokens.css`).toBeDefined();
        expect(lowered).toBe(emitted);
        checked.push(name);
      }
      expect(checked.length).toBeGreaterThanOrEqual(5); // raised/floating/overlay/dialog/popover
    },
  );
});
