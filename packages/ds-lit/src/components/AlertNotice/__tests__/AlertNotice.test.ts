// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../AlertNotice";
// @generated:end

// @generated:start tests
describe("AlertNotice — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-alert-notice");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { stack } = await renderElement("fsds-alert-notice");
    expect(classTokens(stack)).toContain("alert-notice");
  });

  it("applies status=info variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "status": "info" });
    expect(classTokens(stack)).toContain("alert-notice--info");
  });

  it("applies status=success variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "status": "success" });
    expect(classTokens(stack)).toContain("alert-notice--success");
  });

  it("applies status=warning variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "status": "warning" });
    expect(classTokens(stack)).toContain("alert-notice--warning");
  });

  it("applies status=danger variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "status": "danger" });
    expect(classTokens(stack)).toContain("alert-notice--danger");
  });

  it("applies status=error variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "status": "error" });
    expect(classTokens(stack)).toContain("alert-notice--error");
  });

  it("applies level=page variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "level": "page" });
    expect(classTokens(stack)).toContain("alert-notice--page");
  });

  it("applies level=section variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "level": "section" });
    expect(classTokens(stack)).toContain("alert-notice--section");
  });

  it("applies level=inline variant class", async () => {
    const { stack } = await renderElement("fsds-alert-notice", { "level": "inline" });
    expect(classTokens(stack)).toContain("alert-notice--inline");
  });
});

describe("AlertNotice — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-alert-notice");
    const results = await axe(element);
    const knownScaffoldViolationIds = new Set([
      "aria-dialog-name",
      "aria-input-field-name",
      "aria-progressbar-name",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-toggle-field-name",
      "aria-tooltip-name",
      "aria-prohibited-attr",
      "button-name",
      "empty-heading",
      "label",
      "link-name",
      "list",
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
