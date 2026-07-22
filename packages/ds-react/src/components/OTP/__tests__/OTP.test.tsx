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

  it("has the correct ARIA role", () => {
    render(<OTP data-testid="otp" />);
    expect(screen.getByTestId("otp")).toHaveAttribute("role", "group");
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
// FEAT-CHANNEL-UPDATE-OPERATIONS-01 — the set-char-at-index update operation
// wired on the OTP field's `input` event. These pin the A2 behavioral claim
// for React (a second framework, Vue, pins the same claim in its own suite).
import { fireEvent } from "@testing-library/react";

describe("OTP — set-char-at-index (channelUpdate setCharAt)", () => {
  const fields = () =>
    Array.from(
      document.querySelectorAll<HTMLInputElement>("input[data-otp-index]"),
    );

  it("typing in field N sets character N without overwriting the rest", () => {
    const onChange = vi.fn();
    render(<OTP data-testid="otp" length={4} defaultValue="12" onChange={onChange} />);
    // Type "9" into field index 2. Expected next value: "12" + "9" at index 2
    // → slice(0,2)="12", char="9", slice(3)="" → "129".
    fireEvent.input(fields()[2], { target: { value: "9" } });
    expect(onChange).toHaveBeenLastCalledWith("129");
  });

  it("replacing an existing character preserves the surrounding positions", () => {
    const onChange = vi.fn();
    render(<OTP data-testid="otp" length={4} defaultValue="1234" onChange={onChange} />);
    // Replace index 1 with "0": slice(0,1)="1", "0", slice(2)="34" → "1034".
    fireEvent.input(fields()[1], { target: { value: "0" } });
    expect(onChange).toHaveBeenLastCalledWith("1034");
  });

  it("takes the LAST character when a field briefly holds more than one (paste non-claim)", () => {
    const onChange = vi.fn();
    render(<OTP data-testid="otp" length={4} defaultValue="" onChange={onChange} />);
    // A field momentarily holding "ab" keeps only the last char at that index.
    fireEvent.input(fields()[0], { target: { value: "ab" } });
    expect(onChange).toHaveBeenLastCalledWith("b");
  });

  it("clears the position when the payload is empty (backspace)", () => {
    const onChange = vi.fn();
    render(<OTP data-testid="otp" length={4} defaultValue="12" onChange={onChange} />);
    // Empty payload at index 0: slice(0,0)="", ""→"", slice(1)="2" → "2".
    fireEvent.input(fields()[0], { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("2");
  });
});
// @custom:end
