// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import CodeSnippet from "../CodeSnippet.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("CodeSnippet — unit", () => {
  it("renders with default props", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("code-snippet");
  });

  it("merges custom class", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("code-snippet");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies as=code variant class", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: { "as": "code" } });
    expect(container.firstElementChild?.className).toContain("code-snippet--code");
  });

  it("applies as=kbd variant class", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: { "as": "kbd" } });
    expect(container.firstElementChild?.className).toContain("code-snippet--kbd");
  });

  it("applies as=samp variant class", () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: { "as": "samp" } });
    expect(container.firstElementChild?.className).toContain("code-snippet--samp");
  });
});

describe("CodeSnippet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(CodeSnippet as unknown as Component<Record<string, unknown>>, { props: { "text": "placeholder" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
