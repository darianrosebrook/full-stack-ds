// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import NavList from "../NavList.svelte";
// @generated:end

// @generated:start tests
describe("NavList — unit", () => {
  it("renders with default props", () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("nav-list");
  });

  it("merges custom class", () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("nav-list");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies orientation=vertical variant class", () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: { "orientation": "vertical" } });
    expect(container.firstElementChild?.className).toContain("nav-list--vertical");
  });

  it("applies orientation=horizontal variant class", () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: { "orientation": "horizontal" } });
    expect(container.firstElementChild?.className).toContain("nav-list--horizontal");
  });
});

describe("NavList — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(NavList as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test NavList" } });
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
import NavListItem from "../NavListItem.svelte";
import NavListList from "../NavListList.svelte";

describe("NavList — compound parts", () => {
  it("mounts NavListItem with tag and base class", () => {
    const { container } = render(NavListItem as Component, {
      props: { "data-testid": "navlist-navlistitem" },
    });
    const root = container.querySelector('[data-testid="navlist-navlistitem"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("li");
    expect(root!.className.split(/\s+/)).toContain("nav-list__item");
  });

  it("mounts NavListList with tag and base class", () => {
    const { container } = render(NavListList as Component, {
      props: { "data-testid": "navlist-navlistlist" },
    });
    const root = container.querySelector('[data-testid="navlist-navlistlist"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("ul");
    expect(root!.className.split(/\s+/)).toContain("nav-list__list");
  });
});


// @custom:end
