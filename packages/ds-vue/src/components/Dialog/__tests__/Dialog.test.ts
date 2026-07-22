// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Dialog from "../Dialog.vue";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog", "class": "custom" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("applies size=sm variant class", () => {
    mount(Dialog as Component, { props: { "open": true, "size": "sm" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog--sm")).toBe(true);
  });

  it("applies size=md variant class", () => {
    mount(Dialog as Component, { props: { "open": true, "size": "md" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog--md")).toBe(true);
  });

  it("applies size=lg variant class", () => {
    mount(Dialog as Component, { props: { "open": true, "size": "lg" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog--lg")).toBe(true);
  });

  it("applies size=xl variant class", () => {
    mount(Dialog as Component, { props: { "open": true, "size": "xl" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog--xl")).toBe(true);
  });

  it("applies size=full variant class", () => {
    mount(Dialog as Component, { props: { "open": true, "size": "full" }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("dialog--full")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Dialog as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Dialog as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Dialog as Component, { props: { "open": true }, attrs: { "data-testid": "dialog", "aria-label": "Test Dialog" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".dialog");
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
describe("Dialog — portal (FEAT-PORTAL-MECHANISM-CROSS-FRAMEWORK-01)", () => {
  it("teleports the dialog root to document.body, escaping an ancestor stacking context", () => {
    // A transform/overflow ancestor creates a stacking context that would clip
    // a merely-fixed dialog. Vue's <Teleport to="body"> relocates the root so
    // its DOM parent is document.body, NOT the ancestor the consumer nests it in.
    const host = document.createElement("div");
    host.style.transform = "translateZ(0)";
    host.style.overflow = "hidden";
    document.body.appendChild(host);

    mount(Dialog as Component, {
      props: { open: true },
      attrs: { "aria-label": "Portaled Dialog" },
      slots: { default: "body content" },
      attachTo: host,
    });

    // Teleport relocates the root out of the wrapper, and fallthrough attrs
    // (data-testid) do not reach a teleported root, so resolve it by its base
    // class within document.body.
    const dialogRoot = document.body.querySelector<HTMLElement>(".dialog");
    expect(dialogRoot).not.toBeNull();
    // Load-bearing assertion: the teleported root's parent is document.body,
    // not the transform ancestor that would otherwise trap it.
    expect(dialogRoot?.parentElement).toBe(document.body);
    expect(host.contains(dialogRoot)).toBe(false);

    host.remove();
  });
});
// @custom:end
