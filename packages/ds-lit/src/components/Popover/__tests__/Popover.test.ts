// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import "../Popover";
// @generated:end

// @generated:start tests
describe("Popover — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-popover");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover");
  });

  it("applies placement=top variant class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true, "placement": "top" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover--top");
  });

  it("applies placement=bottom variant class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true, "placement": "bottom" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover--bottom");
  });

  it("applies placement=left variant class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true, "placement": "left" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover--left");
  });

  it("applies placement=right variant class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true, "placement": "right" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover--right");
  });

  it("applies placement=auto variant class", async () => {
    const { element } = await renderElement("fsds-popover", { "open": true, "placement": "auto" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("popover--auto");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    const { element } = await renderElement("fsds-popover", { "open": true });
    (element as unknown as Record<string, unknown>)["onOpenChange"] = onOpenChangeSpy;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("reflects open=true after behavior.setOpen(true)", async () => {
    const { element } = await renderElement("fsds-popover");
    const el = element as LitTestElement & {
      behavior?: { setOpen?: (v: boolean) => void; open?: boolean };
    };
    el.behavior?.setOpen?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.open).toBe(true);
    // Guarded subtree should now be rendered (codegen marker).
    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="open"]')).not.toBeNull();
    const trueNode_aria_expanded = element.shadowRoot?.querySelector('[aria-expanded]');
    expect(trueNode_aria_expanded?.getAttribute('aria-expanded')).toBe("true");
  });

  it("reflects open=false after behavior.setOpen(false)", async () => {
    const { element } = await renderElement("fsds-popover");
    const el = element as LitTestElement & {
      behavior?: { setOpen?: (v: boolean) => void; open?: boolean };
    };
    el.behavior?.setOpen?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    el.behavior?.setOpen?.(false);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.open).toBe(false);
    // Guarded subtree should be torn down after the channel flips false.
    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="open"]')).toBeNull();
    const falseNode_aria_expanded = element.shadowRoot?.querySelector('[aria-expanded]');
    expect(falseNode_aria_expanded?.getAttribute('aria-expanded')).toBe("false");
  });
});

describe("Popover — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-popover", {"open":true});
    const results = await axe(element);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "button-name",
      "empty-heading",
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
