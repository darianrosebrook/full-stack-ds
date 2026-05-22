// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Skeleton from "../Skeleton.vue";
// @generated:end

// @generated:start tests
describe("Skeleton — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Skeleton as Component, { props: {}, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Skeleton as Component, { props: {}, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton");
  });

  it("merges custom class", () => {
    const wrapper = mount(Skeleton as Component, { props: {}, attrs: { "data-testid": "skeleton", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(Skeleton as Component, { props: {}, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.attributes("role")).toBe("status");
  });

  it("applies variant=block variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "block" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--block");
  });

  it("applies variant=text variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "text" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--text");
  });

  it("applies variant=avatar variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "avatar" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--avatar");
  });

  it("applies variant=media variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "media" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--media");
  });

  it("applies variant=dataviz variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "dataviz" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--dataviz");
  });

  it("applies variant=actions variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "variant": "actions" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--actions");
  });

  it("applies animate=shimmer variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "animate": "shimmer" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--shimmer");
  });

  it("applies animate=wipe variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "animate": "wipe" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--wipe");
  });

  it("applies animate=pulse variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "animate": "pulse" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--pulse");
  });

  it("applies animate=none variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "animate": "none" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--none");
  });

  it("applies density=compact variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "density": "compact" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--compact");
  });

  it("applies density=regular variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "density": "regular" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--regular");
  });

  it("applies density=spacious variant class", () => {
    const wrapper = mount(Skeleton as Component, { props: { "density": "spacious" }, attrs: { "data-testid": "skeleton" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("skeleton--spacious");
  });
});

describe("Skeleton — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Skeleton as Component, { props: {}, attrs: { "data-testid": "skeleton", "aria-label": "Test Skeleton" }, slots: { default: "content" } });
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
