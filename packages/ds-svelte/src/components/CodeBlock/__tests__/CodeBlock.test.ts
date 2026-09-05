// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import CodeBlock from "../CodeBlock.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("CodeBlock — unit", () => {
  it("renders with default props", () => {
    const { container } = render(CodeBlock as unknown as Component<Record<string, unknown>>, { props: { "code": "placeholder", "language": "bash" } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(CodeBlock as unknown as Component<Record<string, unknown>>, { props: { "code": "placeholder", "language": "bash" } });
    expect(container.firstElementChild?.className).toContain("code-block");
  });

  it("merges custom class", () => {
    const { container } = render(CodeBlock as unknown as Component<Record<string, unknown>>, { props: { "code": "placeholder", "language": "bash", "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("code-block");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("CodeBlock — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(CodeBlock as unknown as Component<Record<string, unknown>>, { props: { "code": "placeholder", "language": "bash" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
