// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Checkbox from "../Checkbox.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Checkbox — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("checkbox");
  });

  it("merges custom class", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("checkbox");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("checkbox--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("checkbox--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("checkbox--lg");
  });

  it("sets .indeterminate as a DOM property (not an attribute) and lowers aria-checked to mixed", () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "indeterminate": true } });
    const el = container.querySelector(".checkbox__input") as HTMLInputElement;
    expect(el.indeterminate).toBe(true);
    expect(el.getAttribute("aria-checked")).toBe("mixed");
  });

  it("re-applies .indeterminate when the prop changes from true to false, and aria-checked reflects checked state again", async () => {
    const { container, rerender } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "indeterminate": true } });
    const el = container.querySelector(".checkbox__input") as HTMLInputElement;
    expect(el.indeterminate).toBe(true);
    await rerender({ indeterminate: false });
    expect(el.indeterminate).toBe(false);
    expect(el.getAttribute("aria-checked")).toBe("false");
  });
});

describe("Checkbox — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Checkbox as unknown as Component<Record<string, unknown>>, { props: { "ariaLabel": "Test Checkbox" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
