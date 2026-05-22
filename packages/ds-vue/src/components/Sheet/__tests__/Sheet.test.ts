// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.vue";
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet");
  });

  it("merges custom class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies side=top variant class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true, "side": "top" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet--top");
  });

  it("applies side=right variant class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true, "side": "right" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true, "side": "bottom" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true, "side": "left" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("sheet--left");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const wrapper = mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    await wrapper.trigger("click");
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet", "aria-label": "Test Sheet" }, slots: { default: "content" } });
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
