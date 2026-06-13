// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Chip } from "../Chip";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Chip — unit", () => {
  it("renders with default props", () => {
    render(<Chip data-testid="chip">content</Chip>);
    expect(screen.getByTestId("chip")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Chip data-testid="chip">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip");
  });

  it("merges custom className", () => {
    render(<Chip data-testid="chip" className="custom">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip", "custom");
  });

  it("applies variant=default variant class", () => {
    render(<Chip data-testid="chip" variant="default">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--default");
  });

  it("applies variant=selected variant class", () => {
    render(<Chip data-testid="chip" variant="selected">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--selected");
  });

  it("applies variant=dismissible variant class", () => {
    render(<Chip data-testid="chip" variant="dismissible">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--dismissible");
  });

  it("applies size=small variant class", () => {
    render(<Chip data-testid="chip" size="small">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--small");
  });

  it("applies size=medium variant class", () => {
    render(<Chip data-testid="chip" size="medium">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--medium");
  });

  it("applies size=large variant class", () => {
    render(<Chip data-testid="chip" size="large">content</Chip>);
    expect(screen.getByTestId("chip")).toHaveClass("chip--large");
  });
});

describe("Chip — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Chip aria-label="Test Chip">content</Chip></>);
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
// CHIP-DISMISS-COMPOSITION-01: Chip is a non-interactive container that owns
// two fsds.Button children (action + dismiss) by componentRef. The former
// design made Chip's root itself a <button>; a dismiss control would then have
// nested a <button> inside a <button> (invalid, an a11y defect). These tests
// prove the composed structure: action + dismiss are SEPARATE sibling buttons,
// each event reaches its own handler, the dismiss label reaches the composed
// Button's accessible name, and there is NO nested interactive content.
import { fireEvent } from "@testing-library/react";

describe("Chip — composed action + dismiss Buttons", () => {
  it("renders the action as a button and forwards its click to onClick", () => {
    let clicked = 0;
    render(
      <Chip onClick={() => { clicked += 1; }}>Filter</Chip>,
    );
    const action = screen.getByRole("button", { name: "Filter" });
    fireEvent.click(action);
    expect(clicked).toBe(1);
  });

  it("forwards the dismiss Button click to onDismiss, not onClick", () => {
    let dismissed = 0;
    let actionClicked = 0;
    render(
      <Chip
        dismissible
        dismissLabel="Remove tag"
        onClick={() => { actionClicked += 1; }}
        onDismiss={() => { dismissed += 1; }}
      >
        Tag
      </Chip>,
    );
    const dismiss = screen.getByRole("button", { name: "Remove tag" });
    fireEvent.click(dismiss);
    expect(dismissed).toBe(1);
    // Clicking the X must not activate the chip action — they are distinct
    // siblings, not the X nested inside the action button.
    expect(actionClicked).toBe(0);
  });

  it("forwards dismissLabel to the composed dismiss Button's accessible name", () => {
    render(
      <Chip dismissible dismissLabel="Clear filter" onDismiss={() => {}}>
        Filter
      </Chip>,
    );
    expect(
      screen.getByRole("button", { name: "Clear filter" }),
    ).toBeInTheDocument();
  });

  it("does not render a dismiss control unless dismissible is set", () => {
    render(<Chip onClick={() => {}}>Tag</Chip>);
    // Only the action button exists.
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("renders dismiss + action as two SEPARATE buttons with no nesting", () => {
    const { container } = render(
      <Chip dismissible dismissLabel="Remove" onDismiss={() => {}}>
        Tag
      </Chip>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    // The structural invariant this whole restructure exists to guarantee:
    // no <button> is a descendant of another <button>. A nested-interactive
    // chip (the pre-composition shape) would match this selector.
    expect(container.querySelector("button button")).toBeNull();
  });
});
// @custom:end
