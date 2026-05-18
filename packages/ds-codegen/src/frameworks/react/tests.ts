/**
 * React test source emission, IR-driven.
 *
 * Test generation derives every framework-neutral fact from `ComponentIR`;
 * only React Testing Library / vitest-axe shape lives here.
 */
import type { ComponentIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";
import { generateReactSurfaceTest } from "./surface-tests.js";

/**
 * Map a channel `valueType` to a placeholder JS literal for use in
 * generated render-only test JSX. The emitter previously hardcoded
 * `{false}` for every controlled channel, which produced TS2322
 * errors when the channel type was actually string, number, union,
 * or Date.
 *
 * Coverage across the 53 component contracts (verified by
 * `grep -h "\"valueType\":" packages/ds-contracts/*.contract.json`):
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
function channelValuePlaceholder(valueType: string | undefined): string {
  if (valueType === "boolean") return "false";
  if (valueType === "number") return "0";
  if (valueType === "string") return '""';
  if (valueType === "string | string[]") return '""';
  if (valueType === "Date | Date[] | null") return "null";
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
  // class-token-only plan.
  if (ir.surface) {
    return generateReactSurfaceTest(ir);
  }
  const plan = buildComponentTestPlan(ir);
  const allImports = [plan.name, ...plan.compoundImports].join(", ");
  const renderProps = plan.renderOpenProp ? ` ${plan.renderOpenProp}={true}` : "";
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
    `    render(<${plan.name} data-testid="${plan.testId}"${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toBeInTheDocument();`,
  );
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("applies the base CSS class", () => {`);
  lines.push(
    `    render(<${plan.name} data-testid="${plan.testId}"${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toHaveClass("${plan.cssPrefix}");`,
  );
  lines.push(`  });`);
  lines.push(``);

  lines.push(`  it("merges custom className", () => {`);
  lines.push(
    `    render(<${plan.name} data-testid="${plan.testId}" className="custom"${renderProps}${closer});`,
  );
  lines.push(
    `    expect(screen.getByTestId("${plan.testId}")).toHaveClass("${plan.cssPrefix}", "custom");`,
  );
  lines.push(`  });`);

  if (plan.role) {
    lines.push(``);
    lines.push(`  it("has the correct ARIA role", () => {`);
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}"${closer});`,
    );
    lines.push(
      `    expect(screen.getByTestId("${plan.testId}")).toHaveAttribute("role", "${plan.role.role}");`,
    );
    lines.push(`  });`);
  }

  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(`  it("applies ${variant.dimension}=${variant.value} variant class", () => {`);
    lines.push(
      `    render(<${plan.name} data-testid="${plan.testId}" ${variant.dimension}="${variant.value}"${renderProps}${closer});`,
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
        `    render(<${plan.name} data-testid="${plan.testId}" ${channel.changeHandlerProp}={${spyName}}${renderProps}${closer});`,
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
        `    expect(() => render(<${plan.name} data-testid="${plan.testId}" ${channel.valueProp}={${placeholder}} ${channel.changeHandlerProp}={${spyName}}${renderPropsForChannel}${closer})).not.toThrow();`,
      );
    } else {
      // Non-boolean channel: fire a synthetic change event with target.value
      lines.push(
        `    render(<${plan.name} data-testid="${plan.testId}" ${channel.changeHandlerProp}={${spyName}}${renderProps}${closer});`,
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
      `    render(<${plan.name} data-testid="${plan.testId}" ${testCase.channel.valueProp}={true} ${testCase.channel.changeHandlerProp}={${testCase.spyName}}${closer});`,
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
      `    render(<${plan.name} data-testid="${plan.testId}" ${testCase.channel.valueProp}={true} ${testCase.channel.changeHandlerProp}={${testCase.spyName}}${closer});`,
    );
    lines.push(
      `    fireEvent.click(screen.getByTestId("${plan.testId}"));`,
    );
    lines.push(`    expect(${testCase.spyName}).toHaveBeenCalledWith(false);`);
    lines.push(`  });`);
  }

  lines.push(`});`);
  lines.push(``);

  const axeJsx = plan.accessibility.needsListParent
    ? `<ul><${plan.name}${plan.accessibility.axeProps}${renderProps}${closer}</ul>`
    : `<${plan.name}${plan.accessibility.axeProps}${renderProps}${closer}`;

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
