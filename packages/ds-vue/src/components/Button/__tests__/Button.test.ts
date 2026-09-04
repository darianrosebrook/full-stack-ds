// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Button from "../Button.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Button — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Button as Component, { props: {}, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Button as Component, { props: {}, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button");
  });

  it("merges custom class", () => {
    const wrapper = mount(Button as Component, { props: {}, attrs: { "data-testid": "button", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=small variant class", () => {
    const wrapper = mount(Button as Component, { props: { "size": "small" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--small");
  });

  it("applies size=medium variant class", () => {
    const wrapper = mount(Button as Component, { props: { "size": "medium" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--medium");
  });

  it("applies size=large variant class", () => {
    const wrapper = mount(Button as Component, { props: { "size": "large" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--large");
  });

  it("applies variant=primary variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "primary" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--primary");
  });

  it("applies variant=secondary variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "secondary" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--secondary");
  });

  it("applies variant=tertiary variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "tertiary" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--tertiary");
  });

  it("applies variant=ghost variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "ghost" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--ghost");
  });

  it("applies variant=destructive variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "destructive" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--destructive");
  });

  it("applies variant=outline variant class", () => {
    const wrapper = mount(Button as Component, { props: { "variant": "outline" }, attrs: { "data-testid": "button" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("button--outline");
  });
});

describe("Button — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Button as Component, { props: { "ariaLabel": "Test Button" }, attrs: { "data-testid": "button" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
