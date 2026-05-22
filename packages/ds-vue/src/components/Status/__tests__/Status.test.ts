// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Status from "../Status.vue";
// @generated:end

// @generated:start tests
describe("Status — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Status as Component, { props: {}, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Status as Component, { props: {}, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status");
  });

  it("merges custom class", () => {
    const wrapper = mount(Status as Component, { props: {}, attrs: { "data-testid": "status", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies status=info variant class", () => {
    const wrapper = mount(Status as Component, { props: { "status": "info" }, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status--info");
  });

  it("applies status=success variant class", () => {
    const wrapper = mount(Status as Component, { props: { "status": "success" }, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status--success");
  });

  it("applies status=warning variant class", () => {
    const wrapper = mount(Status as Component, { props: { "status": "warning" }, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status--warning");
  });

  it("applies status=danger variant class", () => {
    const wrapper = mount(Status as Component, { props: { "status": "danger" }, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status--danger");
  });

  it("applies status=error variant class", () => {
    const wrapper = mount(Status as Component, { props: { "status": "error" }, attrs: { "data-testid": "status" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("status--error");
  });
});

describe("Status — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Status as Component, { props: {}, attrs: { "data-testid": "status", "aria-label": "Test Status" }, slots: { default: "content" } });
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
