import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";

// IR-DOM-CSS-VAR-BINDING-01 — fixture harness.
//
// A new `cssVariableBindings` field on a DOM node lowers each entry to a
// framework-idiomatic inline-style binding. The IR builder enforces the
// `--fsds-<cssPrefix>(-[a-z0-9]+)+` naming pattern at parse time; this
// suite proves each emitter then surfaces the binding in the rendered
// template (and, for Lit, that the styleMap directive import is added
// only when consumed).
//
// The fixture has two cssVarBindings on the same node to verify that
// each emitter handles multi-entry lowering correctly (one merged
// style object for React/Vue/Lit; one attr per binding for
// Svelte/Angular).

const CONTRACT: ComponentContract = {
  name: "FixtureBar",
  layer: "primitive",
  cssPrefix: "fixture-bar",
  anatomy: {
    parts: ["root", "fill"],
    dom: {
      tag: "div",
      part: "root",
      attrs: { role: "progressbar" },
      children: [
        {
          tag: "span",
          part: "fill",
          attrs: { "aria-hidden": "true" },
          cssVariableBindings: {
            "--fsds-fixture-bar-fill-width": "prop:value",
            "--fsds-fixture-bar-fill-intent": "prop:intent",
          },
        },
      ],
    },
  },
  props: {
    styled: {
      members: [
        { name: "value", type: "number", description: "Progress value 0-100" },
        { name: "intent", type: "string", description: "Visual intent token" },
      ],
    },
  },
};

const ir = buildComponentIR(CONTRACT);

describe("IR-DOM-CSS-VAR-BINDING-01: cssVariableBindings lowering", () => {
  describe("React", () => {
    const src = generateReactComponentSource(ir, "../../primitives");

    it("merges all bindings into a single inline style prop", () => {
      // Both vars on the same node share one style={{ ... }} object.
      expect(src).toMatch(
        /<span[^>]*style=\{\{\s*"--fsds-fixture-bar-fill-width":\s*value,\s*"--fsds-fixture-bar-fill-intent":\s*intent\s*\}\s*as\s+CSSProperties\}/,
      );
    });

    it("imports CSSProperties type from react", () => {
      expect(src).toContain(`type CSSProperties`);
      // Strict: the import line must read from "react".
      expect(src).toMatch(/import \{[^}]*type CSSProperties[^}]*\} from "react"/);
    });

    it("does not double-emit the bindings as separate attribute pairs", () => {
      // Must NOT appear as `--fsds-fixture-bar-fill-width={value}` (that
      // would be an invalid JSX attribute name anyway).
      expect(src).not.toMatch(/--fsds-fixture-bar-fill-width=\{/);
    });
  });

  describe("Vue", () => {
    const src = generateVueComponentSource(ir);

    it("merges all bindings into a single :style object binding", () => {
      expect(src).toMatch(
        /<span[^>]*:style="\{\s*'--fsds-fixture-bar-fill-width':\s*props\.value,\s*'--fsds-fixture-bar-fill-intent':\s*props\.intent\s*\}"/,
      );
    });

    it("does not emit the vars as separate :style.--fsds-* attrs", () => {
      // Vue does not support :style.--fsds-foo syntax — the test guards
      // against a future per-binding emit accidentally regressing here.
      expect(src).not.toMatch(/:style\.--fsds-/);
    });
  });

  describe("Svelte", () => {
    const src = generateSvelteComponentSource(ir);

    it("emits one style:--fsds-foo={expr} directive per binding", () => {
      expect(src).toContain(`style:--fsds-fixture-bar-fill-width={value}`);
      expect(src).toContain(`style:--fsds-fixture-bar-fill-intent={intent}`);
    });

    it("does not collapse into a single style={...} attr", () => {
      expect(src).not.toMatch(/<span[^>]*style=\{/);
    });
  });

  describe("Angular", () => {
    const src = generateAngularComponentSource(ir);

    it("emits one [style.--fsds-foo]=\"expr\" binding per variable", () => {
      expect(src).toContain(`[style.--fsds-fixture-bar-fill-width]="value"`);
      expect(src).toContain(`[style.--fsds-fixture-bar-fill-intent]="intent"`);
    });

    it("does not synthesize a style attribute string literal", () => {
      // The contract never declared a literal `style` attr — none should
      // appear in the output.
      expect(src).not.toMatch(/<span[^>]*\sstyle="/);
    });
  });

  describe("Lit", () => {
    const src = generateLitComponentSource(ir);

    it("merges all bindings into a single styleMap({...}) directive", () => {
      // String() coercion is required: lit-analyzer types arbitrary
      // styleMap value slots as `string | undefined`, and prop sources
      // may carry non-string types. The undefined guard is also
      // required because `String(undefined)` materializes the
      // literal string "undefined" — runtime-rail surfaced this in
      // Progress, where default props had no value but the inline
      // emit set `--fsds-progress-fill-width: undefined`, blocking
      // the CSS rule's fallback. The ternary preserves styleMap's
      // "omit when undefined" semantics.
      expect(src).toMatch(
        /<span[^>]*style=\$\{styleMap\(\{\s*'--fsds-fixture-bar-fill-width':\s*this\.value === undefined \? undefined : String\(this\.value\),\s*'--fsds-fixture-bar-fill-intent':\s*this\.intent === undefined \? undefined : String\(this\.intent\)\s*\}\)\}/,
      );
    });

    it("imports the styleMap directive when used", () => {
      expect(src).toContain(
        `import { styleMap } from 'lit/directives/style-map.js';`,
      );
    });
  });
});

describe("IR-DOM-CSS-VAR-BINDING-01: opt-in import injection", () => {
  it("Lit: does NOT import styleMap when no cssVarBindings exist", () => {
    const noVarsContract: ComponentContract = {
      name: "FixturePlain",
      layer: "primitive",
      cssPrefix: "fixture-plain",
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "div",
          part: "root",
        },
      },
      props: { styled: { members: [{ name: "label", type: "string" }] } },
    };
    const src = generateLitComponentSource(buildComponentIR(noVarsContract));
    expect(src).not.toContain(`lit/directives/style-map.js`);
  });

  it("React: does NOT import CSSProperties when no cssVarBindings exist", () => {
    const noVarsContract: ComponentContract = {
      name: "FixturePlainReact",
      layer: "primitive",
      cssPrefix: "fixture-plain-react",
      anatomy: {
        parts: ["root"],
        dom: {
          tag: "div",
          part: "root",
        },
      },
      props: { styled: { members: [{ name: "label", type: "string" }] } },
    };
    const src = generateReactComponentSource(
      buildComponentIR(noVarsContract),
      "../../primitives",
    );
    expect(src).not.toContain(`CSSProperties`);
  });
});
