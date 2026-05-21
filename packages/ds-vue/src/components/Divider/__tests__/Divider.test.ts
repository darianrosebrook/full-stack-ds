// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Divider from "../Divider.vue";
// @generated:end

// @generated:start tests
describe("Divider — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Divider as Component, { props: {}, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Divider as Component, { props: {}, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("divider");
  });

  it("merges custom class", () => {
    const wrapper = mount(Divider as Component, { props: {}, attrs: { "data-testid": "divider", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("divider");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Divider as Component, { props: {}, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("separator");
  });

  it("applies orientation=horizontal variant class", () => {
    const wrapper = mount(Divider as Component, { props: { "orientation": "horizontal" }, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("divider--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    const wrapper = mount(Divider as Component, { props: { "orientation": "vertical" }, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("divider--vertical");
  });
});

describe("Divider — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Divider as Component, { props: {}, attrs: { "data-testid": "divider" }, slots: { default: "content" } });
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
