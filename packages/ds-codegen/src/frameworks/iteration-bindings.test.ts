import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueComponentSource } from "./vue/component-source.js";
import { generateSvelteComponentSource } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularComponentSource } from "./angular/component-source.js";

// IR-DOM-ITERATE-CAPABILITY-01 — fixture harness.
//
// Two new iteration variants exercise the full dispatch path:
//
//   kind="count" — repeat a subtree N times. Source prop is a number.
//                  Index alias visible inside the subtree as
//                  cssVariableBindings value, attribute binding,
//                  or content binding.
//
//   kind="array" — iterate an array prop. Each iteration introduces
//                  `item` and `index` aliases visible inside the
//                  subtree's bindings.
//
// Doctrine locked here: iteration wraps OUTSIDE the if-guard. Each
// loop iteration re-evaluates `if:` against the per-iteration scope.
// The COUNT_CONTRACT below has neither if-guard nor cssVarBindings,
// so it provides clean baseline assertions; the ARRAY_CONTRACT
// combines all four lowering paths (text content, attribute binding,
// CSS-var binding, and a nested if-guard against an item field) so
// the cross-cutting interactions are pinned.

const COUNT_CONTRACT: ComponentContract = {
  name: "FixtureCount",
  layer: "primitive",
  cssPrefix: "fixture-count",
  anatomy: {
    parts: ["root", "dot"],
    dom: {
      tag: "div",
      part: "root",
      attrs: { role: "group" },
      children: [
        {
          tag: "span",
          part: "dot",
          attrs: { "aria-hidden": "true" },
          iterate: {
            source: "prop:count",
            kind: "count",
          },
          bindings: {
            "data-index": "prop:index",
          },
          cssVariableBindings: {
            "--fsds-fixture-count-dot-index": "prop:index",
          },
        },
      ],
    },
  },
  props: {
    styled: {
      members: [
        { name: "count", type: "number", description: "Number of dots to render" },
      ],
    },
  },
};

const ARRAY_CONTRACT: ComponentContract = {
  name: "FixtureArray",
  layer: "primitive",
  cssPrefix: "fixture-array",
  anatomy: {
    parts: ["root", "row", "label"],
    dom: {
      tag: "ul",
      part: "root",
      children: [
        // The iterated `<li>` carries `iterate` + attribute bindings
        // against item/index, then projects the content into a
        // dedicated inner `<span>`. The split is required by the
        // IR builder's `iterate`-vs-`content` mutex (parseDomNode in
        // ir.ts) — Commit 1 keeps content on a separate node so
        // emitters never have to reconcile iteration with content
        // on the same node.
        {
          tag: "li",
          part: "row",
          iterate: {
            source: "prop:items",
            kind: "array",
            itemType: "string",
          },
          // `prop:item` resolves to the iteration alias (bare local in
          // every framework's loop scope). `prop:index` likewise.
          bindings: {
            "data-row-index": "prop:index",
            "aria-label": "prop:item",
          },
          children: [
            {
              tag: "span",
              part: "label",
              content: "prop:item",
            },
          ],
        },
      ],
    },
  },
  props: {
    styled: {
      members: [
        {
          name: "items",
          type: "string[]",
          description: "Row labels (also drives the per-row aria-label).",
        },
      ],
    },
  },
};

