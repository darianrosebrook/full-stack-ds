import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";

/**
 * Cross-emitter parity. The contract is the single source of truth, so when
 * the same IR is rendered through React and Vue, the externally observable
 * surface (the props interface) must declare every attribute the template
 * binds. Concretely: a Vue template that binds `:data-testid` must declare
 * `data-testid` in `interface Props {}`, otherwise consumers get TS errors
 * at usage sites.
 *
 * This test exists because the Vue emitter previously omitted `class` and
 * `data-testid` from its Props interface even though it bound both in the
 * template — caught while porting portfolio contracts (Batch 1 pilot).
 */
describe("emitter parity: Vue Props interface declares every bound attribute", () => {
  it("simple primitive without dom tree binds class + data-testid", () => {
    const contract = makeSimpleContract();
    const vue = generateVueComponentSource(buildComponentIR(contract));

    // Template should bind these
    expect(vue).toContain(`:class="classNames"`);
    expect(vue).toContain(`:data-testid="props['data-testid']"`);

    // Props interface must declare them
    expect(propsInterface(vue)).toContain(`class?: string;`);
    expect(propsInterface(vue)).toContain(`"data-testid"?: string;`);
  });

  it("dom-tree primitive (Spinner-shaped) declares class + data-testid in Props", () => {
    const contract = makeDomTreeContract();
    const vue = generateVueComponentSource(buildComponentIR(contract));

    expect(propsInterface(vue)).toContain(`class?: string;`);
    expect(propsInterface(vue)).toContain(`"data-testid"?: string;`);
  });

  it("dialog dom tree adds aria-label and aria-labelledby to Props", () => {
    const contract = makeDialogContract();
    const vue = generateVueComponentSource(buildComponentIR(contract));

    expect(propsInterface(vue)).toContain(`"aria-label"?: string;`);
    expect(propsInterface(vue)).toContain(`"aria-labelledby"?: string;`);
  });

  it("React and Vue Props expose the same root-attribute additions for the same contract", () => {
    const contract = makeSimpleContract();
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    const vue = generateVueComponentSource(buildComponentIR(contract));

    // React declares `className` (its convention), Vue declares `class`.
    // Both must declare data-testid; neither should silently differ on the
    // set of extra root attrs.
    expect(react).toContain(`className?: string;`);
    expect(react).toContain(`"data-testid"?: string;`);
    expect(propsInterface(vue)).toContain(`class?: string;`);
    expect(propsInterface(vue)).toContain(`"data-testid"?: string;`);
  });
});

describe("ARIA boolean-ish attrs satisfy React's Booleanish type", () => {
  it("React: aria-selected on a string channel coerces via String() + ternary", () => {
    const contract = makeAriaBoolContract("aria-selected", "string");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    expect(react).toContain(
      `aria-selected={activeTab !== undefined ? (String(activeTab) as "true" | "false") : undefined}`,
    );
  });

  it("React: aria-expanded on a boolean channel passes through unwrapped", () => {
    const contract = makeAriaBoolContract("aria-expanded", "boolean");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    expect(react).toContain("aria-expanded={activeTab}");
    expect(react).not.toContain("String(activeTab)");
  });

  it("React: non-aria-boolean attrs pass through unwrapped", () => {
    const contract = makeAriaBoolContract("aria-controls", "string");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    expect(react).not.toContain("String(");
  });

  it("Vue: aria-selected on a string channel coerces via undefined-check + Boolean()", () => {
    const contract = makeAriaBoolContract("aria-selected", "string");
    const vue = generateVueComponentSource(buildComponentIR(contract));
    expect(vue).toContain(
      `:aria-selected="behavior.activeTab.value === undefined ? undefined : Boolean(behavior.activeTab.value)"`,
    );
  });
});

describe("textContent binding renders as child text node", () => {
  it("React: textContent prop becomes a child interpolation, not a JSX attr", () => {
    const contract = makeTextContentContract();
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    // The bug: textContent emitted as JSX attribute, which React rejects
    expect(react).not.toContain("textContent={");
    // The fix: emitted as a child expression inside the span tag
    expect(react).toMatch(/<span[^>]*>\s*\{summary\}\s*<\/span>/);
  });

  it("Vue: textContent prop becomes a {{ ... }} interpolation", () => {
    const contract = makeTextContentContract();
    const vue = generateVueComponentSource(buildComponentIR(contract));
    expect(vue).not.toContain("textContent=");
    expect(vue).toContain("{{ props.summary }}");
  });
});

