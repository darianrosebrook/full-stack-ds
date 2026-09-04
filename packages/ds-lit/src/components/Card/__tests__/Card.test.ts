// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Card";
// @generated:end

// @generated:start tests
const componentAxeOptions = {
  rules: {
    // `region` asks whether all page content is landmark-contained.
    // These tests scan one component subtree, not a complete page.
    region: { enabled: false },
  },
};

describe("Card — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-card");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { stack } = await renderElement("fsds-card");
    expect(classTokens(stack)).toContain("card");
  });

  it("applies status=completed variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "completed" });
    expect(classTokens(stack)).toContain("card--completed");
  });

  it("applies status=in-progress variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "in-progress" });
    expect(classTokens(stack)).toContain("card--in-progress");
  });

  it("applies status=planned variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "planned" });
    expect(classTokens(stack)).toContain("card--planned");
  });

  it("applies status=deprecated variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "deprecated" });
    expect(classTokens(stack)).toContain("card--deprecated");
  });

  it("applies status=category variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "category" });
    expect(classTokens(stack)).toContain("card--category");
  });

  it("applies status=complexity variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "status": "complexity" });
    expect(classTokens(stack)).toContain("card--complexity");
  });

  it("applies density=default variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "density": "default" });
    expect(classTokens(stack)).toContain("card--default");
  });

  it("applies density=inset variant class", async () => {
    const { stack } = await renderElement("fsds-card", { "density": "inset" });
    expect(classTokens(stack)).toContain("card--inset");
  });
});

describe("Card — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-card", { "aria-label": "Test Card" });
    const results = await axe(element, componentAxeOptions);
    expect(results.violations.map((v) => v.id)).toEqual([]);
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

interface AccessibilityContent {
  slotName?: string;
  html: string;
}

function classTokens(element: Element | null | undefined): string[] {
  return (element?.className ?? "").split(/\s+/).filter(Boolean);
}

async function renderElement(tagName: string, props: Record<string, unknown> = {}, content: AccessibilityContent[] = []): Promise<RenderedElement> {
  const element = document.createElement(tagName) as LitTestElement;
  for (const fixture of content) {
    const template = document.createElement("template");
    template.innerHTML = fixture.html;
    const child = template.content.firstElementChild as HTMLElement | null;
    if (child && fixture.slotName) child.slot = fixture.slotName;
    element.append(template.content.cloneNode(true));
  }
  const container = document.createElement("div");
  container.append(element);
  document.body.append(container);
  await customElements.whenDefined(tagName);
  for (const [key, value] of Object.entries(props)) {
    (element as unknown as Record<string, unknown>)[key] = value;
    if (typeof value === "boolean") {
      if (value) element.setAttribute(key, "");
    } else {
      element.setAttribute(key, String(value));
    }
  }
  element.requestUpdate?.();
  await element.updateComplete;
  // Named slots can schedule one follow-up render via slotchange.
  await Promise.resolve();
  await element.updateComplete;
  return { element, stack: element.shadowRoot?.querySelector("fsds-stack") };
}
// @generated:end

// @custom:start tests

// @custom:end
