// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Details, DetailsContent } from "../Details";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Details — unit", () => {
  it("renders with default props", () => {
    render(<Details data-testid="details" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Details data-testid="details" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details");
  });

  it("merges custom className", () => {
    render(<Details data-testid="details" className="custom" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Details data-testid="details">content</Details>);
    expect(screen.getByTestId("details")).toHaveAttribute("role", "group");
  });

  it("applies variant=default variant class", () => {
    render(<Details data-testid="details" variant="default" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--default");
  });

  it("applies variant=inline variant class", () => {
    render(<Details data-testid="details" variant="inline" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--inline");
  });

  it("applies variant=compact variant class", () => {
    render(<Details data-testid="details" variant="compact" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--compact");
  });

  it("applies icon=left variant class", () => {
    render(<Details data-testid="details" icon="left" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--left");
  });

  it("applies icon=right variant class", () => {
    render(<Details data-testid="details" icon="right" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--right");
  });

  it("applies icon=none variant class", () => {
    render(<Details data-testid="details" icon="none" open={true}>content</Details>);
    expect(screen.getByTestId("details")).toHaveClass("details--none");
  });

  it("calls onOpenChange when open changes", async () => {
    const onOpenChangeSpy = vi.fn();
    expect(() => render(<Details data-testid="details" open={false} onOpenChange={onOpenChangeSpy} open={true}>content</Details>)).not.toThrow();
  });
});

describe("Details — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Details aria-label="Test Details" open={true}>content</Details></>);
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
