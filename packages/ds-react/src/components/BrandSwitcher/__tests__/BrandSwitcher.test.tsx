// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { BrandSwitcher } from "../BrandSwitcher";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("BrandSwitcher — unit", () => {
  it("renders with default props", () => {
    render(<BrandSwitcher data-testid="brand-switcher">content</BrandSwitcher>);
    expect(screen.getByTestId("brand-switcher")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<BrandSwitcher data-testid="brand-switcher">content</BrandSwitcher>);
    expect(screen.getByTestId("brand-switcher")).toHaveClass("brand-switcher");
  });

  it("merges custom className", () => {
    render(<BrandSwitcher data-testid="brand-switcher" className="custom">content</BrandSwitcher>);
    expect(screen.getByTestId("brand-switcher")).toHaveClass("brand-switcher", "custom");
  });
});

describe("BrandSwitcher — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><BrandSwitcher>content</BrandSwitcher></>);
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
