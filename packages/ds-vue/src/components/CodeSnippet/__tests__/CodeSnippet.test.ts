// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import CodeSnippet from "../CodeSnippet.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("CodeSnippet — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-snippet");
  });

  it("merges custom class", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder" }, attrs: { "data-testid": "code-snippet", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-snippet");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies as=code variant class", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder", "as": "code" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-snippet--code");
  });

  it("applies as=kbd variant class", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder", "as": "kbd" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-snippet--kbd");
  });

  it("applies as=samp variant class", () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder", "as": "samp" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-snippet--samp");
  });
});

describe("CodeSnippet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(CodeSnippet as Component, { props: { "text": "placeholder" }, attrs: { "data-testid": "code-snippet" }, slots: { "default": "content" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
