// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Avatar from "../Avatar.svelte";
// @generated:end

// @generated:start tests
describe("Avatar — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("avatar");
  });

  it("merges custom class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("avatar");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("img");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("avatar--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("avatar--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("avatar--large");
  });

  it("applies size=extra-large variant class", () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "size": "extra-large" } });
    expect(container.firstElementChild?.className).toContain("avatar--extra-large");
  });
});

describe("Avatar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Avatar as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Avatar" } });
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
