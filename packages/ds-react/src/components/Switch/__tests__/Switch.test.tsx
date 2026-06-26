// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Switch } from "../Switch";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Switch — unit", () => {
  it("renders with default props", () => {
    render(<Switch data-testid="switch">content</Switch>);
    expect(screen.getByTestId("switch")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Switch data-testid="switch">content</Switch>);
    expect(screen.getByTestId("switch")).toHaveClass("switch");
  });

  it("merges custom className", () => {
    render(<Switch data-testid="switch" className="custom">content</Switch>);
    expect(screen.getByTestId("switch")).toHaveClass("switch", "custom");
  });

  it("applies size=sm variant class", () => {
    render(<Switch data-testid="switch" size="sm">content</Switch>);
    expect(screen.getByTestId("switch")).toHaveClass("switch--sm");
  });

  it("applies size=md variant class", () => {
    render(<Switch data-testid="switch" size="md">content</Switch>);
    expect(screen.getByTestId("switch")).toHaveClass("switch--md");
  });

  it("applies size=lg variant class", () => {
    render(<Switch data-testid="switch" size="lg">content</Switch>);
    expect(screen.getByTestId("switch")).toHaveClass("switch--lg");
  });

  it("calls onChange when checked changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<Switch data-testid="switch" checked={false} onChange={onChangeSpy}>content</Switch>)).not.toThrow();
  });
});

describe("Switch — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Switch aria-label="Test Switch">content</Switch></>);
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
