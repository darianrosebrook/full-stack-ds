// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Spinner from "../Spinner.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Spinner — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("spinner");
  });

  it("merges custom class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("spinner");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("status");
  });

  it("applies size=xs variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "size": "xs" } });
    expect(container.firstElementChild?.className).toContain("spinner--xs");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("spinner--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("spinner--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("spinner--lg");
  });

  it("applies thickness=hairline variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "thickness": "hairline" } });
    expect(container.firstElementChild?.className).toContain("spinner--hairline");
  });

  it("applies thickness=regular variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "thickness": "regular" } });
    expect(container.firstElementChild?.className).toContain("spinner--regular");
  });

  it("applies thickness=bold variant class", () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "thickness": "bold" } });
    expect(container.firstElementChild?.className).toContain("spinner--bold");
  });
});

describe("Spinner — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Spinner as unknown as Component<Record<string, unknown>>, { props: { "label": "Test Spinner" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
