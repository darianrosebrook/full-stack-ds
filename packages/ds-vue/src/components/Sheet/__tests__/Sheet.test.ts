// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.vue";
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet", "class": "custom" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("applies side=top variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "top" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--top")).toBe(true);
  });

  it("applies side=right variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "right" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--right")).toBe(true);
  });

  it("applies side=bottom variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "bottom" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--bottom")).toBe(true);
  });

  it("applies side=left variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "left" }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--left")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet", "aria-label": "Test Sheet" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
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
