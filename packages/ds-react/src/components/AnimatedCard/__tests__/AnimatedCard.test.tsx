// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AnimatedCard, AnimatedCardTitle } from "../AnimatedCard";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("AnimatedCard — unit", () => {
  it("renders with default props", () => {
    render(<AnimatedCard data-testid="animated-card">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<AnimatedCard data-testid="animated-card">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card");
  });

  it("merges custom className", () => {
    render(<AnimatedCard data-testid="animated-card" className="custom">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card", "custom");
  });

  it("applies as=article variant class", () => {
    render(<AnimatedCard data-testid="animated-card" as="article">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card--article");
  });

  it("applies as=div variant class", () => {
    render(<AnimatedCard data-testid="animated-card" as="div">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card--div");
  });

  it("applies as=li variant class", () => {
    render(<AnimatedCard data-testid="animated-card" as="li">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card--li");
  });

  it("applies as=a variant class", () => {
    render(<AnimatedCard data-testid="animated-card" as="a">content</AnimatedCard>);
    expect(screen.getByTestId("animated-card")).toHaveClass("animated-card--a");
  });
});

describe("AnimatedCard — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><AnimatedCard>content</AnimatedCard></>);
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
