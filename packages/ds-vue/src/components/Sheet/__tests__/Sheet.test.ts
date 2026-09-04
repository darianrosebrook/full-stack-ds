// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Sheet — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet", "class": "custom" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("applies side=top variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "top" }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--top")).toBe(true);
  });

  it("applies side=right variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "right" }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--right")).toBe(true);
  });

  it("applies side=bottom variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "bottom" }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--bottom")).toBe(true);
  });

  it("applies side=left variant class", () => {
    mount(Sheet as Component, { props: { "open": true, "side": "left" }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("sheet--left")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Sheet as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "sheet" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Sheet as Component, { props: { "open": true }, attrs: { "data-testid": "sheet" }, slots: { "default": "<span>content</span>", "title": "<span>Test Sheet title</span>", "description": "<span>Test Sheet description</span>" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    const results = await axe(root as Element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import SheetBody from "../SheetBody.vue";
import SheetContent from "../SheetContent.vue";
import SheetDescription from "../SheetDescription.vue";
import SheetFooter from "../SheetFooter.vue";
import SheetHeader from "../SheetHeader.vue";
import SheetTitle from "../SheetTitle.vue";


describe("Sheet — compound parts", () => {
  it("mounts SheetBody with tag, base class, and slot content", () => {
    const wrapper = mount(SheetBody as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheetbody" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("sheet__body");
    expect(wrapper.text()).toContain("Sheet part");
  });

  it("mounts SheetContent with tag, base class, and slot content", () => {
    const wrapper = mount(SheetContent as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheetcontent" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("sheet__content");
    expect(wrapper.text()).toContain("Sheet part");
  });

  it("mounts SheetDescription with tag, base class, and slot content", () => {
    const wrapper = mount(SheetDescription as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheetdescription" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("p");
    expect(wrapper.classes()).toContain("sheet__description");
    expect(wrapper.text()).toContain("Sheet part");
  });

  it("mounts SheetFooter with tag, base class, and slot content", () => {
    const wrapper = mount(SheetFooter as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheetfooter" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("footer");
    expect(wrapper.classes()).toContain("sheet__footer");
    expect(wrapper.text()).toContain("Sheet part");
  });

  it("mounts SheetHeader with tag, base class, and slot content", () => {
    const wrapper = mount(SheetHeader as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheetheader" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("header");
    expect(wrapper.classes()).toContain("sheet__header");
    expect(wrapper.text()).toContain("Sheet part");
  });

  it("mounts SheetTitle with tag, base class, and slot content", () => {
    const wrapper = mount(SheetTitle as Component, {
      slots: { default: "Sheet part" },
      attrs: { "data-testid": "sheet-sheettitle" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("h3");
    expect(wrapper.classes()).toContain("sheet__title");
    expect(wrapper.text()).toContain("Sheet part");
  });
});
// @custom:end
