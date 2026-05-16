// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Image from "../Image.svelte";
// @generated:end

// @generated:start tests
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
    expect(container.firstElementChild?.className).toContain("image--xs");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("image--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("image--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("image--lg");
  });

  it("applies size=xl variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "xl" } });
    expect(container.firstElementChild?.className).toContain("image--xl");
  });

  it("applies size=full variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "size": "full" } });
    expect(container.firstElementChild?.className).toContain("image--full");
  });

  it("applies radius=none variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "none" } });
    expect(container.firstElementChild?.className).toContain("image--none");
  });

  it("applies radius=sm variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "sm" } });
    expect(container.firstElementChild?.className).toContain("image--sm");
  });

  it("applies radius=md variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "md" } });
    expect(container.firstElementChild?.className).toContain("image--md");
  });

  it("applies radius=lg variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "lg" } });
    expect(container.firstElementChild?.className).toContain("image--lg");
  });

  it("applies radius=full variant class", () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "radius": "full" } });
    expect(container.firstElementChild?.className).toContain("image--full");
  });
});

describe("Image — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Image as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Image" } });
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
