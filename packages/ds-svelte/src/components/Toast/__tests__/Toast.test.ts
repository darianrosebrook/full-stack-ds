// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Toast from "../Toast.svelte";
// @generated:end

// @generated:start tests
describe("Toast — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("toast");
  });

  it("merges custom class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("toast");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.getAttribute("role")).toBe("alert");
  });

  it("applies variant=info variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "info" } });
    expect(container.firstElementChild?.className).toContain("toast--info");
  });

  it("applies variant=success variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "success" } });
    expect(container.firstElementChild?.className).toContain("toast--success");
  });

  it("applies variant=warning variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "warning" } });
    expect(container.firstElementChild?.className).toContain("toast--warning");
  });

  it("applies variant=error variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "variant": "error" } });
    expect(container.firstElementChild?.className).toContain("toast--error");
  });

  it("applies politeness=polite variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "polite" } });
    expect(container.firstElementChild?.className).toContain("toast--polite");
  });

  it("applies politeness=assertive variant class", () => {
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "open": true, "politeness": "assertive" } });
    expect(container.firstElementChild?.className).toContain("toast--assertive");
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
    const { container } = render(Toast as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Toast", "open": true } });
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
