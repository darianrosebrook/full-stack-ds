// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Tabs from "../Tabs.svelte";
// @generated:end

// @generated:start tests
describe("Tabs — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("tabs");
  });

  it("merges custom class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("tabs");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies orientation=horizontal variant class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "orientation": "horizontal" } });
    expect(container.firstElementChild?.className).toContain("tabs--horizontal");
  });

  it("applies orientation=vertical variant class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "orientation": "vertical" } });
    expect(container.firstElementChild?.className).toContain("tabs--vertical");
  });

  it("applies activationMode=automatic variant class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "activationMode": "automatic" } });
    expect(container.firstElementChild?.className).toContain("tabs--automatic");
  });

  it("applies activationMode=manual variant class", () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "activationMode": "manual" } });
    expect(container.firstElementChild?.className).toContain("tabs--manual");
  });
});

describe("Tabs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Tabs as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Tabs" } });
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
