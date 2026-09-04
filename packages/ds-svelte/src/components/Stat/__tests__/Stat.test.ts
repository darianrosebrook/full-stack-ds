// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Stat from "../Stat.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Stat — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("stat");
  });

  it("merges custom class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("stat");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("stat--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("stat--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("stat--lg");
  });

  it("applies trend=up variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "up" } });
    expect(container.firstElementChild?.className).toContain("stat--up");
  });

  it("applies trend=down variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "down" } });
    expect(container.firstElementChild?.className).toContain("stat--down");
  });

  it("applies trend=neutral variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "neutral" } });
    expect(container.firstElementChild?.className).toContain("stat--neutral");
  });
});

describe("Stat — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
