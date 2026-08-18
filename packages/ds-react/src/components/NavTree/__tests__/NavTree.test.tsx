// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { NavTree, NavTreeList, NavTreeItem } from "../NavTree";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("NavTree — unit", () => {
  it("renders with default props", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"}>content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"}>content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toHaveClass("nav-tree");
  });

  it("merges custom className", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"} className="custom">content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toHaveClass("nav-tree", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"}>content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toHaveAttribute("role", "listitem");
  });

  it("applies iconSize=sm variant class", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"} iconSize="sm">content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toHaveClass("nav-tree--sm");
  });

  it("applies iconSize=md variant class", () => {
    render(<NavTree data-testid="nav-tree" label={"placeholder"} iconSize="md">content</NavTree>);
    expect(screen.getByTestId("nav-tree")).toHaveClass("nav-tree--md");
  });
});

describe("NavTree — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><ul><NavTree aria-label="Test NavTree" label={"placeholder"}>content</NavTree></ul></>);
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
