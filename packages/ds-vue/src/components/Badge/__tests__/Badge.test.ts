// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Badge from "../Badge.vue";
// @generated:end

// @generated:start tests
describe("Badge — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge");
  });

  it("merges custom class", () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "default" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--default");
  });

  it("applies variant=status variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "status" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--status");
  });

  it("applies variant=counter variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "counter" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--counter");
  });

  it("applies variant=tag variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "variant": "tag" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--tag");
  });

  it("applies intent=info variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "info" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--info");
  });

  it("applies intent=success variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "success" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--success");
  });

  it("applies intent=warning variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "warning" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--warning");
  });

  it("applies intent=danger variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "intent": "danger" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--danger");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "sm" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "md" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Badge as Component, { props: { "size": "lg" }, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("badge--lg");
  });
});

describe("Badge — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Badge as Component, { props: {}, attrs: { "data-testid": "badge" }, slots: { default: "content" } });
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
