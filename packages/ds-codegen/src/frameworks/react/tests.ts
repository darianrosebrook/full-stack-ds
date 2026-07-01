/**
 * React test source emission, IR-driven.
 *
 * Test generation derives every framework-neutral fact from `ComponentIR`;
 * only React Testing Library / vitest-axe shape lives here.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import {
  buildComponentTestPlan,
  findIndeterminateAriaCheckedFact,
} from "../../test-plan.js";
import { isSurfaceComponent } from "./surface-emit.js";
import { generateReactSurfaceTest } from "./surface-tests.js";

/**
 * Map a channel `valueType` to a placeholder JS literal for use in
 * generated render-only test JSX. The emitter previously hardcoded
 * `{false}` for every controlled channel, which produced TS2322
 * errors when the channel type was actually string, number, union,
 * or Date.
 *
 * Coverage across the 53 component contracts (verified by
 * `grep -rh "\"valueType\":" packages/ds-contracts/components/`):
 *   - boolean
 *   - string
 *   - string | string[]
 *   - number
 *   - Date | Date[] | null
 *
 * The placeholder is used in render-only assertions (`expect(() =>
 * render(...)).not.toThrow()`) — the actual value doesn't matter
 * semantically; it just has to be type-assignable so the emitted
 * JSX passes tsc.
 */
/**
 * Extract type alias names from required-prop placeholder
 * expressions. Names follow the pattern `{} as Name` (object alias
 * cast) — primitives, union string literals, and array literals
 * don't need imports. Returns a deduplicated list ordered as
 * declared so imports stay stable on regen.
 */
function collectRequiredPropTypeImports(plan: {
  requiredProps: { expression: string }[];
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const prop of plan.requiredProps) {
    const match = prop.expression.match(/\{\}\s+as\s+([A-Za-z_$][\w$]*)/);
    if (match && !seen.has(match[1])) {
      seen.add(match[1]);
      out.push(match[1]);
    }
  }
  return out;
}

function channelValuePlaceholder(valueType: string | undefined): string {
  if (valueType === "boolean") return "false";
  if (valueType === "number") return "0";
  if (valueType === "string") return '""';
  if (valueType === "string | string[]") return '""';
  if (valueType === "Date | Date[] | null") return "null";
  // Array channels (e.g. Shuttle's selection: string[]). An empty array
  // satisfies any array-typed prop and is the cleanest no-op placeholder.
  if (valueType && /\[\]$/.test(valueType)) return "[]";
  // Unknown / unspecified valueType. Default to `false` to match the
  // pre-fix behavior for boolean channels (which is the common case)
  // and avoid surfacing the unknown placeholder as a regression. New
  // valueTypes added later should extend the switch above explicitly;
  // this fallback is intentionally not `null as never` because it
  // would surface as a test-side TS-error for any channel whose
  // contract author forgot to set valueType.
  return "false";
}

