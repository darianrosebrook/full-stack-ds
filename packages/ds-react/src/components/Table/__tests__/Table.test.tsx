// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Table, TableBody, TableFooter, TableHeader } from "../Table";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Table — unit", () => {
  it("renders with default props", () => {
    render(<Table data-testid="table">content</Table>);
    expect(screen.getByTestId("table")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Table data-testid="table">content</Table>);
    expect(screen.getByTestId("table")).toHaveClass("table");
  });

  it("merges custom className", () => {
    render(<Table data-testid="table" className="custom">content</Table>);
    expect(screen.getByTestId("table")).toHaveClass("table", "custom");
  });
});

describe("Table — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Table aria-label="Test Table">content</Table></>);
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
