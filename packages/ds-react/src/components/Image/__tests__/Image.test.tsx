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
    render(<Image data-testid="image" alt={"placeholder"} />);
    expect(screen.getByTestId("image")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Image data-testid="image" alt={"placeholder"} />);
    expect(screen.getByTestId("image")).toHaveClass("image");
  });

  it("merges custom className", () => {
    render(<Image data-testid="image" alt={"placeholder"} className="custom" />);
    expect(screen.getByTestId("image")).toHaveClass("image", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Image data-testid="image" alt={"placeholder"} />);
    expect(screen.getByTestId("image")).toHaveAttribute("role", "img");
  });

  it("applies size=xs variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="xs" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-xs");
  });

  it("applies size=sm variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="sm" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-sm");
  });

  it("applies size=md variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="md" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-md");
  });

  it("applies size=lg variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="lg" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-lg");
  });

  it("applies size=xl variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="xl" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-xl");
  });

  it("applies size=full variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} size="full" />);
    expect(screen.getByTestId("image")).toHaveClass("image--size-full");
  });

  it("applies radius=none variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} radius="none" />);
    expect(screen.getByTestId("image")).toHaveClass("image--radius-none");
  });

  it("applies radius=sm variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} radius="sm" />);
    expect(screen.getByTestId("image")).toHaveClass("image--radius-sm");
  });

  it("applies radius=md variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} radius="md" />);
    expect(screen.getByTestId("image")).toHaveClass("image--radius-md");
  });

  it("applies radius=lg variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} radius="lg" />);
    expect(screen.getByTestId("image")).toHaveClass("image--radius-lg");
  });

  it("applies radius=full variant class", () => {
    render(<Image data-testid="image" alt={"placeholder"} radius="full" />);
    expect(screen.getByTestId("image")).toHaveClass("image--radius-full");
  });
});

describe("Image — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Image aria-label="Test Image" alt={"placeholder"} /></>);
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
