// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Card from "../Card.vue";
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card");
  });

  it("merges custom class", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("applies status=completed variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "completed" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "in-progress" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "planned" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "deprecated" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--deprecated");
  });

  it("applies status=category variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "category" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--category");
  });

  it("applies status=complexity variant class", () => {
    const wrapper = mount(Card as Component, { props: { "status": "complexity" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--complexity");
  });

  it("applies density=default variant class", () => {
    const wrapper = mount(Card as Component, { props: { "density": "default" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--default");
  });

  it("applies density=inset variant class", () => {
    const wrapper = mount(Card as Component, { props: { "density": "inset" }, attrs: { "data-testid": "card" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("card--inset");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Card as Component, { props: {}, attrs: { "data-testid": "card", "aria-label": "Test Card" }, slots: { default: "content" } });
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
      "role-img-alt",
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
