import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { generateReactComponentSource } from "./react/component-source.js";
import { generateVueCompoundStateParts } from "./vue/component-source.js";
import { generateSvelteCompoundStateParts } from "./svelte/component-source.js";
import { generateLitComponentSource } from "./lit/component-source.js";
import { generateAngularCompoundStateParts } from "./angular/component-source.js";
import { getGroupHostOrnamentPart } from "./react/hook-source.js";

// TABS-INDICATOR-REALIZATION-01 fixture.
//
// A minimal compound-state-container contract that declares a singleton
// ornament part (`indicator`) as a direct child of the group host (`list`)
// in anatomy.dom. The emitter's job: realize that declared element as a
// sibling of the consumer's children inside the group host. This is the
// pattern Tabs uses to render its active-tab underline indicator.
//
// Scope notes pinned by these tests:
//   - Declared DOM realization only. The assertions check that an
//     `aria-hidden="true"` element with the BEM `__indicator` class appears
//     inside the tablist subcomponent across all five frameworks.
//   - They do NOT prove measured indicator positioning, active-tab width
//     synchronization, keyboard roving behavior, or animation correctness
//     beyond preserving the contract-authored CSS/motion surface.
//   - The selection rule (sibling part of the interactive item, exactly
//     one, not slot/children) is also pinned via an IR-level unit test so
//     future contracts that introduce *two* ornaments fail loudly rather
//     than silently picking one.

const CONTRACT: ComponentContract = {
  name: "FixtureTabs",
  cssPrefix: "fixture-tabs",
  layer: "compound",
  anatomy: {
    parts: ["root", "list", "tab", "indicator", "panel"],
    details: {
      list: { role: "group" },
      tab: { role: "item", multiple: true, interactive: true, focusable: "roving" },
      panel: { role: "region", multiple: true },
    },
    dom: {
      tag: "div",
      part: "root",
      children: [
        {
          tag: "div",
          part: "list",
          attrs: { role: "tablist" },
          children: [
            {
              tag: "button",
              part: "tab",
              attrs: { role: "tab", type: "button" },
            },
            {
              tag: "span",
              part: "indicator",
              attrs: { "aria-hidden": "true" },
            },
          ],
        },
        {
          tag: "div",
          part: "panel",
          children: [{ tag: "children" }],
        },
      ],
    },
  },
  props: {
    styled: {
      members: [
        { name: "value", type: "string", description: "Active tab value" },
        { name: "defaultValue", type: "string", description: "Uncontrolled default" },
        { name: "onValueChange", type: "(value: string) => void", description: "Change handler" },
      ],
    },
  },
  channels: {
    activeTab: {
      value: "value",
      defaultValue: "defaultValue",
      onChange: "onValueChange",
      valueType: "string",
    },
  },
};

const ir = buildComponentIR(CONTRACT);

describe("TABS-INDICATOR-REALIZATION-01: group-host ornament detection", () => {
  it("identifies indicator as the singleton ornament inside the group host", () => {
    const ornament = getGroupHostOrnamentPart(ir);
    expect(ornament?.name).toBe("indicator");
  });

  it("returns undefined when the contract has no group-host ornament", () => {
    // Same shape as CONTRACT but with no indicator child under the list.
    const noOrnament: ComponentContract = {
      ...CONTRACT,
      name: "NoOrnamentTabs",
      cssPrefix: "no-ornament-tabs",
      anatomy: {
        parts: ["root", "list", "tab", "panel"],
        details: {
          list: { role: "group" },
          tab: { role: "item", multiple: true, interactive: true, focusable: "roving" },
          panel: { role: "region", multiple: true },
        },
        dom: {
          tag: "div",
          part: "root",
          children: [
            {
              tag: "div",
              part: "list",
              attrs: { role: "tablist" },
              children: [
                { tag: "button", part: "tab", attrs: { role: "tab", type: "button" } },
              ],
            },
            {
              tag: "div",
              part: "panel",
              children: [{ tag: "children" }],
            },
          ],
        },
      },
    };
    expect(getGroupHostOrnamentPart(buildComponentIR(noOrnament))).toBeUndefined();
  });
});

describe("TABS-INDICATOR-REALIZATION-01: declared DOM realization per framework", () => {
  it("React TabsList renders <span className=\"<prefix>__indicator\" aria-hidden=\"true\" /> inside the tablist", () => {
    const src = generateReactComponentSource(ir, "../../primitives");
    // Must appear as a sibling of {children} inside the tablist.
    expect(src).toMatch(
      /role="tablist"[\s\S]*\{children\}[\s\S]*<span\s+className="fixture-tabs__indicator"\s+aria-hidden="true"\s*\/>/,
    );
  });

  // Vue/Svelte/Angular emit the List as a separate sub-component file.
  // Reach into the parts API to assert the right output. (React emits its
  // subcomponents inline in the same file, and Lit emits all classes
  // inline as well — those are covered by the *ComponentSource calls
  // above and below.)
  it("Vue TabsList renders <span :class=\"'<prefix>__indicator'\" aria-hidden=\"true\"></span> after the default slot", () => {
    const parts = generateVueCompoundStateParts(ir);
    const listPart = parts.find((p) => p.name.endsWith("List"));
    expect(listPart).toBeDefined();
    expect(listPart!.content).toMatch(
      /<slot \/>[\s\S]*<span :class="'fixture-tabs__indicator'" aria-hidden="true"><\/span>/,
    );
  });

  it("Svelte TabsList renders the indicator span after {@render children?.()}", () => {
    const parts = generateSvelteCompoundStateParts(ir);
    const listPart = parts.find((p) => p.name.endsWith("List"));
    expect(listPart).toBeDefined();
    expect(listPart!.content).toMatch(
      /\{@render children\?\.\(\)\}[\s\S]*<span class="fixture-tabs__indicator" aria-hidden="true"><\/span>/,
    );
  });

  it("Angular TabsList renders the indicator span after <ng-content />", () => {
    const parts = generateAngularCompoundStateParts(ir);
    const listPart = parts.find((p) => p.name.includes("List"));
    expect(listPart).toBeDefined();
    expect(listPart!.content).toMatch(
      /<ng-content \/><span \[ngClass\]="'fixture-tabs__indicator'" aria-hidden="true"><\/span>/,
    );
  });

  it("Lit TabsList renders the indicator span after the default <slot></slot>", () => {
    const src = generateLitComponentSource(ir);
    expect(src).toMatch(
      /<slot><\/slot><span class="fixture-tabs__indicator" aria-hidden="true"><\/span>/,
    );
  });
});
