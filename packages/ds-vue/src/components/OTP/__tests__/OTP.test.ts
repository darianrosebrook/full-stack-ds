// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import OTP from "../OTP.vue";
// @generated:end

// @generated:start tests
describe("OTP — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(OTP as Component, { props: {}, attrs: { "data-testid": "otp" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(OTP as Component, { props: {}, attrs: { "data-testid": "otp" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("otp");
  });

  it("merges custom class", () => {
    const wrapper = mount(OTP as Component, { props: {}, attrs: { "data-testid": "otp", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("otp");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(OTP as Component, { props: {}, attrs: { "data-testid": "otp" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("applies mode=numeric variant class", () => {
    const wrapper = mount(OTP as Component, { props: { "mode": "numeric" }, attrs: { "data-testid": "otp" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("otp--numeric");
  });

  it("applies mode=alphanumeric variant class", () => {
    const wrapper = mount(OTP as Component, { props: { "mode": "alphanumeric" }, attrs: { "data-testid": "otp" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("otp--alphanumeric");
  });
});

describe("OTP — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(OTP as Component, { props: {}, attrs: { "data-testid": "otp", "aria-label": "Test OTP" }, slots: { default: "content" } });
    const results = await axe(wrapper.element);
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
