// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import List from "../List.vue";
// @generated:end

// @generated:start tests
describe("List — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(List as Component, { props: {}, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(List as Component, { props: {}, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list");
  });

  it("merges custom class", () => {
    const wrapper = mount(List as Component, { props: {}, attrs: { "data-testid": "list", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies as=ul variant class", () => {
    const wrapper = mount(List as Component, { props: { "as": "ul" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--ul");
  });

  it("applies as=ol variant class", () => {
    const wrapper = mount(List as Component, { props: { "as": "ol" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--ol");
  });

  it("applies as=dl variant class", () => {
    const wrapper = mount(List as Component, { props: { "as": "dl" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--dl");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(List as Component, { props: { "variant": "default" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--variant-default");
  });

  it("applies variant=unstyled variant class", () => {
    const wrapper = mount(List as Component, { props: { "variant": "unstyled" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--variant-unstyled");
  });

  it("applies variant=inline variant class", () => {
    const wrapper = mount(List as Component, { props: { "variant": "inline" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--variant-inline");
  });

  it("applies variant=divided variant class", () => {
    const wrapper = mount(List as Component, { props: { "variant": "divided" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--variant-divided");
  });

  it("applies variant=spaced variant class", () => {
    const wrapper = mount(List as Component, { props: { "variant": "spaced" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--variant-spaced");
  });

  it("applies marker=default variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "default" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-default");
  });

  it("applies marker=none variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "none" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-none");
  });

  it("applies marker=disc variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "disc" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-disc");
  });

  it("applies marker=circle variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "circle" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-circle");
  });

  it("applies marker=square variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "square" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-square");
  });

  it("applies marker=decimal variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "decimal" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-decimal");
  });

  it("applies marker=alpha variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "alpha" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-alpha");
  });

  it("applies marker=roman variant class", () => {
    const wrapper = mount(List as Component, { props: { "marker": "roman" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--marker-roman");
  });

  it("applies spacing=none variant class", () => {
    const wrapper = mount(List as Component, { props: { "spacing": "none" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--spacing-none");
  });

  it("applies spacing=sm variant class", () => {
    const wrapper = mount(List as Component, { props: { "spacing": "sm" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--spacing-sm");
  });

  it("applies spacing=md variant class", () => {
    const wrapper = mount(List as Component, { props: { "spacing": "md" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--spacing-md");
  });

  it("applies spacing=lg variant class", () => {
    const wrapper = mount(List as Component, { props: { "spacing": "lg" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--spacing-lg");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(List as Component, { props: { "size": "sm" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--size-sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(List as Component, { props: { "size": "md" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--size-md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(List as Component, { props: { "size": "lg" }, attrs: { "data-testid": "list" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("list--size-lg");
  });
});

describe("List — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(List as Component, { props: {}, attrs: { "data-testid": "list", "aria-label": "Test List" }, slots: { default: "content" } });
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
