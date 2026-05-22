// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Label from "../Label.vue";
// @generated:end

// @generated:start tests
describe("Label — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Label as Component, { props: {}, attrs: { "data-testid": "label" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Label as Component, { props: {}, attrs: { "data-testid": "label" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("label");
  });

  it("merges custom class", () => {
    const wrapper = mount(Label as Component, { props: {}, attrs: { "data-testid": "label", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("label");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Label — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Label as Component, { props: {}, attrs: { "data-testid": "label" }, slots: { default: "content" } });
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
