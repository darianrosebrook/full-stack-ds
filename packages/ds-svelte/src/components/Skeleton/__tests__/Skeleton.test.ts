// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Skeleton from "../Skeleton.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Skeleton — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("skeleton");
  });

  it("merges custom class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("skeleton");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies variant=block variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "block" } });
    expect(container.firstElementChild?.className).toContain("skeleton--block");
  });

  it("applies variant=text variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "text" } });
    expect(container.firstElementChild?.className).toContain("skeleton--text");
  });

  it("applies variant=avatar variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "avatar" } });
    expect(container.firstElementChild?.className).toContain("skeleton--avatar");
  });

  it("applies variant=media variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "media" } });
    expect(container.firstElementChild?.className).toContain("skeleton--media");
  });

  it("applies variant=dataviz variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "dataviz" } });
    expect(container.firstElementChild?.className).toContain("skeleton--dataviz");
  });

  it("applies variant=actions variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "variant": "actions" } });
    expect(container.firstElementChild?.className).toContain("skeleton--actions");
  });

  it("applies animate=shimmer variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "animate": "shimmer" } });
    expect(container.firstElementChild?.className).toContain("skeleton--shimmer");
  });

  it("applies animate=wipe variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "animate": "wipe" } });
    expect(container.firstElementChild?.className).toContain("skeleton--wipe");
  });

  it("applies animate=pulse variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "animate": "pulse" } });
    expect(container.firstElementChild?.className).toContain("skeleton--pulse");
  });

  it("applies animate=none variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "animate": "none" } });
    expect(container.firstElementChild?.className).toContain("skeleton--none");
  });

  it("applies density=compact variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "density": "compact" } });
    expect(container.firstElementChild?.className).toContain("skeleton--compact");
  });

  it("applies density=regular variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "density": "regular" } });
    expect(container.firstElementChild?.className).toContain("skeleton--regular");
  });

  it("applies density=spacious variant class", () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "density": "spacious" } });
    expect(container.firstElementChild?.className).toContain("skeleton--spacious");
  });
});

describe("Skeleton — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Skeleton as unknown as Component<Record<string, unknown>>, { props: { "decorative": false, "ariaLabel": "Test Skeleton" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
