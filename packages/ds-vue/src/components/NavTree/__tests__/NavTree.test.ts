// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import NavTree from "../NavTree.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("NavTree — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder" }, attrs: { "data-testid": "nav-tree" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder" }, attrs: { "data-testid": "nav-tree" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-tree");
  });

  it("merges custom class", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder" }, attrs: { "data-testid": "nav-tree", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-tree");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder" }, attrs: { "data-testid": "nav-tree" }, slots: { "default": "content" } });
    expect(wrapper.attributes("role")).toBe("listitem");
  });

  it("applies iconSize=sm variant class", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder", "iconSize": "sm" }, attrs: { "data-testid": "nav-tree" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-tree--sm");
  });

  it("applies iconSize=md variant class", () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder", "iconSize": "md" }, attrs: { "data-testid": "nav-tree" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("nav-tree--md");
  });
});

describe("NavTree — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(NavTree as Component, { props: { "label": "placeholder" }, attrs: { "data-testid": "nav-tree", "aria-label": "Test NavTree" }, slots: { "default": "<li>content</li>" } });
    const list = document.createElement("ul");
    list.append(wrapper.element);
    const results = await axe(list, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import NavTreeItem from "../NavTreeItem.vue";
import NavTreeList from "../NavTreeList.vue";


describe("NavTree — compound parts", () => {
  it("mounts NavTreeItem with tag, base class, and slot content", () => {
    const wrapper = mount(NavTreeItem as Component, {
      slots: { default: "NavTree part" },
      attrs: { "data-testid": "navtree-navtreeitem" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("li");
    expect(wrapper.classes()).toContain("nav-tree__item");
    expect(wrapper.text()).toContain("NavTree part");
  });

  it("mounts NavTreeList with tag, base class, and slot content", () => {
    const wrapper = mount(NavTreeList as Component, {
      slots: { default: "NavTree part" },
      attrs: { "data-testid": "navtree-navtreelist" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("ul");
    expect(wrapper.classes()).toContain("nav-tree__list");
    expect(wrapper.text()).toContain("NavTree part");
  });
});
// @custom:end
