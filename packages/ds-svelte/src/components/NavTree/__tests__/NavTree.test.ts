// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import NavTree from "../NavTree.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("NavTree — unit", () => {
  it("renders with default props", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder" } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder" } });
    expect(container.firstElementChild?.className).toContain("nav-tree");
  });

  it("merges custom class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder", "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("nav-tree");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder" } });
    expect(container.firstElementChild?.getAttribute("role")).toBe("listitem");
  });

  it("applies iconSize=sm variant class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder", "iconSize": "sm" } });
    expect(container.firstElementChild?.className).toContain("nav-tree--sm");
  });

  it("applies iconSize=md variant class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder", "iconSize": "md" } });
    expect(container.firstElementChild?.className).toContain("nav-tree--md");
  });
});

describe("NavTree — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "label": "placeholder", "aria-label": "Test NavTree", "children": createRawSnippet(() => ({ render: () => "<li>content</li>" })) } });
    const list = document.createElement("ul");
    list.append(container.firstElementChild!);
    const results = await axe(list, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import NavTreeItem from "../NavTreeItem.svelte";
import NavTreeList from "../NavTreeList.svelte";

describe("NavTree — compound parts", () => {
  it("mounts NavTreeItem with tag and base class", () => {
    const { container } = render(NavTreeItem as Component, {
      props: { "data-testid": "navtree-navtreeitem" },
    });
    const root = container.querySelector('[data-testid="navtree-navtreeitem"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("li");
    expect(root!.className.split(/\s+/)).toContain("nav-tree__item");
  });

  it("mounts NavTreeList with tag and base class", () => {
    const { container } = render(NavTreeList as Component, {
      props: { "data-testid": "navtree-navtreelist" },
    });
    const root = container.querySelector('[data-testid="navtree-navtreelist"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("ul");
    expect(root!.className.split(/\s+/)).toContain("nav-tree__list");
  });
});


// @custom:end
