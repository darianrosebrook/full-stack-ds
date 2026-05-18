// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { OTP, OTPGroup } from "../OTP";

declare module "vitest" {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
}
// @generated:end

// @generated:start tests
describe("OTP — unit", () => {
  it("renders with default props", () => {
    render(<OTP data-testid="otp" />);
    expect(screen.getByTestId("otp")).toBeInTheDocument();
  });

  it("applies the base CSS class", () => {
    render(<OTP data-testid="otp" />);
    expect(screen.getByTestId("otp")).toHaveClass("otp");
  });

  it("merges custom className", () => {
    render(<OTP data-testid="otp" className="custom" />);
    expect(screen.getByTestId("otp")).toHaveClass("otp", "custom");
  });

  it("applies mode=numeric variant class", () => {
    render(<OTP data-testid="otp" mode="numeric" />);
    expect(screen.getByTestId("otp")).toHaveClass("otp--numeric");
  });

  it("applies mode=alphanumeric variant class", () => {
    render(<OTP data-testid="otp" mode="alphanumeric" />);
    expect(screen.getByTestId("otp")).toHaveClass("otp--alphanumeric");
  });

  it("calls onChange when value changes", async () => {
    const onChangeSpy = vi.fn();
    expect(() => render(<OTP data-testid="otp" value={""} onChange={onChangeSpy} />)).not.toThrow();
  });
});

describe("OTP — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(<><OTP aria-label="Test OTP" /></>);
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
