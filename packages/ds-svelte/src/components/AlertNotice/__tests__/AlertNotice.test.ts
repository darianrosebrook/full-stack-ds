// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import AlertNotice from "../AlertNotice.svelte";
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("renders with default props", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("alert-notice");
  });

  it("merges custom class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("alert-notice");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("alert");
  });

  it("applies status=info variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "info" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--info");
  });

  it("applies status=success variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "success" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "warning" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--warning");
  });

  it("applies status=error variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "status": "error" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--error");
  });

  it("applies level=page variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "page" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--page");
  });

  it("applies level=section variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "section" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "level": "inline" } });
    expect(container.firstElementChild?.className).toContain("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(AlertNotice as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test AlertNotice" } });
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
