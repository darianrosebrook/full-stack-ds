// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Popover from "../Popover.vue";
// @generated:end

// @generated:start tests
describe("Popover — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover");
  });

  it("merges custom class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true }, attrs: { "data-testid": "popover", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies placement=top variant class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true, "placement": "top" }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover--top");
  });

  it("applies placement=bottom variant class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true, "placement": "bottom" }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover--bottom");
  });

  it("applies placement=left variant class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true, "placement": "left" }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover--left");
  });

  it("applies placement=right variant class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true, "placement": "right" }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover--right");
  });

  it("applies placement=auto variant class", () => {
    const wrapper = mount(Popover as Component, { props: { "open": true, "placement": "auto" }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("popover--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Popover as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "popover" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Popover — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Popover as Component, { props: { "open": true }, attrs: { "data-testid": "popover" }, slots: { default: "content" } });
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
