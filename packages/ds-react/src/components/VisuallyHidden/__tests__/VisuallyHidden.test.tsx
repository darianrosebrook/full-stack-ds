// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { VisuallyHidden } from "../VisuallyHidden";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("VisuallyHidden — unit", () => {
  it("renders with default props", () => {
    render(<VisuallyHidden data-testid="visually-hidden">content</VisuallyHidden>);
    expect(screen.getByTestId("visually-hidden")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<VisuallyHidden data-testid="visually-hidden">content</VisuallyHidden>);
    expect(screen.getByTestId("visually-hidden")).toHaveClass("visually-hidden");
  });

  it("merges custom className", () => {
    render(<VisuallyHidden data-testid="visually-hidden" className="custom">content</VisuallyHidden>);
    expect(screen.getByTestId("visually-hidden")).toHaveClass("visually-hidden", "custom");
  });
});

describe("VisuallyHidden — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><VisuallyHidden>content</VisuallyHidden></>);
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
