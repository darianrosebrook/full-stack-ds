import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";

// Deliberately unrelated to CodeBlock: preformatted context must propagate
// through descendants, including conditional and iteration wrappers.
const fixture: ComponentContract = {
  name: "Transcription", layer: "primitive", cssPrefix: "transcription",
  anatomy: { parts: ["root", "sample", "line"], dom: {
    tag: "section", part: "root", children: [{ tag: "pre", part: "sample", children: [
      { tag: "code", content: "prop:source" },
      { tag: "span", part: "line", if: "visible",
        iterate: { source: "prop:lines", kind: "array", itemType: "string" },
        children: [{ tag: "span", content: "iter:item" }] },
    ] }],
  } },
  props: { styled: { members: [
    { name: "source", type: "string", description: "Authored source" },
    { name: "lines", type: "string[]", description: "Additional lines" },
    { name: "visible", type: "boolean", description: "Include additional lines" },
  ] } },
};

for (const [framework, emit] of Object.entries({
  vue: generateVueComponentSource, angular: generateAngularComponentSource,
  svelte: generateSvelteComponentSource, lit: generateLitComponentSource,
})) {
  describe(`${framework} preformatted template emission`, () => {
    it("adds no text whitespace around nested bindings or control wrappers", () => {
      const source = emit(buildComponentIR(fixture));
      const pre = source.match(/<pre\b[^]*?<\/pre>/)?.[0];
      expect(pre).toBeTypeOf("string");
      // This fixture has no authored literal whitespace. Any line break or
      // inter-element space here came from the template formatter.
      expect(pre).not.toMatch(/\n|>\s+</);
      expect(pre).toContain("<code");
      expect(pre).toContain("<span");
    });
  });
}
