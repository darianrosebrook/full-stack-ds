import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../../contract.js";
import { buildComponentIR } from "../../ir.js";
import { generateReactHookSource } from "./hook-source.js";
import { generateVueHookSource } from "../vue/hook-source.js";
import { generateSvelteHookSource } from "../svelte/hook-source.js";
import { generateAngularHookSource } from "../angular/hook-source.js";
import { generateLitHookSource } from "../lit/hook-source.js";

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

// ---------------------------------------------------------------------------
// FIX-PORTAL-CONSUMPTION-01 — the portal-consumption gate, pinned both ways.
//
// The bug this pins: hooks emitted `renderInPortal` / `portalTarget`
// scaffolding whenever `portal.enabled` was set, but nothing consumed it
// unless the component-source actually portaled its root. The corrected gate
// is `portalsRootToBody` (portal.enabled AND a full-overlay surface). React
// is the only framework with a consumption path; the other four have none, so
// they must emit NO portal scaffolding regardless of the contract.
// ---------------------------------------------------------------------------

/** Any token that would appear in a hook only when it emits portal scaffolding. */
const PORTAL_HOOK_TOKENS = [
  "renderInPortal",
  "portalTarget",
  "usePortal",
  "createPortal",
  "PortalController",
] as const;

function assertNoPortalScaffolding(source: string | null, framework: string): void {
  const present = PORTAL_HOOK_TOKENS.filter((t) => (source ?? "").includes(t));
  expect(
    present,
    `${framework} hook must emit no unconsumed portal scaffolding, found: ${present.join(", ")}`,
  ).toEqual([]);
}

/**
 * Dialog-shape: boolean `open` channel + portal.enabled + a full-overlay
 * `centered` surface whose content part carries a content role. This is the
 * shape that DOES portal in React (portalsRootToBody === true).
 */
function makePortaledOverlayContract(): ComponentContract {
  return {
    name: "OverlayShaped",
    cssPrefix: "os",
    anatomy: {
      parts: ["root", "panel"],
      details: {
        root: { role: "root" },
        panel: { role: "region", aria: { role: "dialog" } },
      },
    },
    channels: {
      open: {
        value: "open",
        defaultValue: "defaultOpen",
        onChange: "onOpenChange",
        valueType: "boolean",
      },
    },
    portal: { enabled: true },
    surface: {
      kind: "dialog",
      presence: "persistent",
      modality: "blocking",
      content: { part: "panel", interactive: true },
      positioning: { strategy: "centered" },
      dismissal: ["escape"],
    },
    dismissal: { triggers: [{ event: "escape" }] },
    props: {
      styled: {
        members: [
          { name: "open", type: "boolean" },
          { name: "defaultOpen", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
        ],
      },
    },
  } as ComponentContract;
}

/**
 * portal.enabled but NO qualifying surface (no surface block at all) — the
 * shape that must NOT portal in any framework (portalsRootToBody === false;
 * Command/Select/Calendar/Walkthrough are real instances).
 */
function makePortalNoSurfaceContract(): ComponentContract {
  return {
    name: "NoSurfaceShaped",
    cssPrefix: "ns",
    anatomy: { parts: ["root"], details: { root: { role: "root" } } },
    channels: {
      open: {
        value: "open",
        defaultValue: "defaultOpen",
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
          { name: "defaultOpen", type: "boolean" },
          { name: "onOpenChange", type: "(open: boolean) => void" },
        ],
      },
    },
  } as ComponentContract;
}

describe("hook-source: portal-consumption gate (FIX-PORTAL-CONSUMPTION-01)", () => {
  it("portal.enabled + full-overlay surface → React hook emits the portal primitive", () => {
    const ir = buildComponentIR(makePortaledOverlayContract());
    const source = generateReactHookSource(ir)!;
    // React is the only framework whose component-source consumes the portal,
    // so its hook must expose the renderInPortal helper for the qualifying
    // shape (the positive direction — the primitive is emitted when consumed).
    expect(source).toContain("usePortal");
    expect(source).toContain("renderInPortal: portal.render");
  });

  it("portal.enabled + full-overlay surface → Vue/Svelte/Angular/Lit hooks emit NO portal scaffolding", () => {
    const ir = buildComponentIR(makePortaledOverlayContract());
    // Even for the shape React portals, the other four frameworks have no
    // consumption path — they must not emit dead portalTarget scaffolding.
    assertNoPortalScaffolding(generateVueHookSource(ir), "vue");
    assertNoPortalScaffolding(generateSvelteHookSource(ir), "svelte");
    assertNoPortalScaffolding(generateAngularHookSource(ir), "angular");
    assertNoPortalScaffolding(generateLitHookSource(ir), "lit");
  });

  it("portal.enabled without a qualifying surface → NO framework hook emits portal scaffolding", () => {
    const ir = buildComponentIR(makePortalNoSurfaceContract());
    // portalsRootToBody === false: no surface means nothing to portal, so even
    // React must not emit the primitive (this is the orphaned-computation bug
    // for Command/Select/Calendar/Walkthrough).
    assertNoPortalScaffolding(generateReactHookSource(ir), "react");
    assertNoPortalScaffolding(generateVueHookSource(ir), "vue");
    assertNoPortalScaffolding(generateSvelteHookSource(ir), "svelte");
    assertNoPortalScaffolding(generateAngularHookSource(ir), "angular");
    assertNoPortalScaffolding(generateLitHookSource(ir), "lit");
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
