// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { AnimatedText } from "../AnimatedText";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("AnimatedText — unit", () => {
  it("renders with default props", () => {
    render(<AnimatedText data-testid="animated-text" />);
    expect(screen.getByTestId("animated-text")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<AnimatedText data-testid="animated-text" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text");
  });

  it("merges custom className", () => {
    render(<AnimatedText data-testid="animated-text" className="custom" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text", "custom");
  });

  it("applies as=h1 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h1" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h1");
  });

  it("applies as=h2 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h2" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h2");
  });

  it("applies as=h3 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h3" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h3");
  });

  it("applies as=h4 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h4" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h4");
  });

  it("applies as=h5 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h5" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h5");
  });

  it("applies as=h6 variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="h6" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--h6");
  });

  it("applies as=p variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="p" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--p");
  });

  it("applies as=span variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="span" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--span");
  });

  it("applies as=div variant class", () => {
    render(<AnimatedText data-testid="animated-text" as="div" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--div");
  });

  it("applies variant=blur-in variant class", () => {
    render(<AnimatedText data-testid="animated-text" variant="blur-in" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--blur-in");
  });

  it("applies variant=fade-up variant class", () => {
    render(<AnimatedText data-testid="animated-text" variant="fade-up" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--fade-up");
  });

  it("applies variant=slide-in variant class", () => {
    render(<AnimatedText data-testid="animated-text" variant="slide-in" />);
    expect(screen.getByTestId("animated-text")).toHaveClass("animated-text--slide-in");
  });
});

describe("AnimatedText — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><AnimatedText /></>);
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
