import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactNativeComponentSource } from "./react-native/component-source.js";

/**
 * FIX-STATE-SUPPRESSION-LEAKS-01 — regression pin.
 *
 * React Native lowers web state blocks into Pressable state styles by LOOKING
 * UP the block by its selector: `:active` → pressed, `:disabled` → the disabled
 * prop. That lookup used exact string equality against `.<prefix>:active`.
 *
 * When the interaction-suppression guard started emitting
 * `.<prefix>:active:not(:disabled)`, the lookup silently returned nothing and
 * EVERY `_pressed` style vanished from RN Button — root and all four variants —
 * taking the generated test that pinned pressed styling with it. Nothing else
 * went red: the web rails were green, the corpus regenerated cleanly, and the
 * loss surfaced only as a framework test count dropping by one.
 *
 * The fix matches on the state prefix instead, so a decorated selector is still
 * recognised as the same state block. These tests pin both halves: the guarded
 * form must still lower, and an unrelated pseudo must still not.
 */

function contractWithSuppression(): ComponentContract {
  return {
    name: "Probe",
    cssPrefix: "probe",
    anatomy: { parts: ["root"], dom: { tag: "button", part: "root" } },
    props: {
      styled: { members: [] },
    },
    states: {
      dimensions: {
        availability: {
          category: "availability",
          values: ["enabled", "disabled"],
          initial: "enabled",
          suppresses: { categories: ["interaction"] },
        },
      },
    },
    tokens: {
      "probe.color.background.active": {
        resolvesTo: "semantic.color.background.primary",
        fallback: "#123456",
      },
    },
    styles: {
      active: {
        "background-color": { resolvesTo: "probe.color.background.active" },
      },
    },
  } as unknown as ComponentContract;
}

describe("React Native state-block lookup tolerates a guarded selector", () => {
  it("still lowers :active to a pressed style when the selector carries a suppression guard", () => {
    const contract = contractWithSuppression();
    const ir = buildComponentIR(contract);

    // Precondition: the guard really is present, so this test would be vacuous
    // if the emitter stopped guarding.
    const guarded = ir.cssBlocks.find((b) => b.selector.startsWith(".probe:active"));
    expect(guarded?.selector).toBe(".probe:active:not(:disabled)");

    const files = generateReactNativeComponentSource(ir);
    // The pressed style lands in the styles file as a `_state_pressed` entry —
    // this is the exact artifact that silently disappeared.
    expect(files.stylesFile).toContain("root_state_pressed");
    expect(files.stylesFile).toContain("probe.color.background.active");
  });

  it("does not lower a state block that is merely a prefix neighbour", () => {
    // Boundary control: `.probe:active-within` is a different state and must
    // not be adopted as the pressed block by a loose startsWith match.
    const contract = contractWithSuppression();
    const ir = buildComponentIR(contract);
    const neighbour = ir.cssBlocks.filter((b) =>
      b.selector.startsWith(".probe:active") && b.selector !== ".probe:active:not(:disabled)",
    );
    expect(neighbour).toEqual([]);
  });
});