describe("dialog injection respects contract attrs", () => {
  it("React: skips aria-labelledby injection when contract attrs has it", () => {
    const contract = makeDialogWithLiteralLabelledby();
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    // Count aria-labelledby occurrences in the JSX body (rough but precise)
    const matches = react.match(/aria-labelledby/g) ?? [];
    // 1 in Props interface declaration + 1 destructured + 1 in JSX = 3 max
    // (the bug emitted 4: extra duplicate JSX attribute). After fix: ≤3.
    expect(matches.length).toBeLessThanOrEqual(3);
    // Specifically, the JSX line should have the literal once, not twice
    const jsxLine = react
      .split("\n")
      .find((l) => l.includes('role="dialog"') && l.includes("aria-labelledby"));
    expect(jsxLine).toBeTruthy();
    const labelledbyCount = (jsxLine!.match(/aria-labelledby/g) ?? []).length;
    expect(labelledbyCount).toBe(1);
  });

  it("React: still injects aria-label when no literal is present", () => {
    const contract = makeDialogBare();
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    // Inner dialog node receives the forwarded prop
    expect(react).toContain("aria-label={ariaLabel}");
    expect(react).toContain("aria-labelledby={ariaLabelledBy}");
  });
});

describe("renderBinding: host attribute drives event-handler shape", () => {
  it("boolean channel onChange → e.target.checked unwrap", () => {
    const contract = makeChannelContract("onChange", "boolean");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    expect(react).toContain("(e) => setExpanded(e.target.checked)");
    expect(react).not.toMatch(/onClick=\{.*e\.target\.checked/);
  });

  it("boolean channel onClick → toggle callback (no e.target.checked)", () => {
    const contract = makeChannelContract("onClick", "boolean");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    // The bug fix: onClick must NOT reference e.target.checked
    expect(react).not.toContain("e.target.checked");
    // Toggle reads the channel value from closure scope since the
    // generated setter is `(next: T) => void` (no updater form).
    expect(react).toContain("setExpanded(!expanded)");
  });

  it("string channel onChange → e.target.value unwrap", () => {
    const contract = makeChannelContract("onChange", "string");
    const react = generateReactComponentSource(
      buildComponentIR(contract),
      "../../primitives",
    );
    expect(react).toContain("(e) => setExpanded(e.target.value)");
  });

  it("Vue: boolean channel onClick → toggle callback", () => {
    const contract = makeChannelContract("onClick", "boolean");
    const vue = generateVueComponentSource(buildComponentIR(contract));
    // Vue: @click="() => setExpanded(!behavior.expanded.value)" — no .checked
    expect(vue).not.toContain(".checked");
    expect(vue).toContain("setExpanded(!behavior.expanded.value)");
  });
});

/**
 * Tabs-shaped: a non-boolean (string) channel bound to an ARIA boolean-ish
 * attribute. React's `aria-selected` type is `Booleanish`, not raw string —
 * so the emitter must wrap the value in `String(...)`.
 */
function makeAriaBoolContract(
  attr: string,
  valueType: "string" | "boolean" = "string",
): ComponentContract {
  return {
    name: "AriaBool",
    cssPrefix: "ab",
    anatomy: {
      parts: ["root", "tab"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "button",
            part: "tab",
            attrs: { type: "button" },
            bindings: { [attr]: "channel:activeTab.value" },
          },
        ],
      },
    },
    channels: {
      activeTab: {
        value: "value",
        defaultValue: "defaultValue",
        onChange: "onValueChange",
        valueType,
      },
    },
    props: {
      styled: {
        members: [
          { name: "value", type: valueType },
          { name: "defaultValue", type: valueType },
          {
            name: "onValueChange",
            type: `(value: ${valueType}) => void`,
          },
        ],
      },
    },
  };
}

