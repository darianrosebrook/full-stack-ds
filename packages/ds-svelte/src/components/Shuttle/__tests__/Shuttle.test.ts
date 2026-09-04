// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Shuttle from "../Shuttle.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Shuttle — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Shuttle as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Shuttle as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("shuttle");
  });

  it("merges custom class", () => {
    const { container } = render(Shuttle as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("shuttle");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("Shuttle — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Shuttle as unknown as Component<Record<string, unknown>>, { props: { "ariaLabel": "Test Shuttle" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import ShuttleItem from "../ShuttleItem.svelte";

describe("Shuttle — compound parts", () => {
  it("mounts ShuttleItem with tag and base class", () => {
    const { container } = render(ShuttleItem as Component, {
      props: { "data-testid": "shuttle-shuttleitem" },
    });
    const root = container.querySelector('[data-testid="shuttle-shuttleitem"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("li");
    expect(root!.className.split(/\s+/)).toContain("shuttle__item");
  });
});


// @custom:end
