// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Progress from "../Progress.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Progress — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Progress as Component, { props: {}, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Progress as Component, { props: {}, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress");
  });

  it("merges custom class", () => {
    const wrapper = mount(Progress as Component, { props: {}, attrs: { "data-testid": "progress", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Progress as Component, { props: {}, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.attributes("role")).toBe("progressbar");
  });

  it("applies variant=linear variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "variant": "linear" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--linear");
  });

  it("applies variant=circular variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "variant": "circular" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--circular");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "size": "sm" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "size": "md" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "size": "lg" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--lg");
  });

  it("applies intent=info variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "intent": "info" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--info");
  });

  it("applies intent=success variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "intent": "success" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--success");
  });

  it("applies intent=warning variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "intent": "warning" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--warning");
  });

  it("applies intent=danger variant class", () => {
    const wrapper = mount(Progress as Component, { props: { "intent": "danger" }, attrs: { "data-testid": "progress" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("progress--danger");
  });
});

describe("Progress — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Progress as Component, { props: { "label": "Test Progress" }, attrs: { "data-testid": "progress" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
