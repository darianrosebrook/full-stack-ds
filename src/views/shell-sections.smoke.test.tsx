// Wave-two render smokes: the app shell, sidebar, code viewer, and the
// remaining data-driven sections.
import { beforeAll, describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { bundle } from "../types/bundle";
import { App } from "../app";
import { Sidebar } from "../layout/Sidebar";
import { CodeViewer } from "../components/CodeViewer";
import { TokensTable } from "./sections/TokensTable";
import { VariantsMatrix } from "./sections/VariantsMatrix";
import { UsageExamples } from "./sections/UsageExamples";

beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(cleanup);

describe("showcase shell and sections — render smoke", () => {
  it("App renders the full shell", () => {
    render(<App />);
    expect(document.querySelector("h1")).toBeTruthy();
  });

  it("Sidebar renders the component navigation", () => {
    render(<Sidebar bundle={bundle} route={{ kind: "home" }} />);
    expect(document.body.textContent).toContain("Architecture");
  });

  it("CodeViewer renders the given code", () => {
    render(<CodeViewer code="const x = 1;" filename="x.ts" />);
    expect(document.body.textContent).toContain("const x = 1;");
  });

  it("TokensTable renders token definitions", () => {
    const component = bundle.components[0];
    const tokens = component.tokens ?? {};
    const { container } = render(<TokensTable tokens={tokens} />);
    expect(container).toBeTruthy();
  });

  it("VariantsMatrix renders the variant grid for the first component", () => {
    const { container } = render(<VariantsMatrix component={bundle.components[0]} />);
    expect(container).toBeTruthy();
  });

  it("UsageExamples renders curated examples", () => {
    const { container } = render(<UsageExamples component={bundle.components[0]} />);
    expect(container).toBeTruthy();
  });
});
