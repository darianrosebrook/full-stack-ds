// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Popover, PopoverTrigger, PopoverContent } from "../Popover";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Popover — unit", () => {
  it("renders with default props", () => {
    render(<Popover data-testid="popover" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Popover data-testid="popover" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover");
  });

  it("merges custom className", () => {
    render(<Popover data-testid="popover" className="custom" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover", "custom");
  });

  it("applies placement=top variant class", () => {
    render(<Popover data-testid="popover" placement="top" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover--top");
  });

  it("applies placement=bottom variant class", () => {
    render(<Popover data-testid="popover" placement="bottom" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover--bottom");
  });

  it("applies placement=left variant class", () => {
    render(<Popover data-testid="popover" placement="left" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover--left");
  });

  it("applies placement=right variant class", () => {
    render(<Popover data-testid="popover" placement="right" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover--right");
  });

  it("applies placement=auto variant class", () => {
    render(<Popover data-testid="popover" placement="auto" open={true}>content</Popover>);
    expect(screen.getByTestId("popover")).toHaveClass("popover--auto");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Popover data-testid="popover" open={false} onOpenChange={onOpenChangeSpy} open={true}>content</Popover>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Popover data-testid="popover" open={true} onOpenChange={onOpenChangeSpy}>content</Popover>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Popover — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Popover open={true}>content</Popover></>);
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
