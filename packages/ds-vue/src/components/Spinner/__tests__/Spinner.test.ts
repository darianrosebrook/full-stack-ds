// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Spinner from "../Spinner.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Spinner — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Spinner as Component, { props: {}, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Spinner as Component, { props: {}, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner");
  });

  it("merges custom class", () => {
    const wrapper = mount(Spinner as Component, { props: {}, attrs: { "data-testid": "spinner", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Spinner as Component, { props: {}, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.attributes("role")).toBe("status");
  });

  it("applies size=xs variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "size": "xs" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--xs");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "size": "sm" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "size": "md" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "size": "lg" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--lg");
  });

  it("applies thickness=hairline variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "thickness": "hairline" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--hairline");
  });

  it("applies thickness=regular variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "thickness": "regular" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--regular");
  });

  it("applies thickness=bold variant class", () => {
    const wrapper = mount(Spinner as Component, { props: { "thickness": "bold" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("spinner--bold");
  });
});

describe("Spinner — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Spinner as Component, { props: { "label": "Test Spinner" }, attrs: { "data-testid": "spinner" }, slots: { "default": "content" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
