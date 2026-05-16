// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Blockquote from "../Blockquote.vue";
// @generated:end

// @generated:start tests
describe("Blockquote — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Blockquote as Component, { props: {}, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Blockquote as Component, { props: {}, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote");
  });

  it("merges custom class", () => {
    const wrapper = mount(Blockquote as Component, { props: {}, attrs: { "data-testid": "blockquote", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "variant": "default" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--default");
  });

  it("applies variant=bordered variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "variant": "bordered" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--bordered");
  });

  it("applies variant=highlighted variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "variant": "highlighted" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--highlighted");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "size": "sm" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "size": "md" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Blockquote as Component, { props: { "size": "lg" }, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("blockquote--lg");
  });
});

describe("Blockquote — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Blockquote as Component, { props: {}, attrs: { "data-testid": "blockquote" }, slots: { default: "content" } });
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
