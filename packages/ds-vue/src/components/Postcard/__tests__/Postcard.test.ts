// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Postcard from "../Postcard.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Postcard — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(Postcard as Component, { props: {}, attrs: { "data-testid": "postcard" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(Postcard as Component, { props: {}, attrs: { "data-testid": "postcard" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("postcard");
  });

  it("merges custom class", () => {
    const wrapper = mount(Postcard as Component, { props: {}, attrs: { "data-testid": "postcard", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("postcard");
    expect(wrapper.classes()).toContain("custom");
  });

  it("applies type=image variant class", () => {
    const wrapper = mount(Postcard as Component, { props: { "type": "image" }, attrs: { "data-testid": "postcard" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("postcard--image");
  });

  it("applies type=video variant class", () => {
    const wrapper = mount(Postcard as Component, { props: { "type": "video" }, attrs: { "data-testid": "postcard" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("postcard--video");
  });

  it("applies type=audio variant class", () => {
    const wrapper = mount(Postcard as Component, { props: { "type": "audio" }, attrs: { "data-testid": "postcard" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("postcard--audio");
  });
});

describe("Postcard — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(Postcard as Component, { props: { "postId": "placeholder", "author": {}, "timestamp": "placeholder", "stats": {} }, attrs: { "data-testid": "postcard", "aria-label": "Test Postcard" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import PostcardContent from "../PostcardContent.vue";
import PostcardFooter from "../PostcardFooter.vue";
import PostcardHeader from "../PostcardHeader.vue";


describe("Postcard — compound parts", () => {
  it("mounts PostcardContent with tag, base class, and slot content", () => {
    const wrapper = mount(PostcardContent as Component, {
      slots: { default: "Postcard part" },
      attrs: { "data-testid": "postcard-postcardcontent" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("postcard__content");
    expect(wrapper.text()).toContain("Postcard part");
  });

  it("mounts PostcardFooter with tag, base class, and slot content", () => {
    const wrapper = mount(PostcardFooter as Component, {
      slots: { default: "Postcard part" },
      attrs: { "data-testid": "postcard-postcardfooter" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("footer");
    expect(wrapper.classes()).toContain("postcard__footer");
    expect(wrapper.text()).toContain("Postcard part");
  });

  it("mounts PostcardHeader with tag, base class, and slot content", () => {
    const wrapper = mount(PostcardHeader as Component, {
      slots: { default: "Postcard part" },
      attrs: { "data-testid": "postcard-postcardheader" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("header");
    expect(wrapper.classes()).toContain("postcard__header");
    expect(wrapper.text()).toContain("Postcard part");
  });
});
// @custom:end
