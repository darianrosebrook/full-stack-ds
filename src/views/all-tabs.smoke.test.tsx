// Certification wave: every tab of the three documentation views renders
// its content. The tab panels were the largest remaining uncovered block.
import { describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { TokensPhilosophyView } from "./TokensPhilosophyView";
import { ComponentStandardsView } from "./ComponentStandardsView";
import { ComponentComplexityView } from "./ComponentComplexityView";
import type { TokensTab, StandardsTab, ComplexityTab } from "../router";

const TOKENS_TABS: TokensTab[] = [
  "overview",
  "core-vs-semantic",
  "box-model-primitive",
  "variant-redirection",
  "token-naming",
  "theming",
  "dtcg-formats",
  "resolver-module",
  "schema-validation",
  "build-outputs",
  "accessibility",
];

const STANDARDS_TABS: StandardsTab[] = [
  "overview",
  "anatomy",
  "props",
  "states",
  "usage",
  "accessibility",
];

const COMPLEXITY_TABS: ComplexityTab[] = [
  "overview",
  "primitives",
  "compounds",
  "composers",
  "assemblies",
];

afterEach(cleanup);

describe("TokensPhilosophyView — every tab renders", () => {
  for (const tab of TOKENS_TABS) {
    it(`renders the ${tab} tab`, () => {
      const { container } = render(<TokensPhilosophyView tab={tab} />);
      expect(container.querySelector("h1, h2, h3")).toBeTruthy();
    });
  }
});

describe("ComponentStandardsView — every tab renders", () => {
  for (const tab of STANDARDS_TABS) {
    it(`renders the ${tab} tab`, () => {
      const { container } = render(<ComponentStandardsView tab={tab} />);
      expect(container.querySelector("h1, h2, h3")).toBeTruthy();
    });
  }
});

describe("ComponentComplexityView — every tab renders", () => {
  for (const tab of COMPLEXITY_TABS) {
    it(`renders the ${tab} tab`, () => {
      const { container } = render(<ComponentComplexityView tab={tab} />);
      expect(container.querySelector("h1, h2, h3")).toBeTruthy();
    });
  }
});
