// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Icon from "../Icon.svelte";
// @generated:end

// @generated:start tests
describe("Icon — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("icon");
  });

  it("merges custom class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("icon");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("icon--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("icon--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("icon--lg");
  });

  it("applies size=xl variant class", () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "size": "xl" } });
    expect(container.firstElementChild?.className).toContain("icon--xl");
  });
});

describe("Icon — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Icon as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Icon" } });
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
describe("Icon — catalog glyph rendering (ICON-CATALOG-RUNTIME-DELIVERY-01)", () => {
  const renderIcon = (props: Record<string, unknown>) =>
    render(Icon as unknown as Component<Record<string, unknown>>, { props });

  it("renders the authored 16-grid check glyph at size=sm", () => {
    const { container } = renderIcon({ name: "check", size: "sm" });
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("16");
    const paths = svg!.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    // the exact authored path data, not just element presence
    expect(paths[0].getAttribute("d")).toBe("M3.5 8.5L6.5 11.5L12.5 4.5");
    expect(paths[0].getAttribute("stroke-linecap")).toBe("round");
  });

  it("floor-selects the 16-grid variant at size=md but renders at 20px", () => {
    const { container } = renderIcon({ name: "check", size: "md" });
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("20");
  });

  it("selects the authored 24-grid variant at size=lg", () => {
    const { container } = renderIcon({ name: "check", size: "lg" });
    const svg = container.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg!.querySelector("path")!.getAttribute("d")).toBe("M5 12.5L9.5 17L19 6.5");
  });

  it("renders no svg at all for an unknown icon name", () => {
    const { container } = renderIcon({ name: "does-not-exist" });
    expect(container.querySelector("svg")).toBeNull();
  });
});
// @custom:end
