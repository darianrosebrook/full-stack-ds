// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import TextField from "../TextField.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("TextField — unit", () => {
  it("renders with default props", () => {
    const { container } = render(TextField as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(TextField as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("text-field");
  });

  it("merges custom class", () => {
    const { container } = render(TextField as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("text-field");
    expect(container.firstElementChild?.className).toContain("custom");
  });
});

describe("TextField — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(TextField as unknown as Component<Record<string, unknown>>, { props: { "label": createRawSnippet(() => ({ render: () => "<span>Test TextField label</span>" })), "description": createRawSnippet(() => ({ render: () => "<span>Test TextField description</span>" })), "error": createRawSnippet(() => ({ render: () => "<span>Test TextField error</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import TextFieldDescription from "../TextFieldDescription.svelte";

describe("TextField — compound parts", () => {
  it("mounts TextFieldDescription with tag and base class", () => {
    const { container } = render(TextFieldDescription as Component, {
      props: { "data-testid": "textfield-textfielddescription" },
    });
    const root = container.querySelector('[data-testid="textfield-textfielddescription"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("p");
    expect(root!.className.split(/\s+/)).toContain("text-field__description");
  });
});


// @custom:end