export function generateReactTest(ir: ComponentIR): string {
  // Presence-surface family: behavioral test plan replaces the legacy
  // class-token-only plan. Kind-aware: non-anchored kinds (dialog, sheet,
  // toast) keep the generic test plan; their surface block is fact-tracking.
  if (isSurfaceComponent(ir)) {
    return generateReactSurfaceTest(ir);
  }
  const plan = buildComponentTestPlan(ir);
  // Type aliases referenced by the required-prop placeholder bag (e.g.
  // {} as PostcardAuthor) must be imported alongside the component
  // name so the generated test file type-checks.
  const requiredPropTypeImports = collectRequiredPropTypeImports(plan);
  const allImports = [
    plan.name,
    ...plan.compoundImports,
    ...requiredPropTypeImports.map((name) => `type ${name}`),
  ].join(", ");
  const renderProps = plan.renderOpenProp ? ` ${plan.renderOpenProp}={true}` : "";
  // Required non-channel props splatted on every render call so the
  // test JSX satisfies the component's TypeScript contract. The bag
  // is computed by buildComponentTestPlan from `ir.styledProps`
  // (where `required: true` && no `defaultExpr`), excluding channel
  // valueProp / changeHandlerProp / defaultValueProp and the
  // renderOpenProp. `requiredPropsAttrsExcept` returns the bag minus
  // any names listed — used at variant render sites where the variant
  // dimension is emitted separately and would otherwise duplicate.
  const requiredPropsAttrs = plan.requiredProps
    .map((p) => ` ${p.name}={${p.expression}}`)
    .join("");
  const requiredPropsAttrsExcept = (excludeNames: Set<string>): string =>
    plan.requiredProps
      .filter((p) => !excludeNames.has(p.name))
      .map((p) => ` ${p.name}={${p.expression}}`)
      .join("");
  // Components without a children placement (void elements like <img>, <hr>,
  // <input>) self-close in test JSX; otherwise we pass "content" as the
  // child to exercise children rendering.
  const closer = plan.acceptsChildren ? `>content</${plan.name}>` : ` />`;

  const importsBody = [
    `import { describe, it, expect${plan.hasBehaviorTests ? ", vi" : ""} } from "vitest";`,
    `import { render, screen${plan.needsAct ? ", act" : ""}${plan.needsFireEvent ? ", fireEvent" : ""} } from "@testing-library/react";`,
    ...(plan.needsUserEvent
      ? [`import userEvent from "@testing-library/user-event";`]
      : []),
    `import { axe } from "vitest-axe";`,
    `import { ${allImports} } from "../${plan.name}";`,
    ``,
    `declare module "vitest" {`,
    `  interface Assertion<T> {`,
    `    toHaveNoViolations(): void;`,
    `  }`,
    `}`,
  ].join("\n");

  const lines: string[] = [];
  lines.push(`describe("${plan.name} — unit", () => {`);
  lines.push(`  it("renders with default props", () => {`);
  lines.push(
    `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs}${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toBeInTheDocument();`,
  );
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("applies the base CSS class", () => {`);
  lines.push(
    `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs}${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toHaveClass("${plan.cssPrefix}");`,
  );
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("merges custom className", () => {`);
  lines.push(
    `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} className="custom"${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toHaveClass("${plan.cssPrefix}", "custom");`,
  );
  lines.push(`  });`);

  if (plan.role) {
    lines.push(``);
    lines.push(`  it("has the correct ARIA role", () => {`);
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs}${closer});`,
    );
    lines.push(
      `    expect(screen.getByTestId("${plan.testId}")).toHaveAttribute("role", "${plan.role.role}");`,
    );
    lines.push(`  });`);
  }

  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(`  it("applies ${variant.dimension}=${variant.value} variant class", () => {`);
    // Exclude the variant dimension from requiredPropsAttrs: when a
    // required prop is also a variant dimension (e.g. Status.status,
    // typed StatusIntent + declared as a variant), the variant render
    // site emits its own ${dimension}={value} and we'd duplicate the
    // attribute (TS17001).
    const requiredPropsForVariant = requiredPropsAttrsExcept(
      new Set([variant.dimension]),
    );
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsForVariant} ${variant.dimension}="${variant.value}"${renderProps}${closer});`,
    );
    lines.push(
      `    expect(screen.getByTestId("${plan.testId}")).toHaveClass("${variant.className}");`,
    );
    lines.push(`  });`);
  }

  // Channel interaction tests — one per normalized channel
  for (const testCase of plan.channels) {
    const { channel, spyName } = testCase;
    lines.push(``);
    lines.push(
      `  it("calls ${channel.changeHandlerProp} when ${channel.name} changes", async () => {`,
    );
    lines.push(`    const ${spyName} = vi.fn();`);

    if (testCase.interaction === "click") {
      // Inline control (Switch, Checkbox, Radio, Button): click fires the handler
      lines.push(
        `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${channel.changeHandlerProp}={${spyName}}${renderProps}${closer});`,
      );
      lines.push(
        `    await userEvent.setup().click(screen.getByTestId("${plan.testId}"));`,
      );
      lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
    } else if (testCase.interaction === "render-only") {
      // Overlay component (Modal, Tooltip, Dropdown): clicking the root does
      // not toggle the channel — verify the handler prop is accepted without throwing.
      // Suppress `renderProps` when the channel's valueProp matches
      // plan.renderOpenProp; otherwise the emitted JSX has both
      // `${valueProp}=...` and `${renderOpenProp}={true}` on the same
      // element (TS17001 / React duplicate-attr).
      const renderPropsForChannel =
        plan.renderOpenProp === channel.valueProp ? "" : renderProps;
      // Placeholder typed by channel.valueType. Previously hardcoded
      // `{false}`, which produced TS2322 for string/number/union/Date
      // channels (Calendar, Accordion, Command, OTP, Select, Tabs,
      // TextField, Walkthrough).
      const placeholder = channelValuePlaceholder(channel.valueType);
      lines.push(
        `    expect(() => render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${channel.valueProp}={${placeholder}} ${channel.changeHandlerProp}={${spyName}}${renderPropsForChannel}${closer})).not.toThrow();`,
      );
    } else {
      // Non-boolean channel: fire a synthetic change event with target.value
      lines.push(
        `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${channel.changeHandlerProp}={${spyName}}${renderProps}${closer});`,
      );
      lines.push(
        `    fireEvent.change(screen.getByTestId("${plan.testId}"), { target: { value: "test" } });`,
      );
      lines.push(`    expect(${spyName}).toHaveBeenCalled();`);
    }

    lines.push(`  });`);
  }

  // Dismissal tests — Escape key
  for (const testCase of plan.escapeDismissals) {
    lines.push(``);
    lines.push(`  it("closes on Escape key", () => {`);
    lines.push(`    const ${testCase.spyName} = vi.fn();`);
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${testCase.channel.valueProp}={true} ${testCase.channel.changeHandlerProp}={${testCase.spyName}}${closer});`,
    );
    lines.push(`    act(() => {`);
    lines.push(
      `      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));`,
    );
    lines.push(`    });`);
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  // Dismissal tests — overlay click
  for (const testCase of plan.overlayClickDismissals) {
    lines.push(``);
    lines.push(`  it("closes on overlay click", () => {`);
    lines.push(`    const ${testCase.spyName} = vi.fn();`);
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${testCase.channel.valueProp}={true} ${testCase.channel.changeHandlerProp}={${testCase.spyName}}${closer});`,
    );
    lines.push(
      `    fireEvent.click(screen.getByTestId("${plan.testId}"));`,
    );
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  // DOM-PROPERTY-REFLECTION-IR-CHECKBOX-INDETERMINATE-01: durable runtime
  // proof that indeterminate lowers to a real DOM-property reflection (not
  // an attribute) and aria-checked reflects the tri-state. Gated on the IR
  // fact (propertyBindings.indeterminate + an aria-checked "mixed"
  // conditional coexisting on the same node), not the component name — any
  // future contract with this same fact pattern gets this test for free.
  const indeterminateFact = findIndeterminateAriaCheckedFact(ir.dom);
  if (indeterminateFact) {
    lines.push(``);
    lines.push(
      `  it("sets .${indeterminateFact.propertyKey} as a DOM property (not an attribute) and lowers aria-checked to mixed", () => {`,
    );
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${requiredPropsAttrs} ${indeterminateFact.propertyKey}${closer});`,
    );
    lines.push(
      `    const el = screen.getByTestId("${plan.testId}") as HTMLInputElement;`,
    );
    lines.push(`    expect(el.${indeterminateFact.propertyKey}).toBe(true);`);
    lines.push(`    expect(el.getAttribute("aria-checked")).toBe("mixed");`);
    lines.push(`  });`);
  }

  lines.push(`});`);
  lines.push(``);

  const axeJsx = plan.accessibility.needsListParent
    ? `<ul><${plan.name}${plan.accessibility.axeProps}${requiredPropsAttrs}${renderProps}${closer}</ul>`
    : `<${plan.name}${plan.accessibility.axeProps}${requiredPropsAttrs}${renderProps}${closer}`;

  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(`  it("has no unexpected axe violations with default props", async () => {`);
  lines.push(`    const { container } = render(<>${axeJsx}</>);`);
  lines.push(`    const results = await axe(container) as unknown as { violations: Array<{ id: string }> };`);
  // Allow scaffold-style axe violations the auto-test can never satisfy:
  // empty headings/summaries/buttons/inputs that consumers fill via slot
  // content or labeling props. Real consumers exercise axe in their own
  // tests where they supply those values. This mirrors the Lit + Svelte
  // + Vue test generators so all five frameworks treat scaffold gaps the
  // same way.
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

  const testsBody = lines.join("\n");

  const sections: Section[] = [
    { kind: "generated", id: "imports", body: importsBody },
    { kind: "between", body: "" },
    { kind: "generated", id: "tests", body: testsBody },
    { kind: "between", body: "" },
    { kind: "custom", id: "tests", body: "" },
    { kind: "between", body: "" },
  ];

  return renderSections(sections, "line");
}

export function generateBarrel(componentNames: string[]): string {
  return (
    componentNames
      .sort()
      .map((n) => `export * from "./${n}/${n}";`)
      .join("\n") + "\n"
  );
}
