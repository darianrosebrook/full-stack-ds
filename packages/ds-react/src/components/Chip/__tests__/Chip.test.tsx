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

// @custom:end
