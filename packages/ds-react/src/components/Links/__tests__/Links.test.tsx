// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Links } from "../Links";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Links — unit", () => {
  it("renders with default props", () => {
    render(<Links data-testid="links">content</Links>);
    expect(screen.getByTestId("links")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Links data-testid="links">content</Links>);
    expect(screen.getByTestId("links")).toHaveClass("links");
  });

  it("merges custom className", () => {
    render(<Links data-testid="links" className="custom">content</Links>);
    expect(screen.getByTestId("links")).toHaveClass("links", "custom");
  });

  it("applies size=small variant class", () => {
    render(<Links data-testid="links" size="small">content</Links>);
    expect(screen.getByTestId("links")).toHaveClass("links--small");
  });

  it("applies size=medium variant class", () => {
    render(<Links data-testid="links" size="medium">content</Links>);
    expect(screen.getByTestId("links")).toHaveClass("links--medium");
  });

  it("applies size=large variant class", () => {
    render(<Links data-testid="links" size="large">content</Links>);
    expect(screen.getByTestId("links")).toHaveClass("links--large");
  });
});

describe("Links — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Links>content</Links></>);
    const results = await axe(container) as unknown as { violations: Array<{ id: string }> };
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "role-img-alt",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
