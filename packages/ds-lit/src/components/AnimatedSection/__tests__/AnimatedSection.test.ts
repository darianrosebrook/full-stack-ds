// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../AnimatedSection";
// @generated:end

// @generated:start tests
describe("AnimatedSection — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-animated-section");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-animated-section");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section");
  });

  it("applies as=section variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "section" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--section");
  });

  it("applies as=div variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "div" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--div");
  });

  it("applies as=article variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "article" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--article");
  });

  it("applies as=main variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "main" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--main");
  });

  it("applies as=aside variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "aside" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--aside");
  });

  it("applies as=header variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "header" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--header");
  });

  it("applies as=footer variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "as": "footer" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--footer");
  });

  it("applies variant=fade-up variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "variant": "fade-up" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--fade-up");
  });

  it("applies variant=fade-in variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "variant": "fade-in" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--fade-in");
  });

  it("applies variant=slide-in variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "variant": "slide-in" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--slide-in");
  });

  it("applies variant=stagger-children variant class", async () => {
    const { element } = await renderElement("fsds-animated-section", { "variant": "stagger-children" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-section--stagger-children");
  });
});

describe("AnimatedSection — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-animated-section");
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
