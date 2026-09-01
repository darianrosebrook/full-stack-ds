// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import TextField from "../TextField.svelte";
// @generated:end

// @generated:start tests
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
    const { container } = render(TextField as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test TextField" } });
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
