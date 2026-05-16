// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Accordion from "../Accordion.svelte";
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("accordion");
  });

  it("merges custom class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("accordion");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies type=single variant class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "type": "single" } });
    expect(container.firstElementChild?.className).toContain("accordion--single");
  });

  it("applies type=multiple variant class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "type": "multiple" } });
    expect(container.firstElementChild?.className).toContain("accordion--multiple");
  });
});

describe("Accordion — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: {} });
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
