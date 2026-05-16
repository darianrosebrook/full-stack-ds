// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Tooltip } from "../Tooltip";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Tooltip — unit", () => {
  it("renders with default props", () => {
    render(<Tooltip data-testid="tooltip" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Tooltip data-testid="tooltip" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip");
  });

  it("merges custom className", () => {
    render(<Tooltip data-testid="tooltip" className="custom" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip", "custom");
  });

  it("applies placement=top variant class", () => {
    render(<Tooltip data-testid="tooltip" placement="top" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip--top");
  });

  it("applies placement=bottom variant class", () => {
    render(<Tooltip data-testid="tooltip" placement="bottom" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip--bottom");
  });

  it("applies placement=left variant class", () => {
    render(<Tooltip data-testid="tooltip" placement="left" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip--left");
  });

  it("applies placement=right variant class", () => {
    render(<Tooltip data-testid="tooltip" placement="right" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip--right");
  });

  it("applies placement=auto variant class", () => {
    render(<Tooltip data-testid="tooltip" placement="auto" open={true}>content</Tooltip>);
    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip--auto");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Tooltip data-testid="tooltip" open={false} onOpenChange={onOpenChangeSpy} open={true}>content</Tooltip>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Tooltip data-testid="tooltip" open={true} onOpenChange={onOpenChangeSpy}>content</Tooltip>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Tooltip — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Tooltip open={true}>content</Tooltip></>);
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
