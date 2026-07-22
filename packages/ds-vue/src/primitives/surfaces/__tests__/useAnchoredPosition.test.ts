import { describe, it, expect, afterEach } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import { useAnchoredPosition, type AnchoredPositionState } from "../useAnchoredPosition";

/**
 * Pins the pure collision-resolution semantics of useAnchoredPosition.
 * jsdom's getBoundingClientRect always returns a zero rect, so every
 * test stubs both anchor and content rects explicitly via
 * Element.prototype.getBoundingClientRect. Coordinates asserted here
 * are exact — computed from the stubbed rects — not just presence.
 */

function stubRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  const full: DOMRect = {
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    top: rect.top ?? 0,
    left: rect.left ?? 0,
    bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
    right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    toJSON() {
      return this;
    },
  };
  el.getBoundingClientRect = () => full;
}

let scope: EffectScope | null = null;

function runInScope<T>(fn: () => T): T {
  scope = effectScope();
  return scope.run(fn) as T;
}

afterEach(() => {
  scope?.stop();
  scope = null;
  document.body.innerHTML = "";
});

describe("useAnchoredPosition — bottom placement math", () => {
  it("centers content under the anchor with top = anchor.bottom + offset", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    // Anchor: 100x40 at (200, 100) -> bottom=140. Content: 60x20.
    stubRect(anchor, { left: 200, top: 100, width: 100, height: 40 });
    stubRect(content, { width: 60, height: 20 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        offset: () => 8,
      }),
    );
    await nextTick();

    expect(state.ready).toBe(true);
    expect(state.placement).toBe("bottom");
    // top = anchor.bottom(140) + offset(8) = 148
    expect(state.top).toBe(148);
    // left = anchor.left(200) + (anchor.width(100) - content.width(60)) / 2 = 220
    expect(state.left).toBe(220);
  });
});

describe("useAnchoredPosition — flip on overflow", () => {
  it("flips bottom→top when bottom placement overflows the viewport more than top would", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { value: 200, configurable: true });

    // Anchor near the bottom edge: bottom=190. Content height 100 means
    // placing below overflows by (190+8+100-200)=98; placing above
    // (190-40-100-8 ... ) overflows 0 -> top wins.
    stubRect(anchor, { left: 50, top: 150, width: 40, height: 40 });
    stubRect(content, { width: 60, height: 100 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "flip-shift",
        offset: () => 8,
      }),
    );
    await nextTick();

    expect(state.placement).toBe("top");
    // top placement: anchor.top(150) - content.height(100) - offset(8) = 42
    expect(state.top).toBe(42);

    Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true });
  });
});

describe("useAnchoredPosition — cross-axis clamp", () => {
  it("clamps left to viewportPadding when the centered position would overflow past the left edge", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);

    // Anchor near left edge: left=0, width=20 -> centered left for a
    // wide content (200) would be 0 + (20-200)/2 = -90, well past the
    // viewport padding of 8.
    stubRect(anchor, { left: 0, top: 50, width: 20, height: 20 });
    stubRect(content, { width: 200, height: 30 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "flip-shift",
        offset: () => 8,
        viewportPadding: () => 8,
      }),
    );
    await nextTick();

    expect(state.left).toBe(8);
  });
});

describe("useAnchoredPosition — collision: none", () => {
  it("skips both flip and clamp, keeping the raw placed coordinates even when they overflow", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);

    // Same near-left-edge setup as the clamp test — raw left would be
    // 0 + (20-200)/2 = -90, and with collision "none" it must stay -90.
    stubRect(anchor, { left: 0, top: 50, width: 20, height: 20 });
    stubRect(content, { width: 200, height: 30 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "none",
        offset: () => 8,
        viewportPadding: () => 8,
      }),
    );
    await nextTick();

    expect(state.left).toBe(-90);
    expect(state.top).toBe(78); // anchor.bottom(70) + offset(8)
  });
});

describe("useAnchoredPosition — not ready before open / when nodes missing", () => {
  it("returns ready:false and hidden defaults when open is false", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 10, top: 10, width: 10, height: 10 });
    stubRect(content, { width: 10, height: 10 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => false,
      }),
    );
    await nextTick();

    expect(state.ready).toBe(false);
    expect(state.top).toBe(0);
    expect(state.left).toBe(0);
  });

  it("returns ready:false when anchor or content node is null even while open", async () => {
    const content = document.createElement("div");
    document.body.append(content);
    stubRect(content, { width: 10, height: 10 });

    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => null,
        content: () => content,
        open: () => true,
      }),
    );
    await nextTick();

    expect(state.ready).toBe(false);
  });

  it("resets to hidden state (ready:false, top/left:0) when a previously-open surface closes", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 200, top: 100, width: 100, height: 40 });
    stubRect(content, { width: 60, height: 20 });

    const isOpen = ref(true);
    const state = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => isOpen.value,
        placement: () => "bottom",
      }),
    );
    await nextTick();
    expect(state.ready).toBe(true);
    expect(state.top).toBe(148);

    isOpen.value = false;
    await nextTick();

    expect(state.ready).toBe(false);
    expect(state.top).toBe(0);
    expect(state.left).toBe(0);
  });
});

describe("useAnchoredPosition — explicit top placement (no flip)", () => {
  it("honors an explicit top placement verbatim when collision is 'none'", async () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 0, top: 0, width: 40, height: 20 });
    stubRect(content, { width: 20, height: 10 });

    const state: AnchoredPositionState = runInScope(() =>
      useAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "top",
        collision: () => "none",
        offset: () => 4,
      }),
    );
    await nextTick();

    expect(state.placement).toBe("top");
    // top placement: anchor.top(0) - content.height(10) - offset(4) = -14
    expect(state.top).toBe(-14);
    // left = anchor.left(0) + (anchor.width(40)-content.width(20))/2 = 10
    expect(state.left).toBe(10);
  });
});
