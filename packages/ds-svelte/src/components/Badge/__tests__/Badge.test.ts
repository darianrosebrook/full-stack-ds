// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Badge from "../Badge.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

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
    const { container } = render(Badge as unknown as Component<Record<string, unknown>>, { props: { "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import BadgeContent from "../BadgeContent.svelte";

describe("Badge — compound parts", () => {
  it("mounts BadgeContent with tag and base class", () => {
    const { container } = render(BadgeContent as Component, {
      props: { "data-testid": "badge-badgecontent" },
    });
    const root = container.querySelector('[data-testid="badge-badgecontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("badge__content");
  });
});


// @custom:end
