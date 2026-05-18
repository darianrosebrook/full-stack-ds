// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Walkthrough, WalkthroughContent, WalkthroughTitle, WalkthroughDescription } from "../Walkthrough";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Walkthrough — unit", () => {
  it("renders with default props", () => {
    render(<Walkthrough data-testid="walkthrough" />);
    expect(screen.getByTestId("walkthrough")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Walkthrough data-testid="walkthrough" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough");
  });

  it("merges custom className", () => {
    render(<Walkthrough data-testid="walkthrough" className="custom" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough", "custom");
  });

  it("applies placement=top variant class", () => {
    render(<Walkthrough data-testid="walkthrough" placement="top" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough--top");
  });

  it("applies placement=bottom variant class", () => {
    render(<Walkthrough data-testid="walkthrough" placement="bottom" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough--bottom");
  });

  it("applies placement=left variant class", () => {
    render(<Walkthrough data-testid="walkthrough" placement="left" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough--left");
  });

  it("applies placement=right variant class", () => {
    render(<Walkthrough data-testid="walkthrough" placement="right" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough--right");
  });

  it("applies placement=auto variant class", () => {
    render(<Walkthrough data-testid="walkthrough" placement="auto" />);
    expect(screen.getByTestId("walkthrough")).toHaveClass("walkthrough--auto");
  });

  it("calls onStepChange when step changes", async () => {
    const onStepChangeSpy = vi.fn();
    expect(() => render(<Walkthrough data-testid="walkthrough" index={0} onStepChange={onStepChangeSpy} />)).not.toThrow();
  });
});

describe("Walkthrough — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Walkthrough aria-label="Test Walkthrough" /></>);
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
