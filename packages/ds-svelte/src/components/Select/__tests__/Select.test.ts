// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Select from "../Select.svelte";
// @generated:end

// @generated:start tests
describe("Select — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("select");
  });

  it("merges custom class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("select");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("select--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "md" } });
    expect(container.firstElementChild?.className).toContain("select--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("select--lg");
  });

  it("applies position=bottom variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "bottom" } });
    expect(container.firstElementChild?.className).toContain("select--bottom");
  });

  it("applies position=top variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "top" } });
    expect(container.firstElementChild?.className).toContain("select--top");
  });

  it("applies position=auto variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "auto" } });
    expect(container.firstElementChild?.className).toContain("select--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Select", "open": true } });
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
