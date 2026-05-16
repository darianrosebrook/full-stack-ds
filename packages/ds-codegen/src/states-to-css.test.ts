import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { computeCssBlocks } from "./ir.js";

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
    const blocks = computeCssBlocks(makeContract(["default", "hover", "focus"]), "x");
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

  it("applies tokens.<state> to the resulting selector", () => {
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
    // A resolvesTo token with `property` writes a real declaration.
    expect(hoverBlock?.declarations).toEqual({
      color: "var(--semantic-color-fg, red)",
    });
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
    const focusBlocks = blocks.filter(
      (b) => b.selector === ".x:focus-visible",
    );

    expect(focusBlocks).toHaveLength(1);
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
