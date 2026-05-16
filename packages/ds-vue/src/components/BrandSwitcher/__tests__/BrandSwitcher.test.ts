// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import BrandSwitcher from "../BrandSwitcher.vue";
// @generated:end

// @generated:start tests
describe("BrandSwitcher — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(BrandSwitcher as Component, { props: {}, attrs: { "data-testid": "brand-switcher" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(BrandSwitcher as Component, { props: {}, attrs: { "data-testid": "brand-switcher" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("brand-switcher");
  });

  it("merges custom class", () => {
    const wrapper = mount(BrandSwitcher as Component, { props: {}, attrs: { "data-testid": "brand-switcher", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("brand-switcher");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("BrandSwitcher — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(BrandSwitcher as Component, { props: {}, attrs: { "data-testid": "brand-switcher" }, slots: { default: "content" } });
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
