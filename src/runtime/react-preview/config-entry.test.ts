import { describe, it, expect } from "vitest";
import { buildConfigEntrySource } from "./config-entry";

// These assert on the GENERATED SOURCE shape — the contract the config-mode
// entry must satisfy for the over-the-wire channel to work. The actual runtime
// behavior (re-render + style patch in a real document) is proven by the
// chrome-devtools manual verification (spec A3); here we lock the structure so
// a regression in the emitter is caught fast.

describe("buildConfigEntrySource", () => {
  it("emits a persistent render target: single createRoot, no per-change rebuild", () => {
    const src = buildConfigEntrySource("Button", "Button");
    // One root, created once.
    expect(src).toContain("createRoot");
    expect((src.match(/createRoot\(/g) ?? []).length).toBe(1);
    // Imports the component by absolute Vite-served path (sibling resolution).
    expect(src).toContain(
      'from "/packages/ds-react/src/components/Button/Button.tsx"',
    );
  });

  it("listens for fsds:config and ignores other message types", () => {
    const src = buildConfigEntrySource("Button", "Button");
    expect(src).toContain('addEventListener("message"');
    expect(src).toContain('data.type !== "fsds:config"');
    // Full-prop REPLACE semantics (so removing a prop clears it), not a
    // merge-into-stale.
    expect(src).toContain("currentProps = data.props");
  });

  it("applies token overrides into a dedicated <style data-fsds=overrides> element", () => {
    const src = buildConfigEntrySource("Button", "Button");
    expect(src).toContain("__fsds_overrides");
    expect(src).toContain('setAttribute("data-fsds", "overrides")');
    expect(src).toContain("data.tokenCss");
    // The override style is appended to <head> so it layers over component CSS.
    expect(src).toContain("document.head.appendChild");
  });

  it("renders the child label for components that render children (Button)", () => {
    const src = buildConfigEntrySource("Button", "Button");
    // The label is emitted as a string literal and spread as children.
    expect(src).toContain('const CHILD = "Button"');
  });

  it("emits no child for void/self-closing components (CHILD = null)", () => {
    const src = buildConfigEntrySource("Divider", null);
    expect(src).toContain("const CHILD = null");
  });

  it("posts fsds:ready after first mount for the parent handshake", () => {
    const src = buildConfigEntrySource("Button", "Button");
    expect(src).toContain('parent.postMessage({ type: "fsds:ready" }');
    // ready is posted AFTER the initial render call.
    const renderIdx = src.lastIndexOf("renderNow();");
    const readyIdx = src.indexOf('parent.postMessage({ type: "fsds:ready" }');
    expect(readyIdx).toBeGreaterThan(renderIdx);
  });

  it("forwards render errors to the parent as fsds:error (no silent failure)", () => {
    const src = buildConfigEntrySource("Button", "Button");
    expect(src).toContain('type: "fsds:error"');
  });
});
