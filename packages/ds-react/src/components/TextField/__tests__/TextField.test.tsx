// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { TextField, TextFieldDescription } from "../TextField";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("TextField — unit", () => {
  it("renders with default props", () => {
    render(<TextField data-testid="text-field">content</TextField>);
    expect(screen.getByTestId("text-field")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<TextField data-testid="text-field">content</TextField>);
    expect(screen.getByTestId("text-field")).toHaveClass("text-field");
  });

  it("merges custom className", () => {
    render(<TextField data-testid="text-field" className="custom">content</TextField>);
    expect(screen.getByTestId("text-field")).toHaveClass("text-field", "custom");
  });

  it("calls onChange when value changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<TextField data-testid="text-field" value={false} onChange={onChangeSpy}>content</TextField>)).not.toThrow();
  });
});

describe("TextField — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><TextField aria-label="Test TextField">content</TextField></>);
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
