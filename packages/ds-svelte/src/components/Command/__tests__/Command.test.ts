// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import type { Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Command from "../Command.svelte";
// @generated:end

// @generated:start tests
describe("Command — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("command");
  });

  it("merges custom class", () => {
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("command");
    expect(root?.className).toContain("custom");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    const root = document.body.querySelector<HTMLElement>(".command");
    expect(root).not.toBeNull();
    await fireEvent.click(root!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Command — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Command as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Command", "open": true } });
    const root = document.body.querySelector<HTMLElement>(".command");
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
