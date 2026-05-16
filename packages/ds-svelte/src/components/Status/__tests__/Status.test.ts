// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Status from "../Status.svelte";
// @generated:end

// @generated:start tests
describe("Status — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("status");
  });

  it("merges custom class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("status");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies status=info variant class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "status": "info" } });
    expect(container.firstElementChild?.className).toContain("status--info");
  });

  it("applies status=success variant class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "status": "success" } });
    expect(container.firstElementChild?.className).toContain("status--success");
  });

  it("applies status=warning variant class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "status": "warning" } });
    expect(container.firstElementChild?.className).toContain("status--warning");
  });

  it("applies status=danger variant class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "status": "danger" } });
    expect(container.firstElementChild?.className).toContain("status--danger");
  });

  it("applies status=error variant class", () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "status": "error" } });
    expect(container.firstElementChild?.className).toContain("status--error");
  });
});

describe("Status — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Status as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Status" } });
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
