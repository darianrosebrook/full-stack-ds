// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Markdown from "../Markdown.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Markdown — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Markdown as Component, { props: {}, attrs: { "data-testid": "markdown" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Markdown as Component, { props: {}, attrs: { "data-testid": "markdown" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("markdown");
  });

  it("merges custom class", () => {
    const wrapper = mount(Markdown as Component, { props: {}, attrs: { "data-testid": "markdown", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("markdown");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Markdown — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Markdown as Component, { props: { "content": "placeholder" }, attrs: { "data-testid": "markdown" }, slots: { "default": "content" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
