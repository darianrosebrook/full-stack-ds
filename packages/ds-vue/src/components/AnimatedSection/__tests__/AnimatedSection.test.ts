// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import AnimatedSection from "../AnimatedSection.vue";
// @generated:end

// @generated:start tests
describe("AnimatedSection — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(AnimatedSection as Component, { props: {}, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: {}, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section");
  });

  it("merges custom class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: {}, attrs: { "data-testid": "animated-section", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies as=section variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "section" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--section");
  });

  it("applies as=div variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "div" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--div");
  });

  it("applies as=article variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "article" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--article");
  });

  it("applies as=main variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "main" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--main");
  });

  it("applies as=aside variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "aside" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--aside");
  });

  it("applies as=header variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "header" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--header");
  });

  it("applies as=footer variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "as": "footer" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--footer");
  });

  it("applies variant=fade-up variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "variant": "fade-up" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--fade-up");
  });

  it("applies variant=fade-in variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "variant": "fade-in" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--fade-in");
  });

  it("applies variant=slide-in variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "variant": "slide-in" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--slide-in");
  });

  it("applies variant=stagger-children variant class", () => {
    const wrapper = mount(AnimatedSection as Component, { props: { "variant": "stagger-children" }, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-section--stagger-children");
  });
});

describe("AnimatedSection — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(AnimatedSection as Component, { props: {}, attrs: { "data-testid": "animated-section" }, slots: { default: "content" } });
    const results = await axe(wrapper.element);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
