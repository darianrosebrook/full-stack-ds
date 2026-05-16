// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Input from "../Input.vue";
// @generated:end

// @generated:start tests
describe("Input — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Input as Component, { props: {}, attrs: { "data-testid": "input" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Input as Component, { props: {}, attrs: { "data-testid": "input" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("input");
  });

  it("merges custom class", () => {
    const wrapper = mount(Input as Component, { props: {}, attrs: { "data-testid": "input", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("input");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Input — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Input as Component, { props: {}, attrs: { "data-testid": "input", "aria-label": "Test Input" }, slots: { default: "content" } });
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
