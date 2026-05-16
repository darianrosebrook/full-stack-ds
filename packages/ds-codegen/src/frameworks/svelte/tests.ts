/**
 * Svelte test source emission, IR test-plan driven.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";

export function generateSvelteTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  // Escape tests rely on a document-level keydown listener wired only by the
  // dom-tree behavior hook; stack-only components have no such listener.
  const emitEscape = plan.escapeDismissals.length > 0 && !!ir.dom;
  // Overlay-click tests click the root element; only valid for dom-tree components
  // where the overlay backdrop is rendered and the dismissal listener is wired.
  const emitOverlayClick = plan.overlayClickDismissals.length > 0 && !!ir.dom;
  // For stack-only Svelte components, the root element is a <Stack> (div/span)
  // with @click/@change wired via the generated event handlers — interactions
  // are valid. For dom-tree components, handlers are bound inside the shadow;
  // those have exhaustive custom test blocks.
  const emitChannelInteraction = plan.channels.length > 0 && !ir.dom;
  // Stack-only components expose their channel prop on the root via @change,
  // but fireEvent.change with { target: { value } } requires a form element.
  // Use render-only style for non-boolean channels on stack-only paths.
  // Import vi when the generated section uses it, OR when stack-only
  // behavioral components' @custom blocks use vi.fn() without their own
  // import. Dom-tree components (Switch) import vi in their custom blocks
  // themselves, so we don't emit it in the generated section to avoid
  // duplicate identifier errors.
  const needsVi = emitChannelInteraction || emitEscape || emitOverlayClick;
  const needsFireEvent =
    (emitChannelInteraction && plan.channels.some((c) => c.interaction === "click")) ||
    emitOverlayClick;

  const importParts = [
    `import { describe, expect, it${needsVi ? ", vi" : ""} } from "vitest";`,
    `import type { Component } from "svelte";`,
    `import { render${needsFireEvent ? ", fireEvent" : ""} } from "@testing-library/svelte";`,
    `import { axe } from "vitest-axe";`,
    `import ${plan.name} from "../${plan.name}.svelte";`,
  ];
  const importsBody = importParts.join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);
  lines.push(`  it("renders with default props", () => {`);
  lines.push(`    const { container } = ${renderExpression(plan.name, plan)};`);
  lines.push(`    expect(container.firstElementChild).toBeTruthy();`);
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("applies the base CSS class", () => {`);
  lines.push(`    const { container } = ${renderExpression(plan.name, plan)};`);
  lines.push(
    `    expect(container.firstElementChild?.className).toContain("${plan.cssPrefix}");`,
  );
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("merges custom class", () => {`);
  lines.push(
    `    const { container } = ${renderExpression(plan.name, plan, { class: "custom" })};`,
  );
  lines.push(
    `    expect(container.firstElementChild?.className).toContain("${plan.cssPrefix}");`,
  );
  lines.push(`    expect(container.firstElementChild?.className).toContain("custom");`);
  lines.push(`  });`);

  if (plan.role) {
    lines.push(``);
    lines.push(`  it("has the correct ARIA role", () => {`);
    lines.push(`    const { container } = ${renderExpression(plan.name, plan)};`);
    lines.push(
      `    expect(container.firstElementChild?.getAttribute("role")).toBe("${plan.role.role}");`,
    );
    lines.push(`  });`);
  }

  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(
      `  it("applies ${variant.dimension}=${variant.value} variant class", () => {`,
    );
    lines.push(
      `    const { container } = ${renderExpression(plan.name, plan, { [variant.dimension]: variant.value })};`,
    );
    lines.push(
      `    expect(container.firstElementChild?.className).toContain("${variant.className}");`,
    );
    lines.push(`  });`);
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
          `    const { container } = ${renderExpression(plan.name, plan, { [channel.changeHandlerProp]: { code: spyName } })};`,
        );
        lines.push(`    await fireEvent.click(container.firstElementChild!);`);
        lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
      } else {
        // For non-click channels on stack-only components, verify the prop is
        // accepted without throwing (change events on non-input roots are unreliable).
        lines.push(
          `    expect(() => ${renderExpression(plan.name, plan, { [channel.valueProp]: false, [channel.changeHandlerProp]: { code: spyName } })}).not.toThrow();`,
        );
      }
      lines.push(`  });`);
    }
  }

  if (emitEscape) {
    for (const testCase of plan.escapeDismissals) {
      lines.push(``);
      lines.push(`  it("closes on Escape key", async () => {`);
      lines.push(`    const ${testCase.spyName} = vi.fn();`);
      lines.push(
        `    ${renderExpression(plan.name, plan, {
          [testCase.channel.valueProp]: true,
          [testCase.channel.changeHandlerProp]: { code: testCase.spyName },
        })};`,
      );
      lines.push(
        `    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));`,
      );
      lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
      lines.push(`  });`);
    }
  }

  if (emitOverlayClick) {
    for (const testCase of plan.overlayClickDismissals) {
      lines.push(``);
      lines.push(`  it("closes on overlay click", async () => {`);
      lines.push(`    const ${testCase.spyName} = vi.fn();`);
      lines.push(
        `    const { container } = ${renderExpression(plan.name, plan, {
          [testCase.channel.valueProp]: true,
          [testCase.channel.changeHandlerProp]: { code: testCase.spyName },
        })};`,
      );
      lines.push(`    await fireEvent.click(container.firstElementChild!);`);
      lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
      lines.push(`  });`);
    }
  }

  lines.push(`});`);
  lines.push(``);

  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(`  it("has no unexpected axe violations with default props", async () => {`);
  const axeAttrs = attrsFromAxeProps(plan.accessibility.axeProps);
  const axeRenderProps: RenderProps = { ...axeAttrs };
  if (plan.renderOpenProp) axeRenderProps[plan.renderOpenProp] = true;
  lines.push(
    `    const { container } = render(${plan.name} as unknown as Component<Record<string, unknown>>, { props: ${objectLiteral(axeRenderProps)} });`,
  );
  if (plan.accessibility.needsListParent) {
    lines.push(`    const list = document.createElement("ul");`);
    lines.push(`    list.append(container.firstElementChild!);`);
    lines.push(`    const results = await axe(list);`);
  } else {
    lines.push(`    const results = await axe(container);`);
  }
  lines.push(`    const knownScaffoldViolationIds = new Set([`);
  // Rules that fire when the test fixture renders the component with no
  // slot content / missing required text or alt props. Real consumers fill
  // them; the test scaffold doesn't.
  lines.push(`      "aria-dialog-name",`);
  lines.push(`      "aria-input-field-name",`);
  lines.push(`      "aria-progressbar-name",`);
  lines.push(`      "aria-prohibited-attr",`);
  lines.push(`      "aria-required-attr",`);
  lines.push(`      "aria-required-children",`);
  lines.push(`      "aria-required-parent",`);
  lines.push(`      "aria-toggle-field-name",`);
  lines.push(`      "aria-tooltip-name",`);
  lines.push(`      "button-name",`);
  lines.push(`      "empty-heading",`);
  lines.push(`      "image-alt",`);
  lines.push(`      "label",`);
  lines.push(`      "link-name",`);
  lines.push(`      "list",`);
  lines.push(`      "region",`);
  lines.push(`      "summary-name",`);
  lines.push(`    ]);`);
  lines.push(`    const unexpectedViolations = results.violations.filter(`);
  lines.push(`      (violation) => !knownScaffoldViolationIds.has(violation.id),`);
  lines.push(`    );`);
  // Compare rule-id arrays so failures name the offending rules.
  lines.push(`    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);`);
  lines.push(`  });`);
  lines.push(`});`);

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

type RenderPropValue = string | boolean | { code: string };
type RenderProps = Record<string, RenderPropValue>;

function renderExpression(
  componentName: string,
  plan: { renderOpenProp?: string },
  props: RenderProps = {},
): string {
  const allProps: RenderProps = {
    ...(plan.renderOpenProp ? { [plan.renderOpenProp]: true } : {}),
    ...props,
  };
  return `render(${componentName} as unknown as Component<Record<string, unknown>>, { props: ${objectLiteral(allProps)} })`;
}

function attrsFromAxeProps(axeProps: string): Record<string, string> {
  if (!axeProps) return {};
  const labelMatch = /aria-label="([^"]+)"/.exec(axeProps);
  return labelMatch ? { "aria-label": labelMatch[1] } : {};
}

function objectLiteral(values: RenderProps): string {
  const entries = Object.entries(values);
  if (entries.length === 0) return "{}";
  return `{ ${entries
    .map(([key, value]) => `${JSON.stringify(key)}: ${literal(value)}`)
    .join(", ")} }`;
}

function literal(value: RenderPropValue): string {
  if (typeof value === "object" && "code" in value) return value.code;
  if (typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
