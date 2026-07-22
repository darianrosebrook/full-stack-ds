import { describe, expect, it } from "@jest/globals";
import { DestroyRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createAnchoredPosition } from "../createAnchoredPosition";

/**
 * Pins the PURE computation in createAnchoredPosition against mocked
 * getBoundingClientRect (jsdom returns all-zero rects by default, so
 * every test stubs the anchor/content rects it needs). Framework-
 * neutral math — mirrors packages/ds-react/src/primitives/surfaces/
 * useAnchoredPosition.ts's computePosition verbatim.
 */

function stubRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  const full: DOMRect = {
    x: rect.left ?? 0,
    y: rect.top ?? 0,
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    top: rect.top ?? 0,
    left: rect.left ?? 0,
    right: (rect.left ?? 0) + (rect.width ?? 0),
    bottom: (rect.top ?? 0) + (rect.height ?? 0),
    toJSON: () => ({}),
  };
  el.getBoundingClientRect = () => full;
}

function withDestroyRef(fn: (destroyRef: DestroyRef) => void): void {
  TestBed.runInInjectionContext(() => {
    fn(TestBed.inject(DestroyRef));
  });
}

describe("createAnchoredPosition — pure computation", () => {
  it("bottom placement: top = anchor.bottom + offset, left centers content under anchor", () => {
    withDestroyRef((destroyRef) => {
      const anchor = document.createElement("button");
      const content = document.createElement("div");
      stubRect(anchor, { top: 100, left: 50, width: 40, height: 20 });
      stubRect(content, { width: 100, height: 30 });
      window.innerWidth = 1024;
      window.innerHeight = 768;

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "flip-shift",
        destroyRef,
      });
      requestUpdate();

      // anchor.bottom = 100 + 20 = 120; + default offset 8 = 128.
      expect(state().top).toBe(128);
      // anchor.left(50) + (anchor.width(40) - content.width(100)) / 2 = 50 + (-60/2) = 20.
      expect(state().left).toBe(20);
      expect(state().placement).toBe("bottom");
      expect(state().ready).toBe(true);
    });
  });

  it("flips bottom→top when bottom overflow exceeds top overflow", () => {
    withDestroyRef((destroyRef) => {
      const anchor = document.createElement("button");
      const content = document.createElement("div");
      // Anchor near the bottom edge of an 800px-tall viewport; content
      // is tall enough that placing it below the anchor overflows the
      // viewport bottom by more than placing it above overflows the top.
      stubRect(anchor, { top: 750, left: 100, width: 40, height: 20 });
      stubRect(content, { width: 100, height: 300 });
      window.innerWidth = 1024;
      window.innerHeight = 800;

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "flip-shift",
        destroyRef,
      });
      requestUpdate();

      expect(state().placement).toBe("top");
      // Flipped: top = anchor.top(750) - content.height(300) - offset(8) = 442.
      expect(state().top).toBe(442);
    });
  });

  it("clamps cross-axis (left) to viewportPadding when centered position would overflow", () => {
    withDestroyRef((destroyRef) => {
      const anchor = document.createElement("button");
      const content = document.createElement("div");
      // Anchor near the left edge; a wide content box centered under
      // it would compute a negative left — clamp expects viewportPadding.
      stubRect(anchor, { top: 100, left: 5, width: 20, height: 20 });
      stubRect(content, { width: 200, height: 30 });
      window.innerWidth = 1024;
      window.innerHeight = 768;

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "flip-shift",
        viewportPadding: 8,
        destroyRef,
      });
      requestUpdate();

      // Unclamped left = 5 + (20 - 200)/2 = 5 - 90 = -85 → clamps to 8.
      expect(state().left).toBe(8);
    });
  });

  it('collision "none" skips both flip and clamp, even when content overflows the viewport', () => {
    withDestroyRef((destroyRef) => {
      const anchor = document.createElement("button");
      const content = document.createElement("div");
      stubRect(anchor, { top: 750, left: 5, width: 20, height: 20 });
      stubRect(content, { width: 300, height: 300 });
      window.innerWidth = 1024;
      window.innerHeight = 800;

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => true,
        placement: () => "bottom",
        collision: () => "none",
        destroyRef,
      });
      requestUpdate();

      expect(state().placement).toBe("bottom");
      // No flip: top = anchor.bottom(770) + offset(8) = 778 (overflows viewport, uncorrected).
      expect(state().top).toBe(778);
      // No clamp: left = 5 + (20 - 300)/2 = 5 - 140 = -135 (uncorrected).
      expect(state().left).toBe(-135);
    });
  });

  it("stays not-ready (HIDDEN_STATE) before open, without touching the DOM nodes", () => {
    withDestroyRef((destroyRef) => {
      const anchor = document.createElement("button");
      const content = document.createElement("div");
      stubRect(anchor, { top: 100, left: 50, width: 40, height: 20 });
      stubRect(content, { width: 100, height: 30 });

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchor,
        content: () => content,
        open: () => false,
        destroyRef,
      });
      requestUpdate();

      expect(state().ready).toBe(false);
      expect(state().top).toBe(0);
      expect(state().left).toBe(0);
      expect(state().placement).toBe("bottom");
    });
  });

  it("stays not-ready when open is true but anchor/content nodes are null", () => {
    withDestroyRef((destroyRef) => {
      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => null,
        content: () => null,
        open: () => true,
        destroyRef,
      });
      requestUpdate();

      expect(state().ready).toBe(false);
    });
  });

  it("transitions from not-ready to ready once nodes are registered and requestUpdate runs again", () => {
    withDestroyRef((destroyRef) => {
      let anchorEl: HTMLElement | null = null;
      let contentEl: HTMLElement | null = null;

      const { state, requestUpdate } = createAnchoredPosition({
        anchor: () => anchorEl,
        content: () => contentEl,
        open: () => true,
        destroyRef,
      });
      requestUpdate();
      expect(state().ready).toBe(false);

      anchorEl = document.createElement("button");
      contentEl = document.createElement("div");
      stubRect(anchorEl, { top: 10, left: 10, width: 10, height: 10 });
      stubRect(contentEl, { width: 10, height: 10 });
      requestUpdate();

      expect(state().ready).toBe(true);
    });
  });
});
