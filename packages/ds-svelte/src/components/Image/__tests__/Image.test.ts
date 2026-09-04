// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Image from "../Image.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Image — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("image");
  });

  it("merges custom class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("image");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("img");
  });

  it("applies size=xs variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "xs" } });
    expect(container.firstElementChild?.className).toContain("image--size-xs");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("image--size-sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("image--size-md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("image--size-lg");
  });

  it("applies size=xl variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "xl" } });
    expect(container.firstElementChild?.className).toContain("image--size-xl");
  });

  it("applies size=full variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "full" } });
    expect(container.firstElementChild?.className).toContain("image--size-full");
  });

  it("applies radius=none variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "none" } });
    expect(container.firstElementChild?.className).toContain("image--radius-none");
  });

  it("applies radius=sm variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "sm" } });
    expect(container.firstElementChild?.className).toContain("image--radius-sm");
  });

  it("applies radius=md variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "md" } });
    expect(container.firstElementChild?.className).toContain("image--radius-md");
  });

  it("applies radius=lg variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "lg" } });
    expect(container.firstElementChild?.className).toContain("image--radius-lg");
  });

  it("applies radius=full variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "full" } });
    expect(container.firstElementChild?.className).toContain("image--radius-full");
  });
});

describe("Image — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "alt": "placeholder", "aria-label": "Test Image" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
