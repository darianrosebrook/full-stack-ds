import { describe, it, expect } from "vitest";
import { buildTraceIndex } from "./buildTraceIndex";
import type { ComponentContract } from "../types/data";

const BUTTON_CONTRACT: ComponentContract = {
  name: "Button",
  layer: "primitive",
  anatomy: {
    parts: ["root"],
    dom: {
      tag: "button",
      part: "root",
      bindings: {
        "aria-busy": "prop:loading",
        disabled: "prop:disabled",
      },
    },
  },
  variants: { size: ["small", "medium", "large"], variant: ["primary", "secondary"] },
  states: ["default", "hover", "disabled"],
};

const REACT_SOURCE = `export function Button({ size, variant, disabled, loading }) {
  const classNames = [
    "button",
    size && \`button--\${size}\`,
    variant && \`button--\${variant}\`,
    disabled && "button--disabled",
  ].filter(Boolean).join(" ");
  return (
    <button className={classNames} disabled={disabled} aria-busy={loading} />
  );
}
`;

describe("buildTraceIndex (react)", () => {
  const index = buildTraceIndex("react", "Button", REACT_SOURCE, BUTTON_CONTRACT);

  it("identifies the root tag from anatomy.dom.tag", () => {
    const hit = index.hits.find((h) => h.kind === "tag");
    expect(hit, "expected at least one tag hit").toBeTruthy();
    expect(hit!.contractPath).toBe("anatomy.dom.tag");
  });

  it("identifies anatomy bindings on attributes", () => {
    const ariaBusy = index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.aria-busy");
    expect(ariaBusy, "expected aria-busy binding").toBeTruthy();
    const disabled = index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.disabled");
    expect(disabled, "expected disabled binding").toBeTruthy();
  });

  it("identifies BEM variant modifiers from contract.variants.*", () => {
    const sizeHit = index.hits.find((h) => h.contractPath === "variants.size");
    const variantHit = index.hits.find((h) => h.contractPath === "variants.variant");
    expect(sizeHit, "expected variants.size hit").toBeTruthy();
    expect(variantHit, "expected variants.variant hit").toBeTruthy();
  });
});

describe("buildTraceIndex (vue)", () => {
  const VUE_SOURCE = `<template>
  <button :class="classes" :disabled="props.disabled" :aria-busy="String(props.loading)" />
</template>`;
  const index = buildTraceIndex("vue", "Button", VUE_SOURCE, BUTTON_CONTRACT);

  it("identifies anatomy bindings via colon prefix", () => {
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.disabled")).toBeTruthy();
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.aria-busy")).toBeTruthy();
  });
});

// Svelte intentionally reuses the React rule bank — the template syntax is
// close enough (JSX-ish curly braces, BEM template literals) that the same
// patterns hit. These tests pin that contract: if someone later forks the
// Svelte rules, they need to update these assertions consciously.
describe("buildTraceIndex (svelte) — currently shares React rule bank", () => {
  const SVELTE_SOURCE = `<script lang="ts">
  let { size = "small", disabled = false } = $props();
  const cls = \`button--\${size}\`;
</script>
<button class={cls} disabled={disabled} aria-busy={loading} />`;
  const index = buildTraceIndex("svelte", "Button", SVELTE_SOURCE, BUTTON_CONTRACT);

  it("detects the root tag from anatomy.dom.tag", () => {
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.tag")).toBeTruthy();
  });

  it("detects bindings on attributes with brace-bound values", () => {
    // Svelte rules = React rules, so `disabled={...}` matches the same pattern.
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.disabled")).toBeTruthy();
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.aria-busy")).toBeTruthy();
  });

  it("detects BEM modifiers in template literals", () => {
    expect(index.hits.find((h) => h.contractPath === "variants.size")).toBeTruthy();
  });
});

// Lit's rules are intentionally narrow — only tag detection inside html`…`.
// Showcase users see "1 traced region" on the Lit tab where React shows 9. This
// test codifies the current coverage so improvements register as visible gain.
describe("buildTraceIndex (lit) — narrow coverage", () => {
  const LIT_SOURCE = `import { LitElement, html } from "lit";
export class ButtonElement extends LitElement {
  render() {
    return html\`<button class="button" aria-busy=\${this.loading}></button>\`;
  }
}`;
  const index = buildTraceIndex("lit", "Button", LIT_SOURCE, BUTTON_CONTRACT);

  it("detects the root tag inside html` … `", () => {
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.tag")).toBeTruthy();
  });

  it("does NOT (yet) detect bindings or variants — coverage gap to close later", () => {
    // Intentional: pin the current shape so adding rules trips this test and
    // forces a conscious update. The Lit rules only cover tag detection today.
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.bindings.aria-busy")).toBeFalsy();
    expect(index.hits.find((h) => h.contractPath === "variants.size")).toBeFalsy();
  });
});

// Angular's rules cover tag detection inside `template: \`…\`` and @Input()
// declarations. Like Lit, this is narrower than React on purpose for now.
describe("buildTraceIndex (angular) — tag + @Input only", () => {
  const ANGULAR_SOURCE = `import { Component, Input } from "@angular/core";
@Component({
  selector: "fsds-button",
  template: \`<button [class]="classes()"></button>\`,
})
export class ButtonComponent {
  @Input() size?: string;
  @Input() variant?: string;
  @Input() disabled?: boolean;
}`;
  const index = buildTraceIndex("angular", "Button", ANGULAR_SOURCE, BUTTON_CONTRACT);

  it("detects the root tag inside an inline template", () => {
    expect(index.hits.find((h) => h.contractPath === "anatomy.dom.tag")).toBeTruthy();
  });

  it("maps @Input declarations to variant axes when names match contract.variants", () => {
    // `size` and `variant` are variant axes in BUTTON_CONTRACT — those @Inputs
    // are traceable. `disabled` is a state, not a variant, so it currently
    // falls through to no-match (a coverage gap, documented here).
    expect(index.hits.find((h) => h.contractPath === "variants.size")).toBeTruthy();
    expect(index.hits.find((h) => h.contractPath === "variants.variant")).toBeTruthy();
  });
});
