// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import ShowMore from "../ShowMore.svelte";
// @generated:end

// @generated:start tests
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
    const { container } = render(ShowMore as unknown as Component<Record<string, unknown>>, { props: {} });
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
