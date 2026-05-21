// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Walkthrough from "../Walkthrough.vue";
// @generated:end

// @generated:start tests
describe("Walkthrough — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough");
  });

  it("merges custom class", () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("status");
  });

  it("applies placement=top variant class", () => {
    const wrapper = mount(Walkthrough as Component, { props: { "placement": "top" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough--top");
  });

  it("applies placement=bottom variant class", () => {
    const wrapper = mount(Walkthrough as Component, { props: { "placement": "bottom" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough--bottom");
  });

  it("applies placement=left variant class", () => {
    const wrapper = mount(Walkthrough as Component, { props: { "placement": "left" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough--left");
  });

  it("applies placement=right variant class", () => {
    const wrapper = mount(Walkthrough as Component, { props: { "placement": "right" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough--right");
  });

  it("applies placement=auto variant class", () => {
    const wrapper = mount(Walkthrough as Component, { props: { "placement": "auto" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("walkthrough--auto");
  });
});

describe("Walkthrough — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough", "aria-label": "Test Walkthrough" }, slots: { default: "content" } });
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
