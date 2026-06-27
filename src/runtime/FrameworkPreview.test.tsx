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
  it("legacy-pipeline framework (Angular) mounts with srcDoc + scripts-only sandbox", () => {
    // After ADR-PREVIEW-PIPELINE-001 step 4 Angular is the only framework
    // still on the legacy in-iframe shell — its preview path uses srcdoc
    // wrapping an importmap pointing at /preview/angular/<file>.js compiled
    // by the existing angular-compiler plugin. Sandbox stays at scripts-only
    // because srcdoc's origin is null and allow-same-origin would no-op.
    render(<FrameworkPreview framework="angular" {...COMMON_PROPS} />);
    const iframe = getIframe();
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts");
    const srcDoc = iframe.getAttribute("srcdoc") ?? "";
    expect(srcDoc).toContain("<!doctype html>");
    expect(iframe.getAttribute("src")).toBeNull();
  });

  it.each<Framework>(["react", "vue", "svelte", "lit"])(
    "new-pipeline framework (%s) mounts with src + allow-same-origin sandbox",
    (framework) => {
      // React/Vue/Svelte/Lit each load via /preview/<fw>/<Name> served by
      // their respective fsds-<fw>-preview plugins (ADR-PREVIEW-PIPELINE-001
      // steps 2 + 4). The iframe needs `allow-same-origin` so its dynamic
      // module imports succeed (pitfall #2: opaque origins CORS-block /@id/
      // fetches).
      render(<FrameworkPreview framework={framework} {...COMMON_PROPS} />);
      const iframe = getIframe();
      expect(iframe.getAttribute("sandbox")).toBe("allow-scripts allow-same-origin");
      expect(iframe.getAttribute("src")).toBe(`/preview/${framework}/Button`);
      expect(iframe.getAttribute("srcdoc")).toBeNull();
    },
  );

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

  it("swaps iframe contract (src ↔ srcDoc) when the framework prop changes", () => {
    // React (new pipeline) → Angular (legacy pipeline) flips the iframe
    // between `src` and `srcdoc`. Both must work; switching back must clean
    // up. After step 4 Angular is the only legacy framework, so it's the
    // only direction this transition still tests.
    const { rerender } = render(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    let iframe = getIframe();
    expect(iframe.getAttribute("src")).toBe("/preview/react/Button");
    expect(iframe.getAttribute("srcdoc")).toBeNull();

    rerender(<FrameworkPreview framework="angular" {...COMMON_PROPS} />);
    iframe = getIframe();
    expect(iframe.getAttribute("src")).toBeNull();
    const angularSrcDoc = iframe.getAttribute("srcdoc") ?? "";
    expect(angularSrcDoc).toContain("<!doctype html>");

    rerender(<FrameworkPreview framework="react" {...COMMON_PROPS} />);
    iframe = getIframe();
    expect(iframe.getAttribute("src")).toBe("/preview/react/Button");
    expect(iframe.getAttribute("srcdoc")).toBeNull();
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

  it("renders a legacy-pipeline srcDoc for framework=angular", () => {
    // Angular keeps the legacy in-iframe shell because its preview path
    // depends on the angular-compiler plugin's AOT cache at /preview/angular/.
    // The srcdoc bundles an importmap pointing at those compiled files.
    render(<FrameworkPreview framework="angular" {...COMMON_PROPS} />);
    const iframe = getIframe();
    const srcDoc = iframe.getAttribute("srcdoc") ?? "";
    expect(srcDoc.length).toBeGreaterThan(100);
    expect(srcDoc).toContain("<!doctype html>");
    expect(iframe.getAttribute("src")).toBeNull();
  });

  it.each<Framework>(["react", "vue", "svelte", "lit"])(
    "renders a new-pipeline src URL for framework=%s",
    (framework) => {
      // Each of these frameworks has its own fsds-<fw>-preview plugin
      // (ADR-PREVIEW-PIPELINE-001 steps 2 + 4). The iframe loads from
      // /preview/<fw>/<Name>; the plugin synthesizes the shell HTML and
      // virtual entry server-side.
      render(<FrameworkPreview framework={framework} {...COMMON_PROPS} />);
      const iframe = getIframe();
      expect(iframe.getAttribute("src")).toBe(`/preview/${framework}/Button`);
      expect(iframe.getAttribute("srcdoc")).toBeNull();
    },
  );

  it("keeps new-pipeline URLs stable when previews are driven over the message bus", () => {
    render(
      <FrameworkPreview
        framework="vue"
        config={{ props: { text: "Panel text", as: "kbd" }, tokenCss: "" }}
        {...COMMON_PROPS}
      />,
    );

    const iframe = getIframe();
    expect(iframe.getAttribute("src")).toBe("/preview/vue/Button");
  });
});
