// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Chip from "../Chip.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Chip — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("chip");
  });

  it("merges custom class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("chip");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "variant": "default" } });
    expect(container.firstElementChild?.className).toContain("chip--default");
  });

  it("applies variant=selected variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "variant": "selected" } });
    expect(container.firstElementChild?.className).toContain("chip--selected");
  });

  it("applies variant=dismissible variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "variant": "dismissible" } });
    expect(container.firstElementChild?.className).toContain("chip--dismissible");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("chip--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("chip--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("chip--large");
  });
});

describe("Chip — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Chip as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Chip", "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
