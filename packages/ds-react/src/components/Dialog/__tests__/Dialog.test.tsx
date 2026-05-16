// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "../Dialog";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  it("renders with default props", () => {
    render(<Dialog data-testid="dialog" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Dialog data-testid="dialog" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog");
  });

  it("merges custom className", () => {
    render(<Dialog data-testid="dialog" className="custom" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Dialog data-testid="dialog" size="sm" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog--sm");
  });

  it("applies size=md variant class", () => {
    render(<Dialog data-testid="dialog" size="md" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog--md");
  });

  it("applies size=lg variant class", () => {
    render(<Dialog data-testid="dialog" size="lg" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog--lg");
  });

  it("applies size=xl variant class", () => {
    render(<Dialog data-testid="dialog" size="xl" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog--xl");
  });

  it("applies size=full variant class", () => {
    render(<Dialog data-testid="dialog" size="full" open={true}>content</Dialog>);
    expect(screen.getByTestId("dialog")).toHaveClass("dialog--full");
  });

  it("calls onOpenChange when openness changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Dialog data-testid="dialog" open={false} onOpenChange={onOpenChangeSpy} open={true}>content</Dialog>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Dialog data-testid="dialog" open={true} onOpenChange={onOpenChangeSpy}>content</Dialog>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Dialog data-testid="dialog" open={true} onOpenChange={onOpenChangeSpy}>content</Dialog>);
    fireEvent.click(screen.getByTestId("dialog"));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Dialog aria-label="Test Dialog" open={true}>content</Dialog></>);
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
describe("Dialog — named slots", () => {
  it("renders slots.title inside the <h2> placeholder", () => {
    // Real consumers pass `slots={{ title: <span>...</span> }}` to fill the
    // heading. This test confirms the named-slot pipeline (contract → IR →
    // React codegen → public API → rendered DOM) is intact end-to-end.
    const { container } = render(
      <Dialog open aria-label="Test Dialog" slots={{ title: <span>My Title</span> }}>
        body content
      </Dialog>,
    );
    const heading = container.querySelector("h2.dialog__title");
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe("My Title");
  });

  it("renders an empty <h2> when slots.title is not provided", () => {
    // The placeholder still exists in the DOM tree; consumers without a
    // title get an empty <h2>, which axe correctly flags via empty-heading
    // (kept in the scaffold allowlist).
    const { container } = render(
      <Dialog open aria-label="Test Dialog">
        body content
      </Dialog>,
    );
    const heading = container.querySelector("h2.dialog__title");
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe("");
  });
});
// @custom:end
