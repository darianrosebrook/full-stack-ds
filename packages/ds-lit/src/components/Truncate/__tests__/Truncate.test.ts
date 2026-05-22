// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Truncate";
// @generated:end

// @generated:start tests
describe("Truncate — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-truncate");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-truncate");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("truncate");
  });

  it("reflects expanded=true after behavior.setExpanded(true)", async () => {
    const { element } = await renderElement("fsds-truncate", {"expandable":true});
    const el = element as LitTestElement & {
      behavior?: { setExpanded?: (v: boolean) => void; expanded?: boolean };
    };
    el.behavior?.setExpanded?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.expanded).toBe(true);
    const trueNode_aria_expanded = element.shadowRoot?.querySelector('[aria-expanded]');
    expect(trueNode_aria_expanded?.getAttribute('aria-expanded')).toBe("true");
  });

  it("reflects expanded=false after behavior.setExpanded(false)", async () => {
    const { element } = await renderElement("fsds-truncate", {"expandable":true});
    const el = element as LitTestElement & {
      behavior?: { setExpanded?: (v: boolean) => void; expanded?: boolean };
    };
    el.behavior?.setExpanded?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    el.behavior?.setExpanded?.(false);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.expanded).toBe(false);
    const falseNode_aria_expanded = element.shadowRoot?.querySelector('[aria-expanded]');
    expect(falseNode_aria_expanded?.getAttribute('aria-expanded')).toBe("false");
  });
});

describe("Truncate — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-truncate");
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
