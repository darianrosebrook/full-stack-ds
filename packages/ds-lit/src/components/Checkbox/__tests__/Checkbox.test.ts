// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Checkbox";
// @generated:end

// @generated:start tests
describe("Checkbox — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-checkbox");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-checkbox");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("checkbox");
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-checkbox", { "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("checkbox--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-checkbox", { "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("checkbox--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-checkbox", { "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("checkbox--lg");
  });

  it("reflects checked=true after behavior.setChecked(true)", async () => {
    const { element } = await renderElement("fsds-checkbox");
    const el = element as LitTestElement & {
      behavior?: { setChecked?: (v: boolean) => void; checked?: boolean };
    };
    el.behavior?.setChecked?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.checked).toBe(true);
  });
});

describe("Checkbox — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-checkbox");
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
