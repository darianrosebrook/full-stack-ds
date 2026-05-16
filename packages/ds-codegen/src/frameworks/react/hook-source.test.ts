import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateReactHookSource } from "./hook-source.js";

/**
 * Hook emitter regression tests for defects 1.2 and 1.5: the hook generator
 * previously wired any channel (regardless of valueType) into `useAnchorToggle`
 * as if it were a boolean open-state channel, and referenced
 * `options.defaultOpen` even when the interface generator hadn't emitted that
 * prop (because the channel had no `defaultValue` field).
 */
describe("hook-source: useAnchorToggle channel selection", () => {
  it("number-valued channel is NOT passed to useAnchorToggle as open", () => {
    const contract = makeWalkthroughShapedContract();
    const source = generateReactHookSource(buildComponentIR(contract))!;
    // The bug: useAnchorToggle({ open: options.step }) — a number into a
    // boolean slot. After the fix, anchor-toggle either gets no open
    // wiring (when no boolean channel exists) or its open state is internal.
    expect(source).not.toMatch(/open: options\.index/);
    expect(source).not.toMatch(/open: options\.step/);
  });

  it("picks the boolean `open` channel even when other channels exist", () => {
    const contract = makeSelectShapedContract();
    const source = generateReactHookSource(buildComponentIR(contract))!;
    // useAnchorToggle should wire the `open` channel (boolean), not `value`
    // (string|string[]).
    expect(source).toContain("open: options.open");
    expect(source).not.toMatch(/open: options\.value/);
  });

  it("literal defaultOpen when channel has no defaultValueProp", () => {
    const contract = makeToastShapedContract();
    const source = generateReactHookSource(buildComponentIR(contract))!;
    // Toast's `open` channel has no defaultValue field. The body must NOT
    // reference `options.defaultOpen` (which the interface never declared).
    expect(source).not.toMatch(/options\.defaultOpen/);
    expect(source).toContain("defaultOpen: false");
  });

  it("options interface omits defaultOpen when channel lacks defaultValue", () => {
    const contract = makeToastShapedContract();
    const source = generateReactHookSource(buildComponentIR(contract))!;
    // Confirm the interface really doesn't declare defaultOpen — the bug was
    // a mismatch between interface and body.
    const ifaceMatch = source.match(
      /interface UseToastShapedOptions \{[\s\S]*?\n\}/,
    );
    expect(ifaceMatch).toBeTruthy();
    expect(ifaceMatch![0]).not.toContain("defaultOpen");
  });
});

/** Walkthrough-shape: one number channel `step` + portal. */
function makeWalkthroughShapedContract(): ComponentContract {
  return {
    name: "WalkthroughShaped",
    cssPrefix: "ws",
    anatomy: { parts: ["root"] },
    channels: {
      step: {
        value: "index",
        defaultValue: "defaultIndex",
        onChange: "onStepChange",
        valueType: "number",
      },
    },
    portal: { enabled: true },
    dismissal: { triggers: [{ event: "outsideClick" }] },
    props: {
      styled: {
        members: [
          { name: "index", type: "number" },
          { name: "defaultIndex", type: "number" },
          { name: "onStepChange", type: "(value: number) => void" },
        ],
      },
    },
  };
}

/** Select-shape: `open` (boolean) + `value` (string|string[]). */
function makeSelectShapedContract(): ComponentContract {
  return {
    name: "SelectShaped",
    cssPrefix: "ss",
    anatomy: { parts: ["root"] },
    channels: {
      open: {
        value: "open",
        defaultValue: "defaultOpen",
        onChange: "onOpenChange",
        valueType: "boolean",
      },
      value: {
        value: "value",
        defaultValue: "defaultValue",
        onChange: "onChange",
        valueType: "string | string[]",
      },
    },
    portal: { enabled: true },
    dismissal: { triggers: [{ event: "outsideClick" }] },
    props: {
      styled: {
        members: [
          { name: "open", type: "boolean" },
          { name: "defaultOpen", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
          { name: "value", type: "string | string[]" },
          { name: "defaultValue", type: "string | string[]" },
          { name: "onChange", type: "(value: string | string[]) => void" },
        ],
      },
    },
  };
}

/** Toast-shape: boolean `open` channel without defaultValue + portal. */
function makeToastShapedContract(): ComponentContract {
  return {
    name: "ToastShaped",
    cssPrefix: "ts",
    anatomy: { parts: ["root"] },
    channels: {
      open: {
        value: "open",
        onChange: "onOpenChange",
        valueType: "boolean",
      },
    },
    portal: { enabled: true },
    dismissal: { triggers: [{ event: "escape" }] },
    props: {
      styled: {
        members: [
          { name: "open", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
        ],
      },
    },
  };
}
