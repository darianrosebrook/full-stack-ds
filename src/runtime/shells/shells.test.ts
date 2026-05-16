import { describe, it, expect } from "vitest";
import { buildReactShell } from "./react";
import { buildVueShell } from "./vue";
import { buildSvelteShell } from "./svelte";
import { buildLitShell } from "./lit";
import { buildAngularShell } from "./angular";

// These tests validate the iframe-srcdoc HTML produced by each per-framework
// shell builder. They focus on the regression that originally caused the
// runtime to fail silently:
//
//  - Embedded source containing `</script>` (Vue/Svelte SFCs) must be escaped
//    so the outer <script type="module"> block isn't terminated early.
//  - Embedded source containing `${...}` template-literal interpolations
//    (every component's BEM class assembly) must be escaped so the outer
//    template literal that builds the shell string doesn't re-interpolate.
//  - The shell must contain an importmap pointing at the framework's CDN.
//  - The boot module must call `parent.postMessage({type:"fsds:ready"}, ...)`
//    on success and `fsds:error` on failure — the parent listens for those.

const VUE_SFC_WITH_HAZARDS = [
  `<script setup lang="ts">`,
  `const cls = \`button--\${size}\`;`,
  `</script>`,
  `<template>`,
  `  <button :class="cls" />`,
  `</template>`,
].join("\n");

const REACT_TSX_WITH_HAZARDS = [
  `import { type ReactNode } from "react";`,
  `export function Button({ size }: { size: string }) {`,
  `  const cn = \`button--\${size}\`;`,
  `  return <button className={cn} />;`,
  `}`,
].join("\n");

const SVELTE_WITH_HAZARDS = [
  `<script lang="ts">`,
  `  let { size = "small" } = $props();`,
  `  const cls = \`button--\${size}\`;`,
  `</script>`,
  `<button class={cls} />`,
].join("\n");

const LIT_WITH_HAZARDS = [
  `import { LitElement, html } from "lit";`,
  `export class ButtonElement extends LitElement {`,
  `  render() { return html\`<button class="button--\${this.size}"></button>\`; }`,
  `}`,
  `customElements.define('fsds-button', ButtonElement);`,
].join("\n");

// Count occurrences of a literal substring (no regex semantics).
function countLiteral(haystack: string, needle: string): number {
  let count = 0;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    count++;
    i += needle.length;
  }
  return count;
}

// Extract the iframe boot's outer <script type="module">...</script> body.
function getBootScript(html: string): string {
  const start = html.indexOf('<script type="module">');
  expect(start, "shell must contain <script type=\"module\">").toBeGreaterThanOrEqual(0);
  const after = html.slice(start + '<script type="module">'.length);
  const end = after.indexOf("</script>");
  expect(end, "boot <script type=\"module\"> must have a matching </script>").toBeGreaterThanOrEqual(0);
  return after.slice(0, end);
}

describe("buildReactShell", () => {
  const html = buildReactShell({
    componentName: "Button",
    componentSource: REACT_TSX_WITH_HAZARDS,
    demo: 'import { Button } from "./Button";\nconsole.log(<Button />);',
  });

  it("emits importmap entries for react + react-dom + jsx-runtime", () => {
    expect(html).toMatch(/<script type="importmap">/);
    expect(html).toContain('"react"');
    expect(html).toContain('"react-dom/client"');
    expect(html).toContain('"react/jsx-runtime"');
  });

  it("loads Babel standalone as a classic script", () => {
    expect(html).toContain("babel.min.js");
  });

  it("posts fsds:ready on success and fsds:error on failure", () => {
    const boot = getBootScript(html);
    expect(boot).toContain('"fsds:ready"');
    expect(boot).toContain('"fsds:error"');
  });

  it("escapes hazardous source so the outer template-literal context doesn't re-interpolate", () => {
    // The embedded TSX contains \`button--\${size}\`. If unescaped, the outer
    // template literal that built `html` would have already interpolated it
    // — producing an undefined-reference error at shell-build time. Surviving
    // until this assertion runs is itself proof, but be explicit:
    const boot = getBootScript(html);
    expect(boot).not.toMatch(/[^\\]\$\{size\}/);
  });
});

