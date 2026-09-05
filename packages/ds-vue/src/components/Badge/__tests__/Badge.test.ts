// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Badge from "../Badge.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Badge — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge");
  });

  it("merges custom class", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "default" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--default");
  });

  it("applies variant=status variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "status" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--status");
  });

  it("applies variant=counter variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "counter" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--counter");
  });

  it("applies variant=tag variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "tag" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--tag");
  });

  it("applies intent=info variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "info" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--info");
  });

  it("applies intent=success variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "success" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--success");
  });

  it("applies intent=warning variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "warning" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--warning");
  });

  it("applies intent=danger variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "danger" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--danger");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "sm" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "md" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "lg" }, attrs: { "data-testid": "badge" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("badge--lg");
  });
});

describe("Badge — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import BadgeContent from "../BadgeContent.vue";


describe("Badge — compound parts", () => {
  it("mounts BadgeContent with tag, base class, and slot content", () => {
    const wrapper = mount(BadgeContent as Component, {
      slots: { default: "Badge part" },
      attrs: { "data-testid": "badge-badgecontent" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("badge__content");
    expect(wrapper.text()).toContain("Badge part");
  });
});
// @custom:end
