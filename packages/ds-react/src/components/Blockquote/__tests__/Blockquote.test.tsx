// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Blockquote } from "../Blockquote";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Blockquote — unit", () => {
  it("renders with default props", () => {
    render(<Blockquote data-testid="blockquote">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Blockquote data-testid="blockquote">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote");
  });

  it("merges custom className", () => {
    render(<Blockquote data-testid="blockquote" className="custom">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote", "custom");
  });

  it("applies variant=default variant class", () => {
    render(<Blockquote data-testid="blockquote" variant="default">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--default");
  });

  it("applies variant=bordered variant class", () => {
    render(<Blockquote data-testid="blockquote" variant="bordered">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--bordered");
  });

  it("applies variant=highlighted variant class", () => {
    render(<Blockquote data-testid="blockquote" variant="highlighted">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--highlighted");
  });

  it("applies size=sm variant class", () => {
    render(<Blockquote data-testid="blockquote" size="sm">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--sm");
  });

  it("applies size=md variant class", () => {
    render(<Blockquote data-testid="blockquote" size="md">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--md");
  });

  it("applies size=lg variant class", () => {
    render(<Blockquote data-testid="blockquote" size="lg">content</Blockquote>);
    expect(screen.getByTestId("blockquote")).toHaveClass("blockquote--lg");
  });
});

describe("Blockquote — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Blockquote>content</Blockquote></>);
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
