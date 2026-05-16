// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import ToggleSwitch from "../ToggleSwitch.vue";
// @generated:end

// @generated:start tests
describe("ToggleSwitch — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: {}, attrs: { "data-testid": "toggle-switch" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: {}, attrs: { "data-testid": "toggle-switch" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toggle-switch");
  });

  it("merges custom class", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: {}, attrs: { "data-testid": "toggle-switch", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toggle-switch");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=small variant class", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: { "size": "small" }, attrs: { "data-testid": "toggle-switch" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toggle-switch--small");
  });

  it("applies size=medium variant class", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: { "size": "medium" }, attrs: { "data-testid": "toggle-switch" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toggle-switch--medium");
  });

  it("applies size=large variant class", () => {
    const wrapper = mount(ToggleSwitch as Component, { props: { "size": "large" }, attrs: { "data-testid": "toggle-switch" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toggle-switch--large");
  });
});

describe("ToggleSwitch — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(ToggleSwitch as Component, { props: {}, attrs: { "data-testid": "toggle-switch", "aria-label": "Test ToggleSwitch" }, slots: { default: "content" } });
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