describe("buildVueShell", () => {
  const html = buildVueShell({
    componentName: "Button",
    componentSource: VUE_SFC_WITH_HAZARDS,
    demo: `<script setup lang="ts">\nimport Button from "./Button.vue";\n</script>\n<template><Button /></template>`,
  });

  it("emits importmap entry for vue", () => {
    expect(html).toContain('"vue"');
  });

  it("escapes </script> inside the embedded SFC so the outer <script> block isn't terminated", () => {
    // This is the critical Vue regression. The SFC fixture contains `</script>`
    // as part of its own <script setup>...</script> block. If that bytes
    // through unescaped, the HTML parser closes the outer iframe boot script
    // early and the iframe silently dies.
    //
    // The shell has exactly two real outer </script> closers:
    //   1. the importmap script
    //   2. the boot type="module" script
    // Plus one each for the head <script src=...></script> if present (Vue
    // does include a Babel standalone tag now).
    // Any embedded </script> must appear as `<\/script` instead.
    const scriptCloses = countLiteral(html, "</script>");
    expect(scriptCloses).toBeLessThanOrEqual(3); // importmap + babel + boot
    // And the escaped form must be present somewhere (we embedded it).
    expect(html).toContain("<\\/script");
  });

  it("escapes `${...}` in embedded source so outer template-literal doesn't interpolate", () => {
    const boot = getBootScript(html);
    // The SFC fixture has `${size}`. After encoding, the boot must not
    // contain a literal unescaped `${size}` (it would be `${size}`).
    expect(boot).not.toMatch(/[^\\]\$\{size\}/);
  });

  it("includes the Vue compiler import for in-iframe SFC compilation", () => {
    expect(html).toContain("@vue/compiler-sfc");
  });
});

describe("buildSvelteShell", () => {
  const html = buildSvelteShell({
    componentName: "Button",
    componentSource: SVELTE_WITH_HAZARDS,
    demo: `<script>\nimport Button from "./Button.svelte";\n</script>\n<Button />`,
  });

  it("emits importmap for svelte runtime + internal client", () => {
    expect(html).toContain('"svelte"');
    expect(html).toContain('"svelte/internal/client"');
  });

  it("escapes embedded </script> so outer <script> block survives", () => {
    const scriptCloses = countLiteral(html, "</script>");
    // Svelte shell has: importmap + boot module = 2 real closers (no Babel).
    expect(scriptCloses).toBeLessThanOrEqual(2);
    expect(html).toContain("<\\/script");
  });

  it("includes the svelte compiler import", () => {
    expect(html).toContain("svelte@5");
  });
});

describe("buildLitShell", () => {
  const html = buildLitShell({
    componentName: "Button",
    componentSource: LIT_WITH_HAZARDS,
    demo: "<fsds-button></fsds-button>",
  });

  it("loads Babel with legacy decorators (required by Lit's @property)", () => {
    expect(html).toContain("babel.min.js");
    // The boot uses Babel.transform with proposal-decorators legacy mode.
    const boot = getBootScript(html);
    expect(boot).toContain("proposal-decorators");
    expect(boot).toContain("legacy");
  });

  it("emits importmap for lit + lit/decorators", () => {
    expect(html).toContain('"lit"');
    expect(html).toContain('"lit/decorators.js"');
  });

  it("passes through valid lowercase custom element names without mutation", () => {
    // Now that the Lit codegen emits `fsds-button` directly, no normalization
    // happens at the showcase boundary. We assert the source survives intact.
    const boot = getBootScript(html);
    expect(boot).toContain("fsds-button");
    expect(boot).not.toContain("FSDS-");
  });
});

describe("buildAngularShell", () => {
  it("renders a placeholder (in-browser Angular bootstrap is intentionally unsupported)", () => {
    // The placeholder is by design — Angular 17+ standalone components with
    // signals can't be bootstrapped from esm.sh's linker-output bundles. The
    // shell explains this and points at the Developer source view. This test
    // codifies "we ship an honest placeholder, not a broken Angular tab".
    const html = buildAngularShell({
      componentName: "Button",
      componentSource: "// unused for placeholder",
      demo: "// unused for placeholder",
    });
    expect(html).toContain("Angular live preview unavailable");
    // Still posts ready so the parent's loading spinner clears.
    expect(html).toContain('"fsds:ready"');
  });
});
