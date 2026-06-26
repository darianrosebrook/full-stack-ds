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

  describe("Angular", () => {
    const src = generateAngularComponentSource(ir);

    it("renders content binding as `{{ prop }}` interpolation, not `[content]`", () => {
      expect(src).not.toMatch(/\[content\]=/);
      expect(src).toMatch(/<span[^>]*>\s*\{\{\s*icon\s*\}\}\s*<\/span>/);
    });

    it("renders event binding as `(click)=\"prop && prop()\"`, not as a property binding", () => {
      // Optional callback prop: guard with truthy check so an unset
      // handler is a silent no-op rather than a runtime TypeError.
      expect(src).toMatch(/\(click\)="onDismiss && onDismiss\(\)"/);
      expect(src).not.toMatch(/\[onClick\]=/);
      // Must NOT appear as a raw `onClick="..."` attribute.
      expect(src).not.toMatch(/onClick="[^"]+"/);
    });

    it("keeps the accessible label as `[attr.aria-label]`", () => {
      expect(src).toMatch(/\[attr\.aria-label\]="dismissLabel"/);
    });
  });

  describe("Lit", () => {
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

  describe("Svelte", () => {
    const src = generateSvelteComponentSource(ir);

    it("renders content binding as `{prop}` interpolation, not as a `content=` attr", () => {
      expect(src).not.toMatch(/<span[^>]*\scontent=\{/);
      expect(src).toMatch(/<span[^>]*>\{icon\}<\/span>/);
    });

    it("renders event binding as Svelte 5 `onclick={prop}` (no colon prefix)", () => {
      // Svelte 5 uses lowercase event attribute names without the
      // legacy `on:` directive. Existing Switch emit at
      // packages/ds-svelte/src/components/Switch/Switch.svelte uses
      // `onchange={(e) => …}`, confirming the idiom for this codebase.
      expect(src).toContain("onclick={onDismiss}");
      // Must NOT regress to React-style camelCase JSX prop.
      expect(src).not.toMatch(/<button[^>]*\sonClick=/);
    });
  });

  describe("Vue", () => {
    const src = generateVueComponentSource(ir);

    it("renders content binding as `{{ prop }}` interpolation, not as `:content`", () => {
      expect(src).not.toMatch(/<span[^>]*\s:content=/);
      // Vue emits the interpolation on its own line inside the span,
      // not inline. Tolerant of whitespace.
      expect(src).toMatch(/<span[^>]*>[\s\S]*?\{\{\s*props\.icon\s*\}\}[\s\S]*?<\/span>/);
    });

    it("renders event binding as `@click=\"props.onDismiss?.()\"`", () => {
      expect(src).toMatch(/@click="\s*props\.onDismiss\?\.\(\)/);
    });
  });
});

describe("polymorphic root lowering", () => {
  const polymorphicContract: ComponentContract = {
    name: "InlineSnippet",
    layer: "primitive",
    cssPrefix: "inline-snippet",
    anatomy: {
      parts: ["root"],
      dom: {
        tag: "code",
        part: "root",
        content: "prop:text",
      },
    },
    props: {
      designed: {
        members: [
          {
            name: "text",
            propType: { kind: "string" },
            description: "Literal text",
            required: true,
          },
          {
            name: "as",
            propType: { kind: "ref", to: "InlineSnippetElement" },
            description: "Inline semantic element",
            default: "code",
          },
        ],
      },
    },
    types: {
      InlineSnippetElement: {
        kind: "union",
        values: ["code", "kbd", "samp"],
      },
    },
    variants: {
      as: ["code", "kbd", "samp"],
    },
  };
  const polymorphicIr = buildComponentIR(polymorphicContract);

  it("Vue uses a dynamic native component root", () => {
    const src = generateVueComponentSource(polymorphicIr);
    expect(src).toContain(`<component :is="props.as ?? 'code'"`);
    expect(src).toContain(`{{ props.text }}`);
  });

  it("Svelte uses svelte:element for the root", () => {
    const src = generateSvelteComponentSource(polymorphicIr);
    expect(src).toContain(`<svelte:element this={as ?? "code"}`);
    expect(src).toContain(`>{text}</svelte:element>`);
  });

  it("Angular branches root tags through NgSwitch", () => {
    const src = generateAngularComponentSource(polymorphicIr);
    expect(src).toContain(`import { NgClass, NgSwitch, NgSwitchCase } from "@angular/common";`);
    expect(src).toContain(`<ng-container [ngSwitch]="this.as || 'code'">`);
    expect(src).toContain(`<kbd [ngClass]="classes()" *ngSwitchCase="'kbd'">`);
    expect(src).toContain(`{{ text }}`);
  });

  it("Lit emits static-tag branches from the allowed tag set", () => {
    const src = generateLitComponentSource(polymorphicIr);
    expect(src).toContain(`this.as === "kbd" ? html\`<kbd`);
    expect(src).toContain(`this.as === "samp" ? html\`<samp`);
    expect(src).toContain(`: html\`<code`);
    expect(src).toContain(`\${this.text}`);
  });
});
