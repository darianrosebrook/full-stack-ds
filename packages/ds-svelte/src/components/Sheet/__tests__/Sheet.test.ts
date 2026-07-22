// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import type { Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.svelte";
// @generated:end

// @generated:start tests
describe("Sheet — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet");
  });

  it("merges custom class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet");
    expect(root?.className).toContain("custom");
  });

  it("applies side=top variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "top" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--top");
  });

  it("applies side=right variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "right" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "bottom" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "left" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--left");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    await fireEvent.click(root!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Sheet", "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    const results = await axe(root as Element);
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
