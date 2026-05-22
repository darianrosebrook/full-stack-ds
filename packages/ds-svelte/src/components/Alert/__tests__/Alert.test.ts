// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Alert from "../Alert.svelte";
// @generated:end

// @generated:start tests
describe("Alert — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("alert");
  });

  it("merges custom class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("alert");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("alert");
  });

  it("applies intent=info variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "intent": "info" } });
    expect(container.firstElementChild?.className).toContain("alert--info");
  });

  it("applies intent=success variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "intent": "success" } });
    expect(container.firstElementChild?.className).toContain("alert--success");
  });

  it("applies intent=warning variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "intent": "warning" } });
    expect(container.firstElementChild?.className).toContain("alert--warning");
  });

  it("applies intent=danger variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "intent": "danger" } });
    expect(container.firstElementChild?.className).toContain("alert--danger");
  });

  it("applies level=inline variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "level": "inline" } });
    expect(container.firstElementChild?.className).toContain("alert--inline");
  });

  it("applies level=section variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "level": "section" } });
    expect(container.firstElementChild?.className).toContain("alert--section");
  });

  it("applies level=page variant class", () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "level": "page" } });
    expect(container.firstElementChild?.className).toContain("alert--page");
  });
});

describe("Alert — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Alert as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Alert" } });
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
