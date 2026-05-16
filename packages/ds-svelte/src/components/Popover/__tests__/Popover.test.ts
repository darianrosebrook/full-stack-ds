// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Popover from "../Popover.svelte";
// @generated:end

// @generated:start tests
describe("Popover — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("popover");
  });

  it("merges custom class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("popover");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies placement=top variant class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "placement": "top" } });
    expect(container.firstElementChild?.className).toContain("popover--top");
  });

  it("applies placement=bottom variant class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "placement": "bottom" } });
    expect(container.firstElementChild?.className).toContain("popover--bottom");
  });

  it("applies placement=left variant class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "placement": "left" } });
    expect(container.firstElementChild?.className).toContain("popover--left");
  });

  it("applies placement=right variant class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "placement": "right" } });
    expect(container.firstElementChild?.className).toContain("popover--right");
  });

  it("applies placement=auto variant class", () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "placement": "auto" } });
    expect(container.firstElementChild?.className).toContain("popover--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Popover — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Popover as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
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
