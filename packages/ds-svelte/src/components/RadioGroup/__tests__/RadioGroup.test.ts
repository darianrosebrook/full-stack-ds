// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import RadioGroup from "../RadioGroup.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("RadioGroup — unit", () => {
  it("renders with default props", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder" } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder" } });
    expect(container.firstElementChild?.className).toContain("radio-group");
  });

  it("merges custom class", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder", "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("radio-group");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder" } });
    expect(container.firstElementChild?.getAttribute("role")).toBe("radiogroup");
  });

  it("applies orientation=vertical variant class", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder", "orientation": "vertical" } });
    expect(container.firstElementChild?.className).toContain("radio-group--vertical");
  });

  it("applies orientation=horizontal variant class", () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder", "orientation": "horizontal" } });
    expect(container.firstElementChild?.className).toContain("radio-group--horizontal");
  });
});

describe("RadioGroup — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(RadioGroup as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder", "ariaLabel": "Test RadioGroup" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
