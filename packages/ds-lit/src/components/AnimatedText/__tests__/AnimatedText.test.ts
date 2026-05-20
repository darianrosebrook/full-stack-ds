// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../AnimatedText";
// @generated:end

// @generated:start tests
describe("AnimatedText — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-animated-text");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-animated-text");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text");
  });

  it("applies as=h1 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h1" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h1");
  });

  it("applies as=h2 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h2" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h2");
  });

  it("applies as=h3 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h3" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h3");
  });

  it("applies as=h4 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h4" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h4");
  });

  it("applies as=h5 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h5" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h5");
  });

  it("applies as=h6 variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "h6" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--h6");
  });

  it("applies as=p variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "p" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--p");
  });

  it("applies as=span variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "span" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--span");
  });

  it("applies as=div variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "as": "div" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--div");
  });

  it("applies variant=blur-in variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "variant": "blur-in" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--blur-in");
  });

  it("applies variant=fade-up variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "variant": "fade-up" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--fade-up");
  });

  it("applies variant=slide-in variant class", async () => {
    const { element } = await renderElement("fsds-animated-text", { "variant": "slide-in" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("animated-text--slide-in");
  });
});

describe("AnimatedText — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-animated-text");
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
