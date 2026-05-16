// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import AnimatedCard from "../AnimatedCard.vue";
// @generated:end

// @generated:start tests
describe("AnimatedCard — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(AnimatedCard as Component, { props: {}, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: {}, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card");
  });

  it("merges custom class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: {}, attrs: { "data-testid": "animated-card", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies as=article variant class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: { "as": "article" }, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card--article");
  });

  it("applies as=div variant class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: { "as": "div" }, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card--div");
  });

  it("applies as=li variant class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: { "as": "li" }, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card--li");
  });

  it("applies as=a variant class", () => {
    const wrapper = mount(AnimatedCard as Component, { props: { "as": "a" }, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("animated-card--a");
  });
});

describe("AnimatedCard — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(AnimatedCard as Component, { props: {}, attrs: { "data-testid": "animated-card" }, slots: { default: "content" } });
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
