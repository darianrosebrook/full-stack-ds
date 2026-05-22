// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { NavList, NavListList, NavListItem } from "../NavList";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("NavList — unit", () => {
  it("renders with default props", () => {
    render(<NavList data-testid="nav-list">content</NavList>);
    expect(screen.getByTestId("nav-list")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<NavList data-testid="nav-list">content</NavList>);
    expect(screen.getByTestId("nav-list")).toHaveClass("nav-list");
  });

  it("merges custom className", () => {
    render(<NavList data-testid="nav-list" className="custom">content</NavList>);
    expect(screen.getByTestId("nav-list")).toHaveClass("nav-list", "custom");
  });

  it("applies orientation=vertical variant class", () => {
    render(<NavList data-testid="nav-list" orientation="vertical">content</NavList>);
    expect(screen.getByTestId("nav-list")).toHaveClass("nav-list--vertical");
  });

  it("applies orientation=horizontal variant class", () => {
    render(<NavList data-testid="nav-list" orientation="horizontal">content</NavList>);
    expect(screen.getByTestId("nav-list")).toHaveClass("nav-list--horizontal");
  });
});

describe("NavList — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><NavList aria-label="Test NavList">content</NavList></>);
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
