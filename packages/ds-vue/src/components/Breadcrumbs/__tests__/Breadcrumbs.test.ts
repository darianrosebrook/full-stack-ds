// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Breadcrumbs from "../Breadcrumbs.vue";
// @generated:end

// @generated:start tests
describe("Breadcrumbs — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Breadcrumbs as Component, { props: {}, attrs: { "data-testid": "breadcrumbs" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Breadcrumbs as Component, { props: {}, attrs: { "data-testid": "breadcrumbs" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("breadcrumbs");
  });

  it("merges custom class", () => {
    const wrapper = mount(Breadcrumbs as Component, { props: {}, attrs: { "data-testid": "breadcrumbs", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("breadcrumbs");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Breadcrumbs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Breadcrumbs as Component, { props: {}, attrs: { "data-testid": "breadcrumbs", "aria-label": "Test Breadcrumbs" }, slots: { default: "content" } });
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
import BreadcrumbsList from "../BreadcrumbsList.vue";


describe("Breadcrumbs — compound parts", () => {
  it("mounts BreadcrumbsList with tag, base class, and slot content", () => {
    const wrapper = mount(BreadcrumbsList as Component, {
      slots: { default: "Breadcrumbs part" },
      attrs: { "data-testid": "breadcrumbs-breadcrumbslist" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("ul");
    expect(wrapper.classes()).toContain("breadcrumbs__list");
    expect(wrapper.text()).toContain("Breadcrumbs part");
  });
});
// @custom:end
