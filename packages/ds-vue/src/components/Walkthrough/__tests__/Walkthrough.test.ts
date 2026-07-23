// @generated:start imports
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Component } from "vue";
import { mount } from "@vue/test-utils";
import { axe } from "vitest-axe";
import Walkthrough from "../Walkthrough.vue";
// @generated:end

// @generated:start tests
describe("Walkthrough — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    const wrapper = mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" } });
    expect(wrapper.element).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough")).toBe(true);
  });

  it("merges custom class", () => {
    mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough", "class": "custom" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough")).toBe(true);
    expect(root?.classList.contains("custom")).toBe(true);
  });

  it("has the correct ARIA role", () => {
    mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("status");
  });

  it("applies placement=top variant class", () => {
    mount(Walkthrough as Component, { props: { "placement": "top" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough--top")).toBe(true);
  });

  it("applies placement=bottom variant class", () => {
    mount(Walkthrough as Component, { props: { "placement": "bottom" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough--bottom")).toBe(true);
  });

  it("applies placement=left variant class", () => {
    mount(Walkthrough as Component, { props: { "placement": "left" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough--left")).toBe(true);
  });

  it("applies placement=right variant class", () => {
    mount(Walkthrough as Component, { props: { "placement": "right" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough--right")).toBe(true);
  });

  it("applies placement=auto variant class", () => {
    mount(Walkthrough as Component, { props: { "placement": "auto" }, attrs: { "data-testid": "walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.classList.contains("walkthrough--auto")).toBe(true);
  });
});

describe("Walkthrough — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    mount(Walkthrough as Component, { props: {}, attrs: { "data-testid": "walkthrough", "aria-label": "Test Walkthrough" }, slots: { default: "content" }, attachTo: document.body });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    const results = await axe(root as Element);
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
