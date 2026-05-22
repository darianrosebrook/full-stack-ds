// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Details from "../Details.svelte";
// @generated:end

// @generated:start tests
describe("Details — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("details");
  });

  it("merges custom class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("details");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.getAttribute("role")).toBe("group");
  });

  it("applies variant=default variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "default" } });
    expect(container.firstElementChild?.className).toContain("details--default");
  });

  it("applies variant=inline variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "inline" } });
    expect(container.firstElementChild?.className).toContain("details--inline");
  });

  it("applies variant=compact variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "compact" } });
    expect(container.firstElementChild?.className).toContain("details--compact");
  });

  it("applies icon=left variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "icon": "left" } });
    expect(container.firstElementChild?.className).toContain("details--left");
  });

  it("applies icon=right variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "icon": "right" } });
    expect(container.firstElementChild?.className).toContain("details--right");
  });

  it("applies icon=none variant class", () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "open": true, "icon": "none" } });
    expect(container.firstElementChild?.className).toContain("details--none");
  });
});

describe("Details — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Details as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Details", "open": true } });
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
