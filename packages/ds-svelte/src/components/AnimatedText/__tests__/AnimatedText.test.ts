// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import AnimatedText from "../AnimatedText.svelte";
// @generated:end

// @generated:start tests
describe("AnimatedText — unit", () => {
  it("renders with default props", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("animated-text");
  });

  it("merges custom class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("animated-text");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies as=h1 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h1" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h1");
  });

  it("applies as=h2 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h2" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h2");
  });

  it("applies as=h3 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h3" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h3");
  });

  it("applies as=h4 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h4" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h4");
  });

  it("applies as=h5 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h5" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h5");
  });

  it("applies as=h6 variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "h6" } });
    expect(container.firstElementChild?.className).toContain("animated-text--h6");
  });

  it("applies as=p variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "p" } });
    expect(container.firstElementChild?.className).toContain("animated-text--p");
  });

  it("applies as=span variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "span" } });
    expect(container.firstElementChild?.className).toContain("animated-text--span");
  });

  it("applies as=div variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "as": "div" } });
    expect(container.firstElementChild?.className).toContain("animated-text--div");
  });

  it("applies variant=blur-in variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "variant": "blur-in" } });
    expect(container.firstElementChild?.className).toContain("animated-text--blur-in");
  });

  it("applies variant=fade-up variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "variant": "fade-up" } });
    expect(container.firstElementChild?.className).toContain("animated-text--fade-up");
  });

  it("applies variant=slide-in variant class", () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: { "variant": "slide-in" } });
    expect(container.firstElementChild?.className).toContain("animated-text--slide-in");
  });
});

describe("AnimatedText — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(AnimatedText as unknown as Component<Record<string, unknown>>, { props: {} });
    const results = await axe(container);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "list",
      "region",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
