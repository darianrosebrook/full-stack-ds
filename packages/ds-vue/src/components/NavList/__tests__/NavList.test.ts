// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import NavList from "../NavList.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("NavList — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-list");
  });

  it("merges custom class", () => {
    const wrapper = mount(NavList as Component, { props: {}, attrs: { "data-testid": "nav-list", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-list");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies orientation=vertical variant class", () => {
    const wrapper = mount(NavList as Component, { props: { "orientation": "vertical" }, attrs: { "data-testid": "nav-list" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-list--vertical");
  });

  it("applies orientation=horizontal variant class", () => {
    const wrapper = mount(NavList as Component, { props: { "orientation": "horizontal" }, attrs: { "data-testid": "nav-list" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-list--horizontal");
  });
});

describe("NavList — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(NavList as Component, { props: { "ariaLabel": "Test NavList" }, attrs: { "data-testid": "nav-list" }, slots: { "default": "<li>content</li>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import NavListItem from "../NavListItem.vue";
import NavListList from "../NavListList.vue";


describe("NavList — compound parts", () => {
  it("mounts NavListItem with tag, base class, and slot content", () => {
    const wrapper = mount(NavListItem as Component, {
      slots: { default: "NavList part" },
      attrs: { "data-testid": "navlist-navlistitem" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("li");
    expect(wrapper.classes()).toContain("nav-list__item");
    expect(wrapper.text()).toContain("NavList part");
  });

  it("mounts NavListList with tag, base class, and slot content", () => {
    const wrapper = mount(NavListList as Component, {
      slots: { default: "NavList part" },
      attrs: { "data-testid": "navlist-navlistlist" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("ul");
    expect(wrapper.classes()).toContain("nav-list__list");
    expect(wrapper.text()).toContain("NavList part");
  });
});
// @custom:end
