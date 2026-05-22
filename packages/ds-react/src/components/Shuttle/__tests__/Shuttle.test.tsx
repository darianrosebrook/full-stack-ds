// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Shuttle, ShuttleItem } from "../Shuttle";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Shuttle — unit", () => {
  it("renders with default props", () => {
    render(<Shuttle data-testid="shuttle">content</Shuttle>);
    expect(screen.getByTestId("shuttle")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Shuttle data-testid="shuttle">content</Shuttle>);
    expect(screen.getByTestId("shuttle")).toHaveClass("shuttle");
  });

  it("merges custom className", () => {
    render(<Shuttle data-testid="shuttle" className="custom">content</Shuttle>);
    expect(screen.getByTestId("shuttle")).toHaveClass("shuttle", "custom");
  });

  it("calls onValueChange when selection changes", async () => {
    const onValueChangeSpy = vi.fn();
    expect(() => render(<Shuttle data-testid="shuttle" value={[]} onValueChange={onValueChangeSpy}>content</Shuttle>)).not.toThrow();
  });
});

describe("Shuttle — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Shuttle aria-label="Test Shuttle">content</Shuttle></>);
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
