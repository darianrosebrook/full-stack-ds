// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Accordion from "../Accordion.vue";
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Accordion as Component, { props: {}, attrs: { "data-testid": "accordion" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Accordion as Component, { props: {}, attrs: { "data-testid": "accordion" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("accordion");
  });

  it("merges custom class", () => {
    const wrapper = mount(Accordion as Component, { props: {}, attrs: { "data-testid": "accordion", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("accordion");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies type=single variant class", () => {
    const wrapper = mount(Accordion as Component, { props: { "type": "single" }, attrs: { "data-testid": "accordion" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("accordion--single");
  });

  it("applies type=multiple variant class", () => {
    const wrapper = mount(Accordion as Component, { props: { "type": "multiple" }, attrs: { "data-testid": "accordion" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("accordion--multiple");
  });
});

describe("Accordion — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Accordion as Component, { props: {}, attrs: { "data-testid": "accordion", "aria-label": "Test Accordion" }, slots: { default: "content" } });
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
