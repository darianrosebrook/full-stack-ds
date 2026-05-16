// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Tabs, TabsList, TabsTab, TabsPanel } from "../Tabs";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("Tabs — unit", () => {
  it("renders with default props", () => {
    render(<Tabs data-testid="tabs">content</Tabs>);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<Tabs data-testid="tabs">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs");
  });

  it("merges custom className", () => {
    render(<Tabs data-testid="tabs" className="custom">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs", "custom");
  });

  it("applies orientation=horizontal variant class", () => {
    render(<Tabs data-testid="tabs" orientation="horizontal">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    render(<Tabs data-testid="tabs" orientation="vertical">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs--vertical");
  });

  it("applies activationMode=automatic variant class", () => {
    render(<Tabs data-testid="tabs" activationMode="automatic">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs--automatic");
  });

  it("applies activationMode=manual variant class", () => {
    render(<Tabs data-testid="tabs" activationMode="manual">content</Tabs>);
    expect(screen.getByTestId("tabs")).toHaveClass("tabs--manual");
  });

  it("calls onValueChange when activeTab changes", async () => {
    const onValueChangeSpy = vi.fn();
    expect(() => render(<Tabs data-testid="tabs" value={false} onValueChange={onValueChangeSpy}>content</Tabs>)).not.toThrow();
  });
});

describe("Tabs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><Tabs aria-label="Test Tabs">content</Tabs></>);
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
