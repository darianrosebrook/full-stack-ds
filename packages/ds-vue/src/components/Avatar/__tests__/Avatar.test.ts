// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Avatar from "../Avatar.vue";
// @generated:end

// @generated:start tests
describe("Avatar — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Avatar as Component, { props: {}, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Avatar as Component, { props: {}, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar");
  });

  it("merges custom class", () => {
    const wrapper = mount(Avatar as Component, { props: {}, attrs: { "data-testid": "avatar", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Avatar as Component, { props: {}, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("img");
  });

  it("applies size=small variant class", () => {
    const wrapper = mount(Avatar as Component, { props: { "size": "small" }, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar--small");
  });

  it("applies size=medium variant class", () => {
    const wrapper = mount(Avatar as Component, { props: { "size": "medium" }, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar--medium");
  });

  it("applies size=large variant class", () => {
    const wrapper = mount(Avatar as Component, { props: { "size": "large" }, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar--large");
  });

  it("applies size=extra-large variant class", () => {
    const wrapper = mount(Avatar as Component, { props: { "size": "extra-large" }, attrs: { "data-testid": "avatar" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("avatar--extra-large");
  });
});

describe("Avatar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Avatar as Component, { props: {}, attrs: { "data-testid": "avatar", "aria-label": "Test Avatar" }, slots: { default: "content" } });
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
