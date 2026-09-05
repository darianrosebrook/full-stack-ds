// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Truncate from "../Truncate.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Truncate — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Truncate as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Truncate as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("truncate");
  });

  it("merges custom class", () => {
    const { container } = render(Truncate as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("truncate");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("Truncate — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Truncate as unknown as Component<Record<string, unknown>>, { props: { "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import TruncateContent from "../TruncateContent.svelte";

describe("Truncate — compound parts", () => {
  it("mounts TruncateContent with tag and base class", () => {
    const { container } = render(TruncateContent as Component, {
      props: { "data-testid": "truncate-truncatecontent" },
    });
    const root = container.querySelector('[data-testid="truncate-truncatecontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("truncate__content");
  });
});


// @custom:end
