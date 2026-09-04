// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import OTP from "../OTP.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

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
    const { container } = render(OTP as unknown as Component<Record<string, unknown>>, { props: { "label": "Test OTP" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import OTPGroup from "../OTPGroup.svelte";

describe("OTP — compound parts", () => {
  it("mounts OTPGroup with tag and base class", () => {
    const { container } = render(OTPGroup as Component, {
      props: { "data-testid": "otp-otpgroup" },
    });
    const root = container.querySelector('[data-testid="otp-otpgroup"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("otp__group");
  });
});


// @custom:end
