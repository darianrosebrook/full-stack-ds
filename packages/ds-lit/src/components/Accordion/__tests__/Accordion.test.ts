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

// @custom:end
