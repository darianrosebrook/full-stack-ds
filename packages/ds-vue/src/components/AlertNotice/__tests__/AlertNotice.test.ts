// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import AlertNotice from "../AlertNotice.vue";
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice");
  });

  it("merges custom class", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("alert");
  });

  it("applies status=info variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "info" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "success" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "warning" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--warning");
  });

  it("applies status=danger variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "danger" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--danger");
  });

  it("applies status=error variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "error" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "page" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "section" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "inline" }, attrs: { "data-testid": "alert-notice" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice", "aria-label": "Test AlertNotice" }, slots: { default: "content" } });
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
