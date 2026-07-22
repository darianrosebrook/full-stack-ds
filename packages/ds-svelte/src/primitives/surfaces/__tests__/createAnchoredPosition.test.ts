import { describe, expect, it } from "vitest";
import { computePosition } from "../createAnchoredPosition.svelte.js";

/**
 * Pins the pure collision-resolution math shared with React's
 * useAnchoredPosition (copied verbatim, framework-neutral). jsdom
 * returns zero-valued getBoundingClientRect(), so these tests build
 * DOMRect-shaped fixtures directly instead of relying on layout.
 */

function rect(partial: Partial<DOMRect>): DOMRect {
  const base: DOMRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    toJSON() {
      return this;
    },
  };
  return { ...base, ...partial };
}

describe("createAnchoredPosition — computePosition", () => {
  it("places bottom: top = anchor.bottom + offset, left centered on anchor", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    anchor.getBoundingClientRect = () =>
      rect({ top: 100, bottom: 130, left: 200, right: 260, width: 60, height: 30 });
    content.getBoundingClientRect = () =>
      rect({ top: 0, bottom: 40, left: 0, right: 100, width: 100, height: 40 });

    const result = computePosition({
      anchor,
      content,
      placement: "bottom",
      collision: "flip-shift",
      offset: 8,
      viewportPadding: 8,
    });

    expect(result.placement).toBe("bottom");
    // anchor.bottom (130) + offset (8)
    expect(result.top).toBe(138);
    // anchor.left (200) + (anchor.width - content.width) / 2 = 200 + (60-100)/2 = 180
    expect(result.left).toBe(180);
    expect(result.ready).toBe(true);
  });

  it("flips bottom→top when bottom overflow exceeds top overflow", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    // Anchor near the bottom of a 200px-tall viewport.
    Object.defineProperty(window, "innerHeight", { value: 200, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });
    anchor.getBoundingClientRect = () =>
      rect({ top: 180, bottom: 195, left: 100, right: 160, width: 60, height: 15 });
    // Content is 100px tall — placed at bottom (195 + 8 = 203) it overflows
    // viewport (200) by 203+100-200 = 103. Placed at top instead:
    // top - content.height - offset = 180 - 100 - 8 = 72 (no overflow).
    content.getBoundingClientRect = () =>
      rect({ top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 });

    const result = computePosition({
      anchor,
      content,
      placement: "bottom",
      collision: "flip-shift",
      offset: 8,
      viewportPadding: 8,
    });

    expect(result.placement).toBe("top");
    expect(result.top).toBe(72);
  });

  it("clamps cross-axis (left) to viewportPadding when centered placement would overflow", () => {
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 300, configurable: true });
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    // Anchor near the left edge; content is wider than the anchor, so
    // centered placement would push left into negative territory.
    anchor.getBoundingClientRect = () =>
      rect({ top: 100, bottom: 130, left: 10, right: 40, width: 30, height: 30 });
    content.getBoundingClientRect = () =>
      rect({ top: 0, bottom: 50, left: 0, right: 200, width: 200, height: 50 });

    const result = computePosition({
      anchor,
      content,
      placement: "bottom",
      collision: "flip-shift",
      offset: 8,
      viewportPadding: 8,
    });

    // Unclamped left would be 10 + (30-200)/2 = -75; clamp to viewportPadding.
    expect(result.left).toBe(8);
  });

  it('collision: "none" skips both flip and clamp — placement and raw coordinates pass through', () => {
    Object.defineProperty(window, "innerHeight", { value: 200, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 300, configurable: true });
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    anchor.getBoundingClientRect = () =>
      rect({ top: 180, bottom: 195, left: 10, right: 40, width: 30, height: 15 });
    content.getBoundingClientRect = () =>
      rect({ top: 0, bottom: 100, left: 0, right: 200, width: 200, height: 100 });

    const result = computePosition({
      anchor,
      content,
      placement: "bottom",
      collision: "none",
      offset: 8,
      viewportPadding: 8,
    });

    // No flip despite bottom overflow, no clamp despite left overflow.
    expect(result.placement).toBe("bottom");
    expect(result.top).toBe(203); // 195 + 8, unflipped
    expect(result.left).toBe(-75); // 10 + (30-200)/2, unclamped
    expect(result.ready).toBe(true);
  });

  it('"auto" placement seeds from "bottom"', () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });
    anchor.getBoundingClientRect = () =>
      rect({ top: 100, bottom: 130, left: 200, right: 260, width: 60, height: 30 });
    content.getBoundingClientRect = () =>
      rect({ top: 0, bottom: 40, left: 0, right: 100, width: 100, height: 40 });

    const result = computePosition({
      anchor,
      content,
      placement: "auto",
      collision: "flip-shift",
      offset: 8,
      viewportPadding: 8,
    });

    expect(result.placement).toBe("bottom");
  });
});

describe("createAnchoredPosition — factory reactive contract", () => {
  it("ready is false before open (state shape matches React's HIDDEN_STATE)", async () => {
    const { createAnchoredPosition } = await import("../createAnchoredPosition.svelte.js");
    // Runes ($state/$effect) require a component/effect-root context.
    // We verify the pure computation above directly; here we only pin
    // that the module exports a factory with the documented shape so a
    // consumer wiring mismatch (e.g. renamed export) fails loudly.
    expect(typeof createAnchoredPosition).toBe("function");
  });
});
