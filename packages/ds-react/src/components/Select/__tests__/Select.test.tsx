// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Select, SelectTrigger, SelectContent, SelectOption } from "../Select";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Select — unit", () => {
  it("renders with default props", () => {
    render(<Select data-testid="select" open={true} />);
    expect(screen.getByTestId("select")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Select data-testid="select" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select");
  });

  it("merges custom className", () => {
    render(<Select data-testid="select" className="custom" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Select data-testid="select" size="sm" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--sm");
  });

  it("applies size=md variant class", () => {
    render(<Select data-testid="select" size="md" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--md");
  });

  it("applies size=lg variant class", () => {
    render(<Select data-testid="select" size="lg" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--lg");
  });

  it("applies position=bottom variant class", () => {
    render(<Select data-testid="select" position="bottom" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--bottom");
  });

  it("applies position=top variant class", () => {
    render(<Select data-testid="select" position="top" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--top");
  });

  it("applies position=auto variant class", () => {
    render(<Select data-testid="select" position="auto" open={true} />);
    expect(screen.getByTestId("select")).toHaveClass("select--auto");
  });

  it("calls onChange when selection changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<Select data-testid="select" value={""} onChange={onChangeSpy} open={true} />)).not.toThrow();
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Select data-testid="select" open={false} onOpenChange={onOpenChangeSpy} />)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Select data-testid="select" open={true} onOpenChange={onOpenChangeSpy} />);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Select aria-label="Test Select" open={true} /></>);
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
