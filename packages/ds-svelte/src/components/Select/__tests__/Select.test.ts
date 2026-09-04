// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import type { Component } from "svelte";
import { render } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Select from "../Select.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Select — unit", () => {
  it("renders with default props", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild).toBeTruthy();
  });

  it("applies the base CSS class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    expect(container.firstElementChild?.className).toContain("select");
  });

  it("merges custom class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    expect(container.firstElementChild?.className).toContain("select");
    expect(container.firstElementChild?.className).toContain("custom");
  });

  it("applies size=sm variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "sm" } });
    expect(container.firstElementChild?.className).toContain("select--sm");
  });

  it("applies size=md variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "md" } });
    expect(container.firstElementChild?.className).toContain("select--md");
  });

  it("applies size=lg variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "size": "lg" } });
    expect(container.firstElementChild?.className).toContain("select--lg");
  });

  it("applies position=bottom variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "bottom" } });
    expect(container.firstElementChild?.className).toContain("select--bottom");
  });

  it("applies position=top variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "top" } });
    expect(container.firstElementChild?.className).toContain("select--top");
  });

  it("applies position=auto variant class", () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "position": "auto" } });
    expect(container.firstElementChild?.className).toContain("select--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Select as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { container } = render(Select as unknown as Component<Record<string, unknown>>, { props: { "triggerLabel": "Test Select", "open": true } });
    const results = await axe(container, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import SelectContent from "../SelectContent.svelte";
import SelectOption from "../SelectOption.svelte";
import SelectTrigger from "../SelectTrigger.svelte";

describe("Select — compound parts", () => {
  it("mounts SelectContent with tag and base class", () => {
    const { container } = render(SelectContent as Component, {
      props: { "data-testid": "select-selectcontent" },
    });
    const root = container.querySelector('[data-testid="select-selectcontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("select__content");
  });

  it("mounts SelectOption with tag and base class", () => {
    const { container } = render(SelectOption as Component, {
      props: { "data-testid": "select-selectoption" },
    });
    const root = container.querySelector('[data-testid="select-selectoption"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("li");
    expect(root!.className.split(/\s+/)).toContain("select__option");
  });

  it("mounts SelectTrigger with tag and base class", () => {
    const { container } = render(SelectTrigger as Component, {
      props: { "data-testid": "select-selecttrigger" },
    });
    const root = container.querySelector('[data-testid="select-selecttrigger"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("button");
    expect(root!.className.split(/\s+/)).toContain("select__trigger");
  });
});


// @custom:end
