// @generated:start imports
import { describe, expect, it } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Accordion from "../Accordion.svelte";
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: {} });
    expect(container.firstElementChild?.className).toContain("accordion");
  });

  it("merges custom class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("accordion");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies type=single variant class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "type": "single" } });
    expect(container.firstElementChild?.className).toContain("accordion--single");
  });

  it("applies type=multiple variant class", () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "type": "multiple" } });
    expect(container.firstElementChild?.className).toContain("accordion--multiple");
  });
});

describe("Accordion — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Accordion as unknown as Component<Record<string, unknown>>, { props: { "aria-label": "Test Accordion" } });
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
import { fireEvent } from "@testing-library/svelte";
import { vi } from "vitest";
import AccordionFixture from "./AccordionFixture.svelte";

// FIX-COMPOUND-CONTAINER-ANCESTOR-PREDICATE-01 (A2, Svelte).
describe("Accordion — disclosure behavior", () => {
  it("clicking a trigger expands its own panel and fires the channel callback", async () => {
    const onValueChange = vi.fn();
    const { container } = render(AccordionFixture as unknown as Component<Record<string, unknown>>, {
      props: { type: "single", onValueChange },
    });
    const buttons = () => Array.from(container.querySelectorAll("button"));
    const first = buttons()[0];
    expect(first.getAttribute("aria-expanded")).toBe("false");
    await fireEvent.click(first);
    expect(onValueChange).toHaveBeenCalledWith("a");
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("true");
    const region = container.querySelector('[role="region"]')!;
    expect(region).toBeTruthy();
    expect(region.getAttribute("aria-labelledby")).toBe(buttons()[0].id);
  });

  it("single mode: opening a second item closes the first", async () => {
    const { container } = render(AccordionFixture as unknown as Component<Record<string, unknown>>, {
      props: { type: "single", defaultValue: "a" },
    });
    const buttons = () => Array.from(container.querySelectorAll("button"));
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("true");
    await fireEvent.click(buttons()[1]);
    expect(buttons()[1].getAttribute("aria-expanded")).toBe("true");
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("false");
  });

  it("multiple mode: both items can be open at once", async () => {
    const { container } = render(AccordionFixture as unknown as Component<Record<string, unknown>>, {
      props: { type: "multiple", defaultValue: ["a"] },
    });
    const buttons = () => Array.from(container.querySelectorAll("button"));
    await fireEvent.click(buttons()[1]);
    expect(buttons()[0].getAttribute("aria-expanded")).toBe("true");
    expect(buttons()[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("emits disclosure ARIA, not tab ARIA", () => {
    const { container } = render(AccordionFixture as unknown as Component<Record<string, unknown>>, {
      props: { type: "single" },
    });
    expect(container.querySelector('[role="tab"]')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('[aria-selected]')).toBeNull();
  });
});

// @custom:end
