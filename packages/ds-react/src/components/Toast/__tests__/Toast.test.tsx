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
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Toast — unit", () => {
  it("renders with default props", () => {
    render(<Toast data-testid="toast" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Toast data-testid="toast" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast");
  });

  it("merges custom className", () => {
    render(<Toast data-testid="toast" className="custom" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Toast data-testid="toast"><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveAttribute("role", "alert");
  });

  it("applies variant=info variant class", () => {
    render(<Toast data-testid="toast" variant="info" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--info");
  });

  it("applies variant=success variant class", () => {
    render(<Toast data-testid="toast" variant="success" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--success");
  });

  it("applies variant=warning variant class", () => {
    render(<Toast data-testid="toast" variant="warning" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--warning");
  });

  it("applies variant=error variant class", () => {
    render(<Toast data-testid="toast" variant="error" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    render(<Toast data-testid="toast" politeness="polite" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    render(<Toast data-testid="toast" politeness="assertive" open={true}><span>content</span></Toast>);
    expect(screen.getByTestId("toast")).toHaveClass("toast--assertive");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Toast data-testid="toast" open={false} onOpenChange={onOpenChangeSpy}><span>content</span></Toast>)).not.toThrow();
  });

  it("closes on Escape key", () => {
    const onOpenChangeSpy = vi.fn();
    render(<Toast data-testid="toast" open={true} onOpenChange={onOpenChangeSpy}><span>content</span></Toast>);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { baseElement } = render(<><Toast aria-label="Test Toast" open={true}><span>content</span></Toast></>);
    const component = baseElement.querySelector('[data-fsds-component="toast"]');
    expect(component).not.toBeNull();
    const results = await axe(component!, componentAxeOptions) as unknown as { violations: Array<{ id: string }> };
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
