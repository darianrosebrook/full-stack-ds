// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Button from "../Button.svelte";
// @generated:end

// @generated:start tests
describe("Button — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("button");
  });

  it("merges custom class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("button");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=small variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "small" } });
    expect(container.firstElementChild?.className).toContain("button--small");
  });

  it("applies size=medium variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "medium" } });
    expect(container.firstElementChild?.className).toContain("button--medium");
  });

  it("applies size=large variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "size": "large" } });
    expect(container.firstElementChild?.className).toContain("button--large");
  });

  it("applies variant=primary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "primary" } });
    expect(container.firstElementChild?.className).toContain("button--primary");
  });

  it("applies variant=secondary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "secondary" } });
    expect(container.firstElementChild?.className).toContain("button--secondary");
  });

  it("applies variant=tertiary variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "tertiary" } });
    expect(container.firstElementChild?.className).toContain("button--tertiary");
  });

  it("applies variant=ghost variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "ghost" } });
    expect(container.firstElementChild?.className).toContain("button--ghost");
  });

  it("applies variant=destructive variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "destructive" } });
    expect(container.firstElementChild?.className).toContain("button--destructive");
  });

  it("applies variant=outline variant class", () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "variant": "outline" } });
    expect(container.firstElementChild?.className).toContain("button--outline");
  });
});

describe("Button — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Button as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Button" } });
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
