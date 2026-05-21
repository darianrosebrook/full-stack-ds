// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Card, CardHeader, CardContent, CardFooter, CardDescription } from "../Card";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("renders with default props", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card");
  });

  it("merges custom className", () => {
    render(<Card data-testid="card" className="custom">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card", "custom");
  });

  it("has the correct ARIA role", () => {
    render(<Card data-testid="card">content</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("role", "group");
  });

  it("applies status=completed variant class", () => {
    render(<Card data-testid="card" status="completed">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    render(<Card data-testid="card" status="in-progress">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    render(<Card data-testid="card" status="planned">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    render(<Card data-testid="card" status="deprecated">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--deprecated");
  });

  it("applies status=category variant class", () => {
    render(<Card data-testid="card" status="category">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--category");
  });

  it("applies status=complexity variant class", () => {
    render(<Card data-testid="card" status="complexity">content</Card>);
    expect(screen.getByTestId("card")).toHaveClass("card--complexity");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Card aria-label="Test Card">content</Card></>);
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
