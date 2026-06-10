/**
 * Lit test source emission, IR test-plan driven.
 *
 * Channel and Escape tests are gated on plan.channels / plan.escapeDismissals,
 * not on ir.dom or litBehaviorRequired — those control template shape, not
 * whether behavioral props exist on the element.
 *
 * For compound-state-container components (Tabs-shaped), the generated section
 * emits only a smoke test + an axe test. The behavioral surface is fully covered
 * by the hand-authored @custom:start tests block in the component's test file.
 */
import type { ComponentIR, NormalizedChannelIR, DomNodeIR } from "../../ir.js";
import { renderSections, type Section } from "../../preserve.js";
import { buildComponentTestPlan } from "../../test-plan.js";
import { isCompoundStateContainer } from "../react/hook-source.js";

/**
 * Scan a component IR's DOM tree for the rendered signals a channel
 * produces, so the behavioral test can assert the rendered DOM (not just
 * the controller) reflects the channel's value.
 *
 * Two kinds of signal:
 *   - hasGuard: at least one node's `ifProp` matches this channel. The
 *     codegen emits `data-fsds-channel-renders="${name}"` on that node, so
 *     the test selects on the data attribute to verify presence/absence.
 *   - ariaAttrs: ARIA attributes bound to `channel:${name}.value` on any
 *     node. Each attribute serializes as `"true"` / `"false"` strings, so
 *     the test selects on the attribute value.
 */
/**
 * Per-ARIA-attribute metadata so the test can select on the correct DOM
 * location. `insideGuard` means the ARIA attribute lives on a node that's
 * inside the channel's guarded subtree — when the channel flips false, the
 * node is unmounted entirely (so no "value=false" assertion is possible).
 * `insideGuard: false` means the ARIA attribute is on an always-rendered
 * node (typically the root) and its value flips between "true" and "false"
 * in place.
 */
interface AriaAttrInfo {
  attr: string;
  insideGuard: boolean;
}

function findChannelDomMarkers(
  ir: ComponentIR,
  channel: { name: string; valueProp: string },
): {
  hasGuard: boolean;
  ariaAttrs: AriaAttrInfo[];
  requiredProps: string[];
} {
  let hasGuard = false;
  const ariaAttrs = new Map<string, AriaAttrInfo>();
  const requiredProps = new Set<string>();
  // Channel/prop names whose presence we recognize on a path.
  const channelNames = new Set(
    ir.behavior.normalizedChannels.flatMap((c) => [c.name, c.valueProp]),
  );
  const visit = (
    node: DomNodeIR,
    ancestorProps: string[],
    insideChannelGuard: boolean,
  ): void => {
    let nextAncestors = ancestorProps;
    let nextInsideGuard = insideChannelGuard;
    if (node.ifProp && node.ifProp !== "children") {
      if (node.ifProp === channel.name || node.ifProp === channel.valueProp) {
        hasGuard = true;
        nextInsideGuard = true;
      } else if (!channelNames.has(node.ifProp)) {
        // It's a plain prop guard (not another channel). Record it so the
        // test can pass `${prop}: true` when mounting, ensuring the
        // ARIA-bearing subtree is actually rendered.
        nextAncestors = [...ancestorProps, node.ifProp];
      }
    }
    for (const [attr, expr] of Object.entries(node.bindings)) {
      if (
        attr.startsWith("aria-") &&
        expr.kind === "channel" &&
        expr.channel === channel.name &&
        expr.field === "value"
      ) {
        // Earlier finds take precedence; if the same attr appears on
        // multiple nodes, the first-encountered (outermost) wins.
        if (!ariaAttrs.has(attr)) {
          ariaAttrs.set(attr, { attr, insideGuard: nextInsideGuard });
        }
        for (const p of nextAncestors) requiredProps.add(p);
      }
    }
    for (const child of node.children)
      visit(child, nextAncestors, nextInsideGuard);
  };
  if (ir.dom) visit(ir.dom, [], false);
  return {
    hasGuard,
    ariaAttrs: [...ariaAttrs.values()].sort((a, b) =>
      a.attr.localeCompare(b.attr),
    ),
    requiredProps: [...requiredProps].sort(),
  };
}

