// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Badge from "../Badge.svelte";
// @generated:end

// @generated:start tests
describe("Badge — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("badge");
  });

  it("merges custom class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("badge");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies variant=default variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "variant": "default" } });
    expect(container.firstElementChild?.className).toContain("badge--default");
  });

  it("applies variant=status variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "variant": "status" } });
    expect(container.firstElementChild?.className).toContain("badge--status");
  });

  it("applies variant=counter variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "variant": "counter" } });
    expect(container.firstElementChild?.className).toContain("badge--counter");
  });

  it("applies variant=tag variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "variant": "tag" } });
    expect(container.firstElementChild?.className).toContain("badge--tag");
  });

  it("applies intent=info variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "intent": "info" } });
    expect(container.firstElementChild?.className).toContain("badge--info");
  });

  it("applies intent=success variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "intent": "success" } });
    expect(container.firstElementChild?.className).toContain("badge--success");
  });

  it("applies intent=warning variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "intent": "warning" } });
    expect(container.firstElementChild?.className).toContain("badge--warning");
  });

  it("applies intent=danger variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "intent": "danger" } });
    expect(container.firstElementChild?.className).toContain("badge--danger");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("badge--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("badge--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("badge--lg");
  });
});

describe("Badge — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: {} });
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
