// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Tabs from "../Tabs.vue";
// @generated:end

// @generated:start tests
describe("Tabs — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Tabs as Component, { props: {}, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Tabs as Component, { props: {}, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs");
  });

  it("merges custom class", () => {
    const wrapper = mount(Tabs as Component, { props: {}, attrs: { "data-testid": "tabs", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies orientation=horizontal variant class", () => {
    const wrapper = mount(Tabs as Component, { props: { "orientation": "horizontal" }, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    const wrapper = mount(Tabs as Component, { props: { "orientation": "vertical" }, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs--vertical");
  });

  it("applies activationMode=automatic variant class", () => {
    const wrapper = mount(Tabs as Component, { props: { "activationMode": "automatic" }, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs--automatic");
  });

  it("applies activationMode=manual variant class", () => {
    const wrapper = mount(Tabs as Component, { props: { "activationMode": "manual" }, attrs: { "data-testid": "tabs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("tabs--manual");
  });
});

describe("Tabs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Tabs as Component, { props: {}, attrs: { "data-testid": "tabs", "aria-label": "Test Tabs" }, slots: { default: "content" } });
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
