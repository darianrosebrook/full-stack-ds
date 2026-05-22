// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Dialog from "../Dialog.vue";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog");
  });

  it("merges custom class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true, "size": "sm" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true, "size": "md" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true, "size": "lg" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog--lg");
  });

  it("applies size=xl variant class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true, "size": "xl" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog--xl");
  });

  it("applies size=full variant class", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true, "size": "full" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("dialog--full");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Dialog as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const wrapper = mount(Dialog as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    await wrapper.trigger("click");
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog", "aria-label": "Test Dialog" }, slots: { default: "content" } });
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
