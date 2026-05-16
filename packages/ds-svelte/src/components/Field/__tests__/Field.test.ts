// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Field from "../Field.svelte";
// @generated:end

// @generated:start tests
describe("Field — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("field");
  });

  it("merges custom class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("field");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("group");
  });

  it("applies status=idle variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "idle" } });
    expect(container.firstElementChild?.className).toContain("field--idle");
  });

  it("applies status=validating variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "validating" } });
    expect(container.firstElementChild?.className).toContain("field--validating");
  });

  it("applies status=valid variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "valid" } });
    expect(container.firstElementChild?.className).toContain("field--valid");
  });

  it("applies status=invalid variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "invalid" } });
    expect(container.firstElementChild?.className).toContain("field--invalid");
  });
});

describe("Field — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Field" } });
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
