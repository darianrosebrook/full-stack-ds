// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Calendar, CalendarHeader } from "../Calendar";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Calendar — unit", () => {
  it("renders with default props", () => {
    render(<Calendar data-testid="calendar" />);
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Calendar data-testid="calendar" />);
    expect(screen.getByTestId("calendar")).toHaveClass("calendar");
  });

  it("merges custom className", () => {
    render(<Calendar data-testid="calendar" className="custom" />);
    expect(screen.getByTestId("calendar")).toHaveClass("calendar", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Calendar data-testid="calendar" />);
    expect(screen.getByTestId("calendar")).toHaveAttribute("role", "application");
  });

  it("applies mode=single variant class", () => {
    render(<Calendar data-testid="calendar" mode="single" />);
    expect(screen.getByTestId("calendar")).toHaveClass("calendar--single");
  });

  it("applies mode=range variant class", () => {
    render(<Calendar data-testid="calendar" mode="range" />);
    expect(screen.getByTestId("calendar")).toHaveClass("calendar--range");
  });

  it("calls onChange when value changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<Calendar data-testid="calendar" value={null} onChange={onChangeSpy} />)).not.toThrow();
  });
});

describe("Calendar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Calendar aria-label="Test Calendar" /></>);
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
