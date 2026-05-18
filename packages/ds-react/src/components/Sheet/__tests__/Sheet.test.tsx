// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter } from "../Sheet";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  it("renders with default props", () => {
    render(<Sheet data-testid="sheet" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Sheet data-testid="sheet" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet");
  });

  it("merges custom className", () => {
    render(<Sheet data-testid="sheet" className="custom" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet", "custom");
  });

  it("applies side=top variant class", () => {
    render(<Sheet data-testid="sheet" side="top" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet--top");
  });

  it("applies side=right variant class", () => {
    render(<Sheet data-testid="sheet" side="right" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    render(<Sheet data-testid="sheet" side="bottom" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    render(<Sheet data-testid="sheet" side="left" open={true}>content</Sheet>);
    expect(screen.getByTestId("sheet")).toHaveClass("sheet--left");
  });

  it("calls onOpenChange when openness changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Sheet data-testid="sheet" open={false} onOpenChange={onOpenChangeSpy}>content</Sheet>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Sheet data-testid="sheet" open={true} onOpenChange={onOpenChangeSpy}>content</Sheet>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Sheet data-testid="sheet" open={true} onOpenChange={onOpenChangeSpy}>content</Sheet>);
    fireEvent.click(screen.getByTestId("sheet"));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Sheet aria-label="Test Sheet" open={true}>content</Sheet></>);
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
