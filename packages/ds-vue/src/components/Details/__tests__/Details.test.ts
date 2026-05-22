// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Details from "../Details.vue";
// @generated:end

// @generated:start tests
describe("Details — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Details as Component, { props: { "open": true }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details");
  });

  it("merges custom class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true }, attrs: { "data-testid": "details", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Details as Component, { props: { "open": true }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("group");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "variant": "default" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--default");
  });

  it("applies variant=inline variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "variant": "inline" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--inline");
  });

  it("applies variant=compact variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "variant": "compact" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--compact");
  });

  it("applies icon=left variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "icon": "left" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--left");
  });

  it("applies icon=right variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "icon": "right" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--right");
  });

  it("applies icon=none variant class", () => {
    const wrapper = mount(Details as Component, { props: { "open": true, "icon": "none" }, attrs: { "data-testid": "details" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("details--none");
  });
});

describe("Details — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Details as Component, { props: { "open": true }, attrs: { "data-testid": "details", "aria-label": "Test Details" }, slots: { default: "content" } });
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
