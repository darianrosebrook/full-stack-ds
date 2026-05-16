import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";

// One synthetic component with a named-slot in its dom tree. Every framework
// emitter must map the slot to its idiom AND expose it on the public API
// (slots prop / Snippet prop / etc.). This test pins each framework's
// rendering — divergences across frameworks are exactly the kind of bug
// that historically hid until someone manually inspected a component.

const CONTRACT: ComponentContract = {
  name: "TitledCard",
  layer: "composite",
  cssPrefix: "titled-card",
  anatomy: {
    parts: ["root", "title", "body"],
    dom: {
      tag: "div",
      part: "root",
      children: [
        {
          tag: "h2",
          part: "title",
          children: [{ tag: "slot", name: "title" }],
        },
        {
          tag: "div",
          part: "body",
          children: [{ tag: "slot" }],
        },
      ],
    },
  },
  props: { styled: { members: [] } },
};

const ir = buildComponentIR(CONTRACT);

describe("named slots: codegen idioms per framework", () => {
  it("React maps a named slot to `{slots?.<name>}` and declares a `slots` prop", () => {
    const src = generateReactComponentSource(ir, "../../primitives");
    // Named slot rendered through the slots prop:
    expect(src).toContain("{slots?.title}");
    // Default (unnamed) slot still renders {children}:
    expect(src).toContain("{children}");
    // Public API exposes `slots?: { title?: ReactNode }`:
    expect(src).toMatch(/slots\?:\s*\{[\s\S]*title\?:\s*ReactNode/);
  });

  it("Vue emits `<slot name=\"title\" />` and `<slot />` for default", () => {
    const src = generateVueComponentSource(ir);
    expect(src).toContain(`<slot name="title" />`);
    expect(src).toContain(`<slot />`);
  });

  it("Svelte emits `{@render title?.()}` and declares `title?: Snippet`", () => {
    const src = generateSvelteComponentSource(ir);
    expect(src).toContain("{@render title?.()}");
    expect(src).toContain("{@render children?.()}");
    // Props interface declares the named Snippet:
    expect(src).toMatch(/title\?:\s*import\('svelte'\)\.Snippet/);
  });

  it("Lit emits `<slot name=\"title\"></slot>` and `<slot></slot>` for default", () => {
    const src = generateLitComponentSource(ir);
    expect(src).toContain(`<slot name="title"></slot>`);
    // Default-slot must still exist:
    expect(src).toMatch(/<slot><\/slot>/);
  });

  it("Angular emits `<ng-content select=\"[slot=title]\" />` and unselected `<ng-content />`", () => {
    const src = generateAngularComponentSource(ir);
    expect(src).toContain(`<ng-content select="[slot=title]" />`);
    expect(src).toContain(`<ng-content />`);
  });
});
