// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Text from "../Text.vue";
// @generated:end

// @generated:start tests
describe("Text — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Text as Component, { props: {}, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Text as Component, { props: {}, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text");
  });

  it("merges custom class", () => {
    const wrapper = mount(Text as Component, { props: {}, attrs: { "data-testid": "text", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies variant=display variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "display" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--display");
  });

  it("applies variant=headline variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "headline" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--headline");
  });

  it("applies variant=title variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "title" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--title");
  });

  it("applies variant=body variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "body" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--body");
  });

  it("applies variant=caption variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "caption" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--caption");
  });

  it("applies variant=overline variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "overline" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--overline");
  });

  it("applies variant=code variant class", () => {
    const wrapper = mount(Text as Component, { props: { "variant": "code" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--code");
  });

  it("applies size=xs variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "xs" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--xs");
  });

  it("applies size=sm variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "sm" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--sm");
  });

  it("applies size=md variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "md" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--md");
  });

  it("applies size=lg variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "lg" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--lg");
  });

  it("applies size=xl variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "xl" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--xl");
  });

  it("applies size=2xl variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "2xl" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--2xl");
  });

  it("applies size=3xl variant class", () => {
    const wrapper = mount(Text as Component, { props: { "size": "3xl" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--3xl");
  });

  it("applies weight=light variant class", () => {
    const wrapper = mount(Text as Component, { props: { "weight": "light" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--light");
  });

  it("applies weight=normal variant class", () => {
    const wrapper = mount(Text as Component, { props: { "weight": "normal" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--normal");
  });

  it("applies weight=medium variant class", () => {
    const wrapper = mount(Text as Component, { props: { "weight": "medium" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--medium");
  });

  it("applies weight=semibold variant class", () => {
    const wrapper = mount(Text as Component, { props: { "weight": "semibold" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--semibold");
  });

  it("applies weight=bold variant class", () => {
    const wrapper = mount(Text as Component, { props: { "weight": "bold" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--bold");
  });

  it("applies align=left variant class", () => {
    const wrapper = mount(Text as Component, { props: { "align": "left" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--left");
  });

  it("applies align=center variant class", () => {
    const wrapper = mount(Text as Component, { props: { "align": "center" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--center");
  });

  it("applies align=right variant class", () => {
    const wrapper = mount(Text as Component, { props: { "align": "right" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--right");
  });

  it("applies align=justify variant class", () => {
    const wrapper = mount(Text as Component, { props: { "align": "justify" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--justify");
  });

  it("applies transform=none variant class", () => {
    const wrapper = mount(Text as Component, { props: { "transform": "none" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--none");
  });

  it("applies transform=uppercase variant class", () => {
    const wrapper = mount(Text as Component, { props: { "transform": "uppercase" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--uppercase");
  });

  it("applies transform=lowercase variant class", () => {
    const wrapper = mount(Text as Component, { props: { "transform": "lowercase" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--lowercase");
  });

  it("applies transform=capitalize variant class", () => {
    const wrapper = mount(Text as Component, { props: { "transform": "capitalize" }, attrs: { "data-testid": "text" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("text--capitalize");
  });
});

describe("Text — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Text as Component, { props: {}, attrs: { "data-testid": "text" }, slots: { default: "content" } });
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
