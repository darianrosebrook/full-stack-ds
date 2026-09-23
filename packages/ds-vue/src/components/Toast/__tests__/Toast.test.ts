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

  it("forwards data-testid to the rendered element", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    expect(document.body.querySelector('[data-testid="toast"]')).not.toBeNull();
  });

  it("has the correct ARIA role", () => {
    mount(Toast as Component, { props: { "open": true }, attrs: { "data-testid": "toast" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("region");
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

describe("Toast — action slot", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // a filled action slot renders exactly one wrapper holding that content
  it("renders exactly one toast__action wrapper containing the passed action content", () => {
    mount(Toast as Component, {
      props: { "open": true },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content", "action": "<button>Undo</button>" },
      attachTo: document.body,
    });
    const actions = document.body.querySelectorAll(".toast__action");
    expect(actions.length).toBe(1);
    expect(actions[0].querySelector("button")?.textContent).toBe("Undo");
  });

  // an unfilled action slot renders no empty action wrapper
  it("renders no toast__action wrapper when the action slot is unfilled", () => {
    mount(Toast as Component, {
      props: { "open": true },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content" },
      attachTo: document.body,
    });
    expect(document.body.querySelector(".toast__action")).toBeNull();
  });
});

describe("Toast — live region roles", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // the viewport root is a labeled region, live-announced politely by default
  it("marks the viewport root as a labeled region with default polite aria-live", () => {
    mount(Toast as Component, {
      props: { "open": true },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content" },
      attachTo: document.body,
    });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root?.getAttribute("role")).toBe("region");
    expect(root?.getAttribute("aria-label")).toBe("Notifications");
    expect(root?.getAttribute("aria-live")).toBe("polite");
  });

  // politeness="assertive" raises the root's aria-live to assertive
  it("sets aria-live to assertive when politeness is assertive", () => {
    mount(Toast as Component, {
      props: { "open": true, "politeness": "assertive" },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content" },
      attachTo: document.body,
    });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root?.getAttribute("aria-live")).toBe("assertive");
  });

  // the open toast item is announced as a status, not an interruptive alert
  it("marks the open item with role=status", () => {
    mount(Toast as Component, {
      props: { "open": true },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content" },
      attachTo: document.body,
    });
    const item = document.body.querySelector<HTMLElement>(".toast__item");
    expect(item?.getAttribute("role")).toBe("status");
  });

  // no part of the rendered toast uses the interruptive alert role
  it("never renders any element with role=alert", () => {
    mount(Toast as Component, {
      props: { "open": true },
      attrs: { "data-testid": "toast" },
      slots: { "default": "content" },
      attachTo: document.body,
    });
    expect(document.body.querySelector('[role="alert"]')).toBeNull();
  });
});
// @custom:end
