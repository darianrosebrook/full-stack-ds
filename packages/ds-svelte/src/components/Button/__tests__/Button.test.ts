// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Button from "../Button.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Button — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("button");
  });

  it("merges custom class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("button");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("button--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("button--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("button--large");
  });

  it("applies variant=primary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "primary" } });
    expect(container.firstElementChild?.className).toContain("button--primary");
  });

  it("applies variant=secondary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "secondary" } });
    expect(container.firstElementChild?.className).toContain("button--secondary");
  });

  it("applies variant=tertiary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "tertiary" } });
    expect(container.firstElementChild?.className).toContain("button--tertiary");
  });

  it("applies variant=ghost variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "ghost" } });
    expect(container.firstElementChild?.className).toContain("button--ghost");
  });

  it("applies variant=destructive variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "destructive" } });
    expect(container.firstElementChild?.className).toContain("button--destructive");
  });

  it("applies variant=outline variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "outline" } });
    expect(container.firstElementChild?.className).toContain("button--outline");
  });
});

describe("Button — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "ariaLabel": "Test Button", "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
