// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Card from "../Card.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Card — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("card");
  });

  it("merges custom class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("card");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("group");
  });

  it("applies status=completed variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "completed" } });
    expect(container.firstElementChild?.className).toContain("card--completed");
  });

  it("applies status=in-progress variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "in-progress" } });
    expect(container.firstElementChild?.className).toContain("card--in-progress");
  });

  it("applies status=planned variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "planned" } });
    expect(container.firstElementChild?.className).toContain("card--planned");
  });

  it("applies status=deprecated variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "deprecated" } });
    expect(container.firstElementChild?.className).toContain("card--deprecated");
  });

  it("applies status=category variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "category" } });
    expect(container.firstElementChild?.className).toContain("card--category");
  });

  it("applies status=complexity variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "status": "complexity" } });
    expect(container.firstElementChild?.className).toContain("card--complexity");
  });

  it("applies density=default variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "density": "default" } });
    expect(container.firstElementChild?.className).toContain("card--default");
  });

  it("applies density=inset variant class", () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "density": "inset" } });
    expect(container.firstElementChild?.className).toContain("card--inset");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Card as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Card" } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import CardContent from "../CardContent.svelte";
import CardDescription from "../CardDescription.svelte";
import CardFooter from "../CardFooter.svelte";
import CardHeader from "../CardHeader.svelte";

describe("Card — compound parts", () => {
  it("mounts CardContent with tag and base class", () => {
    const { container } = render(CardContent as Component, {
      props: { "data-testid": "card-cardcontent" },
    });
    const root = container.querySelector('[data-testid="card-cardcontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("card__content");
  });

  it("mounts CardDescription with tag and base class", () => {
    const { container } = render(CardDescription as Component, {
      props: { "data-testid": "card-carddescription" },
    });
    const root = container.querySelector('[data-testid="card-carddescription"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("p");
    expect(root!.className.split(/\s+/)).toContain("card__description");
  });

  it("mounts CardFooter with tag and base class", () => {
    const { container } = render(CardFooter as Component, {
      props: { "data-testid": "card-cardfooter" },
    });
    const root = container.querySelector('[data-testid="card-cardfooter"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("footer");
    expect(root!.className.split(/\s+/)).toContain("card__footer");
  });

  it("mounts CardHeader with tag and base class", () => {
    const { container } = render(CardHeader as Component, {
      props: { "data-testid": "card-cardheader" },
    });
    const root = container.querySelector('[data-testid="card-cardheader"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("header");
    expect(root!.className.split(/\s+/)).toContain("card__header");
  });
});


// @custom:end
