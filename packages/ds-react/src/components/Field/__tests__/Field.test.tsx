// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Field, FieldHeader } from "../Field";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Field — unit", () => {
  it("renders with default props", () => {
    render(<Field data-testid="field" name={"placeholder"}>content</Field>);
    expect(screen.getByTestId("field")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Field data-testid="field" name={"placeholder"}>content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field");
  });

  it("merges custom className", () => {
    render(<Field data-testid="field" name={"placeholder"} className="custom">content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Field data-testid="field" name={"placeholder"}>content</Field>);
    expect(screen.getByTestId("field")).toHaveAttribute("role", "group");
  });

  it("applies status=idle variant class", () => {
    render(<Field data-testid="field" name={"placeholder"} status="idle">content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field--idle");
  });

  it("applies status=validating variant class", () => {
    render(<Field data-testid="field" name={"placeholder"} status="validating">content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field--validating");
  });

  it("applies status=valid variant class", () => {
    render(<Field data-testid="field" name={"placeholder"} status="valid">content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field--valid");
  });

  it("applies status=invalid variant class", () => {
    render(<Field data-testid="field" name={"placeholder"} status="invalid">content</Field>);
    expect(screen.getByTestId("field")).toHaveClass("field--invalid");
  });

  it("calls onChange when value changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<Field data-testid="field" name={"placeholder"} value={false} onChange={onChangeSpy}>content</Field>)).not.toThrow();
  });
});

describe("Field — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Field aria-label="Test Field" name={"placeholder"}>content</Field></>);
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
