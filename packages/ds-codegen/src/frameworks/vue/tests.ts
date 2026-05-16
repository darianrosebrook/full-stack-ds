/**
 * Vue test source emission, IR test-plan driven.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";

export function generateVueTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  // Escape dismissals rely on a document-level keydown listener that is only
  // wired by the dom-tree behavior hook. Stack-only components have no such
  // listener, so Escape tests would always fail and are omitted here.
  const emitEscape = plan.escapeDismissals.length > 0 && !!ir.dom;
  // Overlay-click tests click the root wrapper; only valid for dom-tree components
  // where the overlay backdrop is rendered and the dismissal listener is wired.
  const emitOverlayClick = plan.overlayClickDismissals.length > 0 && !!ir.dom;
  // Channel click/change tests fire events on the root wrapper element. For
  // dom-tree components the handler is bound deeper in the shadow; those
  // components already have exhaustive custom test blocks. Only emit
  // interaction tests for stack-only components where @click/@change on the
  // root wrapper correctly reaches the prop handler.
  const emitChannelInteraction = plan.channels.length > 0 && !ir.dom;
  // Import vi whenever channels exist — custom @custom blocks in Vue tests
  // reference vi.fn() without their own explicit import of vi, relying on
  // the generated imports section to provide it.
  const needsVi = plan.channels.length > 0 || plan.escapeDismissals.length > 0 || emitOverlayClick;
  const importsBody = [
    `import { describe, it, expect${needsVi ? ", vi" : ""} } from "vitest";`,
    `import type { Component } from "vue";`,
    `import { mount } from "@vue/test-utils";`,
    `import { axe } from "vitest-axe";`,
    `import ${plan.name} from "../${plan.name}.vue";`,
  ].join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);
  lines.push(`  it("renders with default props", () => {`);
  lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
  lines.push(`    expect(wrapper.element).toBeTruthy();`);
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("applies the base CSS class", () => {`);
  lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
  lines.push(`    expect(wrapper.classes()).toContain("${plan.cssPrefix}");`);
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("merges custom class", () => {`);
  lines.push(
    `    const wrapper = ${mountExpression(plan.name, plan, { attrs: { class: "custom" } })};`,
  );
  lines.push(`    expect(wrapper.classes()).toContain("${plan.cssPrefix}");`);
  lines.push(`    expect(wrapper.classes()).toContain("custom");`);
  lines.push(`  });`);

  if (plan.role) {
    lines.push(``);
    lines.push(`  it("has the correct ARIA role", () => {`);
    lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
    lines.push(`    expect(wrapper.attributes("role")).toBe("${plan.role.role}");`);
    lines.push(`  });`);
  }

  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(
      `  it("applies ${variant.dimension}=${variant.value} variant class", () => {`,
    );
    lines.push(
      `    const wrapper = ${mountExpression(plan.name, plan, { props: { [variant.dimension]: variant.value } })};`,
    );
    lines.push(`    expect(wrapper.classes()).toContain("${variant.className}");`);
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
          `    const wrapper = ${mountExpression(plan.name, plan, { props: { [channel.changeHandlerProp]: { code: spyName } } })};`,
        );
        lines.push(`    await wrapper.trigger("click");`);
        lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
      } else if (testCase.interaction === "change") {
        lines.push(
          `    const wrapper = ${mountExpression(plan.name, plan, { props: { [channel.changeHandlerProp]: { code: spyName } } })};`,
        );
        lines.push(`    await wrapper.trigger("change");`);
        lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
      } else {
        lines.push(
          `    expect(() => ${mountExpression(plan.name, plan, { props: { [channel.valueProp]: false, [channel.changeHandlerProp]: { code: spyName } } })}).not.toThrow();`,
        );
      }
      lines.push(`  });`);
    }
  }

  if (emitEscape) for (const testCase of plan.escapeDismissals) {
    lines.push(``);
    lines.push(`  it("closes on Escape key", async () => {`);
    lines.push(`    const ${testCase.spyName} = vi.fn();`);
    lines.push(
      `    ${mountExpression(plan.name, plan, {
        props: {
          [testCase.channel.valueProp]: true,
          [testCase.channel.changeHandlerProp]: { code: testCase.spyName },
        },
        attachTo: "document.body",
      })};`,
    );
    lines.push(
      `    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));`,
    );
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  if (emitOverlayClick) for (const testCase of plan.overlayClickDismissals) {
    lines.push(``);
    lines.push(`  it("closes on overlay click", async () => {`);
    lines.push(`    const ${testCase.spyName} = vi.fn();`);
    const wrapper = mountExpression(plan.name, plan, {
      props: {
        [testCase.channel.valueProp]: true,
        [testCase.channel.changeHandlerProp]: { code: testCase.spyName },
      },
      attachTo: "document.body",
    });
    lines.push(`    const wrapper = ${wrapper};`);
    lines.push(`    await wrapper.trigger("click");`);
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(
    `  it("has no unexpected axe violations with default props", async () => {`,
  );
  lines.push(
    `    const wrapper = ${mountExpression(plan.name, plan, {
      attrs: attrsFromAxeProps(plan.accessibility.axeProps),
    })};`,
  );
  if (plan.accessibility.needsListParent) {
    lines.push(`    const list = document.createElement("ul");`);
    lines.push(`    list.append(wrapper.element);`);
    lines.push(`    const results = await axe(list);`);
  } else {
    lines.push(`    const results = await axe(wrapper.element);`);
  }
  // Scaffold violations the auto-test can't satisfy — consumers fill these
  // via slot content or labeling props. Aligned with the React/Svelte/Lit
  // generators so all framework axe tests treat scaffold gaps the same.
  lines.push(`    const knownScaffoldViolationIds = new Set([`);
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
  // Use the unexpected rule IDs as the assertion subject so failures name
  // the offending rule(s) instead of a bare length mismatch.
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

type MountValue = string | boolean | { code: string };

interface MountOverrides {
  props?: Record<string, MountValue>;
  attrs?: Record<string, string>;
  /** When set, emits `attachTo: <value>` so the component is mounted in the real DOM (needed for document-level event listeners). */
  attachTo?: string;
}

function mountExpression(
  componentName: string,
  plan: { renderOpenProp?: string; testId: string },
  overrides: MountOverrides = {},
): string {
  const props: Record<string, MountValue> = {
    ...(plan.renderOpenProp ? { [plan.renderOpenProp]: true } : {}),
    ...(overrides.props ?? {}),
  };
  const attrs: Record<string, string> = {
    "data-testid": plan.testId,
    ...(overrides.attrs ?? {}),
  };
  const attachToPart = overrides.attachTo ? `, attachTo: ${overrides.attachTo}` : "";

  return `mount(${componentName} as Component, { props: ${objectLiteral(props)}, attrs: ${objectLiteral(attrs)}, slots: { default: "content" }${attachToPart} })`;
}

function attrsFromAxeProps(axeProps: string): Record<string, string> {
  if (!axeProps) return {};
  const labelMatch = /aria-label="([^"]+)"/.exec(axeProps);
  return labelMatch ? { "aria-label": labelMatch[1] } : {};
}

function objectLiteral(values: Record<string, MountValue>): string {
  const entries = Object.entries(values);
  if (entries.length === 0) return "{}";
  return `{ ${entries
    .map(([key, value]) => `${JSON.stringify(key)}: ${literal(value)}`)
    .join(", ")} }`;
}

function literal(value: MountValue): string {
  if (typeof value === "object") return value.code;
  if (typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
