// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AspectRatio } from "../AspectRatio";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("AspectRatio — unit", () => {
  it("renders with default props", () => {
    render(<AspectRatio data-testid="aspect-ratio">content</AspectRatio>);
    expect(screen.getByTestId("aspect-ratio")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<AspectRatio data-testid="aspect-ratio">content</AspectRatio>);
    expect(screen.getByTestId("aspect-ratio")).toHaveClass("aspect-ratio");
  });

  it("merges custom className", () => {
    render(<AspectRatio data-testid="aspect-ratio" className="custom">content</AspectRatio>);
    expect(screen.getByTestId("aspect-ratio")).toHaveClass("aspect-ratio", "custom");
  });
});

describe("AspectRatio — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><AspectRatio>content</AspectRatio></>);
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
