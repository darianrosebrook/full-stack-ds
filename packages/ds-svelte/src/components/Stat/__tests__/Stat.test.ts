// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Stat from "../Stat.svelte";
// @generated:end

// @generated:start tests
describe("Stat — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("stat");
  });

  it("merges custom class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("stat");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("stat--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("stat--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("stat--lg");
  });

  it("applies trend=up variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "up" } });
    expect(container.firstElementChild?.className).toContain("stat--up");
  });

  it("applies trend=down variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "down" } });
    expect(container.firstElementChild?.className).toContain("stat--down");
  });

  it("applies trend=neutral variant class", () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: { "trend": "neutral" } });
    expect(container.firstElementChild?.className).toContain("stat--neutral");
  });
});

describe("Stat — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Stat as unknown as Component<Record<string, unknown>>, { props: {} });
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
      "role-img-alt",
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
