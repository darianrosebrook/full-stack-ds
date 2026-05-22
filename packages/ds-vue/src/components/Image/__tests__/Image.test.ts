// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Image from "../Image.vue";
// @generated:end

// @generated:start tests
describe("Image — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Image as Component, { props: {}, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Image as Component, { props: {}, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image");
  });

  it("merges custom class", () => {
    const wrapper = mount(Image as Component, { props: {}, attrs: { "data-testid": "image", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Image as Component, { props: {}, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("img");
  });

  it("applies size=xs variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "xs" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--xs");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "sm" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "md" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "lg" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--lg");
  });

  it("applies size=xl variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "xl" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--xl");
  });

  it("applies size=full variant class", () => {
    const wrapper = mount(Image as Component, { props: { "size": "full" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--full");
  });

  it("applies radius=none variant class", () => {
    const wrapper = mount(Image as Component, { props: { "radius": "none" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--none");
  });

  it("applies radius=sm variant class", () => {
    const wrapper = mount(Image as Component, { props: { "radius": "sm" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--sm");
  });

  it("applies radius=md variant class", () => {
    const wrapper = mount(Image as Component, { props: { "radius": "md" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--md");
  });

  it("applies radius=lg variant class", () => {
    const wrapper = mount(Image as Component, { props: { "radius": "lg" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--lg");
  });

  it("applies radius=full variant class", () => {
    const wrapper = mount(Image as Component, { props: { "radius": "full" }, attrs: { "data-testid": "image" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("image--full");
  });
});

describe("Image — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Image as Component, { props: {}, attrs: { "data-testid": "image", "aria-label": "Test Image" }, slots: { default: "content" } });
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

// @custom:end
