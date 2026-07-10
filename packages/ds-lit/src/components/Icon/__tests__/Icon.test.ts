// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Icon";
// @generated:end

// @generated:start tests
describe("Icon — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-icon");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-icon");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("icon");
  });
});

describe("Icon — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-icon");
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
describe("Icon — catalog glyph rendering (ICON-CATALOG-RUNTIME-DELIVERY-01)", () => {
  async function renderIcon(props: Record<string, string>) {
    const { element } = await renderElement("fsds-icon", props);
    return element.shadowRoot!;
  }

  it("renders the authored 16-grid check glyph at size=sm", async () => {
    const root = await renderIcon({ name: "check", size: "sm" });
    const svg = root.querySelector('svg[data-fsds-icon="check"]');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("16");
    const paths = svg!.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    // the exact authored path data, not just element presence
    expect(paths[0].getAttribute("d")).toBe("M3.5 8.5L6.5 11.5L12.5 4.5");
    expect(paths[0].getAttribute("stroke-linecap")).toBe("round");
  });

  it("floor-selects the 16-grid variant at size=md but renders at 20px", async () => {
    const root = await renderIcon({ name: "check", size: "md" });
    const svg = root.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(svg!.getAttribute("width")).toBe("20");
  });

  it("selects the authored 24-grid variant at size=lg", async () => {
    const root = await renderIcon({ name: "check", size: "lg" });
    const svg = root.querySelector('svg[data-fsds-icon="check"]');
    expect(svg!.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg!.querySelector("path")!.getAttribute("d")).toBe("M5 12.5L9.5 17L19 6.5");
  });

  it("renders no svg at all for an unknown icon name", async () => {
    const root = await renderIcon({ name: "does-not-exist" });
    expect(root.querySelector("svg")).toBeNull();
  });
});
// @custom:end
