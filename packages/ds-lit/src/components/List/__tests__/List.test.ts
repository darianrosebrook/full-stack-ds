// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../List";
// @generated:end

// @generated:start tests
describe("List — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-list");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-list");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list");
  });

  it("applies as=ul variant class", async () => {
    const { element } = await renderElement("fsds-list", { "as": "ul" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--ul");
  });

  it("applies as=ol variant class", async () => {
    const { element } = await renderElement("fsds-list", { "as": "ol" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--ol");
  });

  it("applies as=dl variant class", async () => {
    const { element } = await renderElement("fsds-list", { "as": "dl" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--dl");
  });

  it("applies variant=default variant class", async () => {
    const { element } = await renderElement("fsds-list", { "variant": "default" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--default");
  });

  it("applies variant=unstyled variant class", async () => {
    const { element } = await renderElement("fsds-list", { "variant": "unstyled" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--unstyled");
  });

  it("applies variant=inline variant class", async () => {
    const { element } = await renderElement("fsds-list", { "variant": "inline" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--inline");
  });

  it("applies variant=divided variant class", async () => {
    const { element } = await renderElement("fsds-list", { "variant": "divided" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--divided");
  });

  it("applies variant=spaced variant class", async () => {
    const { element } = await renderElement("fsds-list", { "variant": "spaced" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--spaced");
  });

  it("applies marker=default variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "default" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--default");
  });

  it("applies marker=none variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "none" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--none");
  });

  it("applies marker=disc variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "disc" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--disc");
  });

  it("applies marker=circle variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "circle" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--circle");
  });

  it("applies marker=square variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "square" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--square");
  });

  it("applies marker=decimal variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "decimal" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--decimal");
  });

  it("applies marker=alpha variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "alpha" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--alpha");
  });

  it("applies marker=roman variant class", async () => {
    const { element } = await renderElement("fsds-list", { "marker": "roman" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--roman");
  });

  it("applies spacing=none variant class", async () => {
    const { element } = await renderElement("fsds-list", { "spacing": "none" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--none");
  });

  it("applies spacing=sm variant class", async () => {
    const { element } = await renderElement("fsds-list", { "spacing": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--sm");
  });

  it("applies spacing=md variant class", async () => {
    const { element } = await renderElement("fsds-list", { "spacing": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--md");
  });

  it("applies spacing=lg variant class", async () => {
    const { element } = await renderElement("fsds-list", { "spacing": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--lg");
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-list", { "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-list", { "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-list", { "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("list--lg");
  });
});

describe("List — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-list");
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
