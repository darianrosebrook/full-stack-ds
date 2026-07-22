// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Accordion";
// @generated:end

// @generated:start tests
describe("Accordion — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-accordion");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-accordion");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("accordion");
  });

  it("applies type=single variant class", async () => {
    const { element } = await renderElement("fsds-accordion", { "type": "single" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("accordion--single");
  });

  it("applies type=multiple variant class", async () => {
    const { element } = await renderElement("fsds-accordion", { "type": "multiple" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("accordion--multiple");
  });
});

describe("Accordion — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-accordion");
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
      "role-img-alt",
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
import { vi } from "vitest";
// FIX-COMPOUND-CONTAINER-ANCESTOR-PREDICATE-01 (A2, Lit).
async function mountAccordion(
  type: "single" | "multiple",
  onChange?: (v: string | string[]) => void,
): Promise<HTMLElement> {
  await customElements.whenDefined("fsds-accordion");
  await customElements.whenDefined("fsds-accordion-trigger");
  await customElements.whenDefined("fsds-accordion-content");
  const root = document.createElement("fsds-accordion") as HTMLElement & {
    type?: string;
    onValueChange?: (v: string | string[]) => void;
    updateComplete?: Promise<unknown>;
  };
  root.type = type;
  if (onChange) root.onValueChange = onChange;
  root.innerHTML = `
    <fsds-accordion-item>
      <fsds-accordion-trigger value="a">First</fsds-accordion-trigger>
      <fsds-accordion-content value="a">Panel A</fsds-accordion-content>
    </fsds-accordion-item>
    <fsds-accordion-item>
      <fsds-accordion-trigger value="b">Second</fsds-accordion-trigger>
      <fsds-accordion-content value="b">Panel B</fsds-accordion-content>
    </fsds-accordion-item>
  `;
  document.body.append(root);
  await (root as { updateComplete?: Promise<unknown> }).updateComplete;
  await Promise.resolve();
  await settle(root);
  return root;
}

async function settle(root: HTMLElement): Promise<void> {
  for (const el of Array.from(root.querySelectorAll<HTMLElement & { updateComplete?: Promise<unknown> }>("*"))) {
    await el.updateComplete;
  }
  await Promise.resolve();
}

function triggers(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("fsds-accordion-trigger"));
}

describe("Accordion — disclosure behavior", () => {
  it("clicking a trigger expands its own panel and fires the channel callback", async () => {
    const onChange = vi.fn();
    const root = await mountAccordion("single", onChange);
    const first = triggers(root)[0];
    expect(first.getAttribute("aria-expanded")).toBe("false");
    first.click();
    await settle(root);
    expect(onChange).toHaveBeenCalledWith("a");
    expect(first.getAttribute("aria-expanded")).toBe("true");
    const region = root.querySelector('[role="region"]')!;
    expect(region).toBeTruthy();
    expect(region.getAttribute("aria-labelledby")).toBe(first.getAttribute("id"));
  });

  it("single mode: opening a second item closes the first", async () => {
    const root = await mountAccordion("single");
    triggers(root)[0].click();
    await settle(root);
    expect(triggers(root)[0].getAttribute("aria-expanded")).toBe("true");
    triggers(root)[1].click();
    await settle(root);
    expect(triggers(root)[1].getAttribute("aria-expanded")).toBe("true");
    expect(triggers(root)[0].getAttribute("aria-expanded")).toBe("false");
  });

  it("multiple mode: both items can be open at once", async () => {
    const root = await mountAccordion("multiple");
    triggers(root)[0].click();
    await settle(root);
    triggers(root)[1].click();
    await settle(root);
    expect(triggers(root)[0].getAttribute("aria-expanded")).toBe("true");
    expect(triggers(root)[1].getAttribute("aria-expanded")).toBe("true");
  });

  it("emits disclosure ARIA, not tab ARIA", async () => {
    const root = await mountAccordion("single");
    expect(root.querySelector('[role="tab"]')).toBeNull();
    expect(root.querySelector('[role="tablist"]')).toBeNull();
    expect(root.querySelector('[aria-selected]')).toBeNull();
  });
});

// @custom:end
