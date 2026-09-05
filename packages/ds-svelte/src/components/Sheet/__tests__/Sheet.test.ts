// @generated:start imports
import { describe, expect, it, vi, afterEach } from "vitest";
import { createRawSnippet, type Component } from "svelte";
import { render, fireEvent } from "@testing-library/svelte";
import { axe } from "vitest-axe";
import Sheet from "../Sheet.svelte";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Sheet — unit", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders with default props", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
  });

  it("applies the base CSS class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet");
  });

  it("merges custom class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "class": "custom" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet");
    expect(root?.className).toContain("custom");
  });

  it("applies side=top variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "top" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--top");
  });

  it("applies side=right variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "right" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--right");
  });

  it("applies side=bottom variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "bottom" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--bottom");
  });

  it("applies side=left variant class", () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "side": "left" } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    expect(root?.className).toContain("sheet--left");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "open": true, "onOpenChange": onOpenChangeSpy } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    await fireEvent.click(root!.querySelector(".sheet__overlay")!);
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });
});

describe("Sheet — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    render(Sheet as unknown as Component<Record<string, unknown>>, { props: { "title": createRawSnippet(() => ({ render: () => "<span>Test Sheet title</span>" })), "description": createRawSnippet(() => ({ render: () => "<span>Test Sheet description</span>" })), "children": createRawSnippet(() => ({ render: () => "<span>content</span>" })), "open": true } });
    const root = document.body.querySelector<HTMLElement>(".sheet");
    expect(root).not.toBeNull();
    const results = await axe(root as Element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
// @generated:end

// @custom:start tests
import SheetBody from "../SheetBody.svelte";
import SheetContent from "../SheetContent.svelte";
import SheetDescription from "../SheetDescription.svelte";
import SheetFooter from "../SheetFooter.svelte";
import SheetHeader from "../SheetHeader.svelte";
import SheetTitle from "../SheetTitle.svelte";

describe("Sheet — compound parts", () => {
  it("mounts SheetBody with tag and base class", () => {
    const { container } = render(SheetBody as Component, {
      props: { "data-testid": "sheet-sheetbody" },
    });
    const root = container.querySelector('[data-testid="sheet-sheetbody"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("sheet__body");
  });

  it("mounts SheetContent with tag and base class", () => {
    const { container } = render(SheetContent as Component, {
      props: { "data-testid": "sheet-sheetcontent" },
    });
    const root = container.querySelector('[data-testid="sheet-sheetcontent"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("div");
    expect(root!.className.split(/\s+/)).toContain("sheet__content");
  });

  it("mounts SheetDescription with tag and base class", () => {
    const { container } = render(SheetDescription as Component, {
      props: { "data-testid": "sheet-sheetdescription" },
    });
    const root = container.querySelector('[data-testid="sheet-sheetdescription"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("p");
    expect(root!.className.split(/\s+/)).toContain("sheet__description");
  });

  it("mounts SheetFooter with tag and base class", () => {
    const { container } = render(SheetFooter as Component, {
      props: { "data-testid": "sheet-sheetfooter" },
    });
    const root = container.querySelector('[data-testid="sheet-sheetfooter"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("footer");
    expect(root!.className.split(/\s+/)).toContain("sheet__footer");
  });

  it("mounts SheetHeader with tag and base class", () => {
    const { container } = render(SheetHeader as Component, {
      props: { "data-testid": "sheet-sheetheader" },
    });
    const root = container.querySelector('[data-testid="sheet-sheetheader"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("header");
    expect(root!.className.split(/\s+/)).toContain("sheet__header");
  });

  it("mounts SheetTitle with tag and base class", () => {
    const { container } = render(SheetTitle as Component, {
      props: { "data-testid": "sheet-sheettitle" },
    });
    const root = container.querySelector('[data-testid="sheet-sheettitle"]');
    expect(root).toBeTruthy();
    expect(root!.tagName.toLowerCase()).toBe("h3");
    expect(root!.className.split(/\s+/)).toContain("sheet__title");
  });
});


// @custom:end
