import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";

// IR-DOM-BINDING-CAPABILITY-01 — fixture harness.
//
// Two new domNode fields:
//   content: "prop:X"       — render the prop's value as inner content
//   events: { click: "..." } — wire an event handler, keyed by unprefixed
//                              event name (click, input, change, ...)
//
// The canonical mini-component below exercises both: a guarded icon
// wrapper that interpolates an icon ReactNode prop as content, and a
// guarded dismiss button with an accessible label and a click handler.
// Each framework emitter must lower these to its idiom — and crucially,
// must NOT emit them as attribute bindings (where Angular's template
// parser and Lit's binding model would reject them).
//
// Each it-block is the contract between the IR and one emitter. When a
// new emitter is migrated in step 4B, its expectations stay green; the
// others remain skipped (or assert the legacy shape) until they're
// migrated in turn.

const CONTRACT: ComponentContract = {
  name: "FixtureAlert",
  layer: "compound",
  cssPrefix: "fixture-alert",
  anatomy: {
    parts: ["root", "icon", "dismiss"],
    dom: {
      tag: "div",
      part: "root",
      attrs: { role: "alert" },
      children: [
        {
          tag: "span",
          part: "icon",
          if: "icon",
          attrs: { "aria-hidden": "true" },
          // NEW: content binding. Renders the icon prop as the span's
          // inner content via the framework's interpolation idiom.
          content: "prop:icon",
        },
        { tag: "children" },
        {
          tag: "button",
          part: "dismiss",
          if: "dismissible",
          attrs: { type: "button" },
          bindings: {
            "aria-label": "prop:dismissLabel",
          },
          // NEW: events binding. Wires onClick to the onDismiss prop
          // via the framework's event-listener idiom.
          events: {
            click: "prop:onDismiss",
          },
        },
      ],
    },
  },
  props: {
    styled: {
      members: [
        { name: "dismissible", type: "boolean", description: "Whether the alert can be dismissed" },
        { name: "onDismiss", type: "() => void", description: "Click handler for dismiss" },
        { name: "dismissLabel", type: "string", description: "Accessible label for dismiss", default: "Dismiss" },
        { name: "icon", type: "ReactNode", description: "Optional leading icon" },
      ],
    },
  },
};

const ir = buildComponentIR(CONTRACT);

describe("IR-DOM-BINDING-CAPABILITY-01: events + content lowering", () => {
  describe("React", () => {
    const src = generateReactComponentSource(ir, "../../primitives");

    it("renders content binding as a JSX expression child, not as an attribute", () => {
      // Must NOT appear as a `content={icon}` or `children={icon}` attribute.
      expect(src).not.toMatch(/<span[^>]*\scontent=\{/);
      // Must appear as a JSX child expression inside the wrapper span.
      // Tolerant of formatting variations — match across the span body.
      expect(src).toMatch(/<span[^>]*>\s*\{icon\}\s*<\/span>/);
    });

    it("renders event binding as `onClick={prop}`, not as an attribute literal", () => {
      expect(src).toContain("onClick={onDismiss}");
      // Must NOT smuggle the handler through a string attribute.
      expect(src).not.toMatch(/onClick="[^"]+"/);
    });

    it("keeps the accessible label as an attribute binding", () => {
      expect(src).toContain("aria-label={dismissLabel}");
    });

    it("guards both new bindings with their declared if-prop", () => {
      // Icon span only renders when `icon` is truthy.
      expect(src).toMatch(/\{icon &&[\s\S]*<span[^>]*aria-hidden/);
      // Dismiss button only renders when `dismissible` is truthy.
      expect(src).toMatch(/\{dismissible &&[\s\S]*<button[^>]*aria-label/);
    });
  });

  describe.skip("Angular", () => {
    const src = generateAngularComponentSource(ir);

    it("renders content binding as `{{ prop }}` interpolation, not `[content]`", () => {
      expect(src).not.toMatch(/\[content\]=/);
      expect(src).toMatch(/<span[^>]*>\s*\{\{\s*icon\s*\}\}\s*<\/span>/);
    });

    it("renders event binding as `(click)=\"prop()\"`, not as a property binding", () => {
      expect(src).toMatch(/\(click\)="\s*onDismiss\(\)/);
      expect(src).not.toMatch(/\[onClick\]=/);
      // Must NOT appear as a raw `onClick="..."` attribute.
      expect(src).not.toMatch(/onClick="[^"]+"/);
    });

    it("keeps the accessible label as `[attr.aria-label]`", () => {
      expect(src).toMatch(/\[attr\.aria-label\]="dismissLabel"/);
    });
  });

  describe.skip("Lit", () => {
    const src = generateLitComponentSource(ir);

    it("renders content binding as `${this.prop}` interpolation, not as an attribute", () => {
      expect(src).not.toMatch(/<span[^>]*\scontent=\$\{/);
      expect(src).toMatch(/<span[^>]*>\$\{this\.icon\}<\/span>/);
    });

    it("renders event binding as `@click=${this.prop}`, not wrapped in ifDefined", () => {
      // Must use the @event syntax, not an onclick attribute.
      expect(src).toMatch(/@click=\$\{this\.onDismiss\}/);
      // Must NOT wrap the handler in ifDefined() — event handlers either
      // exist or don't; undefined is silently a no-op.
      expect(src).not.toMatch(/@click=\$\{ifDefined\(this\.onDismiss\)/);
    });
  });

  describe.skip("Svelte", () => {
    const src = generateSvelteComponentSource(ir);

    it("renders content binding as `{prop}` interpolation, not as a `content=` attr", () => {
      expect(src).not.toMatch(/<span[^>]*\scontent=\{/);
      expect(src).toMatch(/<span[^>]*>\{icon\}<\/span>/);
    });

    it("renders event binding as `on:click={prop}`, not as `onClick=`", () => {
      expect(src).toContain("on:click={onDismiss}");
      expect(src).not.toMatch(/<button[^>]*\sonClick=/);
    });
  });

  describe.skip("Vue", () => {
    const src = generateVueComponentSource(ir);

    it("renders content binding as `{{ prop }}` interpolation, not as `:content`", () => {
      expect(src).not.toMatch(/<span[^>]*\s:content=/);
      expect(src).toMatch(/<span[^>]*>\{\{\s*props\.icon\s*\}\}<\/span>/);
    });

    it("renders event binding as `@click=\"props.onDismiss?.()\"`", () => {
      expect(src).toMatch(/@click="\s*props\.onDismiss\?\.\(\)/);
    });
  });
});
