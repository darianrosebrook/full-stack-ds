// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import NavTree from "../NavTree.svelte";
// @generated:end

// @generated:start tests
describe("NavTree — unit", () => {
  it("renders with default props", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("nav-tree");
  });

  it("merges custom class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("nav-tree");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("listitem");
  });

  it("applies iconSize=sm variant class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "iconSize": "sm" } });
    expect(container.firstElementChild?.className).toContain("nav-tree--sm");
  });

  it("applies iconSize=md variant class", () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "iconSize": "md" } });
    expect(container.firstElementChild?.className).toContain("nav-tree--md");
  });
});

describe("NavTree — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(NavTree as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test NavTree" } });
    const list = document.createElement("ul");
    list.append(container.firstElementChild!);
    const results = await axe(list);
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
      "role-img-alt",
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
