import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";

// A single slot-gated idref (a labelledby whose target's content IS a
// consumer slot) must keep its presence gate in every framework that can
// express one. An idref to an empty naming element is worse than no idref
// (axe `label-title-only`), so an ungated emission is an a11y defect even
// though the attribute "exists" — the a11y-realization rail checks
// presence only and cannot catch a dropped gate. This test exists because
// the Lit single-ref collapse in litIdRefListExpr once discarded the
// slotGate it had just built, shipping unconditional aria-labelledby in
// TextField/Dialog/Sheet/Walkthrough.

const CONTRACT: ComponentContract = {
  name: "GatedField",
  layer: "compound",
  cssPrefix: "gated-field",
  anatomy: {
    parts: ["root", "label", "field"],
    dom: {
      tag: "div",
      part: "root",
      children: [
        {
          tag: "label",
          part: "label",
          children: [{ tag: "slot", name: "label" }],
        },
        {
          tag: "input",
          part: "field",
        },
      ],
    },
  },
  relationships: [
    { from: "field", to: "label", attribute: "aria-labelledby" },
  ],
  props: { styled: { members: [] } },
};

const ir = buildComponentIR(CONTRACT);

describe("single slot-gated idref keeps its presence gate per framework", () => {
  it("React gates on the slots prop", () => {
    const src = generateReactComponentSource(ir, "../../primitives");
    expect(src).toContain(
      "aria-labelledby={slots?.label ? `${instanceId}-label` : undefined}",
    );
  });

  it("Vue gates on $slots", () => {
    const src = generateVueComponentSource(ir);
    expect(src).toContain(
      ":aria-labelledby=\"$slots.label ? `${instanceId}-label` : undefined\"",
    );
  });

  it("Svelte gates on the snippet prop", () => {
    const src = generateSvelteComponentSource(ir);
    expect(src).toContain(
      "aria-labelledby={label ? `${instanceId}-label` : undefined}",
    );
  });

  it("Lit gates with a runtime light-DOM presence query and re-renders on slotchange", () => {
    const src = generateLitComponentSource(ir);
    // The guard must survive the single-ref collapse — never a bare
    // literal reference to a possibly-empty label.
    expect(src).toContain(
      `aria-labelledby=\${ifDefined([this.querySelector('[slot="label"]') !== null ? 'gated-field-label' : null].filter(Boolean).join(' ') || undefined)}`,
    );
    expect(src).not.toContain("ifDefined('gated-field-label')");
    expect(src).not.toContain(`aria-labelledby="gated-field-label"`);
    // Late-arriving slot content must re-evaluate the guard.
    expect(src).toContain(
      `<slot name="label" @slotchange=\${() => this.requestUpdate()}></slot>`,
    );
  });

  it("Angular emits unconditionally — the documented divergence, pinned as fact", () => {
    // Projected-content presence is not statically knowable in Angular;
    // IdRefIR.slotGate documents this as the one ungated family. If this
    // assertion starts failing because a gate appeared, delete the
    // divergence note on IdRefIR too.
    const src = generateAngularComponentSource(ir);
    expect(src).toContain(`[attr.aria-labelledby]="instanceId + '-label'"`);
  });
});
