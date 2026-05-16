// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Text from "../Text.svelte";
// @generated:end

// @generated:start tests
describe("Text — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("text");
  });

  it("merges custom class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("text");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies variant=display variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "display" } });
    expect(container.firstElementChild?.className).toContain("text--display");
  });

  it("applies variant=headline variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "headline" } });
    expect(container.firstElementChild?.className).toContain("text--headline");
  });

  it("applies variant=title variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "title" } });
    expect(container.firstElementChild?.className).toContain("text--title");
  });

  it("applies variant=body variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "body" } });
    expect(container.firstElementChild?.className).toContain("text--body");
  });

  it("applies variant=caption variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "caption" } });
    expect(container.firstElementChild?.className).toContain("text--caption");
  });

  it("applies variant=overline variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "overline" } });
    expect(container.firstElementChild?.className).toContain("text--overline");
  });

  it("applies variant=code variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "variant": "code" } });
    expect(container.firstElementChild?.className).toContain("text--code");
  });

  it("applies size=xs variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "xs" } });
    expect(container.firstElementChild?.className).toContain("text--xs");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("text--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("text--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("text--lg");
  });

  it("applies size=xl variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "xl" } });
    expect(container.firstElementChild?.className).toContain("text--xl");
  });

  it("applies size=2xl variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "2xl" } });
    expect(container.firstElementChild?.className).toContain("text--2xl");
  });

  it("applies size=3xl variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "size": "3xl" } });
    expect(container.firstElementChild?.className).toContain("text--3xl");
  });

  it("applies weight=light variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "weight": "light" } });
    expect(container.firstElementChild?.className).toContain("text--light");
  });

  it("applies weight=normal variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "weight": "normal" } });
    expect(container.firstElementChild?.className).toContain("text--normal");
  });

  it("applies weight=medium variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "weight": "medium" } });
    expect(container.firstElementChild?.className).toContain("text--medium");
  });

  it("applies weight=semibold variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "weight": "semibold" } });
    expect(container.firstElementChild?.className).toContain("text--semibold");
  });

  it("applies weight=bold variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "weight": "bold" } });
    expect(container.firstElementChild?.className).toContain("text--bold");
  });

  it("applies align=left variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "align": "left" } });
    expect(container.firstElementChild?.className).toContain("text--left");
  });

  it("applies align=center variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "align": "center" } });
    expect(container.firstElementChild?.className).toContain("text--center");
  });

  it("applies align=right variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "align": "right" } });
    expect(container.firstElementChild?.className).toContain("text--right");
  });

  it("applies align=justify variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "align": "justify" } });
    expect(container.firstElementChild?.className).toContain("text--justify");
  });

  it("applies transform=none variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "transform": "none" } });
    expect(container.firstElementChild?.className).toContain("text--none");
  });

  it("applies transform=uppercase variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "transform": "uppercase" } });
    expect(container.firstElementChild?.className).toContain("text--uppercase");
  });

  it("applies transform=lowercase variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "transform": "lowercase" } });
    expect(container.firstElementChild?.className).toContain("text--lowercase");
  });

  it("applies transform=capitalize variant class", () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: { "transform": "capitalize" } });
    expect(container.firstElementChild?.className).toContain("text--capitalize");
  });
});

describe("Text — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Text as unknown as Component<Record<string, unknown>>, { props: {} });
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
