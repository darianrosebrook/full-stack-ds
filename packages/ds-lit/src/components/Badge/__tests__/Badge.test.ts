// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Badge";
// @generated:end

// @generated:start tests
describe("Badge — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-badge");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-badge");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge");
  });

  it("applies variant=default variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "variant": "default" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--default");
  });

  it("applies variant=status variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "variant": "status" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--status");
  });

  it("applies variant=counter variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "variant": "counter" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--counter");
  });

  it("applies variant=tag variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "variant": "tag" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--tag");
  });

  it("applies intent=info variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "intent": "info" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--info");
  });

  it("applies intent=success variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "intent": "success" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--success");
  });

  it("applies intent=warning variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "intent": "warning" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--warning");
  });

  it("applies intent=danger variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "intent": "danger" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--danger");
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-badge", { "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("badge--lg");
  });
});

describe("Badge — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-badge");
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
