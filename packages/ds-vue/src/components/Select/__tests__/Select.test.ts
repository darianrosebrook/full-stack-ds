// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Select from "../Select.vue";
// @generated:end

// @generated:start tests
describe("Select — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Select as Component, { props: { "open": true }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select");
  });

  it("merges custom class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true }, attrs: { "data-testid": "select", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "size": "sm" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "size": "md" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "size": "lg" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--lg");
  });

  it("applies position=bottom variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "position": "bottom" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--bottom");
  });

  it("applies position=top variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "position": "top" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--top");
  });

  it("applies position=auto variant class", () => {
    const wrapper = mount(Select as Component, { props: { "open": true, "position": "auto" }, attrs: { "data-testid": "select" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("select--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    mount(Select as Component, { props: { "open": true, "onOpenChange": onOpenChangeSpy }, attrs: { "data-testid": "select" }, slots: { default: "content" }, attachTo: document.body });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Select as Component, { props: { "open": true }, attrs: { "data-testid": "select", "aria-label": "Test Select" }, slots: { default: "content" } });
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

// VUE-FIRST-RENDER-CONTROLLABLE-DEFAULT-01.
// The generated tests above all pass `open: true` (controlled), which
// bypasses the controllable-state default path. The bug surfaced in
// BINDING-EXPRESSION-V2-PREDICATE-01 runtime rail only fires on the
// *uncontrolled* path: passing `defaultOpen: true` should make the
// listbox render on first mount. These tests pin the contract.
describe("Select — uncontrolled defaultOpen first-render", () => {
  it("renders the listbox content on first mount with defaultOpen=true", () => {
    const wrapper = mount(Select as Component, {
      props: { defaultOpen: true },
    });
    // The `v-if="behavior.open.value"` guard must be open on first
    // render. The listbox content carries class `select__content`.
    expect(wrapper.find(".select__content").exists()).toBe(true);
  });

  it("reports aria-expanded='true' on first mount with defaultOpen=true", () => {
    const wrapper = mount(Select as Component, {
      props: { defaultOpen: true },
    });
    // The combobox root's aria-expanded reads `behavior.open.value`.
    expect(wrapper.attributes("aria-expanded")).toBe("true");
  });

  it("renders three default options on first mount with defaultOpen=true", () => {
    const wrapper = mount(Select as Component, {
      props: { defaultOpen: true },
    });
    const options = wrapper.findAll(".select__option");
    expect(options).toHaveLength(3);
  });

  it("marks the option matching defaultValue as aria-selected='true'", () => {
    const wrapper = mount(Select as Component, {
      props: { defaultOpen: true, defaultValue: "beta" },
    });
    const options = wrapper.findAll(".select__option");
    const selected = options.map((o) => o.attributes("aria-selected"));
    // memberOf(item.value, "beta") collapses to scalar equality at
    // runtime because the channel value is a string, not an array.
    expect(selected).toEqual(["false", "true", "false"]);
  });
});

// @custom:end
