// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Details";
// @generated:end

// @generated:start tests
describe("Details — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-details");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details");
  });

  it("applies variant=default variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "variant": "default" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--default");
  });

  it("applies variant=inline variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "variant": "inline" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--inline");
  });

  it("applies variant=compact variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "variant": "compact" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--compact");
  });

  it("applies icon=left variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "icon": "left" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--left");
  });

  it("applies icon=right variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "icon": "right" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--right");
  });

  it("applies icon=none variant class", async () => {
    const { element } = await renderElement("fsds-details", { "open": true, "icon": "none" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("details--none");
  });

  it("reflects open=true after behavior.setOpen(true)", async () => {
    const { element } = await renderElement("fsds-details");
    const el = element as LitTestElement & {
      behavior?: { setOpen?: (v: boolean) => void; open?: boolean };
    };
    el.behavior?.setOpen?.(true);
    el.requestUpdate?.();
    await el.updateComplete;
    expect(el.behavior?.open).toBe(true);
  });
});

describe("Details — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-details", {"open":true});
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
