// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import AnimatedSection from "../AnimatedSection.svelte";
// @generated:end

// @generated:start tests
describe("AnimatedSection — unit", () => {
  it("renders with default props", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("animated-section");
  });

  it("merges custom class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("animated-section");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies as=section variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "section" } });
    expect(container.firstElementChild?.className).toContain("animated-section--section");
  });

  it("applies as=div variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "div" } });
    expect(container.firstElementChild?.className).toContain("animated-section--div");
  });

  it("applies as=article variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "article" } });
    expect(container.firstElementChild?.className).toContain("animated-section--article");
  });

  it("applies as=main variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "main" } });
    expect(container.firstElementChild?.className).toContain("animated-section--main");
  });

  it("applies as=aside variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "aside" } });
    expect(container.firstElementChild?.className).toContain("animated-section--aside");
  });

  it("applies as=header variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "header" } });
    expect(container.firstElementChild?.className).toContain("animated-section--header");
  });

  it("applies as=footer variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "as": "footer" } });
    expect(container.firstElementChild?.className).toContain("animated-section--footer");
  });

  it("applies variant=fade-up variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "variant": "fade-up" } });
    expect(container.firstElementChild?.className).toContain("animated-section--fade-up");
  });

  it("applies variant=fade-in variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "variant": "fade-in" } });
    expect(container.firstElementChild?.className).toContain("animated-section--fade-in");
  });

  it("applies variant=slide-in variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "variant": "slide-in" } });
    expect(container.firstElementChild?.className).toContain("animated-section--slide-in");
  });

  it("applies variant=stagger-children variant class", () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: { "variant": "stagger-children" } });
    expect(container.firstElementChild?.className).toContain("animated-section--stagger-children");
  });
});

describe("AnimatedSection — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(AnimatedSection as unknown as Component<Record<string, unknown>>, { props: {} });
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
