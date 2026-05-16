// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Card";
// @generated:end

// @generated:start tests
describe("Card — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-card");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { stack } = await renderElement("fsds-card");
    expect(classTokens(stack)).toContain("card");
  });

  it("applies status=completed variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "completed" });
    expect(classTokens(stack)).toContain("card--completed");
  });

  it("applies status=in-progress variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "in-progress" });
    expect(classTokens(stack)).toContain("card--in-progress");
  });

  it("applies status=planned variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "planned" });
    expect(classTokens(stack)).toContain("card--planned");
  });

  it("applies status=deprecated variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "deprecated" });
    expect(classTokens(stack)).toContain("card--deprecated");
  });

  it("applies status=category variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "category" });
    expect(classTokens(stack)).toContain("card--category");
  });

  it("applies status=complexity variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "complexity" });
    expect(classTokens(stack)).toContain("card--complexity");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-card");
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
