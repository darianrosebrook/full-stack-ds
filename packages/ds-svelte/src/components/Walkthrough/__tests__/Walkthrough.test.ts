// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Walkthrough from "../Walkthrough.svelte";
// @generated:end

// @generated:start tests
describe("Walkthrough — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("walkthrough");
  });

  it("merges custom class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("walkthrough");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies placement=top variant class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "top" } });
    expect(container.firstElementChild?.className).toContain("walkthrough--top");
  });

  it("applies placement=bottom variant class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "bottom" } });
    expect(container.firstElementChild?.className).toContain("walkthrough--bottom");
  });

  it("applies placement=left variant class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "left" } });
    expect(container.firstElementChild?.className).toContain("walkthrough--left");
  });

  it("applies placement=right variant class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "right" } });
    expect(container.firstElementChild?.className).toContain("walkthrough--right");
  });

  it("applies placement=auto variant class", () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "placement": "auto" } });
    expect(container.firstElementChild?.className).toContain("walkthrough--auto");
  });
});

describe("Walkthrough — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Walkthrough as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Walkthrough" } });
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
