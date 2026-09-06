import { describe, expect, it } from "vitest";
import { allCorpusComponentNames, corpusIR } from "./corpus-fixtures.js";
import { createReactEmitter } from "./react/factory.js";
import { createVueEmitter } from "./vue/factory.js";
import { createSvelteEmitter } from "./svelte/factory.js";
import { createAngularEmitter } from "./angular/factory.js";
import { createLitEmitter } from "./lit/factory.js";

const options = { componentsRoot: "/tmp/fsds-boundary-test/components", contractsRoot: "/tmp/fsds-boundary-test/contracts" };
const targets = [
  ["react", "tsx", createReactEmitter({ stackImportRelative: "../../primitives" })],
  ["vue", "vue", createVueEmitter()],
  ["svelte", "svelte", createSvelteEmitter()],
  ["angular", "component.ts", createAngularEmitter()],
  ["lit", "ts", createLitEmitter()],
] as const;

describe("component boundary and physical box carriage", () => {
  for (const [target, extension, emitter] of targets) {
    it(`${target} emits a geometry consumer marker for every component root`, () => {
      for (const name of allCorpusComponentNames()) {
        const files = emitter.emitComponent(corpusIR(name), options);
        const root = files.find(file => file.relativePath === `${name}/${name}.${extension}`);
        expect(root, `${target}/${name} root`).toBeDefined();
        expect(root!.contents, `${target}/${name} physical box`).toContain('data-fsds-box=""');
        expect(root!.contents, `${target}/${name} boundary`).toContain('data-fsds-component');
      }
    });
  }
  it("the Vue disclosure item does not introduce a second component boundary", () => {
    const files = createVueEmitter().emitComponent(corpusIR("Accordion"), options);
    const item = files.find(file => file.relativePath.endsWith('/AccordionItem.vue'));
    expect(item).toBeDefined();
    expect(item!.contents).not.toContain('data-fsds-component');
    expect(item!.contents).not.toContain('data-fsds-box');
  });
});
