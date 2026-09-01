// @generated:start imports
import { describe, it, expect, vi } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import ShowMore from "../ShowMore.vue";
// @generated:end

// @generated:start tests
describe("ShowMore — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(ShowMore as Component, { props: {}, attrs: { "data-testid": "show-more" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(ShowMore as Component, { props: {}, attrs: { "data-testid": "show-more" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("show-more");
  });

  it("merges custom class", () => {
    const wrapper = mount(ShowMore as Component, { props: {}, attrs: { "data-testid": "show-more", "class": "custom" }, slots: { default: "content" } });
    expect(wrapper.classes()).toContain("show-more");
    expect(wrapper.classes()).toContain("custom");
  });
});

describe("ShowMore — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(ShowMore as Component, { props: {}, attrs: { "data-testid": "show-more" }, slots: { default: "content" } });
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
import ShowMoreContent from "../ShowMoreContent.vue";
import ShowMoreTrigger from "../ShowMoreTrigger.vue";


describe("ShowMore — compound parts", () => {
  it("mounts ShowMoreContent with tag, base class, and slot content", () => {
    const wrapper = mount(ShowMoreContent as Component, {
      slots: { default: "ShowMore part" },
      attrs: { "data-testid": "showmore-showmorecontent" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("show-more__content");
    expect(wrapper.text()).toContain("ShowMore part");
  });

  it("mounts ShowMoreTrigger with tag, base class, and slot content", () => {
    const wrapper = mount(ShowMoreTrigger as Component, {
      slots: { default: "ShowMore part" },
      attrs: { "data-testid": "showmore-showmoretrigger" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("button");
    expect(wrapper.classes()).toContain("show-more__trigger");
    expect(wrapper.text()).toContain("ShowMore part");
  });
});
// @custom:end
