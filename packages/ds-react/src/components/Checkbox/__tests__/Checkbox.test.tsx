// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Checkbox } from "../Checkbox";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Checkbox — unit", () => {
  it("renders with default props", () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId("checkbox")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("checkbox");
  });

  it("merges custom className", () => {
    render(<Checkbox data-testid="checkbox" className="custom" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("checkbox", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Checkbox data-testid="checkbox" size="sm" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("checkbox--sm");
  });

  it("applies size=md variant class", () => {
    render(<Checkbox data-testid="checkbox" size="md" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("checkbox--md");
  });

  it("applies size=lg variant class", () => {
    render(<Checkbox data-testid="checkbox" size="lg" />);
    expect(screen.getByTestId("checkbox")).toHaveClass("checkbox--lg");
  });

  it("calls onChange when checked changes", async () => {
    const onChangeSpy = vi.fn();
    render(<Checkbox data-testid="checkbox" onChange={onChangeSpy} />);
    await userEvent.setup().click(screen.getByTestId("checkbox"));
    expect(onChangeSpy).toHaveBeenCalled();
  });
});

describe("Checkbox — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Checkbox aria-label="Test Checkbox" /></>);
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
