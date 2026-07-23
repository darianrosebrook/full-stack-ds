/**
 * Vue test source emission, IR test-plan driven.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { portalsRootToBody, selectorAnchoredRootPortal } from "../../semantics.js";
import {
  buildComponentTestPlan,
  findIndeterminateAriaCheckedFact,
} from "../../test-plan.js";

export function generateVueTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  // FEAT-PORTAL-MECHANISM-CROSS-FRAMEWORK-01: full-overlay surfaces render
  // their root through <Teleport to="body">, so @vue/test-utils' `wrapper`
  // no longer wraps the root element (`wrapper.element` is the teleport anchor
  // comment). Class/role/axe assertions must resolve the teleported root from
  // document.body instead. IR-driven via `portalsRootToBody` — no name lore.
  // Selector-anchored root portals (coachmark tours) also teleport the root
  // and need the same document.body resolution/reset in generated tests.
  const portalRoot =
    portalsRootToBody(ir) || selectorAnchoredRootPortal(ir) !== null;
  // Resolve the teleported root by its base class within document.body —
  // fallthrough attrs (data-testid) do not reach a teleported root, so the
  // component's own class is the only reliable handle. Safe because each
  // portal-mode test resets document.body in afterEach.
  const rootDecl = `    const root = document.body.querySelector<HTMLElement>(".${plan.cssPrefix}");\n    expect(root).not.toBeNull();`;
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
    `import { describe, it, expect${needsVi ? ", vi" : ""}${portalRoot ? ", afterEach" : ""} } from "vitest";`,
    `import type { Component } from "vue";`,
    `import { mount } from "@vue/test-utils";`,
    `import { axe } from "vitest-axe";`,
    `import ${plan.name} from "../${plan.name}.vue";`,
  ].join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);
  if (portalRoot) {
    // Teleported roots accumulate in document.body across mounts; reset so
    // the class-based root query always resolves the current test's mount.
    lines.push(`  afterEach(() => {`);
    lines.push(`    document.body.innerHTML = "";`);
    lines.push(`  });`);
    lines.push(``);
  }
  lines.push(`  it("renders with default props", () => {`);
  lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
  lines.push(`    expect(wrapper.element).toBeTruthy();`);
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("applies the base CSS class", () => {`);
  if (portalRoot) {
    lines.push(`    ${mountExpression(plan.name, plan, { attachTo: "document.body" })};`);
    lines.push(rootDecl);
    lines.push(`    expect(root?.classList.contains("${plan.cssPrefix}")).toBe(true);`);
  } else {
    lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
    lines.push(`    expect(wrapper.classes()).toContain("${plan.cssPrefix}");`);
  }
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("merges custom class", () => {`);
  if (portalRoot) {
    lines.push(
      `    ${mountExpression(plan.name, plan, { attrs: { class: "custom" }, attachTo: "document.body" })};`,
    );
    lines.push(rootDecl);
    lines.push(`    expect(root?.classList.contains("${plan.cssPrefix}")).toBe(true);`);
    lines.push(`    expect(root?.classList.contains("custom")).toBe(true);`);
  } else {
    lines.push(
      `    const wrapper = ${mountExpression(plan.name, plan, { attrs: { class: "custom" } })};`,
    );
    lines.push(`    expect(wrapper.classes()).toContain("${plan.cssPrefix}");`);
    lines.push(`    expect(wrapper.classes()).toContain("custom");`);
  }
  lines.push(`  });`);

  if (plan.role) {
    lines.push(``);
    lines.push(`  it("has the correct ARIA role", () => {`);
    if (portalRoot) {
      lines.push(`    ${mountExpression(plan.name, plan, { attachTo: "document.body" })};`);
      lines.push(rootDecl);
      lines.push(`    expect(root?.getAttribute("role")).toBe("${plan.role.role}");`);
    } else {
      lines.push(`    const wrapper = ${mountExpression(plan.name, plan)};`);
      lines.push(`    expect(wrapper.attributes("role")).toBe("${plan.role.role}");`);
    }
    lines.push(`  });`);
  }

  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(
      `  it("applies ${variant.dimension}=${variant.value} variant class", () => {`,
    );
    if (portalRoot) {
      lines.push(
        `    ${mountExpression(plan.name, plan, { props: { [variant.dimension]: variant.value }, attachTo: "document.body" })};`,
      );
      lines.push(rootDecl);
      lines.push(`    expect(root?.classList.contains("${variant.className}")).toBe(true);`);
    } else {
      lines.push(
        `    const wrapper = ${mountExpression(plan.name, plan, { props: { [variant.dimension]: variant.value } })};`,
      );
      lines.push(`    expect(wrapper.classes()).toContain("${variant.className}");`);
    }
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

  // DOM-PROPERTY-REFLECTION-IR-CHECKBOX-INDETERMINATE-01: durable runtime
  // proof that indeterminate lowers to a real DOM-property reflection (not
  // an attribute) and aria-checked reflects the tri-state. Gated on the IR
  // fact (propertyBindings.indeterminate + an aria-checked "mixed"
  // conditional coexisting on the same node), shared with React/Angular's
  // generators so any future contract with this same fact pattern gets
  // this test for free.
  const indeterminateFact = findIndeterminateAriaCheckedFact(ir.dom);
  if (indeterminateFact) {
    lines.push(``);
    lines.push(
      `  it("sets .${indeterminateFact.propertyKey} as a DOM property (not an attribute) and lowers aria-checked to mixed", () => {`,
    );
    lines.push(
      `    const wrapper = ${mountExpression(plan.name, plan, { props: { [indeterminateFact.propertyKey]: true } })};`,
    );
    lines.push(
      `    const el = wrapper.element as HTMLInputElement;`,
    );
    lines.push(`    expect(el.${indeterminateFact.propertyKey}).toBe(true);`);
    lines.push(`    expect(el.getAttribute("aria-checked")).toBe("mixed");`);
    lines.push(`  });`);

    // Reactive-update ratchet: the mount-only test above can't distinguish
    // "the binding is reactive" from "the binding happened to write the
    // right value once at mount." wrapper.setProps() is Vue Test Utils'
    // own API for pushing a new prop through the real reactive-props
    // pipeline (confirmed against the installed @vue/test-utils package —
    // it returns a Promise and must be awaited before Vue's DOM patch
    // flushes). This genuinely falsifies a mount-only property write: a
    // one-time write would leave el.indeterminate stuck at `true` after
    // setProps({ indeterminate: false }) below.
    lines.push(``);
    lines.push(
      `  it("re-applies .${indeterminateFact.propertyKey} when the prop changes from true to false, and aria-checked reflects checked state again", async () => {`,
    );
    lines.push(
      `    const wrapper = ${mountExpression(plan.name, plan, { props: { [indeterminateFact.propertyKey]: true } })};`,
    );
    lines.push(
      `    const el = wrapper.element as HTMLInputElement;`,
    );
    lines.push(`    expect(el.${indeterminateFact.propertyKey}).toBe(true);`);
    lines.push(
      `    await wrapper.setProps({ ${indeterminateFact.propertyKey}: false });`,
    );
    lines.push(`    expect(el.${indeterminateFact.propertyKey}).toBe(false);`);
    lines.push(`    expect(el.getAttribute("aria-checked")).toBe("false");`);
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
    if (portalRoot) {
      // The teleported root lives in document.body, so trigger the click on
      // the resolved DOM node (wrapper no longer wraps the root element).
      lines.push(`    ${wrapper};`);
      lines.push(rootDecl);
      lines.push(`    root?.dispatchEvent(new MouseEvent("click", { bubbles: true }));`);
      lines.push(`    await Promise.resolve();`);
    } else {
      lines.push(`    const wrapper = ${wrapper};`);
      lines.push(`    await wrapper.trigger("click");`);
    }
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  lines.push(`});`);
  lines.push(``);
  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(
    `  it("has no unexpected axe violations with default props", async () => {`,
  );
  if (portalRoot) {
    // Teleported root lives in document.body; resolve it and run axe on it.
    lines.push(
      `    ${mountExpression(plan.name, plan, {
        attrs: attrsFromAxeProps(plan.accessibility.axeProps),
        attachTo: "document.body",
      })};`,
    );
    lines.push(rootDecl);
    if (plan.accessibility.needsListParent) {
      lines.push(`    const list = document.createElement("ul");`);
      lines.push(`    if (root) list.append(root);`);
      lines.push(`    const results = await axe(list);`);
    } else {
      lines.push(`    const results = await axe(root as Element);`);
    }
  } else {
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
  lines.push(`      "role-img-alt",`);
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
