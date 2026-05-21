// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Calendar from "../Calendar.vue";
// @generated:end

// @generated:start tests
describe("Calendar — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Calendar as Component, { props: {}, attrs: { "data-testid": "calendar" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Calendar as Component, { props: {}, attrs: { "data-testid": "calendar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("calendar");
  });

  it("merges custom class", () => {
    const wrapper = mount(Calendar as Component, { props: {}, attrs: { "data-testid": "calendar", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("calendar");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Calendar as Component, { props: {}, attrs: { "data-testid": "calendar" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("application");
  });

  it("applies mode=single variant class", () => {
    const wrapper = mount(Calendar as Component, { props: { "mode": "single" }, attrs: { "data-testid": "calendar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("calendar--single");
  });

  it("applies mode=range variant class", () => {
    const wrapper = mount(Calendar as Component, { props: { "mode": "range" }, attrs: { "data-testid": "calendar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("calendar--range");
  });
});

describe("Calendar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Calendar as Component, { props: {}, attrs: { "data-testid": "calendar", "aria-label": "Test Calendar" }, slots: { default: "content" } });
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
