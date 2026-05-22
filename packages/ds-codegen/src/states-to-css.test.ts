import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { computeCssBlocks, partitionVariantKeyedRootTokens } from "./ir.js";

/**
 * Contract `states` declare author intent. The CSS emitter decides how
 * to express that intent in idiomatic CSS:
 *   - Pseudo-class-derivable states (hover, focus, active, ...) become
 *     pseudo-class selectors (`.x:hover`, `.x:focus-visible`, ...).
 *   - ARIA-derived states (expanded, pressed, selected) become attribute
 *     selectors (`.x[aria-expanded="true"]`).
 *   - Anything else falls back to a BEM modifier class
 *     (`.x--entering`, `.x--loading`).
 *
 * This separation lets non-derivable states be toggled via JS (a hook
 * adds the class) without forcing a runtime concern onto derivable ones,
 * which the browser handles for free.
 */
describe("computeCssBlocks: contract.states -> CSS selectors", () => {
  it("maps :hover and :focus-visible to pseudo-class selectors", () => {
    const blocks = computeCssBlocks(
      makeContract(["default", "hover", "focus"]),
      "x",
    );
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x:hover");
    expect(selectors).toContain(".x:focus-visible");
    // Must NOT emit the BEM-modifier form for derivable states.
    expect(selectors).not.toContain(".x--hover");
    expect(selectors).not.toContain(".x--focus");
  });

  it("maps ARIA-derived states to attribute selectors", () => {
    const blocks = computeCssBlocks(
      makeContract(["default", "expanded", "pressed"]),
      "x",
    );
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain('.x[aria-expanded="true"]');
    expect(selectors).toContain('.x[aria-pressed="true"]');
    expect(selectors).not.toContain(".x--expanded");
    expect(selectors).not.toContain(".x--pressed");
  });

  it("keeps non-derivable states as BEM modifier classes", () => {
    const blocks = computeCssBlocks(
      makeContract(["default", "entering", "leaving", "loading"]),
      "x",
    );
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x--entering");
    expect(selectors).toContain(".x--leaving");
    expect(selectors).toContain(".x--loading");
  });

  it("applies tokens.<state> to the resulting selector using two-hop indirection", () => {
    // After 6a-ii, a structured TokenResolution emits TWO declarations:
    // a component-scoped slot that carries the global+fallback, and the
    // property reference that consumes the slot. The slot insulates
    // consumers from naming changes in the global graph and gives brands
    // a per-component override point.
    const contract: ComponentContract = {
      ...makeContract(["default", "hover"]),
      tokens: {
        root: {},
        hover: {
          "x.color.fg": {
            resolvesTo: "semantic.color.fg",
            fallback: "red",
            property: "color",
            layer: "semantic",
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const hoverBlock = blocks.find((b) => b.selector === ".x:hover");

    expect(hoverBlock).toBeDefined();
    // Slot declaration (with inner fallback) AND property consumer (no fallback).
    expect(hoverBlock?.declarations).toEqual({
      "--fsds-x-color-fg": "var(--fsds-semantic-color-fg, red)",
      color: "var(--fsds-x-color-fg)",
    });
  });

  it("does NOT emit a phantom indirection for a token without `property`", () => {
    // 6a-ii falsification: a TokenResolution without a `property` field
    // continues to produce only a comment, not a slot declaration that
    // nothing consumes. (A slot with no consumer would be dead weight
    // in the output.)
    const contract: ComponentContract = {
      ...makeContract(["default"]),
      tokens: {
        root: {
          "x.color.future": {
            resolvesTo: "semantic.color.future",
            fallback: "magenta",
            // no `property` — design intent not yet bound to CSS
            layer: "semantic",
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const rootBlock = blocks.find((b) => b.selector === ".x");

    expect(rootBlock?.declarations).toEqual({});
    // The intent is preserved as a comment so designers can promote it later.
    expect(rootBlock?.comments).toEqual([
      "/* --fsds-semantic-color-future: magenta; */",
    ]);
  });

  // -------- Variant-keyed token routing (Gap 1b fix, TOKENS-WORKSTREAM-STEP-06A-I) --------
  //
  // Contracts authored in the flat shape carry per-variant tokens under
  // tokens.root with keys like "switch.size.md.track.width". Before the
  // fix the emitter would collapse those onto `.switch`, dropping all
  // but the alphabetically-last entry. The fix routes them to the
  // appropriate `.switch--<value>` modifier, and surfaces the
  // default-variant tokens on the base selector as well (since the
  // base selector represents the default rendering).

  it("routes variant-keyed root tokens to the matching --<value> modifier (sm/lg)", () => {
    const contract: ComponentContract = {
      ...makeContract(["default"]),
      cssPrefix: "switch",
      variants: { size: ["sm", "md", "lg"] },
      props: {
        styled: {
          members: [{ name: "size", type: "string", default: "md" }],
        },
      },
      tokens: {
        root: {
          // Variant-keyed: should route OFF root, ONTO `.switch--sm`.
          "switch.size.sm.track.width": {
            resolvesTo: "core.spacing.size.07",
            fallback: "24px",
            property: "width",
            layer: "core",
          },
          // Default variant — should appear on BOTH `.switch` and `.switch--md`.
          "switch.size.md.track.width": {
            resolvesTo: "core.spacing.size.09",
            fallback: "48px",
            property: "width",
            layer: "core",
          },
          // Variant-keyed: routes ONTO `.switch--lg`.
          "switch.size.lg.track.width": {
            resolvesTo: "core.spacing.size.10",
            fallback: "64px",
            property: "width",
            layer: "core",
          },
          // Not variant-keyed: stays at root.
          "switch.color.track.background.default": {
            resolvesTo: "semantic.color.background.tertiary",
            fallback: "#cecece",
            property: "background-color",
            layer: "semantic",
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "switch");
    const byKey = Object.fromEntries(blocks.map((b) => [b.selector, b]));

    // Base selector: gets the default variant (md) PLUS the non-variant root token.
    // Each TokenResolution emits two declarations: the component-scoped slot
    // declaration (with the global+fallback inside) and the property reference
    // that consumes the slot.
    expect(byKey[".switch"]?.declarations).toEqual({
      "--fsds-switch-size-md-track-width": "var(--fsds-core-spacing-size-09, 48px)",
      width: "var(--fsds-switch-size-md-track-width)",
      "--fsds-switch-color-track-background-default":
        "var(--fsds-semantic-color-background-tertiary, #cecece)",
      "background-color": "var(--fsds-switch-color-track-background-default)",
    });
    // Default modifier: same shape as base (redundant but consistent).
    expect(byKey[".switch--md"]?.declarations).toEqual({
      "--fsds-switch-size-md-track-width": "var(--fsds-core-spacing-size-09, 48px)",
      width: "var(--fsds-switch-size-md-track-width)",
    });
    // sm modifier: only the sm slot + width.
    expect(byKey[".switch--sm"]?.declarations).toEqual({
      "--fsds-switch-size-sm-track-width": "var(--fsds-core-spacing-size-07, 24px)",
      width: "var(--fsds-switch-size-sm-track-width)",
    });
    // lg modifier: only the lg slot + width.
    expect(byKey[".switch--lg"]?.declarations).toEqual({
      "--fsds-switch-size-lg-track-width": "var(--fsds-core-spacing-size-10, 64px)",
      width: "var(--fsds-switch-size-lg-track-width)",
    });
  });

  it("does not regress when a variant is declared with NO per-variant tokens (Checkbox case)", () => {
    // Checkbox declares `variants.size=[sm,md,lg]` but ships no per-size
    // tokens at all. The parser must NOT invent variant entries — empty
    // modifier blocks must stay empty, and root must still emit normally.
    const contract: ComponentContract = {
      ...makeContract(["default"]),
      cssPrefix: "checkbox",
      variants: { size: ["sm", "md", "lg"] },
      props: {
        styled: {
          members: [{ name: "size", type: "string", default: "md" }],
        },
      },
      tokens: {
        root: {
          "checkbox.color.background": {
            resolvesTo: "semantic.color.background.primary",
            fallback: "#ffffff",
            property: "background-color",
            layer: "semantic",
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "checkbox");
    const byKey = Object.fromEntries(blocks.map((b) => [b.selector, b]));

    expect(byKey[".checkbox"]?.declarations).toEqual({
      "--fsds-checkbox-color-background":
        "var(--fsds-semantic-color-background-primary, #ffffff)",
      "background-color": "var(--fsds-checkbox-color-background)",
    });
    expect(byKey[".checkbox--sm"]?.declarations).toEqual({});
    expect(byKey[".checkbox--md"]?.declarations).toEqual({});
    expect(byKey[".checkbox--lg"]?.declarations).toEqual({});
  });

  it("ignores variant-keyed keys whose dimension isn't declared in variants", () => {
    // `switch.tone.subtle.color` looks variant-keyed but `tone` isn't in
    // contract.variants. Treat it as a regular root token (it stays).
    const contract: ComponentContract = {
      ...makeContract(["default"]),
      cssPrefix: "switch",
      variants: { size: ["sm", "md"] },
      props: { styled: { members: [{ name: "size", type: "string", default: "md" }] } },
      tokens: {
        root: {
          "switch.tone.subtle.color": {
            resolvesTo: "semantic.color.foreground.muted",
            fallback: "#888",
            property: "color",
            layer: "semantic",
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "switch");
    const byKey = Object.fromEntries(blocks.map((b) => [b.selector, b]));

    expect(byKey[".switch"]?.declarations).toEqual({
      "--fsds-switch-tone-subtle-color":
        "var(--fsds-semantic-color-foreground-muted, #888)",
      color: "var(--fsds-switch-tone-subtle-color)",
    });
    // `tone-subtle` is NOT a modifier; we did not invent one.
    expect(byKey[".switch--subtle"]).toBeUndefined();
  });

  it("does not double-emit when `focus` state and `tokens.focus` are both present", () => {
    const contract: ComponentContract = {
      ...makeContract(["default", "focus"]),
      tokens: {
        root: {},
        focus: {
          "x.outline": { literal: "2px solid blue" },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const focusBlocks = blocks.filter((b) => b.selector === ".x:focus-visible");

    expect(focusBlocks).toHaveLength(1);
  });

  /**
   * Gap 6 — Layout primitives via `contract.styles.<part>` must merge with
   * `contract.tokens.<part>`, not replace it. Without this, authoring
   * structural CSS (display, position, box-sizing) on a part would silently
   * drop the part's tokenized theming (background-color, width via slot, etc.).
   * See packages/ds-codegen/__golden__/Switch/Switch.traceability.md Gap 6.
   */
  it("merges styles.<part> with tokens.<part> when both target the same part", () => {
    const contract: ComponentContract = {
      name: "Switch",
      cssPrefix: "switch",
      anatomy: { parts: ["root", "track"] },
      states: ["default"],
      props: { styled: { members: [] } },
      tokens: {
        root: {},
        track: {
          "switch.color.track.bg": {
            resolvesTo: "semantic.color.background.tertiary",
            fallback: "#cecece",
            property: "background-color",
          },
        },
      },
      styles: {
        track: {
          display: "inline-block",
          position: "relative",
        },
      },
    };
    const blocks = computeCssBlocks(contract, "switch");
    const trackBlocks = blocks.filter((b) => b.selector === ".switch__track");

    // Both the tokens-derived slot+property and the styles-authored layout
    // primitives must coexist in a single .switch__track block.
    expect(trackBlocks).toHaveLength(1);
    expect(trackBlocks[0].declarations).toMatchObject({
      // From tokens.track (two-hop indirection):
      "--fsds-switch-color-track-bg":
        "var(--fsds-semantic-color-background-tertiary, #cecece)",
      "background-color": "var(--fsds-switch-color-track-bg)",
      // From styles.track:
      display: "inline-block",
      position: "relative",
    });
  });

  it("emits a styles.<part> block even when tokens.<part> is absent", () => {
    const contract: ComponentContract = {
      name: "Switch",
      cssPrefix: "switch",
      anatomy: { parts: ["root", "input"] },
      states: ["default"],
      props: { styled: { members: [] } },
      styles: {
        input: {
          position: "absolute",
          width: "1px",
          height: "1px",
        },
      },
    };
    const blocks = computeCssBlocks(contract, "switch");
    const inputBlocks = blocks.filter((b) => b.selector === ".switch__input");

    expect(inputBlocks).toHaveLength(1);
    expect(inputBlocks[0].declarations).toEqual({
      position: "absolute",
      width: "1px",
      height: "1px",
    });
  });

  it("authored styles override token-emitted properties when both target the same property", () => {
    // E.g., the contract's `tokens.thumb` declares `border-radius: var(slot)`
    // but the author wants a literal `border-radius: 50%` for a circular knob
    // independent of any theme. `styles` wins per the existing root-merge
    // doctrine: "authored styles win when both target the same property".
    const contract: ComponentContract = {
      name: "Switch",
      cssPrefix: "switch",
      anatomy: { parts: ["root", "thumb"] },
      states: ["default"],
      props: { styled: { members: [] } },
      tokens: {
        root: {},
        thumb: {
          "switch.shape.thumb.radius": {
            resolvesTo: "core.shape.radius.medium",
            fallback: "8px",
            property: "border-radius",
          },
        },
      },
      styles: {
        thumb: {
          "border-radius": "50%",
        },
      },
    };
    const blocks = computeCssBlocks(contract, "switch");
    const thumbBlocks = blocks.filter((b) => b.selector === ".switch__thumb");

    expect(thumbBlocks).toHaveLength(1);
    // Slot declaration still emitted (so brands can override the slot).
    expect(thumbBlocks[0].declarations["--fsds-switch-shape-thumb-radius"]).toBe(
      "var(--fsds-core-shape-radius-medium, 8px)",
    );
    // But the property consumer is the author's literal, not var(slot).
    expect(thumbBlocks[0].declarations["border-radius"]).toBe("50%");
  });
});

function makeContract(states: string[]): ComponentContract {
  return {
    name: "X",
    cssPrefix: "x",
    anatomy: { parts: ["root"] },
    states,
    props: { styled: { members: [] } },
  };
}

/**
 * Unit tests for the variant-keyed partition function in isolation.
 * These cover the parser's edge cases (unknown variant, key too short,
 * mismatched prefix) without dragging the rest of computeCssBlocks in.
 */
describe("partitionVariantKeyedRootTokens", () => {
  it("partitions a single variant-keyed entry into the right bucket", () => {
    const result = partitionVariantKeyedRootTokens({
      rootTokens: {
        "switch.size.md.track.width": { resolvesTo: "x", fallback: "1px" },
      },
      cssPrefix: "switch",
      variants: { size: ["sm", "md", "lg"] },
    });
    expect(result.rootRemainder).toEqual({});
    expect(result.variantBuckets).toEqual({
      size: {
        md: {
          "switch.size.md.track.width": { resolvesTo: "x", fallback: "1px" },
        },
      },
    });
  });

  it("leaves keys too short to be variant-keyed at root", () => {
    // "switch.size.md" is only 3 segments — needs at least 4 (<prefix>.<dim>.<val>.<rest>).
    const result = partitionVariantKeyedRootTokens({
      rootTokens: { "switch.size.md": { resolvesTo: "x", fallback: "y" } },
      cssPrefix: "switch",
      variants: { size: ["md"] },
    });
    expect(result.rootRemainder).toEqual({
      "switch.size.md": { resolvesTo: "x", fallback: "y" },
    });
    expect(result.variantBuckets).toEqual({});
  });

  it("leaves keys with a mismatched prefix at root", () => {
    const result = partitionVariantKeyedRootTokens({
      rootTokens: {
        // First segment is "button", not "switch" — must not get routed.
        "button.size.md.track.width": { resolvesTo: "x", fallback: "y" },
      },
      cssPrefix: "switch",
      variants: { size: ["md"] },
    });
    expect(result.rootRemainder).toEqual({
      "button.size.md.track.width": { resolvesTo: "x", fallback: "y" },
    });
    expect(result.variantBuckets).toEqual({});
  });

  it("leaves keys whose third segment isn't a declared variant value at root", () => {
    const result = partitionVariantKeyedRootTokens({
      rootTokens: {
        // "huge" is not in variants.size; treat as a regular root token.
        "switch.size.huge.track.width": { resolvesTo: "x", fallback: "y" },
      },
      cssPrefix: "switch",
      variants: { size: ["sm", "md", "lg"] },
    });
    expect(result.rootRemainder).toEqual({
      "switch.size.huge.track.width": { resolvesTo: "x", fallback: "y" },
    });
    expect(result.variantBuckets).toEqual({});
  });
});
