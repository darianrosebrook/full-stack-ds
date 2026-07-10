// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Icon from "../Icon.vue";
// @generated:end

// @generated:start tests
describe("Icon — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Icon as Component, { props: {}, attrs: { "data-testid": "icon" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Icon as Component, { props: {}, attrs: { "data-testid": "icon" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("icon");
  });

  it("merges custom class", () => {
    const wrapper = mount(Icon as Component, { props: {}, attrs: { "data-testid": "icon", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("icon");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("Icon — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Icon as Component, { props: {}, attrs: { "data-testid": "icon", "aria-label": "Test Icon" }, slots: { default: "content" } });
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
describe("Icon — catalog glyph rendering (ICON-CATALOG-RUNTIME-DELIVERY-01)", () => {
  it("renders the authored 16-grid check glyph at size=sm", () => {
    const wrapper = mount(Icon as Component, { props: { name: "check", size: "sm" } });
    const svg = wrapper.find('svg[data-fsds-icon="check"]');
    expect(svg.exists()).toBe(true);
    expect(svg.element.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg.element.getAttribute("width")).toBe("16");
    const paths = svg.findAll("path");
    expect(paths).toHaveLength(1);
    // the exact authored path data, not just element presence
    expect(paths[0].element.getAttribute("d")).toBe("M3.5 8.5L6.5 11.5L12.5 4.5");
    expect(paths[0].element.getAttribute("stroke-linecap")).toBe("round");
  });

  it("floor-selects the 16-grid variant at size=md but renders at 20px", () => {
    const wrapper = mount(Icon as Component, { props: { name: "check", size: "md" } });
    const svg = wrapper.find('svg[data-fsds-icon="check"]');
    expect(svg.element.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg.element.getAttribute("width")).toBe("20");
  });

  it("selects the authored 24-grid variant at size=lg", () => {
    const wrapper = mount(Icon as Component, { props: { name: "check", size: "lg" } });
    const svg = wrapper.find('svg[data-fsds-icon="check"]');
    expect(svg.element.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.find("path").element.getAttribute("d")).toBe("M5 12.5L9.5 17L19 6.5");
  });

  it("renders no svg at all for an unknown icon name", () => {
    const wrapper = mount(Icon as Component, { props: { name: "does-not-exist" } });
    expect(wrapper.find("svg").exists()).toBe(false);
  });
});
// @custom:end
