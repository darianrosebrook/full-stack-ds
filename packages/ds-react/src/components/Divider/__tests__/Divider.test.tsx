// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Divider } from "../Divider";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Divider — unit", () => {
  it("renders with default props", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider")).toHaveClass("divider");
  });

  it("merges custom className", () => {
    render(<Divider data-testid="divider" className="custom" />);
    expect(screen.getByTestId("divider")).toHaveClass("divider", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId("divider")).toHaveAttribute("role", "separator");
  });

  it("applies orientation=horizontal variant class", () => {
    render(<Divider data-testid="divider" orientation="horizontal" />);
    expect(screen.getByTestId("divider")).toHaveClass("divider--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    expect(screen.getByTestId("divider")).toHaveClass("divider--vertical");
  });
});

describe("Divider — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Divider /></>);
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
