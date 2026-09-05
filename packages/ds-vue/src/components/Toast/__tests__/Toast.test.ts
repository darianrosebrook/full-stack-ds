// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Toast from "../Toast.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Toast — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "class": "custom" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("has the correct ARIA role", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("alert");
  });

  it("applies variant=info variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "info" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--info")).toBe(true);
  });

  it("applies variant=success variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "success" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--success")).toBe(true);
  });

  it("applies variant=warning variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "warning" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--warning")).toBe(true);
  });

  it("applies variant=error variant class", () => {
    mount(Toast as Component, { props: { "open": true, "variant": "error" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--error")).toBe(true);
  });

  it("applies politeness=polite variant class", () => {
    mount(Toast as Component, { props: { "open": true, "politeness": "polite" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--polite")).toBe(true);
  });

  it("applies politeness=assertive variant class", () => {
    mount(Toast as Component, { props: { "open": true, "politeness": "assertive" }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("toast--assertive")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Toast as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast", "aria-label": "Test Toast" }, slots: { "default": "<span>content</span>" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    const results = await axe(root as Element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import ToastDescription from "../ToastDescription.vue";
import ToastItem from "../ToastItem.vue";
import ToastTitle from "../ToastTitle.vue";


describe("Toast — compound parts", () => {
  it("mounts ToastDescription with tag, base class, and slot content", () => {
    const wrapper = mount(ToastDescription as Component, {
      slots: { default: "Toast part" },
      attrs: { "data-testid": "toast-toastdescription" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("p");
    expect(wrapper.classes()).toContain("toast__description");
    expect(wrapper.text()).toContain("Toast part");
  });

  it("mounts ToastItem with tag, base class, and slot content", () => {
    const wrapper = mount(ToastItem as Component, {
      slots: { default: "Toast part" },
      attrs: { "data-testid": "toast-toastitem" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("li");
    expect(wrapper.classes()).toContain("toast__item");
    expect(wrapper.text()).toContain("Toast part");
  });

  it("mounts ToastTitle with tag, base class, and slot content", () => {
    const wrapper = mount(ToastTitle as Component, {
      slots: { default: "Toast part" },
      attrs: { "data-testid": "toast-toasttitle" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("h3");
    expect(wrapper.classes()).toContain("toast__title");
    expect(wrapper.text()).toContain("Toast part");
  });
});
// @custom:end
