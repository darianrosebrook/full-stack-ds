// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import AnimatedText from "../AnimatedText.vue";
// @generated:end

// @generated:start tests
describe("AnimatedText — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(AnimatedText as Component, { props: {}, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(AnimatedText as Component, { props: {}, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text");
  });

  it("merges custom class", () => {
    const wrapper = mount(AnimatedText as Component, { props: {}, attrs: { "data-testid": "animated-text", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies as=h1 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h1" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h1");
  });

  it("applies as=h2 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h2" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h2");
  });

  it("applies as=h3 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h3" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h3");
  });

  it("applies as=h4 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h4" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h4");
  });

  it("applies as=h5 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h5" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h5");
  });

  it("applies as=h6 variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "h6" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--h6");
  });

  it("applies as=p variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "p" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--p");
  });

  it("applies as=span variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "span" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--span");
  });

  it("applies as=div variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "as": "div" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--div");
  });

  it("applies variant=blur-in variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "variant": "blur-in" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--blur-in");
  });

  it("applies variant=fade-up variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "variant": "fade-up" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--fade-up");
  });

  it("applies variant=slide-in variant class", () => {
    const wrapper = mount(AnimatedText as Component, { props: { "variant": "slide-in" }, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-text--slide-in");
  });
});

describe("AnimatedText — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(AnimatedText as Component, { props: {}, attrs: { "data-testid": "animated-text" }, slots: { default: "content" } });
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
