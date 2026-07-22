/**
 * Pins the pure collision-resolution semantics of AnchoredPositionController.
 * jsdom's getBoundingClientRect always returns a zero rect, so every test
 * stubs both anchor and content rects explicitly via
 * Element.prototype.getBoundingClientRect. Coordinates asserted here are
 * exact — computed from the stubbed rects — not just presence.
 */
import { describe, it, expect, vi } from "vitest";
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { AnchoredPositionController } from "../AnchoredPositionController.js";

// ---------------------------------------------------------------------------
// Minimal ReactiveControllerHost stub, matching the CompoundContext.test.ts
// FakeHost idiom used elsewhere in this package.
// ---------------------------------------------------------------------------
class FakeHost implements ReactiveControllerHost {
  private controllers: ReactiveController[] = [];
  requestUpdate = vi.fn();
  updateComplete: Promise<boolean> = Promise.resolve(true);

  addController(c: ReactiveController): void {
    this.controllers.push(c);
  }
  removeController(c: ReactiveController): void {
    this.controllers = this.controllers.filter((x) => x !== c);
  }
  connect(): void {
    for (const c of this.controllers) c.hostConnected?.();
  }
  update(): void {
    for (const c of this.controllers) c.hostUpdate?.();
  }
  disconnect(): void {
    for (const c of this.controllers) c.hostDisconnected?.();
  }
}

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

