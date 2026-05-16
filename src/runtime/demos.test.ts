import { describe, it, expect } from "vitest";
import {
  buildReactDemo,
  buildVueDemo,
  buildSvelteDemo,
  buildLitDemo,
  buildAngularDemo,
  buildDemo,
} from "./demos";
import type { ComponentBundle } from "../types/data";

function makeBundle(overrides: Partial<ComponentBundle> = {}): ComponentBundle {
  return {
    name: "Button",
    contractPath: "packages/ds-contracts/Button.contract.json",
    sources: {},
    contract: {
      name: "Button",
      layer: "primitive",
      variants: {
        size: ["small", "medium", "large"],
        variant: ["primary", "secondary"],
      },
      props: {
        styled: {
          members: [{ name: "type", type: "string", default: "button" }],
        },
      },
    },
    ...overrides,
  };
}

describe("buildReactDemo", () => {
  it("emits a JSX snippet with default variants + a child label", () => {
    const out = buildReactDemo(makeBundle());
    // First variant value of each variant axis is used as the default.
    expect(out).toContain('size="small"');
    expect(out).toContain('variant="primary"');
    expect(out).toContain('type="button"');
    // Children: the component name as the visible label.
    expect(out).toContain(">Button</Button>");
    // React harness mounts via createRoot.
    expect(out).toContain('import { Button } from "./Button"');
    expect(out).toContain("createRoot");
  });

  it("respects prop overrides", () => {
    const out = buildReactDemo(makeBundle(), { size: "large", disabled: true });
    expect(out).toContain('size="large"');
    // Boolean true → bare attribute (no `={true}`).
    expect(out).toMatch(/\bdisabled\b(?!=)/);
  });

  it("omits a child label for icon-like components", () => {
    const out = buildReactDemo(makeBundle({ name: "Spinner" }));
    expect(out).toContain("<Spinner");
    // No `>Spinner</Spinner>` since Spinner is in the no-children list.
    expect(out).not.toContain(">Spinner</Spinner>");
  });
});

describe("buildVueDemo", () => {
  it("emits a Vue SFC with <script setup> + <template>", () => {
    const out = buildVueDemo(makeBundle());
    expect(out).toContain('<script setup lang="ts">');
    expect(out).toContain('import Button from "./Button.vue";');
    expect(out).toContain("<template>");
    expect(out).toContain('<Button size="small"');
  });
});

describe("buildSvelteDemo", () => {
  it("emits a Svelte component that imports the .svelte file", () => {
    const out = buildSvelteDemo(makeBundle());
    expect(out).toContain('import Button from "./Button.svelte";');
    expect(out).toContain('<Button size="small"');
  });
});

describe("buildLitDemo", () => {
  it("emits HTML using a lowercase custom-element tag (fsds-{name})", () => {
    // Custom element names must be all-lowercase per the spec. The Lit demo
    // must use `fsds-button`, not `FSDS-button` — even though we receive a
    // PascalCase component name.
    const out = buildLitDemo(makeBundle());
    expect(out).toContain("<fsds-button");
    expect(out).toContain("</fsds-button>");
    expect(out).not.toContain("FSDS-");
  });

  it("renders attributes (not JSX props)", () => {
    // Lit consumes plain HTML attributes — string-valued props become attrs.
    const out = buildLitDemo(makeBundle());
    expect(out).toContain('size="small"');
    expect(out).toContain('variant="primary"');
  });
});

describe("buildAngularDemo", () => {
  it("uses the same lowercase fsds- prefix as Lit", () => {
    const out = buildAngularDemo(makeBundle());
    expect(out).toContain("<fsds-button");
    expect(out).not.toContain("FSDS-");
  });
});

describe("buildDemo (dispatcher)", () => {
  it("routes to the framework-specific builder", () => {
    const bundle = makeBundle();
    expect(buildDemo("react", bundle)).toContain("createRoot");
    expect(buildDemo("vue", bundle)).toContain('import Button from "./Button.vue"');
    expect(buildDemo("svelte", bundle)).toContain('import Button from "./Button.svelte"');
    expect(buildDemo("lit", bundle)).toContain("<fsds-button");
    expect(buildDemo("angular", bundle)).toContain("<fsds-button");
  });
});
