// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import CodeBlock from "../CodeBlock.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("CodeBlock — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(CodeBlock as Component, { props: {}, attrs: { "data-testid": "code-block" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(CodeBlock as Component, { props: {}, attrs: { "data-testid": "code-block" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-block");
  });

  it("merges custom class", () => {
    const wrapper = mount(CodeBlock as Component, { props: {}, attrs: { "data-testid": "code-block", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("code-block");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("CodeBlock — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(CodeBlock as Component, { props: { "code": "placeholder", "language": "bash" }, attrs: { "data-testid": "code-block" }, slots: { "default": "content" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
