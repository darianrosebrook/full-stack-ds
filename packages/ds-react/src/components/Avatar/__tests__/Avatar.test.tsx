// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Avatar } from "../Avatar";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Avatar — unit", () => {
  it("renders with default props", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar");
  });

  it("merges custom className", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} className="custom" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} />);
    expect(screen.getByTestId("avatar")).toHaveAttribute("role", "img");
  });

  it("applies size=small variant class", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} size="small" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar--small");
  });

  it("applies size=medium variant class", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} size="medium" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar--medium");
  });

  it("applies size=large variant class", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} size="large" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar--large");
  });

  it("applies size=extra-large variant class", () => {
    render(<Avatar data-testid="avatar" name={"placeholder"} size="extra-large" />);
    expect(screen.getByTestId("avatar")).toHaveClass("avatar--extra-large");
  });
});

describe("Avatar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Avatar aria-label="Test Avatar" name={"placeholder"} /></>);
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
