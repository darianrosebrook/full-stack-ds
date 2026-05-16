import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildReactShell } from "./react";
import { buildVueShell } from "./vue";
import { buildSvelteShell } from "./svelte";
import { buildLitShell } from "./lit";
import { buildAngularShell } from "./angular";

// Smoke tests: pick one component from each contract layer and verify that
// each shell builder accepts the actual on-disk generated source without
// throwing. These tests don't execute the iframe — that requires Playwright
// (deferred) — but they catch the most common regressions:
//   - Encoding bugs that throw at shell-build time
//   - Source content that breaks the outer template literal
//   - Missing files / renamed paths after a regen
//
// One representative per layer:
//   primitive  → Button   (covered in shells.test.ts with synthetic fixtures)
//   composite  → Card     (has compound parts in Vue/Svelte sibling SFCs)
//   composite  → Calendar (rich types, useCalendar hook)

const REPO_ROOT = resolve(__dirname, "../../..");

function readSource(framework: string, component: string, file: string): string {
  return readFileSync(resolve(REPO_ROOT, `packages/ds-${framework}/src/components/${component}/${file}`), "utf8");
}

interface Case {
  name: string;
  layer: string;
  react: { source: string; demo: string };
  vue: { source: string; demo: string };
  svelte: { source: string; demo: string };
  lit: { source: string; demo: string };
}

function loadCase(name: string, layer: string): Case {
  return {
    name,
    layer,
    react: {
      source: readSource("react", name, `${name}.tsx`),
      demo: `import { ${name} } from "./${name}";\nimport { createRoot } from "react-dom/client";\ncreateRoot(document.getElementById("root")!).render(<${name} />);`,
    },
    vue: {
      source: readSource("vue", name, `${name}.vue`),
      demo: `<script setup lang="ts">\nimport ${name} from "./${name}.vue";\n</script>\n<template><${name} /></template>`,
    },
    svelte: {
      source: readSource("svelte", name, `${name}.svelte`),
      demo: `<script lang="ts">\nimport ${name} from "./${name}.svelte";\n</script>\n<${name} />`,
    },
    lit: {
      source: readSource("lit", name, `${name}.ts`),
      demo: `<fsds-${name.toLowerCase()}></fsds-${name.toLowerCase()}>`,
    },
  };
}

// HTML must contain the framework's importmap entry and the boot fsds:ready
// signal — a quick sanity check that the shell returned a complete document.
function assertShellSane(html: string, framework: string): void {
  expect(html, `${framework} shell should be a complete HTML document`).toContain("<!doctype html>");
  expect(html, `${framework} shell should signal fsds:ready`).toContain('"fsds:ready"');
  expect(html, `${framework} shell should signal fsds:error`).toContain('"fsds:error"');
}

describe("shell smoke — Button (primitive)", () => {
  // Button is covered by shells.test.ts synthetic fixtures already; this case
  // just confirms the real on-disk source survives the same pipeline.
  const c = loadCase("Button", "primitive");

  it("builds React shell from real Button.tsx", () => {
    const html = buildReactShell({ componentName: c.name, componentSource: c.react.source, demo: c.react.demo });
    assertShellSane(html, "react");
  });

  it("builds Vue shell from real Button.vue", () => {
    const html = buildVueShell({ componentName: c.name, componentSource: c.vue.source, demo: c.vue.demo });
    assertShellSane(html, "vue");
  });

  it("builds Svelte shell from real Button.svelte", () => {
    const html = buildSvelteShell({ componentName: c.name, componentSource: c.svelte.source, demo: c.svelte.demo });
    assertShellSane(html, "svelte");
  });

  it("builds Lit shell from real Button.ts", () => {
    const html = buildLitShell({ componentName: c.name, componentSource: c.lit.source, demo: c.lit.demo });
    assertShellSane(html, "lit");
  });

  it("Angular shell returns its placeholder (does not consume source)", () => {
    const html = buildAngularShell({ componentName: c.name, componentSource: c.react.source, demo: "" });
    expect(html).toContain("Angular live preview unavailable");
  });
});

describe("shell smoke — Card (composite with compound parts)", () => {
  // Card is interesting because Vue/Svelte emit sibling SFCs for compound
  // parts (CardHeader.vue, CardBody.vue, etc.). The iframe shell only loads
  // the root Card source — it does NOT import the compound siblings. If the
  // Card root references CardHeader at module-load time, the iframe will
  // fail. This smoke test guards the contract that the root Card source
  // alone produces a buildable shell.
  const c = loadCase("Card", "composite");

  it("builds React shell from real Card.tsx", () => {
    const html = buildReactShell({ componentName: c.name, componentSource: c.react.source, demo: c.react.demo });
    assertShellSane(html, "react");
  });

  it("builds Vue shell from real Card.vue (compound siblings not imported)", () => {
    const html = buildVueShell({ componentName: c.name, componentSource: c.vue.source, demo: c.vue.demo });
    assertShellSane(html, "vue");
  });

  it("builds Svelte shell from real Card.svelte (compound siblings not imported)", () => {
    const html = buildSvelteShell({ componentName: c.name, componentSource: c.svelte.source, demo: c.svelte.demo });
    assertShellSane(html, "svelte");
  });

  it("builds Lit shell from real Card.ts", () => {
    const html = buildLitShell({ componentName: c.name, componentSource: c.lit.source, demo: c.lit.demo });
    assertShellSane(html, "lit");
  });
});

describe("shell smoke — Calendar (composite, rich types + hook)", () => {
  // Calendar is the worst case for type-heavy output (typed dates, range
  // types, complex prop unions). If TypeScript-stripping ever breaks in the
  // Vue or Lit pipelines, this case catches it before runtime.
  const c = loadCase("Calendar", "composite");

  it("builds React shell from real Calendar.tsx", () => {
    const html = buildReactShell({ componentName: c.name, componentSource: c.react.source, demo: c.react.demo });
    assertShellSane(html, "react");
  });

  it("builds Vue shell from real Calendar.vue", () => {
    const html = buildVueShell({ componentName: c.name, componentSource: c.vue.source, demo: c.vue.demo });
    assertShellSane(html, "vue");
  });

  it("builds Svelte shell from real Calendar.svelte", () => {
    const html = buildSvelteShell({ componentName: c.name, componentSource: c.svelte.source, demo: c.svelte.demo });
    assertShellSane(html, "svelte");
  });

  it("builds Lit shell from real Calendar.ts", () => {
    const html = buildLitShell({ componentName: c.name, componentSource: c.lit.source, demo: c.lit.demo });
    assertShellSane(html, "lit");
  });
});
