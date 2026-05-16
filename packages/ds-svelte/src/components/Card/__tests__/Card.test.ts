// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Card from "../Card.svelte";
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("card");
  });

  it("merges custom class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("card");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies status=completed variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "completed" } });
    expect(container.firstElementChild?.className).toContain("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "in-progress" } });
    expect(container.firstElementChild?.className).toContain("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "planned" } });
    expect(container.firstElementChild?.className).toContain("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "deprecated" } });
    expect(container.firstElementChild?.className).toContain("card--deprecated");
  });

  it("applies status=category variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "category" } });
    expect(container.firstElementChild?.className).toContain("card--category");
  });

  it("applies status=complexity variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "complexity" } });
    expect(container.firstElementChild?.className).toContain("card--complexity");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
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
