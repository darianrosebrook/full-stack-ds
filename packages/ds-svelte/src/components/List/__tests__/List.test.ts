// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import List from "../List.svelte";
// @generated:end

// @generated:start tests
describe("List — unit", () => {
  it("renders with default props", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("list");
  });

  it("merges custom class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("list");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies as=ul variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "as": "ul" } });
    expect(container.firstElementChild?.className).toContain("list--ul");
  });

  it("applies as=ol variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "as": "ol" } });
    expect(container.firstElementChild?.className).toContain("list--ol");
  });

  it("applies as=dl variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "as": "dl" } });
    expect(container.firstElementChild?.className).toContain("list--dl");
  });

  it("applies variant=default variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "variant": "default" } });
    expect(container.firstElementChild?.className).toContain("list--default");
  });

  it("applies variant=unstyled variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "variant": "unstyled" } });
    expect(container.firstElementChild?.className).toContain("list--unstyled");
  });

  it("applies variant=inline variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "variant": "inline" } });
    expect(container.firstElementChild?.className).toContain("list--inline");
  });

  it("applies variant=divided variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "variant": "divided" } });
    expect(container.firstElementChild?.className).toContain("list--divided");
  });

  it("applies variant=spaced variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "variant": "spaced" } });
    expect(container.firstElementChild?.className).toContain("list--spaced");
  });

  it("applies marker=default variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "default" } });
    expect(container.firstElementChild?.className).toContain("list--default");
  });

  it("applies marker=none variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "none" } });
    expect(container.firstElementChild?.className).toContain("list--none");
  });

  it("applies marker=disc variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "disc" } });
    expect(container.firstElementChild?.className).toContain("list--disc");
  });

  it("applies marker=circle variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "circle" } });
    expect(container.firstElementChild?.className).toContain("list--circle");
  });

  it("applies marker=square variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "square" } });
    expect(container.firstElementChild?.className).toContain("list--square");
  });

  it("applies marker=decimal variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "decimal" } });
    expect(container.firstElementChild?.className).toContain("list--decimal");
  });

  it("applies marker=alpha variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "alpha" } });
    expect(container.firstElementChild?.className).toContain("list--alpha");
  });

  it("applies marker=roman variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "marker": "roman" } });
    expect(container.firstElementChild?.className).toContain("list--roman");
  });

  it("applies spacing=none variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "spacing": "none" } });
    expect(container.firstElementChild?.className).toContain("list--none");
  });

  it("applies spacing=sm variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "spacing": "sm" } });
    expect(container.firstElementChild?.className).toContain("list--sm");
  });

  it("applies spacing=md variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "spacing": "md" } });
    expect(container.firstElementChild?.className).toContain("list--md");
  });

  it("applies spacing=lg variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "spacing": "lg" } });
    expect(container.firstElementChild?.className).toContain("list--lg");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("list--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("list--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("list--lg");
  });
});

describe("List — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(List as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test List" } });
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
