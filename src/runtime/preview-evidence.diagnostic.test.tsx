import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { FrameworkPreview } from "./FrameworkPreview";
import type { SourceFile } from "../types/data";

function makeSource(code: string): SourceFile {
  return { filename: "Button.tsx", code };
}

function getIframe(): HTMLIFrameElement {
  const el = document.querySelector<HTMLIFrameElement>("iframe.preview-iframe");
  expect(el, "preview iframe must be in the DOM").not.toBeNull();
  return el!;
}

function postFromIframe(iframe: HTMLIFrameElement, data: unknown): void {
  window.dispatchEvent(new MessageEvent("message", { data, source: iframe.contentWindow }));
}

const COMMON_PROPS = {
  componentName: "Button",
  componentSource: makeSource("export function Button() { return null; }"),
  demo: 'import { Button } from "./Button";',
};

describe("FrameworkPreview effect-split evidence", () => {
  it("loading status resets when framework changes (the new effect's job)", () => {
    const { rerender } = render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    const iframe1 = getIframe();
    console.log("\n=== step 1: react mounted ===");
    console.log("status text:", screen.queryByText(/Booting/)?.textContent ?? "<none>");

    act(() => {
      postFromIframe(iframe1, { type: "fsds:ready" });
    });
    console.log("=== step 2: react posted fsds:ready ===");
    console.log("status text:", screen.queryByText(/Booting/)?.textContent ?? "<none>");
    // Expect: spinner gone (status === "ready")
    expect(screen.queryByText(/Booting/)).toBeNull();

    rerender(<FrameworkPreview framework="vue" {...COMMON_PROPS} />);
    console.log("=== step 3: switched framework to vue (no ready yet) ===");
    console.log("status text:", screen.queryByText(/Booting/)?.textContent ?? "<none>");
    // CRITICAL: after the rerender to vue, the spinner must come BACK
    // because the new shell hasn't booted. Before the effect split, this
    // was implicit in the listener re-attach; after the split, only the
    // `useEffect(..., [html])` reset does this.
    expect(screen.getByText(/Booting vue/)).toBeInTheDocument();
  });

  it("addEventListener('message') called exactly once across rerenders", () => {
    const origAdd = window.addEventListener;
    const origRemove = window.removeEventListener;
    let messageAddCount = 0;
    let messageRemoveCount = 0;
    window.addEventListener = function (type: string, ...rest: unknown[]) {
      if (type === "message") messageAddCount++;
      return (origAdd as Function).call(window, type, ...rest);
    } as typeof window.addEventListener;
    window.removeEventListener = function (type: string, ...rest: unknown[]) {
      if (type === "message") messageRemoveCount++;
      return (origRemove as Function).call(window, type, ...rest);
    } as typeof window.removeEventListener;

    try {
      const { rerender, unmount } = render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
      const afterMount = { adds: messageAddCount, removes: messageRemoveCount };
      rerender(<FrameworkPreview framework="vue" {...COMMON_PROPS} />);
      rerender(<FrameworkPreview framework="svelte" {...COMMON_PROPS} />);
      rerender(<FrameworkPreview framework="lit" {...COMMON_PROPS} />);
      const afterRerenders = { adds: messageAddCount, removes: messageRemoveCount };
      unmount();
      const afterUnmount = { adds: messageAddCount, removes: messageRemoveCount };

      console.log("\n=== listener accounting (message events only) ===");
      console.log("after mount:    ", afterMount);
      console.log("after 3 reren.: ", afterRerenders);
      console.log("after unmount:  ", afterUnmount);

      // After the effect split: the listener attaches ONCE on mount, never
      // again on rerender, and detaches ONCE on unmount.
      expect(afterMount.adds - afterMount.removes).toBe(1);
      expect(afterRerenders.adds).toBe(afterMount.adds); // no new attaches
      expect(afterUnmount.removes).toBe(afterMount.adds); // all detached
    } finally {
      window.addEventListener = origAdd;
      window.removeEventListener = origRemove;
    }
  });

  it("listener does NOT double-fire on html change (the listener effect's job)", () => {
    // If both effects re-attached the listener on every html change, we'd
    // accumulate listeners. Mount once, switch frameworks 5x, then send a
    // single fsds:ready and watch for status flicker.
    const { rerender } = render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    rerender(<FrameworkPreview framework="vue" {...COMMON_PROPS} />);
    rerender(<FrameworkPreview framework="svelte" {...COMMON_PROPS} />);
    rerender(<FrameworkPreview framework="lit" {...COMMON_PROPS} />);
    rerender(<FrameworkPreview framework="react" {...COMMON_PROPS} />);

    const iframe = getIframe();
    console.log("\n=== after 5 framework switches, posting one fsds:ready ===");
    act(() => {
      postFromIframe(iframe, { type: "fsds:ready" });
    });
    console.log("status text:", screen.queryByText(/Booting/)?.textContent ?? "<none>");
    // Single ready should clear the spinner, regardless of how many
    // rerenders happened.
    expect(screen.queryByText(/Booting/)).toBeNull();
  });

  it("ignores postMessages from foreign sources after effect split", () => {
    render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    console.log("\n=== foreign-source isolation ===");
    console.log("initial:", screen.queryByText(/Booting/)?.textContent);
    act(() => {
      window.dispatchEvent(new MessageEvent("message", { data: { type: "fsds:ready" }, source: null }));
    });
    console.log("after foreign post:", screen.queryByText(/Booting/)?.textContent);
    // Foreign source ignored; still booting.
    expect(screen.getByText(/Booting react/)).toBeInTheDocument();
  });
});
