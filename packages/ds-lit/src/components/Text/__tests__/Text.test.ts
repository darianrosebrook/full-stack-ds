// @generated:start imports
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import "../Text";
// @generated:end

// @generated:start tests
describe("Text — unit", () => {
  it("renders with default props", async () => {
    const { element } = await renderElement("fsds-text");
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("applies the base CSS class", async () => {
    const { element } = await renderElement("fsds-text");
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text");
  });

  it("applies variant=display variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "display" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--display");
  });

  it("applies variant=headline variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "headline" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--headline");
  });

  it("applies variant=title variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "title" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--title");
  });

  it("applies variant=body variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "body" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--body");
  });

  it("applies variant=caption variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "caption" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--caption");
  });

  it("applies variant=overline variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "overline" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--overline");
  });

  it("applies variant=code variant class", async () => {
    const { element } = await renderElement("fsds-text", { "variant": "code" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--code");
  });

  it("applies size=xs variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "xs" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--xs");
  });

  it("applies size=sm variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "sm" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--sm");
  });

  it("applies size=md variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "md" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--md");
  });

  it("applies size=lg variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "lg" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--lg");
  });

  it("applies size=xl variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "xl" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--xl");
  });

  it("applies size=2xl variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "2xl" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--2xl");
  });

  it("applies size=3xl variant class", async () => {
    const { element } = await renderElement("fsds-text", { "size": "3xl" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--3xl");
  });

  it("applies weight=light variant class", async () => {
    const { element } = await renderElement("fsds-text", { "weight": "light" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--light");
  });

  it("applies weight=normal variant class", async () => {
    const { element } = await renderElement("fsds-text", { "weight": "normal" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--normal");
  });

  it("applies weight=medium variant class", async () => {
    const { element } = await renderElement("fsds-text", { "weight": "medium" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--medium");
  });

  it("applies weight=semibold variant class", async () => {
    const { element } = await renderElement("fsds-text", { "weight": "semibold" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--semibold");
  });

  it("applies weight=bold variant class", async () => {
    const { element } = await renderElement("fsds-text", { "weight": "bold" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--bold");
  });

  it("applies align=left variant class", async () => {
    const { element } = await renderElement("fsds-text", { "align": "left" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--left");
  });

  it("applies align=center variant class", async () => {
    const { element } = await renderElement("fsds-text", { "align": "center" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--center");
  });

  it("applies align=right variant class", async () => {
    const { element } = await renderElement("fsds-text", { "align": "right" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--right");
  });

  it("applies align=justify variant class", async () => {
    const { element } = await renderElement("fsds-text", { "align": "justify" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--justify");
  });

  it("applies transform=none variant class", async () => {
    const { element } = await renderElement("fsds-text", { "transform": "none" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--none");
  });

  it("applies transform=uppercase variant class", async () => {
    const { element } = await renderElement("fsds-text", { "transform": "uppercase" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--uppercase");
  });

  it("applies transform=lowercase variant class", async () => {
    const { element } = await renderElement("fsds-text", { "transform": "lowercase" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--lowercase");
  });

  it("applies transform=capitalize variant class", async () => {
    const { element } = await renderElement("fsds-text", { "transform": "capitalize" });
    const root = element.shadowRoot?.firstElementChild ?? element;
    expect(classTokens(root)).toContain("text--capitalize");
  });
});

describe("Text — accessibility", () => {
  it("has no unexpected axe violations with default props", async () => {
    const { element } = await renderElement("fsds-text");
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
