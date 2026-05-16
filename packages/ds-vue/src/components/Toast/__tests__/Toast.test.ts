// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Toast from "../Toast.vue";
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast");
  });

  it("merges custom class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("alert");
  });

  it("applies variant=info variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "variant": "info" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--info");
  });

  it("applies variant=success variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "variant": "success" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--success");
  });

  it("applies variant=warning variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "variant": "warning" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--warning");
  });

  it("applies variant=error variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "variant": "error" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "politeness": "polite" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true, "politeness": "assertive" }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("toast--assertive");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Toast as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "aria-label": "Test Toast" }, slots: { default: "content" } });
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
