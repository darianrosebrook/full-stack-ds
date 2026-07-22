// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import type { Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Dialog from "../Dialog.svelte";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog");
  });

  it("merges custom class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog");
    expect(root?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "sm" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog--sm");
  });

  it("applies size=md variant class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "md" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog--md");
  });

  it("applies size=lg variant class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "lg" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog--lg");
  });

  it("applies size=xl variant class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "xl" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog--xl");
  });

  it("applies size=full variant class", () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "full" } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("dialog--full");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
    expect(root).not.toBeNull();
    await fireEvent.click(root!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Dialog as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Dialog", "open": true } });
    const root = document.body.querySelector<HTMLElement>(".dialog");
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
describe("Dialog — portal (FEAT-PORTAL-MECHANISM-CROSS-FRAMEWORK-01)", () => {
  it("relocates the dialog root to document.body, escaping an ancestor stacking context", () => {
    // A transform/overflow ancestor creates a stacking context that would clip
    // a merely-fixed dialog. The `use:portal` action appends the root to
    // document.body so the fixed layer escapes it; the root's DOM parent must
    // be document.body, not the render container inside the ancestor.
    const ancestor = document.createElement("div");
    ancestor.style.transform = "translateZ(0)";
    ancestor.style.overflow = "hidden";
    document.body.append(ancestor);

    const target = ancestor.appendChild(document.createElement("div"));
    render(Dialog as unknown as Component<Record<string, unknown>>, {
      props: { open: true },
      target,
    });

    const dialogRoot = document.body.querySelector<HTMLElement>(".dialog");
    expect(dialogRoot).not.toBeNull();
    // Load-bearing: the portaled root's parent is document.body, not the
    // target the action moved it out of.
    expect(dialogRoot?.parentElement).toBe(document.body);
    expect(target.contains(dialogRoot)).toBe(false);

    dialogRoot?.remove();
    ancestor.remove();
  });
});
// @custom:end
