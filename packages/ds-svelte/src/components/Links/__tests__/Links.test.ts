// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Links from "../Links.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Links — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("links");
  });

  it("merges custom class", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("links");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("links--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("links--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("links--large");
  });
});

describe("Links — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Links as unknown as Component<Record<string, unknown>>, { props: { "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