describe("AnchoredPositionController — bottom placement math", () => {
  it("centers content under the anchor with top = anchor.bottom + offset", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    // Anchor: 100x40 at (200, 100) -> bottom=140. Content: 60x20.
    stubRect(anchor, { left: 200, top: 100, width: 100, height: 40 });
    stubRect(content, { width: 60, height: 20 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      placement: () => "bottom",
      offset: () => 8,
    });
    host.connect();

    expect(controller.state.ready).toBe(true);
    expect(controller.state.placement).toBe("bottom");
    // top = anchor.bottom(140) + offset(8) = 148
    expect(controller.state.top).toBe(148);
    // left = anchor.left(200) + (anchor.width(100) - content.width(60)) / 2 = 220
    expect(controller.state.left).toBe(220);

    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — flip on overflow", () => {
  it("flips bottom→top when bottom placement overflows the viewport more than top would", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", { value: 200, configurable: true });

    // Anchor near the bottom edge: bottom=190. Content height 100 means
    // placing below would end at 190+8+100=298, overflowing by 98 past the
    // 200px viewport. Placing above ends at 190-40-8-100=42, well within
    // bounds (overflow 0). So flip must choose "top".
    stubRect(anchor, { left: 50, top: 150, width: 40, height: 40 });
    stubRect(content, { width: 60, height: 100 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      placement: () => "bottom",
      collision: () => "flip-shift",
      offset: () => 8,
    });
    host.connect();

    expect(controller.state.placement).toBe("top");
    // top = anchor.top(150) - content.height(100) - offset(8) = 42
    expect(controller.state.top).toBe(42);

    Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true });
    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — cross-axis clamp", () => {
  it("clamps left to viewportPadding when the centered position would overflow past the left edge", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);

    // Anchor near the left edge: centered left would be
    // anchor.left(5) + (anchor.width(20) - content.width(200))/2 = 5 - 90 = -85,
    // which is below viewportPadding(8), so it clamps to 8.
    stubRect(anchor, { left: 5, top: 100, width: 20, height: 20 });
    stubRect(content, { width: 200, height: 30 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      placement: () => "bottom",
      collision: () => "flip-shift",
      offset: () => 8,
      viewportPadding: () => 8,
    });
    host.connect();

    expect(controller.state.left).toBe(8);

    document.body.innerHTML = "";
  });

  it("clamps left to the max bound when the centered position would overflow past the right edge", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { value: 300, configurable: true });

    // Anchor near the right edge: centered left would be
    // anchor.left(280) + (anchor.width(20) - content.width(200))/2 = 280 - 90 = 190.
    // maxLeft = viewportWidth(300) - content.width(200) - viewportPadding(8) = 92.
    // 190 > 92, so clamps to 92.
    stubRect(anchor, { left: 280, top: 100, width: 20, height: 20 });
    stubRect(content, { width: 200, height: 30 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      placement: () => "bottom",
      collision: () => "flip-shift",
      offset: () => 8,
      viewportPadding: () => 8,
    });
    host.connect();

    expect(controller.state.left).toBe(92);

    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth, configurable: true });
    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — collision: none", () => {
  it("skips both flip and clamp when collision is none, even with severe overflow", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    const originalInnerHeight = window.innerHeight;
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerHeight", { value: 100, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 100, configurable: true });

    // Anchor positioned so bottom placement would badly overflow both axes.
    stubRect(anchor, { left: 90, top: 90, width: 10, height: 10 });
    stubRect(content, { width: 500, height: 500 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      placement: () => "bottom",
      collision: () => "none",
      offset: () => 8,
    });
    host.connect();

    // Stays "bottom" (no flip) with unclamped top/left despite overflow.
    expect(controller.state.placement).toBe("bottom");
    // top = anchor.bottom(100) + offset(8) = 108 — no clamp applied.
    expect(controller.state.top).toBe(108);
    // left = anchor.left(90) + (10 - 500)/2 = 90 - 245 = -155 — no clamp applied.
    expect(controller.state.left).toBe(-155);

    Object.defineProperty(window, "innerHeight", { value: originalInnerHeight, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth, configurable: true });
    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — ready flag and missing nodes", () => {
  it("is not ready before hostConnected/reconcile runs", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 0, top: 0, width: 10, height: 10 });
    stubRect(content, { width: 10, height: 10 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
    });

    expect(controller.state.ready).toBe(false);
    expect(controller.state.top).toBe(0);
    expect(controller.state.left).toBe(0);

    document.body.innerHTML = "";
  });

  it("stays not-ready when open is false", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 0, top: 0, width: 10, height: 10 });
    stubRect(content, { width: 10, height: 10 });

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => false,
    });
    host.connect();

    expect(controller.state.ready).toBe(false);

    document.body.innerHTML = "";
  });

  it("stays not-ready when anchor or content nodes are null", () => {
    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => null,
      content: () => null,
      open: () => true,
    });
    host.connect();

    expect(controller.state.ready).toBe(false);
  });

  it("resets to hidden state when open transitions from true to false", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 200, top: 100, width: 100, height: 40 });
    stubRect(content, { width: 60, height: 20 });

    let open = true;
    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => open,
    });
    host.connect();
    expect(controller.state.ready).toBe(true);

    open = false;
    host.update();
    expect(controller.state.ready).toBe(false);

    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — onChange notification", () => {
  it("calls onChange when the computed state changes", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 200, top: 100, width: 100, height: 40 });
    stubRect(content, { width: 60, height: 20 });

    const onChange = vi.fn();
    const host = new FakeHost();
    new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
      onChange,
    });
    host.connect();

    expect(onChange).toHaveBeenCalled();

    document.body.innerHTML = "";
  });
});

describe("AnchoredPositionController — teardown", () => {
  it("removes scroll/resize listeners on hostDisconnected", () => {
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    document.body.append(anchor, content);
    stubRect(anchor, { left: 0, top: 0, width: 10, height: 10 });
    stubRect(content, { width: 10, height: 10 });

    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const host = new FakeHost();
    const controller = new AnchoredPositionController(host, {
      anchor: () => anchor,
      content: () => content,
      open: () => true,
    });
    host.connect();
    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    host.disconnect();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function), true);
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    expect(controller.state.ready).toBe(false);

    addSpy.mockRestore();
    removeSpy.mockRestore();
    document.body.innerHTML = "";
  });
});
