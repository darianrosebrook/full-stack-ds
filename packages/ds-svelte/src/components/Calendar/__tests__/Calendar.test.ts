// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Calendar from "../Calendar.svelte";
// @generated:end

// @generated:start tests
describe("Calendar — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("calendar");
  });

  it("merges custom class", () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("calendar");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies mode=single variant class", () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: { "mode": "single" } });
    expect(container.firstElementChild?.className).toContain("calendar--single");
  });

  it("applies mode=range variant class", () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: { "mode": "range" } });
    expect(container.firstElementChild?.className).toContain("calendar--range");
  });
});

describe("Calendar — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Calendar as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Calendar" } });
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
