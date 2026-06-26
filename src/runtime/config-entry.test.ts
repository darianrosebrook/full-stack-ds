import { describe, it, expect } from "vitest";
import { buildConfigEntrySource } from "./config-entry";

const RENDERER = `
function renderComponent(props, child) {
  window.__lastRender = { props, child };
}`;

describe("buildConfigEntrySource", () => {
  it("owns the framework-neutral fsds:config message bus", () => {
    const src = buildConfigEntrySource({
      childLabel: "Button",
      defaultProps: { type: "button" },
      rendererSource: RENDERER,
    });

    expect(src).toContain('data.type !== "fsds:config"');
    expect(src).toContain("currentProps = data.props");
    expect(src).toContain('const DEFAULT_PROPS = {"type":"button"}');
    expect(src).toContain('const CHILD = "Button"');
  });

  it("applies token overrides through the same bus contract", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: {},
      rendererSource: RENDERER,
    });

    expect(src).toContain("__fsds_overrides");
    expect(src).toContain('setAttribute("data-fsds", "overrides")');
    expect(src).toContain("data.tokenCss");
  });

  it("delegates framework specifics to the renderer source", () => {
    const src = buildConfigEntrySource({
      childLabel: null,
      defaultProps: {},
      rendererSource: RENDERER,
    });

    expect(src).toContain(RENDERER.trim());
    expect(src).toContain("renderComponent(currentProps, CHILD)");
  });

  it("posts ready after first render and forwards render errors", () => {
    const src = buildConfigEntrySource({
      childLabel: "Button",
      defaultProps: {},
      rendererSource: RENDERER,
    });

    const renderIdx = src.lastIndexOf("renderNow();");
    const readyIdx = src.indexOf('parent.postMessage({ type: "fsds:ready" }');
    expect(readyIdx).toBeGreaterThan(renderIdx);
    expect(src).toContain('type: "fsds:error"');
  });
});
