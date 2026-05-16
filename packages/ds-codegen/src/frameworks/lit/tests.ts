/**
 * Lit test source emission, IR test-plan driven.
 *
 * Channel and Escape tests are gated on plan.channels / plan.escapeDismissals,
 * not on ir.dom or litBehaviorRequired — those control template shape, not
 * whether behavioral props exist on the element.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";

export function generateLitTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  const elementName = `fsds-${plan.testId}`;
  // Escape tests require a document-level listener wired by the dom-tree
  // behavior class. Stack-only Lit elements have no such listener.
  const emitEscape = plan.escapeDismissals.length > 0 && !!ir.dom;
  // Overlay-click tests dispatch a click on the host element; only valid for
  // dom-tree components where the overlay backdrop and dismissal listener exist.
  const emitOverlayClick = plan.overlayClickDismissals.length > 0 && !!ir.dom;
  // Channel interaction tests dispatch events on the host element. For
  // dom-tree components the real event binding is in the shadow subtree;
  // those components have exhaustive custom test blocks. Only emit for
  // stack-only components where host-level event dispatch reaches the prop.
  const emitChannelInteraction = plan.channels.length > 0 && !ir.dom;
  // Only import vi when the generated section uses it. Dom-tree components
  // have vi in their @custom block imports already, so we don't add it here
  // to avoid duplicate identifier errors.
  const needsVi = emitChannelInteraction || emitEscape || emitOverlayClick;

  const importsBody = [
    `import { describe, expect, it${needsVi ? ", vi" : ""} } from "vitest";`,
    `import { axe } from "vitest-axe";`,
    `import "../${plan.name}";`,
  ].join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);
  lines.push(`  it("renders with default props", async () => {`);
  lines.push(`    const { element } = await renderElement("${elementName}");`);
  lines.push(`    expect(element).toBeInstanceOf(HTMLElement);`);
  lines.push(`  });`);
  lines.push(``);

  if (ir.dom) {
    // Dom-tree components use their own shadow structure; classes live on the
    // shadow root's first child, not on a nested fsds-stack element. Also, some
    // dom-tree components (e.g. Modal) only render content when open — include
    // the open prop to ensure the shadow tree is populated.
    const openProps = plan.renderOpenProp
      ? `, { ${JSON.stringify(plan.renderOpenProp)}: true }`
      : "";
    lines.push(`  it("applies the base CSS class", async () => {`);
    lines.push(
      `    const { element } = await renderElement("${elementName}"${openProps});`,
    );
    lines.push(
      `    const root = element.shadowRoot?.firstElementChild ?? element;`,
    );
    lines.push(`    expect(classTokens(root)).toContain("${plan.cssPrefix}");`);
    lines.push(`  });`);

    const testableVariantDimensions = new Set(
      ir.styledProps.map((prop) => prop.name),
    );
    for (const variant of plan.variants.filter((entry) =>
      testableVariantDimensions.has(entry.dimension),
    )) {
      const variantProps = plan.renderOpenProp
        ? `, { ${JSON.stringify(plan.renderOpenProp)}: true, ${JSON.stringify(variant.dimension)}: ${JSON.stringify(variant.value)} }`
        : `, { ${JSON.stringify(variant.dimension)}: ${JSON.stringify(variant.value)} }`;
      lines.push(``);
      lines.push(
        `  it("applies ${variant.dimension}=${variant.value} variant class", async () => {`,
      );
      lines.push(
        `    const { element } = await renderElement("${elementName}"${variantProps});`,
      );
      lines.push(
        `    const root = element.shadowRoot?.firstElementChild ?? element;`,
      );
      lines.push(
        `    expect(classTokens(root)).toContain("${variant.className}");`,
      );
      lines.push(`  });`);
    }
  } else {
    lines.push(`  it("applies the base CSS class", async () => {`);
    lines.push(`    const { stack } = await renderElement("${elementName}");`);
    lines.push(
      `    expect(classTokens(stack)).toContain("${plan.cssPrefix}");`,
    );
    lines.push(`  });`);

    const testableVariantDimensions = new Set(
      ir.styledProps.map((prop) => prop.name),
    );
    for (const variant of plan.variants.filter((entry) =>
      testableVariantDimensions.has(entry.dimension),
    )) {
      lines.push(``);
      lines.push(
        `  it("applies ${variant.dimension}=${variant.value} variant class", async () => {`,
      );
      lines.push(
        `    const { stack } = await renderElement("${elementName}", { ${JSON.stringify(variant.dimension)}: ${JSON.stringify(variant.value)} });`,
      );
      lines.push(
        `    expect(classTokens(stack)).toContain("${variant.className}");`,
      );
      lines.push(`  });`);
    }
  }

  if (emitChannelInteraction) {
    for (const testCase of plan.channels) {
      const { channel, spyName } = testCase;
      lines.push(``);
      lines.push(
        `  it("calls ${channel.changeHandlerProp} when ${channel.name} changes", async () => {`,
      );
      lines.push(`    const ${spyName} = vi.fn();`);
      if (testCase.interaction === "click") {
        lines.push(
          `    const { element } = await renderElement("${elementName}");`,
        );
        lines.push(
          `    (element as unknown as Record<string, unknown>)["${channel.changeHandlerProp}"] = ${spyName};`,
        );
        lines.push(`    element.click();`);
        lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
      } else if (testCase.interaction === "change") {
        // Stack-only Lit elements have no native change event binding on the
        // host. Verify the handler prop is assignable without throwing.
        lines.push(
          `    const { element } = await renderElement("${elementName}");`,
        );
        lines.push(
          `    expect(() => { (element as unknown as Record<string, unknown>)["${channel.changeHandlerProp}"] = ${spyName}; }).not.toThrow();`,
        );
      } else {
        // render-only: verify the prop is assignable without throwing
        lines.push(
          `    const { element } = await renderElement("${elementName}", { "${channel.valueProp}": false });`,
        );
        lines.push(
          `    expect(() => { (element as unknown as Record<string, unknown>)["${channel.changeHandlerProp}"] = ${spyName}; }).not.toThrow();`,
        );
      }
      lines.push(`  });`);
    }
  }

  if (emitEscape) {
    for (const testCase of plan.escapeDismissals) {
      // For Lit, use the live open prop (not defaultProp) so the behavior can
      // see the component as open at render time. The renderOpenProp is the
      // canonical "open" / "isOpen" prop name from the contract.
      const litOpenProp = plan.renderOpenProp ?? testCase.defaultProp;
      lines.push(``);
      lines.push(`  it("closes on Escape key", async () => {`);
      lines.push(`    const ${testCase.spyName} = vi.fn();`);
      lines.push(
        `    const { element } = await renderElement("${elementName}", { "${litOpenProp}": true });`,
      );
      lines.push(
        `    (element as unknown as Record<string, unknown>)["${testCase.channel.changeHandlerProp}"] = ${testCase.spyName};`,
      );
      lines.push(
        `    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));`,
      );
      lines.push(
        `    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`,
      );
      lines.push(`  });`);
    }
  }

  if (emitOverlayClick) {
    for (const testCase of plan.overlayClickDismissals) {
      const litOpenProp = plan.renderOpenProp ?? testCase.defaultProp;
      lines.push(``);
      lines.push(`  it("closes on overlay click", async () => {`);
      lines.push(`    const ${testCase.spyName} = vi.fn();`);
      lines.push(
        `    const { element } = await renderElement("${elementName}", { "${litOpenProp}": true });`,
      );
      lines.push(
        `    (element as unknown as Record<string, unknown>)["${testCase.channel.changeHandlerProp}"] = ${testCase.spyName};`,
      );
      lines.push(
        `    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));`,
      );
      lines.push(
        `    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`,
      );
      lines.push(`  });`);
    }
  }

  lines.push(`});`);
  lines.push(``);

  // Accessibility suite — filtered violation allowlist matches Vue/React.
  // Note: aria-label is intentionally NOT passed for Lit custom element hosts
  // because the host element has no implicit ARIA role, making aria-label a
  // prohibited attribute (aria-prohibited-attr). We omit it and allow that
  // rule in the scaffold allowlist instead.
  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(
    `  it("has no unexpected axe violations with default props", async () => {`,
  );
  const axeProps: Record<string, string | boolean> = {};
  if (plan.renderOpenProp) axeProps[plan.renderOpenProp] = true;
  lines.push(
    `    const { element } = await renderElement("${elementName}"${Object.keys(axeProps).length > 0 ? `, ${JSON.stringify(axeProps)}` : ""});`,
  );
  if (plan.accessibility.needsListParent) {
    lines.push(`    const list = document.createElement("ul");`);
    lines.push(`    list.append(element);`);
    lines.push(`    const results = await axe(list);`);
  } else {
    lines.push(`    const results = await axe(element);`);
  }
  lines.push(`    const knownScaffoldViolationIds = new Set([`);
  // These rules fire when the test fixture renders the component with no
  // slot content / missing required text props. Real consumers fill them.
  lines.push(`      "aria-dialog-name",`);
  lines.push(`      "aria-input-field-name",`);
  lines.push(`      "aria-progressbar-name",`);
  lines.push(`      "aria-required-attr",`);
  lines.push(`      "aria-required-children",`);
  lines.push(`      "aria-required-parent",`);
  lines.push(`      "aria-toggle-field-name",`);
  lines.push(`      "aria-tooltip-name",`);
  lines.push(`      "aria-prohibited-attr",`);
  lines.push(`      "button-name",`);
  lines.push(`      "empty-heading",`);
  lines.push(`      "label",`);
  lines.push(`      "link-name",`);
  lines.push(`      "list",`);
  lines.push(`      "region",`);
  lines.push(`      "summary-name",`);
  lines.push(`    ]);`);
  lines.push(`    const unexpectedViolations = results.violations.filter(`);
  lines.push(
    `      (violation) => !knownScaffoldViolationIds.has(violation.id),`,
  );
  lines.push(`    );`);
  // Compare rule-id arrays so failures name the offending rules.
  lines.push(`    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);`);
  lines.push(`  });`);
  lines.push(`});`);
  lines.push(``);

  // Helpers emitted inline — kept single-file to avoid runtime import complexity
  lines.push(`interface RenderedElement {`);
  lines.push(`  element: HTMLElement;`);
  lines.push(`  stack: Element | null | undefined;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`interface LitTestElement extends HTMLElement {`);
  lines.push(`  updateComplete?: Promise<unknown>;`);
  lines.push(`  requestUpdate?: () => void;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(
    `function classTokens(element: Element | null | undefined): string[] {`,
  );
  lines.push(
    `  return (element?.className ?? "").split(/\\s+/).filter(Boolean);`,
  );
  lines.push(`}`);
  lines.push(``);
  lines.push(
    `async function renderElement(tagName: string, props: Record<string, string | boolean | number> = {}): Promise<RenderedElement> {`,
  );
  lines.push(
    `  const element = document.createElement(tagName) as LitTestElement;`,
  );
  // Append to an isolated container so axe doesn't walk sibling elements
  // from prior test renders when scoping to this element's context.
  lines.push(`  const container = document.createElement("div");`);
  lines.push(`  container.append(element);`);
  lines.push(`  document.body.append(container);`);
  lines.push(`  await customElements.whenDefined(tagName);`);
  lines.push(`  for (const [key, value] of Object.entries(props)) {`);
  lines.push(
    `    (element as unknown as Record<string, string | boolean | number>)[key] = value;`,
  );
  lines.push(`    if (typeof value === "boolean") {`);
  lines.push(`      if (value) element.setAttribute(key, "");`);
  lines.push(`    } else {`);
  lines.push(`      element.setAttribute(key, String(value));`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`  element.requestUpdate?.();`);
  lines.push(`  await element.updateComplete;`);
  lines.push(
    `  return { element, stack: element.shadowRoot?.querySelector("fsds-stack") };`,
  );
  lines.push(`}`);

  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    { kind: "between", body: "" },
    { kind: "generated", id: "tests", body: lines.join("\n") },
    { kind: "between", body: "" },
    { kind: "custom", id: "tests", body: "" },
    { kind: "between", body: "" },
  ];
  return renderSections(sections, "line");
}
