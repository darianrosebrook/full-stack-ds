// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Toast from "../Toast.vue";
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "class": "custom" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("has the correct ARIA role", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("alert");
  });

  it("applies variant=info variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "info" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--info")).toBe(true);
  });

  it("applies variant=success variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "success" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--success")).toBe(true);
  });

  it("applies variant=warning variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "warning" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--warning")).toBe(true);
  });

  it("applies variant=error variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "error" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--error")).toBe(true);
  });

  it("applies politeness=polite variant class", () => {
    mount(Toast as Component, { props: { "open": true, "politeness": "polite" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--polite")).toBe(true);
  });

  it("applies politeness=assertive variant class", () => {
    mount(Toast as Component, { props: { "open": true, "politeness": "assertive" }, attrs: { "data-testid": "toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--assertive")).toBe(true);
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
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "aria-label": "Test Toast" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
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
