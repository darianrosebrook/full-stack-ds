// @generated:start imports
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import "../Select";
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
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-select");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-select", { "open": true });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("select");
  });

  it("toggles the open channel from the trigger click", async () => {
    const { element } = await renderElement("fsds-select");
    const seen: boolean[] = [];
    (element as LitTestElement & { onOpenChange?: (v: boolean) => void }).onOpenChange = (v: boolean) => seen.push(v);
    await (element as LitTestElement).updateComplete;
    const host = element.shadowRoot?.querySelector(".select__trigger") as HTMLElement;
    host.click();
    expect(seen).toEqual([false]);
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-select", { "open": true, "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("select--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-select", { "open": true, "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("select--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-select", { "open": true, "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("select--lg");
  });

  it("closes on Escape key", async () => {
    const onOpenChangeSpy = vi.fn();
    const { element } = await renderElement("fsds-select", { "open": true });
    (element as unknown as Record<string, unknown>)["onOpenChange"] = onOpenChangeSpy;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChangeSpy).toHaveBeenCalledWith(false);
  });

  it("reflects open=true after behavior.setOpen(true)", async () => {
    const { element } = await renderElement("fsds-select");
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
    const { element } = await renderElement("fsds-select");
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

describe("Select — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-select", { "triggerLabel": "Test Select", "open": true });
    const results = await axe(element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
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

interface AccessibilityContent {
  slotName?: string;
  html: string;
}

function classTokens(element: Element | null | undefined): string[] {
  return (element?.className ?? "").split(/\s+/).filter(Boolean);
}

async function renderElement(tagName: string, props: Record<string, unknown> = {}, content: AccessibilityContent[] = []): Promise<RenderedElement> {
  const element = document.createElement(tagName) as LitTestElement;
  for (const fixture of content) {
    const template = document.createElement("template");
    template.innerHTML = fixture.html;
    const child = template.content.firstElementChild as HTMLElement | null;
    if (child && fixture.slotName) child.slot = fixture.slotName;
    element.append(template.content.cloneNode(true));
  }
  const container = document.createElement("div");
  container.append(element);
  document.body.append(container);
  await customElements.whenDefined(tagName);
  for (const [key, value] of Object.entries(props)) {
    (element as unknown as Record<string, unknown>)[key] = value;
    if (typeof value === "boolean") {
      if (value) element.setAttribute(key, "");
    } else {
      element.setAttribute(key, String(value));
    }
  }
  element.requestUpdate?.();
  await element.updateComplete;
  // Named slots can schedule one follow-up render via slotchange.
  await Promise.resolve();
  await element.updateComplete;
  return { element, stack: element.shadowRoot?.querySelector("fsds-stack") };
}
// @generated:end

// @custom:start tests

// @custom:end
