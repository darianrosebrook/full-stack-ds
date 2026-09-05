// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Progress from "../Progress.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Progress — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("progress");
  });

  it("merges custom class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("progress");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("progressbar");
  });

  it("applies variant=linear variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "variant": "linear" } });
    expect(container.firstElementChild?.className).toContain("progress--linear");
  });

  it("applies variant=circular variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "variant": "circular" } });
    expect(container.firstElementChild?.className).toContain("progress--circular");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("progress--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "size": "md" } });
    expect(container.firstElementChild?.className).toContain("progress--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("progress--lg");
  });

  it("applies intent=info variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "intent": "info" } });
    expect(container.firstElementChild?.className).toContain("progress--info");
  });

  it("applies intent=success variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "intent": "success" } });
    expect(container.firstElementChild?.className).toContain("progress--success");
  });

  it("applies intent=warning variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "intent": "warning" } });
    expect(container.firstElementChild?.className).toContain("progress--warning");
  });

  it("applies intent=danger variant class", () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "intent": "danger" } });
    expect(container.firstElementChild?.className).toContain("progress--danger");
  });
});

describe("Progress — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Progress as unknown as Component<Record<string, unknown>>, { props: { "label": "Test Progress", "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests

// @custom:end
