// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import ProfileFlag from "../ProfileFlag.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("ProfileFlag — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(ProfileFlag as Component, { props: {}, attrs: { "data-testid": "profile-flag" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(ProfileFlag as Component, { props: {}, attrs: { "data-testid": "profile-flag" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("profile-flag");
  });

  it("merges custom class", () => {
    const wrapper = mount(ProfileFlag as Component, { props: {}, attrs: { "data-testid": "profile-flag", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("profile-flag");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("ProfileFlag — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(ProfileFlag as Component, { props: {}, attrs: { "data-testid": "profile-flag" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
