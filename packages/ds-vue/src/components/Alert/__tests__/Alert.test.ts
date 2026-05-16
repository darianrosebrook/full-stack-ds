// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Alert from "../Alert.vue";
// @generated:end

// @generated:start tests
describe("Alert — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Alert as Component, { props: {}, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Alert as Component, { props: {}, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert");
  });

  it("merges custom class", () => {
    const wrapper = mount(Alert as Component, { props: {}, attrs: { "data-testid": "alert", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Alert as Component, { props: {}, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("alert");
  });

  it("applies intent=info variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "intent": "info" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--info");
  });

  it("applies intent=success variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "intent": "success" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--success");
  });

  it("applies intent=warning variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "intent": "warning" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--warning");
  });

  it("applies intent=danger variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "intent": "danger" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--danger");
  });

  it("applies level=inline variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "level": "inline" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--inline");
  });

  it("applies level=section variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "level": "section" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--section");
  });

  it("applies level=page variant class", () => {
    const wrapper = mount(Alert as Component, { props: { "level": "page" }, attrs: { "data-testid": "alert" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("alert--page");
  });
});

describe("Alert — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Alert as Component, { props: {}, attrs: { "data-testid": "alert", "aria-label": "Test Alert" }, slots: { default: "content" } });
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
