// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Field from "../Field.vue";
// @generated:end

// @generated:start tests
describe("Field — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Field as Component, { props: {}, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Field as Component, { props: {}, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field");
  });

  it("merges custom class", () => {
    const wrapper = mount(Field as Component, { props: {}, attrs: { "data-testid": "field", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Field as Component, { props: {}, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("applies status=idle variant class", () => {
    const wrapper = mount(Field as Component, { props: { "status": "idle" }, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field--idle");
  });

  it("applies status=validating variant class", () => {
    const wrapper = mount(Field as Component, { props: { "status": "validating" }, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field--validating");
  });

  it("applies status=valid variant class", () => {
    const wrapper = mount(Field as Component, { props: { "status": "valid" }, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field--valid");
  });

  it("applies status=invalid variant class", () => {
    const wrapper = mount(Field as Component, { props: { "status": "invalid" }, attrs: { "data-testid": "field" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("field--invalid");
  });
});

describe("Field — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Field as Component, { props: {}, attrs: { "data-testid": "field", "aria-label": "Test Field" }, slots: { default: "content" } });
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
