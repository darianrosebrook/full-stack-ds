// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import ShowMore from "../ShowMore.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("ShowMore — unit", () => {
  it("renders with default props", () => {
    const { container } = render(ShowMore as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(ShowMore as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("show-more");
  });

  it("merges custom class", () => {
    const { container } = render(ShowMore as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("show-more");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("ShowMore — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(ShowMore as unknown as Component<Record<string, unknown>>, { props: { "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import ShowMoreContent from "../ShowMoreContent.svelte";
import ShowMoreTrigger from "../ShowMoreTrigger.svelte";

describe("ShowMore — compound parts", () => {
  it("mounts ShowMoreContent with tag and base class", () => {
    const { container } = render(ShowMoreContent as Component, {
      props: { "data-testid": "showmore-showmorecontent" },
    });
    const root = container.querySelector('[data-testid="showmore-showmorecontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("show-more__content");
  });

  it("mounts ShowMoreTrigger with tag and base class", () => {
    const { container } = render(ShowMoreTrigger as Component, {
      props: { "data-testid": "showmore-showmoretrigger" },
    });
    const root = container.querySelector('[data-testid="showmore-showmoretrigger"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("button");
    expect(root!.className.split(/\s+/)).toContain("show-more__trigger");
  });
});


// @custom:end
