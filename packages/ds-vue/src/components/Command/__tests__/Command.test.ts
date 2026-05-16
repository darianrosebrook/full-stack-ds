// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Command from "../Command.vue";
// @generated:end

// @generated:start tests
describe("Command — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("command");
  });

  it("merges custom class", () => {
    const wrapper = mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("command");
    expect(wrapper.classes()).toContain("custom");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const wrapper = mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { default: "content" }, attachTo: document.body });
    await wrapper.trigger("click");
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command", "aria-label": "Test Command" }, slots: { default: "content" } });
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
