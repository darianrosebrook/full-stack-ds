import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
import { resolveNativeDisclosureActivation } from "./semantics.js";
import { generateReactComponentSource } from "./frameworks/react/component-source.js";
import { generateVueComponentSource } from "./frameworks/vue/component-source.js";
import { generateSvelteComponentSource } from "./frameworks/svelte/component-source.js";
import { generateAngularComponentSource } from "./frameworks/angular/component-source.js";
import { generateLitComponentSource } from "./frameworks/lit/component-source.js";

function fixture() {
  const contract = JSON.parse(readFileSync(resolve(__dirname, "../../ds-contracts/components/Details/Details.contract.json"), "utf8")) as ComponentContract;
  contract.name = "DisclosureFixture";
  return buildComponentIR(contract);
}

const emitters = {
  react: (ir: ReturnType<typeof fixture>) => generateReactComponentSource(ir, "../../primitives"),
  vue: generateVueComponentSource,
  svelte: generateSvelteComponentSource,
  angular: generateAngularComponentSource,
  lit: generateLitComponentSource,
};

describe("native disclosure activation", () => {
  it("is selected by the summary click binding and boolean channel, not component identity", () => {
    const ir = fixture();
    const channels = new Map(ir.behavior.normalizedChannels.map(ch => [ch.name, ch]));
    const binding = { kind: "channel", channel: "open", field: "onChange" } as const;
    expect(resolveNativeDisclosureActivation("summary", "click", binding, channels)).toEqual(channels.get("open"));
    for (const [tag, event] of [["button", "click"], ["details", "toggle"], ["summary", "keydown"]]) {
      expect(resolveNativeDisclosureActivation(tag, event, binding, channels)).toBeNull();
    }
    expect(resolveNativeDisclosureActivation("summary", "click", { ...binding, field: "value" }, channels)).toBeNull();
    expect(resolveNativeDisclosureActivation("summary", "click", { kind: "prop", prop: "onClick" }, channels)).toBeNull();
    expect(resolveNativeDisclosureActivation("summary", "click", { ...binding, channel: "missing" }, channels)).toBeNull();
    for (const patch of [{ valueType: "string" }, { callbackKind: "event" as const }]) {
      const changed = new Map([["open", { ...channels.get("open")!, ...patch }]]);
      expect(resolveNativeDisclosureActivation("summary", "click", binding, changed)).toBeNull();
    }
  });

  it.each(Object.entries(emitters))("%s emits one activation with native cancellation and the disabled guard", (_target, emit) => {
    const source = emit(fixture());
    expect(source.match(/preventDefault\(\)/g)).toHaveLength(1);
    expect(source).toContain("getAttribute('aria-disabled') !== 'true'");
    expect(source).toMatch(/setOpen\(!/);
    const ir = fixture();
    const summary = ir.dom!.children.find(node => node.tag === "summary")!;
    summary.events = {};
    expect(emit(ir)).not.toContain("preventDefault()");
  });
});
