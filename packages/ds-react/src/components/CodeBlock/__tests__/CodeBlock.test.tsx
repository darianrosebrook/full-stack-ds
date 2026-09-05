// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { CodeBlock } from "../CodeBlock";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("CodeBlock — unit", () => {
  it("renders with default props", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} />);
    expect(screen.getByTestId("code-block")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} />);
    expect(screen.getByTestId("code-block")).toHaveClass("code-block");
  });

  it("merges custom className", () => {
    render(<CodeBlock data-testid="code-block" code={"placeholder"} language={"bash"} className="custom" />);
    expect(screen.getByTestId("code-block")).toHaveClass("code-block", "custom");
  });
});

describe("CodeBlock — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { baseElement } = render(<><CodeBlock code={"placeholder"} language={"bash"} /></>);
    const component = baseElement.querySelector('[data-fsds-component="code-block"]');
    expect(component).not.toBeNull();
    const results = await axe(component!, componentAxeOptions) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