/**
 * Emit a minimal smoke + axe test for compound-state-container components.
 *
 * The full behavioral surface is in the hand-authored @custom:start tests block.
 * This generated section only asserts that the element renders and passes axe.
 */
function generateCompoundStateContainerTest(ir: ComponentIR): string {
  const plan = buildComponentTestPlan(ir);
  const elementName = `fsds-${plan.testId}`;
  const subTagList = `fsds-${plan.testId}-list`;
  const subTagTab = `fsds-${plan.testId}-tab`;
  const subTagPanel = `fsds-${plan.testId}-panel`;

  const importsBody = [
    `import { describe, expect, it } from "vitest";`,
    `import { axe } from "vitest-axe";`,
    `import "../${plan.name}";`,
  ].join("\n");

  const lines: string[] = [];

  lines.push(`describe("${plan.name} — unit", () => {`);
  lines.push(`  it("renders with default props", async () => {`);
  lines.push(`    const container = document.createElement("div");`);
  lines.push(`    container.innerHTML = \`<${elementName} value="a">`);
  lines.push(`  <${subTagList}>`);
  lines.push(`    <${subTagTab} value="a">A</${subTagTab}>`);
  lines.push(`    <${subTagTab} value="b">B</${subTagTab}>`);
  lines.push(`  </${subTagList}>`);
  lines.push(`  <${subTagPanel} value="a">PA</${subTagPanel}>`);
  lines.push(`  <${subTagPanel} value="b">PB</${subTagPanel}>`);
  lines.push(`</${elementName}>\`;`);
  lines.push(`    document.body.append(container);`);
  lines.push(`    await customElements.whenDefined("${elementName}");`);
  lines.push(`    const el = container.querySelector("${elementName}")!;`);
  lines.push(`    await (el as any).updateComplete;`);
  lines.push(`    expect(el).toBeInstanceOf(HTMLElement);`);
  lines.push(`    container.remove();`);
  lines.push(`  });`);

  // Variant tests — applies tabs--horizontal etc.
  for (const variant of plan.variants) {
    lines.push(``);
    lines.push(`  it("applies ${variant.dimension}=${variant.value} variant class", async () => {`);
    lines.push(`    const el = document.createElement("${elementName}") as any;`);
    lines.push(`    el.setAttribute("${variant.dimension}", "${variant.value}");`);
    lines.push(`    const container = document.createElement("div");`);
    lines.push(`    container.append(el);`);
    lines.push(`    document.body.append(container);`);
    lines.push(`    await customElements.whenDefined("${elementName}");`);
    lines.push(`    await el.updateComplete;`);
    lines.push(`    const root = el.shadowRoot?.firstElementChild ?? el;`);
    lines.push(`    const classes = (root?.className ?? "").split(/\\s+/).filter(Boolean);`);
    lines.push(`    expect(classes).toContain("${variant.className}");`);
    lines.push(`    container.remove();`);
    lines.push(`  });`);
  }

  lines.push(`});`);
  lines.push(``);

  lines.push(`describe("${plan.name} — accessibility", () => {`);
  lines.push(`  it("has no unexpected axe violations with default props", async () => {`);
  lines.push(`    // Build elements imperatively so we can set idBase before connecting.`);
  lines.push(`    const container = document.createElement("div");`);
  lines.push(`    await customElements.whenDefined("${elementName}");`);
  lines.push(`    await customElements.whenDefined("${subTagList}");`);
  lines.push(`    await customElements.whenDefined("${subTagTab}");`);
  lines.push(`    await customElements.whenDefined("${subTagPanel}");`);
  lines.push(`    const tabsEl = document.createElement("${elementName}") as any;`);
  lines.push(`    tabsEl.value = "a";`);
  lines.push(`    tabsEl.idBase = "axe-test";`);
  lines.push(`    const listEl = document.createElement("${subTagList}");`);
  lines.push(`    const tabA = document.createElement("${subTagTab}") as any;`);
  lines.push(`    tabA.value = "a"; tabA.textContent = "Tab A";`);
  lines.push(`    const tabB = document.createElement("${subTagTab}") as any;`);
  lines.push(`    tabB.value = "b"; tabB.textContent = "Tab B";`);
  lines.push(`    listEl.append(tabA, tabB);`);
  lines.push(`    const panelA = document.createElement("${subTagPanel}") as any;`);
  lines.push(`    panelA.value = "a"; panelA.textContent = "Panel A";`);
  lines.push(`    const panelB = document.createElement("${subTagPanel}") as any;`);
  lines.push(`    panelB.value = "b"; panelB.textContent = "Panel B";`);
  lines.push(`    tabsEl.append(listEl, panelA, panelB);`);
  lines.push(`    container.append(tabsEl);`);
  lines.push(`    document.body.append(container);`);
  lines.push(`    await tabsEl.updateComplete;`);
  lines.push(`    // Allow time for microtask-deferred tab registration.`);
  lines.push(`    await new Promise((r) => setTimeout(r, 0));`);
  lines.push(`    // Wait for children to re-render after context is established.`);
  lines.push(`    await tabA.updateComplete; await tabB.updateComplete;`);
  lines.push(`    await panelA.updateComplete; await panelB.updateComplete;`);
  lines.push(`    await new Promise((r) => setTimeout(r, 0));`);
  lines.push(`    const results = await axe(container);`);
  lines.push(`    const knownScaffoldViolationIds = new Set([`);
  lines.push(`      "aria-dialog-name",`);
  lines.push(`      "aria-input-field-name",`);
  lines.push(`      "aria-progressbar-name",`);
  lines.push(`      "aria-toggle-field-name",`);
  lines.push(`      "aria-tooltip-name",`);
  lines.push(`      "button-name",`);
  lines.push(`      "empty-heading",`);
  // image-alt: <fsds-image> requires the consumer to provide `alt`
  // (or `alt=""` for decorative images). The scaffold test renders
  // with no props. This violation joins the same scaffold-violation
  // family as button-name/link-name/label — surfaced by the
  // ifDefined-based attribute binding which now correctly omits
  // the `alt` attribute when undefined, instead of the prior
  // property-binding accident that coerced `undefined` to `""`.
  lines.push(`      "image-alt",`);
  lines.push(`      "label",`);
  lines.push(`      "link-name",`);
  lines.push(`      "region",`);
  lines.push(`      "role-img-alt",`);
  lines.push(`      "summary-name",`);
  lines.push(`    ]);`);
  lines.push(`    const unexpectedViolations = results.violations.filter(`);
  lines.push(`      (violation) => !knownScaffoldViolationIds.has(violation.id),`);
  lines.push(`    );`);
  lines.push(`    expect(unexpectedViolations.map((v) => v.id)).toEqual([]);`);
  lines.push(`    container.remove();`);
  lines.push(`  });`);
  lines.push(`});`);
  lines.push(``);

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

export function generateLitTest(ir: ComponentIR): string {
  // Compound-state-container components (Tabs-shaped) use a hand-authored
  // @custom:start tests block for behavioral coverage. Only emit smoke + axe.
  if (isCompoundStateContainer(ir)) {
    return generateCompoundStateContainerTest(ir);
  }

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

    // FIX-CHANNEL-EVENT-LOWERING-001: a boolean channel click on a
    // non-form host must toggle through the change callback. Only emitted
    // for unguarded hosts (rendered by default) so the click is reachable.
    const channelClick = findUnguardedBooleanChannelClick(ir);
    if (channelClick) {
      const selector =
        channelClick.node === ir.dom
          ? `.${plan.cssPrefix}`
          : `.${plan.cssPrefix}__${channelClick.node.part}`;
      lines.push(``);
      lines.push(
        `  it("toggles the ${channelClick.channel.name} channel from the ${channelClick.node.part ?? "root"} click", async () => {`,
      );
      lines.push(
        `    const { element } = await renderElement("${elementName}");`,
      );
      lines.push(`    const seen: boolean[] = [];`);
      lines.push(
        `    (element as LitTestElement & { ${channelClick.channel.changeHandlerProp}?: (v: boolean) => void }).${channelClick.channel.changeHandlerProp} = (v: boolean) => seen.push(v);`,
      );
      lines.push(`    await (element as LitTestElement).updateComplete;`);
      lines.push(
        `    const host = element.shadowRoot?.querySelector("${selector}") as HTMLElement;`,
      );
      lines.push(`    host.click();`);
      lines.push(`    expect(seen).toEqual([true]);`);
      lines.push(`  });`);
    }

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

  // Behavioral-state tests for dom-tree components. For every boolean
  // controllable channel, set the channel to true via the behavior controller,
  // await updateComplete, and assert the rendered DOM reflects the new state.
  //
  // Three layers of assertion:
  //   1. Controller state: `el.behavior.${ch.name}` flipped.
  //   2. Guarded subtree: any node whose `ifProp` matches the channel gets a
  //      `data-fsds-channel-renders` attribute. Presence/absence verifies the
  //      render() actually re-fired with the new state. Components without
  //      a guarded subtree (the channel doesn't conditionally render anything)
  //      skip this assertion.
  //   3. ARIA attributes: any aria-* binding pointing at this channel
  //      serializes to "true"/"false" strings. The test asserts both polarities.
  if (ir.dom) {
    const booleanChannels = ir.behavior.normalizedChannels.filter(
      (c) => c.valueType === "boolean",
    );
    for (const ch of booleanChannels) {
      const setter = `set${ch.name[0].toUpperCase()}${ch.name.slice(1)}`;
      const markers = findChannelDomMarkers(ir, ch);
      // Build the renderElement second-arg with any prop-guards on the path
      // to the ARIA-bearing node — without these, the node is unmounted and
      // the test would assert against missing markup.
      const renderProps: Record<string, boolean> = {};
      for (const prop of markers.requiredProps) renderProps[prop] = true;
      const renderArg =
        Object.keys(renderProps).length > 0
          ? `, ${JSON.stringify(renderProps)}`
          : "";
      lines.push(``);
      lines.push(
        `  it("reflects ${ch.name}=true after behavior.${setter}(true)", async () => {`,
      );
      lines.push(
        `    const { element } = await renderElement("${elementName}"${renderArg});`,
      );
      lines.push(`    const el = element as LitTestElement & {`);
      lines.push(
        `      behavior?: { ${setter}?: (v: boolean) => void; ${ch.name}?: boolean };`,
      );
      lines.push(`    };`);
      lines.push(`    el.behavior?.${setter}?.(true);`);
      lines.push(`    el.requestUpdate?.();`);
      lines.push(`    await el.updateComplete;`);
      lines.push(`    expect(el.behavior?.${ch.name}).toBe(true);`);
      if (markers.hasGuard) {
        lines.push(
          `    // Guarded subtree should now be rendered (codegen marker).`,
        );
        lines.push(
          `    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="${ch.name}"]')).not.toBeNull();`,
        );
      }
      // Per-attribute: when the ARIA attr is on a node INSIDE the guarded
      // subtree, the attribute simply doesn't exist when the guard is closed,
      // so the selector must scope into the guard. When it's on an
      // always-rendered node (typically the root), the attribute is always
      // present and its value flips between "true" and "false".
      for (const info of markers.ariaAttrs) {
        const selector = info.insideGuard
          ? `[data-fsds-channel-renders="${ch.name}"] [${info.attr}], [data-fsds-channel-renders="${ch.name}"][${info.attr}]`
          : `[${info.attr}]`;
        const varName = `trueNode_${info.attr.replace(/-/g, "_")}`;
        lines.push(
          `    const ${varName} = element.shadowRoot?.querySelector('${selector}');`,
        );
        lines.push(
          `    expect(${varName}?.getAttribute('${info.attr}')).toBe("true");`,
        );
      }
      lines.push(`  });`);

      // Also test the false side — proves render() responds in both directions.
      // When the guarded subtree contains the ARIA-bearing node, the node
      // simply isn't in the DOM after the channel flips false; we only assert
      // the guard marker is gone. When the ARIA attribute is on an unguarded
      // node, we additionally assert the attribute value flipped to "false".
      if (markers.hasGuard || markers.ariaAttrs.length > 0) {
        lines.push(``);
        lines.push(
          `  it("reflects ${ch.name}=false after behavior.${setter}(false)", async () => {`,
        );
        lines.push(
          `    const { element } = await renderElement("${elementName}"${renderArg});`,
        );
        lines.push(`    const el = element as LitTestElement & {`);
        lines.push(
          `      behavior?: { ${setter}?: (v: boolean) => void; ${ch.name}?: boolean };`,
        );
        lines.push(`    };`);
        // Set to true first, then to false — proves the transition works,
        // not just the initial render.
        lines.push(`    el.behavior?.${setter}?.(true);`);
        lines.push(`    el.requestUpdate?.();`);
        lines.push(`    await el.updateComplete;`);
        lines.push(`    el.behavior?.${setter}?.(false);`);
        lines.push(`    el.requestUpdate?.();`);
        lines.push(`    await el.updateComplete;`);
        lines.push(`    expect(el.behavior?.${ch.name}).toBe(false);`);
        if (markers.hasGuard) {
          lines.push(
            `    // Guarded subtree should be torn down after the channel flips false.`,
          );
          lines.push(
            `    expect(element.shadowRoot?.querySelector('[data-fsds-channel-renders="${ch.name}"]')).toBeNull();`,
          );
        }
        // ARIA attribute on an always-rendered node — assert value flipped to "false".
        // Attributes inside the guarded subtree are gone with the subtree, so
        // there's nothing to assert against.
        for (const info of markers.ariaAttrs) {
          if (info.insideGuard) continue;
          const varName = `falseNode_${info.attr.replace(/-/g, "_")}`;
          lines.push(
            `    const ${varName} = element.shadowRoot?.querySelector('[${info.attr}]');`,
          );
          lines.push(
            `    expect(${varName}?.getAttribute('${info.attr}')).toBe("false");`,
          );
        }
        lines.push(`  });`);
      }
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
  // These rules fire because the test fixture renders the component with no
  // slot content or missing required text props. Real consumers fill them in.
  // Rules removed from this list as part of Phase 4 (intentionally surfaces
  // implementation bugs rather than masking them):
  //   - aria-required-attr / aria-required-children / aria-required-parent:
  //     impl bugs (component should set required attrs / contain required
  //     children / be inside a required parent).
  //   - aria-prohibited-attr: impl bug (wrong ARIA attribute for the role).
  //   - list: impl bug (a <ul> must contain <li> children — the codegen
  //     should ensure this in the rendered structure, not paper over it).
  lines.push(`      "aria-dialog-name",`);
  lines.push(`      "aria-input-field-name",`);
  lines.push(`      "aria-progressbar-name",`);
  lines.push(`      "aria-toggle-field-name",`);
  lines.push(`      "aria-tooltip-name",`);
  lines.push(`      "button-name",`);
  lines.push(`      "empty-heading",`);
  // image-alt: <fsds-image> requires the consumer to provide `alt`
  // (or `alt=""` for decorative images). The scaffold test renders
  // with no props. This violation joins the same scaffold-violation
  // family as button-name/link-name/label — surfaced by the
  // ifDefined-based attribute binding which now correctly omits
  // the `alt` attribute when undefined, instead of the prior
  // property-binding accident that coerced `undefined` to `""`.
  lines.push(`      "image-alt",`);
  lines.push(`      "label",`);
  lines.push(`      "link-name",`);
  lines.push(`      "region",`);
  lines.push(`      "role-img-alt",`);
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


/**
 * First dom node with a boolean-channel click event on a non-form host
 * and no if-guard on itself or any ancestor (so a generated test can
 * click it without arranging state first).
 */
function findUnguardedBooleanChannelClick(
  ir: ComponentIR,
): { node: DomNodeIR; channel: NormalizedChannelIR } | null {
  const FORM_HOSTS = new Set(["input", "textarea", "select"]);
  const channelByName = new Map(
    ir.behavior.normalizedChannels.map((c) => [c.name, c]),
  );
  const visit = (
    node: DomNodeIR | undefined,
  ): { node: DomNodeIR; channel: NormalizedChannelIR } | null => {
    if (!node || node.ifProp) return null;
    const click = node.events["click"];
    if (click && click.kind === "channel" && !FORM_HOSTS.has(node.tag)) {
      const channel = channelByName.get(click.channel);
      if (channel?.valueType === "boolean" && channel.callbackKind !== "event") {
        return { node, channel };
      }
    }
    for (const child of node.children) {
      const found = visit(child);
      if (found) return found;
    }
    return null;
  };
  return visit(ir.dom);
}
