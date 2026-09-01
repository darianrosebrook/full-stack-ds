// View render-smoke suites: each view renders against the real bundle data
// and asserts its headline surface. Presentation views were the largest
// 0%-coverage block in the showcase package.
import { describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { bundle } from "../types/bundle";
import { Home } from "./Home";
import { ArchitectureView } from "./ArchitectureView";
import { DisplayCaseView } from "./DisplayCaseView";
import { TokensPhilosophyView } from "./TokensPhilosophyView";
import { ComponentStandardsView } from "./ComponentStandardsView";
import { ComponentComplexityView } from "./ComponentComplexityView";
import { PropertiesScratchView } from "./PropertiesScratchView";
import { DesignView } from "./DesignView";
import { DeveloperView } from "./DeveloperView";

afterEach(cleanup);

describe("showcase views — render smoke", () => {
  it("Home renders the census-driven overview", () => {
    render(<Home bundle={bundle} />);
    expect(document.querySelector("h1")).toBeTruthy();
    expect(document.body.textContent).toContain("component");
  });

  it("ArchitectureView renders the claim summary", () => {
    render(<ArchitectureView bundle={bundle} />);
    expect(document.querySelector("h1")?.textContent).toContain("compositional");
  });

  it("DisplayCaseView renders the component gallery", () => {
    render(<DisplayCaseView bundle={bundle} />);
    expect(document.querySelector("h1")).toBeTruthy();
  });

  it("TokensPhilosophyView renders the philosophy tabs", () => {
    render(<TokensPhilosophyView tab="overview" />);
    expect(document.querySelector("h1")).toBeTruthy();
    expect(document.body.textContent).toContain("Philosophy");
  });

  it("ComponentStandardsView renders the standards tabs", () => {
    render(<ComponentStandardsView tab="overview" />);
    expect(document.querySelector("h1")).toBeTruthy();
    expect(document.body.textContent).toContain("Overview");
  });

  it("ComponentComplexityView renders the complexity tabs", () => {
    render(<ComponentComplexityView tab="overview" />);
    expect(document.querySelector("h1")).toBeTruthy();
  });

  it("PropertiesScratchView renders the property sandbox", () => {
    render(<PropertiesScratchView />);
    expect(document.querySelector("h1")).toBeTruthy();
  });

  it("DesignView renders the component surface for the first component", () => {
    render(<DesignView component={bundle.components[0]} />);
    expect(document.querySelector("h1")).toBeTruthy();
    expect(screen.getAllByText(bundle.components[0].name).length).toBeGreaterThan(0);
  });

  it("DeveloperView renders the developer surface", () => {
    render(<DeveloperView component={bundle.components[0]} />);
    expect(document.querySelector("h1")).toBeTruthy();
  });
});
