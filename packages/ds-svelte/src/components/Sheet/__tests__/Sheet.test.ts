// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.svelte";
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("sheet");
  });

  it("merges custom class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("sheet");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies side=top variant class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "top" } });
    expect(container.firstElementChild?.className).toContain("sheet--top");
  });

  it("applies side=right variant class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "right" } });
    expect(container.firstElementChild?.className).toContain("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "bottom" } });
    expect(container.firstElementChild?.className).toContain("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "left" } });
    expect(container.firstElementChild?.className).toContain("sheet--left");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    await fireEvent.click(container.firstElementChild!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Sheet", "open": true } });
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
