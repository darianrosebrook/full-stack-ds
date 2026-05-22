// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Truncate from "../Truncate.vue";
// @generated:end

// @generated:start tests
describe("Truncate — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Truncate as Component, { props: {}, attrs: { "data-testid": "truncate" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Truncate as Component, { props: {}, attrs: { "data-testid": "truncate" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("truncate");
  });

  it("merges custom class", () => {
    const wrapper = mount(Truncate as Component, { props: {}, attrs: { "data-testid": "truncate", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("truncate");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Truncate — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Truncate as Component, { props: {}, attrs: { "data-testid": "truncate" }, slots: { default: "content" } });
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
