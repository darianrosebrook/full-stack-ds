// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Dialog from "../Dialog.svelte";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("dialog");
  });

  it("merges custom class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("dialog");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("dialog--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "md" } });
    expect(container.firstElementChild?.className).toContain("dialog--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("dialog--lg");
  });

  it("applies size=xl variant class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "xl" } });
    expect(container.firstElementChild?.className).toContain("dialog--xl");
  });

  it("applies size=full variant class", () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "full" } });
    expect(container.firstElementChild?.className).toContain("dialog--full");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    await fireEvent.click(container.firstElementChild!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Dialog", "open": true } });
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
