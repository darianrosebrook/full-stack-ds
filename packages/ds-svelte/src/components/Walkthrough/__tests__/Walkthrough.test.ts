// @generated:start imports
import { describe, expect, it, afterEach } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Walkthrough from "../Walkthrough.svelte";
// @generated:end

// @generated:start tests
describe("Walkthrough — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: {} });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: {} });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough");
  });

  it("merges custom class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough");
    expect(root?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: {} });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("status");
  });

  it("applies placement=top variant class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "top" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough--top");
  });

  it("applies placement=bottom variant class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "bottom" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough--bottom");
  });

  it("applies placement=left variant class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "left" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough--left");
  });

  it("applies placement=right variant class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "right" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough--right");
  });

  it("applies placement=auto variant class", () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "auto" } });
    const root = document.body.querySelector<HTMLElement>(".walkthrough");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("walkthrough--auto");
  });
});

describe("Walkthrough — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Walkthrough" } });
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
