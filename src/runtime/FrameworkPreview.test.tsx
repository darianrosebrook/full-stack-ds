import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { FrameworkPreview } from "./FrameworkPreview";
import type { Framework, SourceFile } from "../types/data";

function makeSource(code: string): SourceFile {
  return { filename: "Button.tsx", code };
}

function getIframe(): HTMLIFrameElement {
  const el = document.querySelector<HTMLIFrameElement>("iframe.preview-iframe");
  expect(el, "preview iframe must be in the DOM").not.toBeNull();
  return el!;
}

// Dispatch a MessageEvent at the window with `source` set to the iframe's
// contentWindow. The component filters on `e.source === iframeRef.current.contentWindow`,
// so this mirrors what the real iframe boot script does via `parent.postMessage`.
function postFromIframe(iframe: HTMLIFrameElement, data: unknown): void {
  const event = new MessageEvent("message", {
    data,
    source: iframe.contentWindow,
  });
  window.dispatchEvent(event);
}

function postFromForeign(data: unknown): void {
  // Source is `null` / "some other window" — should be ignored.
  const event = new MessageEvent("message", { data, source: null });
  window.dispatchEvent(event);
}

const COMMON_PROPS = {
  componentName: "Button",
  componentSource: makeSource("export function Button() { return null; }"),
  demo: 'import { Button } from "./Button";',
};

describe("FrameworkPreview", () => {
  it("mounts an iframe with srcDoc set and the scripts-only sandbox", () => {
    render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    const iframe = getIframe();
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts");
    const srcDoc = iframe.getAttribute("srcdoc") ?? "";
    // Sanity: the React shell renders a full HTML document.
    expect(srcDoc).toContain("<!doctype html>");
    // Sanity: the user-supplied source is embedded into the boot module.
    expect(srcDoc).toContain("export function Button()");
  });

  it("starts in a loading state with a 'Booting <framework>…' indicator", () => {
    render(<FrameworkPreview framework="vue" {...COMMON_PROPS} />);
    expect(screen.getByText(/Booting vue/)).toBeInTheDocument();
  });

  it("clears the loading state when the iframe posts fsds:ready", () => {
    render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    const iframe = getIframe();
    expect(screen.getByText(/Booting react/)).toBeInTheDocument();
    act(() => {
      postFromIframe(iframe, { type: "fsds:ready" });
    });
    expect(screen.queryByText(/Booting react/)).not.toBeInTheDocument();
  });

  it("surfaces fsds:error as an alert with the message text", () => {
    render(<FrameworkPreview framework="svelte" {...COMMON_PROPS} />);
    const iframe = getIframe();
    act(() => {
      postFromIframe(iframe, { type: "fsds:error", message: "Boom: TypeError at line 42" });
    });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Boom: TypeError at line 42");
  });

  it("ignores postMessages from windows other than its own iframe", () => {
    // Cross-iframe isolation: when multiple FrameworkPreviews mount in the
    // same page, a `ready` from preview A must not clear preview B's loading
    // state. The component does this by comparing `e.source` to the local
    // iframe's contentWindow.
    render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    expect(screen.getByText(/Booting react/)).toBeInTheDocument();
    act(() => {
      postFromForeign({ type: "fsds:ready" });
    });
    // Still loading — the foreign source was ignored.
    expect(screen.getByText(/Booting react/)).toBeInTheDocument();
  });

  it("rebuilds the srcDoc when the framework prop changes", () => {
    const { rerender } = render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    const reactSrcDoc = getIframe().getAttribute("srcdoc") ?? "";
    expect(reactSrcDoc).toContain('"react"'); // import map entry

    rerender(<FrameworkPreview framework="vue" {...COMMON_PROPS} />);
    const vueSrcDoc = getIframe().getAttribute("srcdoc") ?? "";
    expect(vueSrcDoc).toContain('"vue"');
    expect(vueSrcDoc).not.toBe(reactSrcDoc);
  });

  it("disables pointer events on the iframe when interactive=false", () => {
    render(<FrameworkPreview framework="react" interactive={false} {...COMMON_PROPS} />);
    const iframe = getIframe();
    expect(iframe.style.pointerEvents).toBe("none");
  });

  it("forwards the height prop to the iframe inline style", () => {
    render(<FrameworkPreview framework="react" height={420} {...COMMON_PROPS} />);
    const iframe = getIframe();
    expect(iframe.style.height).toBe("420px");
  });

  it.each<Framework>(["react", "vue", "svelte", "lit", "angular"])(
    "renders a unique srcDoc for framework=%s",
    (framework) => {
      render(<FrameworkPreview framework={framework} {...COMMON_PROPS} />);
      const srcDoc = getIframe().getAttribute("srcdoc") ?? "";
      expect(srcDoc.length).toBeGreaterThan(100);
      expect(srcDoc).toContain("<!doctype html>");
    },
  );
});
