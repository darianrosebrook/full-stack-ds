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
    mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>('[data-testid="command"]');
    expect(root).not.toBeNull();
    expect(root?.classList.contains("command")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command", "class": "custom" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>('[data-testid="command"]');
    expect(root).not.toBeNull();
    expect(root?.classList.contains("command")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>('[data-testid="command"]');
    expect(root).not.toBeNull();
    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command", "aria-label": "Test Command" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>('[data-testid="command"]');
    expect(root).not.toBeNull();
    const results = await axe(root as Element);
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
