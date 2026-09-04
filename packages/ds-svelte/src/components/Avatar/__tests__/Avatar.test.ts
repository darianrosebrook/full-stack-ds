// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Avatar from "../Avatar.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Avatar — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("avatar");
  });

  it("merges custom class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("avatar");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("img");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("avatar--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("avatar--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("avatar--large");
  });

  it("applies size=extra-large variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "extra-large" } });
    expect(container.firstElementChild?.className).toContain("avatar--extra-large");
  });
});

describe("Avatar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "name": "Test Avatar" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
