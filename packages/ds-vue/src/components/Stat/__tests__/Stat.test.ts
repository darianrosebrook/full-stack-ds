// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Stat from "../Stat.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Stat — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Stat as Component, { props: {}, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Stat as Component, { props: {}, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat");
  });

  it("merges custom class", () => {
    const wrapper = mount(Stat as Component, { props: {}, attrs: { "data-testid": "stat", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "size": "sm" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "size": "md" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "size": "lg" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--lg");
  });

  it("applies trend=up variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "trend": "up" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--up");
  });

  it("applies trend=down variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "trend": "down" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--down");
  });

  it("applies trend=neutral variant class", () => {
    const wrapper = mount(Stat as Component, { props: { "trend": "neutral" }, attrs: { "data-testid": "stat" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("stat--neutral");
  });
});

describe("Stat — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Stat as Component, { props: {}, attrs: { "data-testid": "stat" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
