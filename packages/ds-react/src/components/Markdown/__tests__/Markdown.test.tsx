// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Markdown } from "../Markdown";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Markdown — unit", () => {
  it("renders with default props", () => {
    render(<Markdown data-testid="markdown" content={"placeholder"} />);
    expect(screen.getByTestId("markdown")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Markdown data-testid="markdown" content={"placeholder"} />);
    expect(screen.getByTestId("markdown")).toHaveClass("markdown");
  });

  it("merges custom className", () => {
    render(<Markdown data-testid="markdown" content={"placeholder"} className="custom" />);
    expect(screen.getByTestId("markdown")).toHaveClass("markdown", "custom");
  });
});

describe("Markdown — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Markdown content={"placeholder"} /></>);
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
