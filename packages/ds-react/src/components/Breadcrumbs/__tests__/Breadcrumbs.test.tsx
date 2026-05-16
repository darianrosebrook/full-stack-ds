// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Breadcrumbs, BreadcrumbsList } from "../Breadcrumbs";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Breadcrumbs — unit", () => {
  it("renders with default props", () => {
    render(<Breadcrumbs data-testid="breadcrumbs">content</Breadcrumbs>);
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Breadcrumbs data-testid="breadcrumbs">content</Breadcrumbs>);
    expect(screen.getByTestId("breadcrumbs")).toHaveClass("breadcrumbs");
  });

  it("merges custom className", () => {
    render(<Breadcrumbs data-testid="breadcrumbs" className="custom">content</Breadcrumbs>);
    expect(screen.getByTestId("breadcrumbs")).toHaveClass("breadcrumbs", "custom");
  });
});

describe("Breadcrumbs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Breadcrumbs aria-label="Test Breadcrumbs">content</Breadcrumbs></>);
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
