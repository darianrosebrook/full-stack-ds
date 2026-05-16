import { describe, it, expect } from "vitest";
import {
  rewriteReactSource,
  rewriteVueSource,
  rewriteSvelteSource,
  rewriteLitSource,
  rewriteAngularSource,
} from "./rewriteImports";

// Each framework emitter produces a few common import shapes that the sandbox
// iframe can't (or shouldn't) resolve:
//   1. Side-effect CSS imports — we inject CSS via <style> instead.
//   2. Primitive-package imports (Stack etc.) — leaf components don't need
//      them at preview time, and the relative paths don't exist in the iframe.
// The rewrite functions strip those without touching anything else.

describe("rewriteReactSource", () => {
  it("strips side-effect CSS imports", () => {
    const src = [
      `import { type ReactNode } from "react";`,
      `import "./Button.css";`,
      `export function Button() { return null; }`,
    ].join("\n");
    const out = rewriteReactSource(src);
    expect(out).not.toContain("Button.css");
    expect(out).toContain("export function Button");
  });

  it("strips named primitive imports from ../../primitives", () => {
    const src = [
      `import { Stack } from "../../primitives";`,
      `import { Stack, Inline } from "../../primitives";`,
      `export const x = 1;`,
    ].join("\n");
    const out = rewriteReactSource(src);
    expect(out).not.toContain("primitives");
    expect(out).toContain("export const x = 1");
  });

  it("strips default primitive imports", () => {
    const src = `import Stack from "../../primitives/Stack";\nexport const y = 2;`;
    const out = rewriteReactSource(src);
    expect(out).not.toContain("primitives");
    expect(out).toContain("export const y = 2");
  });

  it("leaves bare-specifier framework imports alone (import map handles them)", () => {
    const src = `import { useState } from "react";\nimport { createRoot } from "react-dom/client";`;
    const out = rewriteReactSource(src);
    expect(out).toContain('from "react"');
    expect(out).toContain('from "react-dom/client"');
  });
});

describe("rewriteVueSource", () => {
  it("strips CSS imports from inside <script setup>", () => {
    const src = `<script setup>\nimport "./Button.css";\nconst x = 1;\n</script>`;
    const out = rewriteVueSource(src);
    expect(out).not.toContain("Button.css");
    expect(out).toContain("const x = 1");
  });

  it("preserves <template> and full SFC structure when no CSS/primitive imports present", () => {
    const sfc = `<script setup lang="ts">\nconst foo = "bar";\n</script>\n<template>\n  <button>x</button>\n</template>`;
    expect(rewriteVueSource(sfc)).toBe(sfc);
  });
});

describe("rewriteSvelteSource", () => {
  it("strips CSS imports", () => {
    const src = `<script>\nimport "./Button.css";\n</script>\n<button />`;
    const out = rewriteSvelteSource(src);
    expect(out).not.toContain("Button.css");
    expect(out).toContain("<button");
  });
});

describe("rewriteLitSource", () => {
  it("strips primitive imports", () => {
    const src = `import Stack from "../../primitives/Stack";\nexport class ButtonElement {}`;
    const out = rewriteLitSource(src);
    expect(out).not.toContain("primitives");
    expect(out).toContain("ButtonElement");
  });

  it("leaves valid lowercase fsds- custom element names alone", () => {
    // The Lit codegen now emits `fsds-button` directly. The rewrite shouldn't
    // touch those — they're already valid custom element names per the spec.
    const src = `customElements.define('fsds-button', ButtonElement);\nhtml\`<fsds-stack></fsds-stack>\`;`;
    const out = rewriteLitSource(src);
    expect(out).toContain("'fsds-button'");
    expect(out).toContain("<fsds-stack>");
  });
});

describe("rewriteAngularSource", () => {
  it("strips CSS imports and primitive imports", () => {
    const src = [
      `import "./Button.css";`,
      `import Stack from "../../primitives/Stack";`,
      `export class ButtonComponent {}`,
    ].join("\n");
    const out = rewriteAngularSource(src);
    expect(out).not.toContain("Button.css");
    expect(out).not.toContain("primitives");
    expect(out).toContain("ButtonComponent");
  });
});
