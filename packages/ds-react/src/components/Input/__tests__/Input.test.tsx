// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Input } from "../Input";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Input — unit", () => {
  it("renders with default props", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("input");
  });

  it("merges custom className", () => {
    render(<Input data-testid="input" className="custom" />);
    expect(screen.getByTestId("input")).toHaveClass("input", "custom");
  });

  it("calls onChange when value changes", async () => {
    const onChangeSpy = vi.fn();
    render(<Input data-testid="input" onChange={onChangeSpy} />);
    fireEvent.change(screen.getByTestId("input"), { target: { value: "test" } });
    expect(onChangeSpy).toHaveBeenCalled();
  });
});

describe("Input — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Input aria-label="Test Input" /></>);
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