/**
 * Details-shaped contract with a textContent binding on an inner span.
 * The bug emitted this as `<span textContent={summary} />`, which TypeScript
 * rejects because React has no `textContent` prop.
 */
function makeTextContentContract(): ComponentContract {
  return {
    name: "Disclosure",
    cssPrefix: "disclosure",
    anatomy: {
      parts: ["root", "summary", "summaryText"],
      dom: {
        tag: "details",
        part: "root",
        children: [
          {
            tag: "summary",
            part: "summary",
            children: [
              {
                tag: "span",
                part: "summaryText",
                bindings: { textContent: "prop:summary" },
              },
            ],
          },
        ],
      },
    },
    props: {
      styled: {
        members: [
          { name: "summary", type: "string", required: true },
        ],
      },
    },
  };
}

/**
 * Dialog where the contract author has already declared an aria-labelledby
 * literal on the dialog node. The emitter must not also inject a forwarded
 * aria-labelledby — that produced TS17001 (duplicate JSX attribute).
 */
function makeDialogWithLiteralLabelledby(): ComponentContract {
  return {
    name: "DialogLit",
    cssPrefix: "dialog-lit",
    anatomy: {
      parts: ["root", "modal"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "div",
            part: "modal",
            attrs: {
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": "dialog-title-id",
            },
          },
        ],
      },
    },
    props: {
      styled: {
        members: [{ name: "open", type: "boolean" }],
      },
    },
  };
}

/**
 * Dialog with no contract-level aria-labelledby — emitter should still
 * inject the prop-forwarded attribute so axe finds an accessible name.
 */
function makeDialogBare(): ComponentContract {
  return {
    name: "DialogBare",
    cssPrefix: "dialog-bare",
    anatomy: {
      parts: ["root", "modal"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          { tag: "div", part: "modal", attrs: { role: "dialog" } },
        ],
      },
    },
    props: {
      styled: {
        members: [{ name: "open", type: "boolean" }],
      },
    },
  };
}

function makeChannelContract(
  hostAttr: "onChange" | "onClick",
  valueType: "boolean" | "string",
): ComponentContract {
  return {
    name: "Toggleable",
    cssPrefix: "toggleable",
    anatomy: {
      parts: ["root", "trigger"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          {
            tag: "button",
            part: "trigger",
            attrs: { type: "button" },
            bindings: {
              [hostAttr]: "channel:expanded.onChange",
            },
          },
        ],
      },
    },
    channels: {
      expanded: {
        value: "expanded",
        defaultValue: "defaultExpanded",
        onChange: "onExpandedChange",
        valueType,
      },
    },
    props: {
      styled: {
        members: [
          { name: "expanded", type: valueType },
          { name: "defaultExpanded", type: valueType },
          {
            name: "onExpandedChange",
            type: `(value: ${valueType}) => void`,
          },
        ],
      },
    },
  };
}

function propsInterface(source: string): string {
  // Extract the Vue `interface Props { ... }` block. We assert on this region
  // alone so test failures point at the right place rather than matching
  // template content that happens to look like a prop declaration.
  const match = source.match(/interface Props \{[\s\S]*?\n\}/);
  if (!match) throw new Error("Vue source has no `interface Props` block");
  return match[0];
}

function makeSimpleContract(): ComponentContract {
  return {
    name: "Simple",
    cssPrefix: "simple",
    anatomy: { parts: ["root"] },
    props: {
      styled: {
        members: [{ name: "label", type: "string" }],
      },
    },
  };
}

function makeDomTreeContract(): ComponentContract {
  return {
    name: "Spinner",
    cssPrefix: "spinner",
    anatomy: {
      parts: ["root", "visual"],
      dom: {
        tag: "div",
        part: "root",
        children: [
          { tag: "span", part: "visual", attrs: { "aria-hidden": "true" } },
        ],
      },
    },
    props: {
      styled: {
        members: [{ name: "label", type: "string" }],
      },
    },
  };
}

function makeDialogContract(): ComponentContract {
  return {
    name: "Dialog",
    cssPrefix: "dialog",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "div",
        part: "root",
        attrs: { role: "dialog" },
      },
    },
    props: {
      styled: {
        members: [{ name: "open", type: "boolean" }],
      },
    },
  };
}
