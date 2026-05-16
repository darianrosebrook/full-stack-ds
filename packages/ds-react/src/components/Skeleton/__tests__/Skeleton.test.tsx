// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Skeleton } from "../Skeleton";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Skeleton — unit", () => {
  it("renders with default props", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton");
  });

  it("merges custom className", () => {
    render(<Skeleton data-testid="skeleton" className="custom" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId("skeleton")).toHaveAttribute("role", "status");
  });

  it("applies variant=block variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="block" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--block");
  });

  it("applies variant=text variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="text" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--text");
  });

  it("applies variant=avatar variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="avatar" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--avatar");
  });

  it("applies variant=media variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="media" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--media");
  });

  it("applies variant=dataviz variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="dataviz" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--dataviz");
  });

  it("applies variant=actions variant class", () => {
    render(<Skeleton data-testid="skeleton" variant="actions" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--actions");
  });

  it("applies animate=shimmer variant class", () => {
    render(<Skeleton data-testid="skeleton" animate="shimmer" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--shimmer");
  });

  it("applies animate=wipe variant class", () => {
    render(<Skeleton data-testid="skeleton" animate="wipe" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--wipe");
  });

  it("applies animate=pulse variant class", () => {
    render(<Skeleton data-testid="skeleton" animate="pulse" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--pulse");
  });

  it("applies animate=none variant class", () => {
    render(<Skeleton data-testid="skeleton" animate="none" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--none");
  });

  it("applies density=compact variant class", () => {
    render(<Skeleton data-testid="skeleton" density="compact" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--compact");
  });

  it("applies density=regular variant class", () => {
    render(<Skeleton data-testid="skeleton" density="regular" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--regular");
  });

  it("applies density=spacious variant class", () => {
    render(<Skeleton data-testid="skeleton" density="spacious" />);
    expect(screen.getByTestId("skeleton")).toHaveClass("skeleton--spacious");
  });
});

describe("Skeleton — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Skeleton aria-label="Test Skeleton" /></>);
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
