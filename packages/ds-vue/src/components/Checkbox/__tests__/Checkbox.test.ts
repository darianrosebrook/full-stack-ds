// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Checkbox from "../Checkbox.vue";
// @generated:end

// @generated:start tests
describe("Checkbox — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Checkbox as Component, { props: {}, attrs: { "data-testid": "checkbox" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Checkbox as Component, { props: {}, attrs: { "data-testid": "checkbox" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("checkbox");
  });

  it("merges custom class", () => {
    const wrapper = mount(Checkbox as Component, { props: {}, attrs: { "data-testid": "checkbox", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("checkbox");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Checkbox as Component, { props: { "size": "sm" }, attrs: { "data-testid": "checkbox" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("checkbox--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Checkbox as Component, { props: { "size": "md" }, attrs: { "data-testid": "checkbox" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("checkbox--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Checkbox as Component, { props: { "size": "lg" }, attrs: { "data-testid": "checkbox" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("checkbox--lg");
  });
});

describe("Checkbox — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Checkbox as Component, { props: {}, attrs: { "data-testid": "checkbox", "aria-label": "Test Checkbox" }, slots: { default: "content" } });
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
