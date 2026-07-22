// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Toast from "../Toast.svelte";
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast");
  });

  it("merges custom class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast");
    expect(root?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.getAttribute("role")).toBe("alert");
  });

  it("applies variant=info variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "info" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--info");
  });

  it("applies variant=success variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "success" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--success");
  });

  it("applies variant=warning variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "warning" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--warning");
  });

  it("applies variant=error variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "error" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "polite" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "assertive" } });
    const root = document.body.querySelector<HTMLElement>(".toast");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("toast--assertive");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Toast — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Toast as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Toast", "open": true } });
    const root = document.body.querySelector<HTMLElement>(".toast");
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
