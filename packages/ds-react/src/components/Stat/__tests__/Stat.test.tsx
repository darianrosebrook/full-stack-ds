// @generated:start imports
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Stat } from "../Stat";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Stat — unit", () => {
  it("renders with default props", () => {
    render(<Stat data-testid="stat">content</Stat>);
    expect(screen.getByTestId("stat")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Stat data-testid="stat">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat");
  });

  it("merges custom className", () => {
    render(<Stat data-testid="stat" className="custom">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Stat data-testid="stat" size="sm">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--sm");
  });

  it("applies size=md variant class", () => {
    render(<Stat data-testid="stat" size="md">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--md");
  });

  it("applies size=lg variant class", () => {
    render(<Stat data-testid="stat" size="lg">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--lg");
  });

  it("applies trend=up variant class", () => {
    render(<Stat data-testid="stat" trend="up">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--up");
  });

  it("applies trend=down variant class", () => {
    render(<Stat data-testid="stat" trend="down">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--down");
  });

  it("applies trend=neutral variant class", () => {
    render(<Stat data-testid="stat" trend="neutral">content</Stat>);
    expect(screen.getByTestId("stat")).toHaveClass("stat--neutral");
  });
});

describe("Stat — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Stat>content</Stat></>);
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
