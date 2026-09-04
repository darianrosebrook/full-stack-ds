// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Command from "../Command.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Command — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("command")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Command as Component, { props: { "open": true }, attrs: { "data-testid": "command", "class": "custom" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("command")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { "default": "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Command as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "command" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await Promise.resolve();
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Command as Component, { props: { "open": true, "label": "Test Command" }, attrs: { "data-testid": "command" }, slots: { "default": "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    const results = await axe(root as Element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import CommandGroup from "../CommandGroup.vue";
import CommandItem from "../CommandItem.vue";
import CommandList from "../CommandList.vue";


describe("Command — compound parts", () => {
  it("mounts CommandGroup with tag, base class, and slot content", () => {
    const wrapper = mount(CommandGroup as Component, {
      slots: { default: "Command part" },
      attrs: { "data-testid": "command-commandgroup" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("command__group");
    expect(wrapper.text()).toContain("Command part");
  });

  it("mounts CommandItem with tag, base class, and slot content", () => {
    const wrapper = mount(CommandItem as Component, {
      slots: { default: "Command part" },
      attrs: { "data-testid": "command-commanditem" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("li");
    expect(wrapper.classes()).toContain("command__item");
    expect(wrapper.text()).toContain("Command part");
  });

  it("mounts CommandList with tag, base class, and slot content", () => {
    const wrapper = mount(CommandList as Component, {
      slots: { default: "Command part" },
      attrs: { "data-testid": "command-commandlist" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("ul");
    expect(wrapper.classes()).toContain("command__list");
    expect(wrapper.text()).toContain("Command part");
  });
});
// @custom:end
