// @generated:start imports
import { describe, it, expect } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import AlertNotice from "../AlertNotice.vue";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("AlertNotice — unit", () => {
  it("renders with default props", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice");
  });

  it("merges custom class", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice", "class": "custom" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice");
    expect(wrapper.classes()).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const wrapper = mount(AlertNotice as Component, { props: {}, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.attributes("role")).toBe("alert");
  });

  it("applies status=info variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "info" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "success" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "warning" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--warning");
  });

  it("applies status=error variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "status": "error" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "page" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "section" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    const wrapper = mount(AlertNotice as Component, { props: { "level": "inline" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "content" } });
    expect(wrapper.classes()).toContain("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const wrapper = mount(AlertNotice as Component, { props: { "dismissLabel": "Test AlertNotice" }, attrs: { "data-testid": "alert-notice" }, slots: { "default": "<span>content</span>" } });
    const results = await axe(wrapper.element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import AlertNoticeBody from "../AlertNoticeBody.vue";
import AlertNoticeTitle from "../AlertNoticeTitle.vue";


describe("AlertNotice — compound parts", () => {
  it("mounts AlertNoticeBody with tag, base class, and slot content", () => {
    const wrapper = mount(AlertNoticeBody as Component, {
      slots: { default: "AlertNotice part" },
      attrs: { "data-testid": "alertnotice-alertnoticebody" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("div");
    expect(wrapper.classes()).toContain("alert-notice__body");
    expect(wrapper.text()).toContain("AlertNotice part");
  });

  it("mounts AlertNoticeTitle with tag, base class, and slot content", () => {
    const wrapper = mount(AlertNoticeTitle as Component, {
      slots: { default: "AlertNotice part" },
      attrs: { "data-testid": "alertnotice-alertnoticetitle" },
    });
    expect(wrapper.element.tagName.toLowerCase()).toBe("h3");
    expect(wrapper.classes()).toContain("alert-notice__title");
    expect(wrapper.text()).toContain("AlertNotice part");
  });
});
// @custom:end
