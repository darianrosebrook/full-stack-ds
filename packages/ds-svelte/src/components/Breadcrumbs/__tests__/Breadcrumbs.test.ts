// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Breadcrumbs from "../Breadcrumbs.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Breadcrumbs — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Breadcrumbs as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Breadcrumbs as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("breadcrumbs");
  });

  it("merges custom class", () => {
    const { container } = render(Breadcrumbs as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("breadcrumbs");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("Breadcrumbs — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Breadcrumbs as unknown as Component<Record<string, unknown>>, { props: { "ariaLabel": "Test Breadcrumbs", "children": createRawSnippet(() => ({ render: () => "<li>content</li>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import BreadcrumbsList from "../BreadcrumbsList.svelte";

describe("Breadcrumbs — compound parts", () => {
  it("mounts BreadcrumbsList with tag and base class", () => {
    const { container } = render(BreadcrumbsList as Component, {
      props: { "data-testid": "breadcrumbs-breadcrumbslist" },
    });
    const root = container.querySelector('[data-testid="breadcrumbs-breadcrumbslist"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("ul");
    expect(root!.className.split(/\s+/)).toContain("breadcrumbs__list");
  });
});


// @custom:end
