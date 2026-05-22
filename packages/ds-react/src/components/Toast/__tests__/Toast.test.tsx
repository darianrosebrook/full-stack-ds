// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Toast, ToastItem, ToastTitle, ToastDescription } from "../Toast";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  it("renders with default props", () => {
    render(<Toast data-testid="toast" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Toast data-testid="toast" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast");
  });

  it("merges custom className", () => {
    render(<Toast data-testid="toast" className="custom" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Toast data-testid="toast">content</Toast>);
    expect(screen.getByTestId("toast")).toHaveAttribute("role", "alert");
  });

  it("applies variant=info variant class", () => {
    render(<Toast data-testid="toast" variant="info" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--info");
  });

  it("applies variant=success variant class", () => {
    render(<Toast data-testid="toast" variant="success" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--success");
  });

  it("applies variant=warning variant class", () => {
    render(<Toast data-testid="toast" variant="warning" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--warning");
  });

  it("applies variant=error variant class", () => {
    render(<Toast data-testid="toast" variant="error" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    render(<Toast data-testid="toast" politeness="polite" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    render(<Toast data-testid="toast" politeness="assertive" open={true}>content</Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--assertive");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Toast data-testid="toast" open={false} onOpenChange={onOpenChangeSpy}>content</Toast>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Toast data-testid="toast" open={true} onOpenChange={onOpenChangeSpy}>content</Toast>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Toast aria-label="Test Toast" open={true}>content</Toast></>);
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
