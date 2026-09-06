import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "./contract.js";
import { buildComponentIR } from "./ir.js";
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
  it("cancels native activation by host capability independently of the component name", () => {
    const ir = fixture();
    const summary = ir.dom!.children.find(node => node.tag === "summary")!;
    expect(summary.activation).toMatchObject({ operation: "toggle", cancelNativeDefault: true, channel: { name: "open" } });
    expect(ir.dom!.activation).toBeUndefined();
  });

  it.each(Object.entries(emitters))("%s emits one activation with native cancellation and the disabled guard", (_target, emit) => {
    const source = emit(fixture());
    expect(source.match(/canActivateInteraction\((?:e|\$event), true\)/g)).toHaveLength(1);
    expect(source).toMatch(/setOpen\(!/);
    const ir = fixture();
    const summary = ir.dom!.children.find(node => node.tag === "summary")!;
    summary.events = {};
    expect(emit(ir)).not.toMatch(/canActivateInteraction\((?:e|\$event), true\)/);
  });
});
