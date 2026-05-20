// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import "../Dialog";
// @generated:end

// @generated:start tests
describe("Dialog — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-dialog");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog");
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true, "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true, "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true, "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog--lg");
  });

  it("applies size=xl variant class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true, "size": "xl" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog--xl");
  });

  it("applies size=full variant class", async () => {
    const { element } = await renderElement("fsds-dialog", { "open": true, "size": "full" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("dialog--full");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    const { element } = await renderElement("fsds-dialog", { "open": true });
    (element as unknown as Record<string, unknown>)["onOpenChange"] = onOpenChangeSpy;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("closes on overlay click", async () => {
    const onOpenChangeSpy = vi.fn();
    const { element } = await renderElement("fsds-dialog", { "open": true });
    (element as unknown as Record<string, unknown>)["onOpenChange"] = onOpenChangeSpy;
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("reflects openness=true after behavior.setOpenness(true)", async () => {
    const { element } = await renderElement("fsds-dialog");
    const el = element as LitTestElement & {
      behavior?: { setOpenness?: (v: boolean) => void; openness?: boolean };
    };
    el.behavior?.setOpenness?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.openness).toBe(true);
    // Guarded subtree should now be rendered (codegen marker).
    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="openness"]')).not.toBeNull();
  });

  it("reflects openness=false after behavior.setOpenness(false)", async () => {
    const { element } = await renderElement("fsds-dialog");
    const el = element as LitTestElement & {
      behavior?: { setOpenness?: (v: boolean) => void; openness?: boolean };
    };
    el.behavior?.setOpenness?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    el.behavior?.setOpenness?.(false);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.openness).toBe(false);
    // Guarded subtree should be torn down after the channel flips false.
    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="openness"]')).toBeNull();
  });
});

describe("Dialog — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-dialog", {"open":true});
    const results = await axe(element);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
      "image-alt",
      "label",
      "link-name",
      "region",
      "summary-name",
    ]);
    const unexpectedViolations = results.violations.filter(
      (violation) => !knownScaffoldViolationIds.has(violation.id),
    );
    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);
  });
});

interface RenderedElement {
  element: HTMLElement;
  stack: Element | null | undefined;
}

interface LitTestElement extends HTMLElement {
  updateComplete?: Promise<unknown>;
  requestUpdate?: () => void;
}

function classTokens(element: Element | null | undefined): string[] {
  return (element?.className ?? "").split(/\s+/).filter(Boolean);
}

async function renderElement(tagName: string, props: Record<string, string | boolean | number> = {}): Promise<RenderedElement> {
  const element = document.createElement(tagName) as LitTestElement;
  const container = document.createElement("div");
  container.append(element);
  document.body.append(container);
  await customElements.whenDefined(tagName);
  for (const [key, value] of Object.entries(props)) {
    (element as unknown as Record<string, string | boolean | number>)[key] = value;
    if (typeof value === "boolean") {
      if (value) element.setAttribute(key, "");
    } else {
      element.setAttribute(key, String(value));
    }
  }
  element.requestUpdate?.();
  await element.updateComplete;
  return { element, stack: element.shadowRoot?.querySelector("fsds-stack") };
}
// @generated:end

// @custom:start tests

// @custom:end
