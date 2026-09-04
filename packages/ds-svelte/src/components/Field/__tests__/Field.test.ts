// @generated:start imports
import { describe, expect, it } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Field from "../Field.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Field — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("field");
  });

  it("merges custom class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("field");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("has the correct ARIA role", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.getAttribute("role")).toBe("group");
  });

  it("applies status=idle variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "idle" } });
    expect(container.firstElementChild?.className).toContain("field--idle");
  });

  it("applies status=validating variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "validating" } });
    expect(container.firstElementChild?.className).toContain("field--validating");
  });

  it("applies status=valid variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "valid" } });
    expect(container.firstElementChild?.className).toContain("field--valid");
  });

  it("applies status=invalid variant class", () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "status": "invalid" } });
    expect(container.firstElementChild?.className).toContain("field--invalid");
  });
});

describe("Field — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Field as unknown as Component<Record<string, unknown>>, { props: { "name": "placeholder", "label": createRawSnippet(() => ({ render: () => "<span>Test Field label</span>" })) } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import FieldHeader from "../FieldHeader.svelte";

describe("Field — compound parts", () => {
  it("mounts FieldHeader with tag and base class", () => {
    const { container } = render(FieldHeader as Component, {
      props: { "data-testid": "field-fieldheader" },
    });
    const root = container.querySelector('[data-testid="field-fieldheader"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("header");
    expect(root!.className.split(/\s+/)).toContain("field__header");
  });
});


// @custom:end
