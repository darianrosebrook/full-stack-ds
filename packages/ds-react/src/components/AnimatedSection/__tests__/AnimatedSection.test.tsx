// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AnimatedSection } from "../AnimatedSection";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("AnimatedSection — unit", () => {
  it("renders with default props", () => {
    render(<AnimatedSection data-testid="animated-section">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<AnimatedSection data-testid="animated-section">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section");
  });

  it("merges custom className", () => {
    render(<AnimatedSection data-testid="animated-section" className="custom">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section", "custom");
  });

  it("applies as=section variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="section">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--section");
  });

  it("applies as=div variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="div">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--div");
  });

  it("applies as=article variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="article">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--article");
  });

  it("applies as=main variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="main">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--main");
  });

  it("applies as=aside variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="aside">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--aside");
  });

  it("applies as=header variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="header">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--header");
  });

  it("applies as=footer variant class", () => {
    render(<AnimatedSection data-testid="animated-section" as="footer">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--footer");
  });

  it("applies variant=fade-up variant class", () => {
    render(<AnimatedSection data-testid="animated-section" variant="fade-up">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--fade-up");
  });

  it("applies variant=fade-in variant class", () => {
    render(<AnimatedSection data-testid="animated-section" variant="fade-in">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--fade-in");
  });

  it("applies variant=slide-in variant class", () => {
    render(<AnimatedSection data-testid="animated-section" variant="slide-in">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--slide-in");
  });

  it("applies variant=stagger-children variant class", () => {
    render(<AnimatedSection data-testid="animated-section" variant="stagger-children">content</AnimatedSection>);
    expect(screen.getByTestId("animated-section")).toHaveClass("animated-section--stagger-children");
  });
});

describe("AnimatedSection — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><AnimatedSection>content</AnimatedSection></>);
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
