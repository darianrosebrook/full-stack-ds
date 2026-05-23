import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { computeCssBlocks } from "./ir.js";

/**
 * After the tokens/styles convergence (PLAN-TOKENS-STYLES-CONVERGENCE-001),
 * `<Name>.tokens.json` is a flat slot pool whose entries always emit as
 * custom-property declarations on the component root selector. The IR
 * keys all other selector blocks off `<Name>.styles.json`:
 *
 *   - Bare state names ("hover", "checked", ...) -> pseudo-class selectors
 *     via DERIVABLE_STATE_TO_PSEUDO.
 *   - ARIA states ("expanded", "pressed", "selected") -> attribute selectors.
 *   - "--<value>" -> BEM variant modifier.
 *   - "__<part>" or bare part name -> BEM anatomy selector.
 *   - Compound keys (":has(...)", combinator chars) -> expanded verbatim
 *     with bare part identifiers qualified by the BEM prefix.
 *
 * Each entry inside a selector block is a styleEntry: `{ resolvesTo }`
 * (slot reference; emits `var(--<slug>)` consumer) or `{ literal, platforms }`
 * (target-filtered hardcoded value).
 */
describe("computeCssBlocks: styles.json key -> CSS selector", () => {
  it("maps bare state names to pseudo-class selectors via DERIVABLE_STATE_TO_PSEUDO", () => {
    const contract = makeContract({
      styles: {
        hover: { color: { literal: "red", platforms: ["web"] } },
        focus: { color: { literal: "blue", platforms: ["web"] } },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x:hover");
    expect(selectors).toContain(".x:focus-visible");
    // Must NOT collapse state keys onto __part fallbacks.
    expect(selectors).not.toContain(".x__hover");
    expect(selectors).not.toContain(".x--hover");
  });

  it("maps ARIA states to attribute selectors", () => {
    const contract = makeContract({
      styles: {
        expanded: { color: { literal: "red", platforms: ["web"] } },
        pressed: { color: { literal: "blue", platforms: ["web"] } },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain('.x[aria-expanded="true"]');
    expect(selectors).toContain('.x[aria-pressed="true"]');
  });

  it("expands bare anatomy part names into BEM selectors", () => {
    const contract = makeContract({
      anatomy: { parts: ["root", "track", "thumb"] },
      styles: {
        track: { "background-color": { literal: "#cecece", platforms: ["web"] } },
        thumb: { "background-color": { literal: "#ffffff", platforms: ["web"] } },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x__track");
    expect(selectors).toContain(".x__thumb");
  });

  it("expands --<value> keys into BEM variant modifiers", () => {
    const contract = makeContract({
      variants: { size: ["sm", "md", "lg"] },
      styles: {
        "--sm": { width: { literal: "24px", platforms: ["web"] } },
        "--lg": { width: { literal: "64px", platforms: ["web"] } },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x--sm");
    expect(selectors).toContain(".x--lg");
  });

  it("passes compound selector keys through expandComplexSelector verbatim", () => {
    const contract = makeContract({
      anatomy: { parts: ["root", "track", "input"] },
      styles: {
        ":has(.x__input:checked) .x__track": {
          "background-color": { literal: "#d9292b", platforms: ["web"] },
        },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(":has(.x__input:checked) .x__track");
  });

  it("passes already-qualified single-segment selectors (start with `.`) through verbatim", () => {
    // Regression for the `expandStylesKey` bug Round 3 surfaced:
    // a single-segment key like `.x--small` was treated as a bare
    // anatomy part and emitted as `.x__.x--small` instead of `.x--small`.
    // Already-qualified selectors (start with `.`, `#`, or `*`) must
    // pass through untouched.
    const contract = makeContract({
      variants: { size: ["small", "medium"] },
      styles: {
        ".x--small": { width: { literal: "24px", platforms: ["web"] } },
        ".x--medium": { width: { literal: "32px", platforms: ["web"] } },
      },
    });
    const blocks = computeCssBlocks(contract, "x");
    const selectors = blocks.map((b) => b.selector);

    expect(selectors).toContain(".x--small");
    expect(selectors).toContain(".x--medium");
    expect(selectors).not.toContain(".x__.x--small");
    expect(selectors).not.toContain(".x__.x--medium");
  });
});

// The box-model primitive auto-consumes its 11 longhand slots on every
// component's root selector. Declared once here so the three root-block
// shape tests below stay focused on what they're actually asserting
// (token-slot wiring) rather than restating the consumer block in each
// expectation.
const BOX_MODEL_CONSUMERS = {
  "padding-block-start": "var(--fsds-box-model-padding-block-start)",
  "padding-block-end": "var(--fsds-box-model-padding-block-end)",
  "padding-inline-start": "var(--fsds-box-model-padding-inline-start)",
  "padding-inline-end": "var(--fsds-box-model-padding-inline-end)",
  gap: "var(--fsds-box-model-gap)",
  width: "var(--fsds-box-model-width)",
  "min-width": "var(--fsds-box-model-min-width)",
  "max-width": "var(--fsds-box-model-max-width)",
  height: "var(--fsds-box-model-height)",
  "min-height": "var(--fsds-box-model-min-height)",
  "max-height": "var(--fsds-box-model-max-height)",
};

describe("computeCssBlocks: tokens.json -> slot declarations on root", () => {
  it("emits one slot declaration per tokens.json entry on the root selector", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.color.track.bg": {
          resolvesTo: "semantic.color.background.tertiary",
          fallback: "#cecece",
          layer: "semantic",
        },
        "x.color.thumb.bg": {
          resolvesTo: "semantic.color.background.primary",
          fallback: "#ffffff",
          layer: "semantic",
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const root = blocks.find((b) => b.selector === ".x");

    expect(root).toBeDefined();
    // Every tokens.json entry becomes a `--<slug>: var(--global, fallback)`
    // declaration on the root selector. The cascade delivers it to every
    // descendant selector that reads it by name.
    expect(root?.declarations).toEqual({
      "--fsds-x-color-track-bg":
        "var(--fsds-semantic-color-background-tertiary, #cecece)",
      "--fsds-x-color-thumb-bg":
        "var(--fsds-semantic-color-background-primary, #ffffff)",
      ...BOX_MODEL_CONSUMERS,
    });
  });

  it("emits literal-valued slot declarations as the literal value", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.size.hairline": { literal: "1px" },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const root = blocks.find((b) => b.selector === ".x");

    expect(root?.declarations).toEqual({
      "--fsds-x-size-hairline": "1px",
      ...BOX_MODEL_CONSUMERS,
    });
  });

  it("merges styles.root consumers with the slot declarations on the root selector", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.color.bg": {
          resolvesTo: "semantic.color.background.primary",
          fallback: "#fff",
        },
      },
      styles: {
        root: {
          "background-color": { resolvesTo: "x.color.bg" },
          display: { literal: "inline-flex", platforms: ["web"] },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const root = blocks.find((b) => b.selector === ".x");

    expect(root?.declarations).toEqual({
      "--fsds-x-color-bg":
        "var(--fsds-semantic-color-background-primary, #fff)",
      ...BOX_MODEL_CONSUMERS,
      "background-color": "var(--fsds-x-color-bg)",
      display: "inline-flex",
    });
  });
});

describe("renderStyleBlock: resolution and platform filtering", () => {
  it("renders a `resolvesTo` styleEntry as var(--<slug>) at the consumer site", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root", "track"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.color.track.bg": {
          resolvesTo: "semantic.color.background.tertiary",
          fallback: "#cecece",
        },
      },
      styles: {
        track: {
          "background-color": { resolvesTo: "x.color.track.bg" },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const track = blocks.find((b) => b.selector === ".x__track");

    // No fallback at the consumer site — the slot's own fallback chains
    // via the cascade.
    expect(track?.declarations).toEqual({
      "background-color": "var(--fsds-x-color-track-bg)",
    });
  });

  it("emits a `literal` styleEntry only when its platforms include the target", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root", "track"] },
      props: { styled: { members: [] } },
      styles: {
        track: {
          // web-only: should render under the default ("web") platformTarget.
          cursor: { literal: "pointer", platforms: ["web"] },
          // ios/android-only: should NOT render under "web".
          "tap-highlight-color": {
            literal: "rgba(0,0,0,0)",
            platforms: ["ios", "android"],
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x");
    const track = blocks.find((b) => b.selector === ".x__track");

    expect(track?.declarations).toEqual({
      cursor: "pointer",
    });
  });

  it("emits a `literal` styleEntry under a non-web target when platforms match", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root", "track"] },
      props: { styled: { members: [] } },
      styles: {
        track: {
          cursor: { literal: "pointer", platforms: ["web"] },
          "tap-highlight-color": {
            literal: "rgba(0,0,0,0)",
            platforms: ["ios", "android"],
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x", { platformTarget: "ios" });
    const track = blocks.find((b) => b.selector === ".x__track");

    expect(track?.declarations).toEqual({
      "tap-highlight-color": "rgba(0,0,0,0)",
    });
  });

  it("includes a `resolvesTo` styleEntry on all platforms by default (no `platforms` arg)", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root", "track"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.color.track.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        track: {
          "background-color": { resolvesTo: "x.color.track.bg" },
        },
      },
    };
    const blocksWeb = computeCssBlocks(contract, "x", { platformTarget: "web" });
    const blocksIos = computeCssBlocks(contract, "x", { platformTarget: "ios" });

    const trackWeb = blocksWeb.find((b) => b.selector === ".x__track");
    const trackIos = blocksIos.find((b) => b.selector === ".x__track");

    expect(trackWeb?.declarations).toEqual({
      "background-color": "var(--fsds-x-color-track-bg)",
    });
    expect(trackIos?.declarations).toEqual({
      "background-color": "var(--fsds-x-color-track-bg)",
    });
  });

  it("filters a `resolvesTo` styleEntry by explicit platforms", () => {
    const contract: ComponentContract = {
      name: "X",
      cssPrefix: "x",
      anatomy: { parts: ["root", "track"] },
      props: { styled: { members: [] } },
      tokens: {
        "x.color.track.bg": { resolvesTo: "semantic.color.bg", fallback: "#fff" },
      },
      styles: {
        track: {
          "background-color": {
            resolvesTo: "x.color.track.bg",
            platforms: ["web"],
          },
        },
      },
    };
    const blocks = computeCssBlocks(contract, "x", { platformTarget: "ios" });
    // Under ios, the explicit `platforms: ["web"]` filter drops the entry,
    // and the resulting empty block isn't emitted.
    expect(blocks.find((b) => b.selector === ".x__track")).toBeUndefined();
  });
});

function makeContract(extra: Partial<ComponentContract>): ComponentContract {
  return {
    name: "X",
    cssPrefix: "x",
    anatomy: { parts: ["root"] },
    props: { styled: { members: [] } },
    ...extra,
  } as ComponentContract;
}
