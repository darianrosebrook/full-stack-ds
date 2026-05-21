// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import OTP from "../OTP.svelte";
// @generated:end

// @generated:start tests
describe("OTP — unit", () => {
  it("renders with default props", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("otp");
  });

  it("merges custom class", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("otp");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("group");
  });

  it("applies mode=numeric variant class", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: { "mode": "numeric" } });
    expect(container.firstElementChild?.className).toContain("otp--numeric");
  });

  it("applies mode=alphanumeric variant class", () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: { "mode": "alphanumeric" } });
    expect(container.firstElementChild?.className).toContain("otp--alphanumeric");
  });
});

describe("OTP — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test OTP" } });
    const results = await axe(container);
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
