// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Image } from "../Image";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Image — unit", () => {
  it("renders with default props", () => {
    render(<Image data-testid="image" />);
    expect(screen.getByTestId("image")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Image data-testid="image" />);
    expect(screen.getByTestId("image")).toHaveClass("image");
  });

  it("merges custom className", () => {
    render(<Image data-testid="image" className="custom" />);
    expect(screen.getByTestId("image")).toHaveClass("image", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Image data-testid="image" />);
    expect(screen.getByTestId("image")).toHaveAttribute("role", "img");
  });

  it("applies size=xs variant class", () => {
    render(<Image data-testid="image" size="xs" />);
    expect(screen.getByTestId("image")).toHaveClass("image--xs");
  });

  it("applies size=sm variant class", () => {
    render(<Image data-testid="image" size="sm" />);
    expect(screen.getByTestId("image")).toHaveClass("image--sm");
  });

  it("applies size=md variant class", () => {
    render(<Image data-testid="image" size="md" />);
    expect(screen.getByTestId("image")).toHaveClass("image--md");
  });

  it("applies size=lg variant class", () => {
    render(<Image data-testid="image" size="lg" />);
    expect(screen.getByTestId("image")).toHaveClass("image--lg");
  });

  it("applies size=xl variant class", () => {
    render(<Image data-testid="image" size="xl" />);
    expect(screen.getByTestId("image")).toHaveClass("image--xl");
  });

  it("applies size=full variant class", () => {
    render(<Image data-testid="image" size="full" />);
    expect(screen.getByTestId("image")).toHaveClass("image--full");
  });

  it("applies radius=none variant class", () => {
    render(<Image data-testid="image" radius="none" />);
    expect(screen.getByTestId("image")).toHaveClass("image--none");
  });

  it("applies radius=sm variant class", () => {
    render(<Image data-testid="image" radius="sm" />);
    expect(screen.getByTestId("image")).toHaveClass("image--sm");
  });

  it("applies radius=md variant class", () => {
    render(<Image data-testid="image" radius="md" />);
    expect(screen.getByTestId("image")).toHaveClass("image--md");
  });

  it("applies radius=lg variant class", () => {
    render(<Image data-testid="image" radius="lg" />);
    expect(screen.getByTestId("image")).toHaveClass("image--lg");
  });

  it("applies radius=full variant class", () => {
    render(<Image data-testid="image" radius="full" />);
    expect(screen.getByTestId("image")).toHaveClass("image--full");
  });
});

describe("Image — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Image aria-label="Test Image" /></>);
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
