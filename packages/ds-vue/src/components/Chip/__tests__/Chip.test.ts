// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Chip from "../Chip.vue";
// @generated:end

// @generated:start tests
describe("Chip — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Chip as Component, { props: {}, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Chip as Component, { props: {}, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip");
  });

  it("merges custom class", () => {
    const wrapper = mount(Chip as Component, { props: {}, attrs: { "data-testid": "chip", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "variant": "default" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--default");
  });

  it("applies variant=selected variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "variant": "selected" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--selected");
  });

  it("applies variant=dismissible variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "variant": "dismissible" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--dismissible");
  });

  it("applies size=small variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "size": "small" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--small");
  });

  it("applies size=medium variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "size": "medium" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--medium");
  });

  it("applies size=large variant class", () => {
    const wrapper = mount(Chip as Component, { props: { "size": "large" }, attrs: { "data-testid": "chip" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("chip--large");
  });
});

describe("Chip — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Chip as Component, { props: {}, attrs: { "data-testid": "chip", "aria-label": "Test Chip" }, slots: { default: "content" } });
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
