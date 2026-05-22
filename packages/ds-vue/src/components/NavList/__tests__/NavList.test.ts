// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import NavList from "../NavList.vue";
// @generated:end

// @generated:start tests
describe("NavList — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("nav-list");
  });

  it("merges custom class", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("nav-list");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies orientation=vertical variant class", () => {
    const wrapper = mount(NavList as Component, { props: { "orientation": "vertical" }, attrs: { "data-testid": "nav-list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("nav-list--vertical");
  });

  it("applies orientation=horizontal variant class", () => {
    const wrapper = mount(NavList as Component, { props: { "orientation": "horizontal" }, attrs: { "data-testid": "nav-list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("nav-list--horizontal");
  });
});

describe("NavList — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list", "aria-label": "Test NavList" }, slots: { default: "content" } });
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
