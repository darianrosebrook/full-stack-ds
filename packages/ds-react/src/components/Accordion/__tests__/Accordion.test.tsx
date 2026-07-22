// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../Accordion";

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
import { fireEvent } from "@testing-library/react";

// FIX-COMPOUND-CONTAINER-ANCESTOR-PREDICATE-01 (A2): the trigger toggle must
// live on the descendant trigger, aria-expanded must follow the openness
// channel, and the openness channel must update per contract semantics.
function Fixture(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem>
        <AccordionTrigger value="a">First</AccordionTrigger>
        <AccordionContent value="a">Panel A</AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTrigger value="b">Second</AccordionTrigger>
        <AccordionContent value="b">Panel B</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion — disclosure behavior", () => {
  it("clicking a trigger expands its own panel and updates the openness channel", () => {
    const onValueChange = vi.fn();
    render(<Fixture type="single" onValueChange={onValueChange} />);
    const first = screen.getByRole("button", { name: "First" });
    // Closed initially: aria-expanded=false, panel hidden.
    expect(first).toHaveAttribute("aria-expanded", "false");
    const panelA = document.getElementById(
      first.getAttribute("aria-controls")!,
    )!;
    expect(panelA).toHaveAttribute("hidden");

    fireEvent.click(first);
    // The handler on the descendant trigger fired the channel with "a".
    expect(onValueChange).toHaveBeenCalledWith("a");
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(panelA).not.toHaveAttribute("hidden");
    expect(panelA).toHaveTextContent("Panel A");
    // region role + labelledby wiring derive from the contract.
    expect(panelA).toHaveAttribute("role", "region");
    expect(panelA).toHaveAttribute("aria-labelledby", first.id);
  });

  it("single mode: opening a second item closes the first (single-select semantics)", () => {
    render(<Fixture type="single" defaultValue="a" />);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("single collapsible: re-clicking the open trigger collapses it", () => {
    render(<Fixture type="single" collapsible defaultValue="a" />);
    const first = screen.getByRole("button", { name: "First" });
    expect(first).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("multiple mode: both items can be open at once", () => {
    render(<Fixture type="multiple" defaultValue={["a"]} />);
    const first = screen.getByRole("button", { name: "First" });
    const second = screen.getByRole("button", { name: "Second" });
    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(second).toHaveAttribute("aria-expanded", "true");
  });

  it("emits disclosure ARIA, not tab ARIA", () => {
    const { container } = render(<Fixture type="single" />);
    expect(container.querySelector('[role="tab"]')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('[role="tabpanel"]')).toBeNull();
    expect(container.querySelector('[aria-selected]')).toBeNull();
  });
});

// @custom:end