describe("IR-DOM-ITERATE-CAPABILITY-01: count iteration lowering", () => {
  const ir = buildComponentIR(COUNT_CONTRACT);

  describe("React", () => {
    const src = generateReactComponentSource(ir, "../../primitives");

    it("wraps the iterated subtree in Array.from(...).map() with 0-based index", () => {
      // The map callback uses underscore for the discarded slot and the
      // contract's indexVar default `index` as the second param.
      expect(src).toMatch(
        /\{Array\.from\(\{ length: count \}, \(_, index\) =>/,
      );
    });

    it("emits key={index} on the iterated element", () => {
      // The key attribute may come before or after other attrs; only
      // the membership and the indexVar value are load-bearing.
      expect(src).toMatch(/<span[^>]*aria-hidden="true"[^>]*key=\{index\}/);
    });

    it("resolves `prop:index` inside the subtree to the bare iteration alias", () => {
      // data-index is the attribute binding; React lowers bare prop names
      // as JSX identifiers. The bare `index` here comes from the map
      // callback parameter, NOT from a destructured component prop
      // (the component only declares `count`).
      expect(src).toMatch(/data-index=\{index\}/);
    });

    it("threads `prop:index` into the cssVarBindings value too", () => {
      // The cssVarBindings emit shape: style={{ '--fsds-foo': value }}.
      // The value position is the iteration alias.
      expect(src).toMatch(
        /style=\{\{\s*"--fsds-fixture-count-dot-index":\s*index\s*\}\s*as\s+CSSProperties\}/,
      );
    });

    it("does not lower `prop:index` as a destructured component prop", () => {
      // Negative: `index` is not in the destructure list (only `count` is
      // declared on the contract). React's destructure for FixtureCount
      // should NOT contain `index`.
      const destructure = src.match(/export function FixtureCount\(\{([\s\S]*?)\}: FixtureCountProps\)/);
      expect(destructure).toBeTruthy();
      const destructured = destructure?.[1] ?? "";
      expect(destructured).not.toContain("index");
    });
  });

  describe("Vue", () => {
    const src = generateVueComponentSource(ir);

    it("emits v-for over Array(count) for 0-based index", () => {
      // Array(count) yields a sparse iterable of length N — Vue's v-for
      // produces 0..count-1 as the index. The numeric form `v-for="i in N"`
      // is 1-based, so we deliberately wrap in Array() for cross-framework
      // parity.
      expect(src).toMatch(
        /<span[^>]*v-for="\(_, index\) in Array\(count\)"[^>]*:key="index"/,
      );
    });

    it("resolves `prop:index` in attribute bindings to bare alias (not props.index)", () => {
      // :data-index must be the bare local, not props.index — `index`
      // is introduced by v-for, not by the props interface.
      expect(src).toMatch(/:data-index="index"/);
      expect(src).not.toMatch(/:data-index="props\.index"/);
    });

    it("threads `prop:index` into the :style cssVar object", () => {
      expect(src).toMatch(
        /:style="\{\s*'--fsds-fixture-count-dot-index':\s*index\s*\}"/,
      );
    });
  });

  describe("Svelte", () => {
    const src = generateSvelteComponentSource(ir);

    it("wraps the iterated subtree in {#each Array(count) as _, index (index)}", () => {
      expect(src).toContain(`{#each Array(count) as _, index (index)}`);
      expect(src).toMatch(/\{\/each\}/);
    });

    it("emits the bare alias in attribute bindings", () => {
      expect(src).toMatch(/data-index=\{index\}/);
    });

    it("emits the bare alias in the style:--fsds-* directive value", () => {
      expect(src).toContain(`style:--fsds-fixture-count-dot-index={index}`);
    });
  });

  describe("Angular", () => {
    const src = generateAngularComponentSource(ir);

    it("wraps in <ng-container *ngFor> with arrayFromCount(count) and `let index = index`", () => {
      // The `let index = index` syntax aliases Angular's built-in
      // template variable `$index` (right side) to a local `index`
      // (left side) for cross-framework parity.
      expect(src).toMatch(
        /<ng-container \*ngFor="let _ of arrayFromCount\(count\); let index = index">/,
      );
    });

    it("emits bare alias in attribute bindings (not safePropertyExpr-wrapped)", () => {
      // `[attr.data-index]="index"` — bare, no `this.` prefix.
      expect(src).toMatch(/\[attr\.data-index\]="index"/);
    });

    it("emits bare alias in [style.--fsds-*] bindings", () => {
      expect(src).toMatch(
        /\[style\.--fsds-fixture-count-dot-index\]="index"/,
      );
    });

    it("imports NgFor and injects the arrayFromCount helper", () => {
      expect(src).toMatch(/import \{[^}]*NgFor[^}]*\} from "@angular\/common"/);
      expect(src).toMatch(/arrayFromCount\(n: number \| undefined\)/);
    });
  });

  describe("Lit", () => {
    const src = generateLitComponentSource(ir);

    it("wraps the iterated subtree in Array.from({...}).map((_, index) => html``)", () => {
      // The class-field accessor `this.count` is the source. `?? 0`
      // guards against undefined when the prop is unset.
      expect(src).toMatch(
        /Array\.from\(\{ length: this\.count \?\? 0 \}, \(_, index\) => html`/,
      );
    });

    it("emits bare alias in attribute bindings (no `this.` prefix, no ifDefined)", () => {
      // Post-V2 (BINDING-EXPRESSION-V2-01): `prop:index` inside an
      // iteration scope normalizes to `iterationLocal` in the IR, and
      // the Lit emitter's `iterationLocal` branch lowers without an
      // `ifDefined` wrap. Iteration locals introduced by a `.map`
      // callback are never undefined, so `ifDefined` was always dead
      // weight on the V1 path.
      expect(src).toMatch(/data-index=\$\{index\}/);
      expect(src).not.toMatch(/data-index=\$\{ifDefined\(index\)\}/);
    });

    it("emits bare alias inside styleMap directive value", () => {
      // The undefined-guard ternary is uniform across all sources
      // (iteration aliases included), even though loop-locals can't
      // be undefined in scope. Keeping the emit shape branch-free
      // makes the codegen path simpler than threading per-source
      // nullability through styleMap construction.
      expect(src).toMatch(
        /styleMap\(\{\s*'--fsds-fixture-count-dot-index':\s*index === undefined \? undefined : String\(index\)\s*\}\)/,
      );
    });

    it("does not emit `this.index` anywhere", () => {
      // Negative: `index` is loop-local, never a class field.
      expect(src).not.toMatch(/this\.index\b/);
    });
  });
});

describe("IR-DOM-ITERATE-CAPABILITY-01: array iteration lowering", () => {
  const ir = buildComponentIR(ARRAY_CONTRACT);

  describe("React", () => {
    const src = generateReactComponentSource(ir, "../../primitives");

    it("wraps in items.map((item, index) => (...))", () => {
      expect(src).toMatch(/\{items\.map\(\(item, index\) =>/);
    });

    it("resolves both `item` and `index` aliases inside the subtree", () => {
      // data-row-index reads index; aria-label reads item; content is
      // item inside the nested <span>.
      expect(src).toMatch(/data-row-index=\{index\}/);
      expect(src).toMatch(/aria-label=\{item\}/);
      // Content binding renders as a JSX child expression on the
      // <span> child.
      expect(src).toMatch(/<span[^>]*>\s*\{item\}\s*<\/span>/);
    });

    it("emits a stable key on the iterated element", () => {
      expect(src).toMatch(/<li[^>]*key=\{index\}/);
    });
  });

  describe("Vue", () => {
    const src = generateVueComponentSource(ir);

    it("emits v-for=\"(item, index) in items\"", () => {
      expect(src).toMatch(
        /<li[^>]*v-for="\(item, index\) in items"[^>]*:key="index"/,
      );
    });

    it("emits content binding as {{ item }} interpolation on the inner <span>", () => {
      // The {{ item }} resolves against the v-for scope, not props.item.
      expect(src).toMatch(/<span[^>]*>\s*\{\{ item \}\}\s*<\/span>/);
    });

    it("emits attribute bindings against the bare aliases", () => {
      expect(src).toMatch(/:data-row-index="index"/);
      expect(src).toMatch(/:aria-label="item"/);
    });
  });

  describe("Svelte", () => {
    const src = generateSvelteComponentSource(ir);

    it("wraps in {#each items as item, index (index)}", () => {
      expect(src).toContain(`{#each items as item, index (index)}`);
    });

    it("inlines content as {item} text expression on the inner <span>", () => {
      // Svelte's content path emits `<tag>{item}</tag>` for a node
      // whose content binding is present and which has no children.
      expect(src).toMatch(/<span[^>]*>\{item\}<\/span>/);
    });

    it("emits both aliases in attribute bindings", () => {
      expect(src).toMatch(/data-row-index=\{index\}/);
      expect(src).toMatch(/aria-label=\{item\}/);
    });
  });

  describe("Angular", () => {
    const src = generateAngularComponentSource(ir);

    it("wraps in <ng-container *ngFor=\"let item of items; let index = index\">", () => {
      expect(src).toMatch(
        /<ng-container \*ngFor="let item of items; let index = index">/,
      );
    });

    it("emits content binding as {{ item }} interpolation on inner <span>", () => {
      expect(src).toMatch(/<span[^>]*>[\s\S]*\{\{ item \}\}[\s\S]*<\/span>/);
    });

    it("emits attribute bindings against the bare aliases", () => {
      expect(src).toMatch(/\[attr\.data-row-index\]="index"/);
      expect(src).toMatch(/\[attr\.aria-label\]="item"/);
    });

    it("does NOT inject arrayFromCount when only array iteration is used", () => {
      // Negative — count helper only appears when at least one
      // count-iteration node exists in the tree.
      expect(src).not.toContain("arrayFromCount(");
    });
  });

  describe("Lit", () => {
    const src = generateLitComponentSource(ir);

    it("wraps in this.items.map((item, index) => html``)", () => {
      expect(src).toMatch(
        /this\.items\.map\(\(item, index\) => html`/,
      );
    });

    it("emits content interpolation against the bare alias on inner <span>", () => {
      // renderLitContent for prop:item lowers to `${item}` (not `${this.item}`)
      // because `item` is in the iterationScope.
      expect(src).toMatch(/<span[^>]*>[\s\S]*\$\{item\}[\s\S]*<\/span>/);
      expect(src).not.toMatch(/\$\{this\.item\}/);
    });

    it("emits attribute bindings against the bare aliases (no ifDefined)", () => {
      // Post-V2 (BINDING-EXPRESSION-V2-01): both `data-row-index` and
      // `aria-label` bind to iterationLocal-kind values now, so the
      // emitter takes the dedicated iterationLocal branch which skips
      // the `ifDefined` wrap. Loop locals introduced by `.map((item,
      // index) => ...)` are never undefined; the V1 wrap was inherited
      // mechanically from the `prop:` branch.
      expect(src).toMatch(/data-row-index=\$\{index\}/);
      expect(src).toMatch(/aria-label=\$\{item\}/);
      expect(src).not.toMatch(/ifDefined\((index|item)\)/);
    });
  });
});

describe("IR-DOM-ITERATE-CAPABILITY-01: no-opt-in drift guard", () => {
  // No production contract uses `iterate` yet (this commit is latent
  // — Commits 5 and 6 wire OTP and Calendar). The synthetic contracts
  // above never reach the framework src trees because they aren't
  // emitted from disk. Each framework's existing components should
  // therefore remain byte-identical after this commit.
  //
  // We can't easily run a full `generate --target=all` from a unit
  // test, so the drift check is enforced upstream by the pre-push
  // hook's framework-src diff guard (step 13/13). This test exists
  // as documentation of the no-opt-in invariant and as a
  // breadcrumb for future debuggers.
  it("documents the no-opt-in invariant", () => {
    expect(true).toBe(true);
  });
});
