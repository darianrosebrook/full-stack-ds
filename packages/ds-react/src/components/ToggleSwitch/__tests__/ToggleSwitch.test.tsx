// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ToggleSwitch } from "../ToggleSwitch";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("ToggleSwitch — unit", () => {
  it("renders with default props", () => {
    render(<ToggleSwitch data-testid="toggle-switch" />);
    expect(screen.getByTestId("toggle-switch")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<ToggleSwitch data-testid="toggle-switch" />);
    expect(screen.getByTestId("toggle-switch")).toHaveClass("toggle-switch");
  });

  it("merges custom className", () => {
    render(<ToggleSwitch data-testid="toggle-switch" className="custom" />);
    expect(screen.getByTestId("toggle-switch")).toHaveClass("toggle-switch", "custom");
  });

  it("applies size=small variant class", () => {
    render(<ToggleSwitch data-testid="toggle-switch" size="small" />);
    expect(screen.getByTestId("toggle-switch")).toHaveClass("toggle-switch--small");
  });

  it("applies size=medium variant class", () => {
    render(<ToggleSwitch data-testid="toggle-switch" size="medium" />);
    expect(screen.getByTestId("toggle-switch")).toHaveClass("toggle-switch--medium");
  });

  it("applies size=large variant class", () => {
    render(<ToggleSwitch data-testid="toggle-switch" size="large" />);
    expect(screen.getByTestId("toggle-switch")).toHaveClass("toggle-switch--large");
  });

  it("calls onChange when checked changes", async () => {
    const onChangeSpy = vi.fn();
    render(<ToggleSwitch data-testid="toggle-switch" onChange={onChangeSpy} />);
    await userEvent.setup().click(screen.getByTestId("toggle-switch"));
    expect(onChangeSpy).toHaveBeenCalled();
  });
});

describe("ToggleSwitch — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><ToggleSwitch aria-label="Test ToggleSwitch" /></>);
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
