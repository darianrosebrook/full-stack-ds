// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Alert";
// @generated:end

// @generated:start tests
describe("Alert — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-alert");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { stack } = await renderElement("fsds-alert");
    expect(classTokens(stack)).toContain("alert");
  });

  it("applies intent=info variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "intent": "info" });
    expect(classTokens(stack)).toContain("alert--info");
  });

  it("applies intent=success variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "intent": "success" });
    expect(classTokens(stack)).toContain("alert--success");
  });

  it("applies intent=warning variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "intent": "warning" });
    expect(classTokens(stack)).toContain("alert--warning");
  });

  it("applies intent=danger variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "intent": "danger" });
    expect(classTokens(stack)).toContain("alert--danger");
  });

  it("applies level=inline variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "level": "inline" });
    expect(classTokens(stack)).toContain("alert--inline");
  });

  it("applies level=section variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "level": "section" });
    expect(classTokens(stack)).toContain("alert--section");
  });

  it("applies level=page variant class", async () => {
    const { stack } = await renderElement("fsds-alert", { "level": "page" });
    expect(classTokens(stack)).toContain("alert--page");
  });
});

describe("Alert — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-alert");
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
