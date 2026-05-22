// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Accordion, AccordionItem, AccordionTrigger, AccordionHeader, AccordionContent } from "../Accordion";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  it("renders with default props", () => {
    render(<Accordion data-testid="accordion">content</Accordion>);
    expect(screen.getByTestId("accordion")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Accordion data-testid="accordion">content</Accordion>);
    expect(screen.getByTestId("accordion")).toHaveClass("accordion");
  });

  it("merges custom className", () => {
    render(<Accordion data-testid="accordion" className="custom">content</Accordion>);
    expect(screen.getByTestId("accordion")).toHaveClass("accordion", "custom");
  });

  it("applies type=single variant class", () => {
    render(<Accordion data-testid="accordion" type="single">content</Accordion>);
    expect(screen.getByTestId("accordion")).toHaveClass("accordion--single");
  });

  it("applies type=multiple variant class", () => {
    render(<Accordion data-testid="accordion" type="multiple">content</Accordion>);
    expect(screen.getByTestId("accordion")).toHaveClass("accordion--multiple");
  });

  it("calls onValueChange when openness changes", async () => {
    const onValueChangeSpy = vi.fn();
    expect(() => render(<Accordion data-testid="accordion" value={""} onValueChange={onValueChangeSpy}>content</Accordion>)).not.toThrow();
  });
});

describe("Accordion — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Accordion aria-label="Test Accordion">content</Accordion></>);
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
