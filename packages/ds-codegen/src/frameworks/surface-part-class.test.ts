/**
 * FIX-SURFACE-PART-CLASS-01.
 *
 * The anchored-surface emitters mark `trigger` and `content` with
 * `data-<prefix>-<part>` and emit no part class — the trigger may be the
 * consumer's own adopted element (React `asChild`, Vue slot-props host
 * adoption) and the content is portaled out of the `.<prefix>` ancestor. So a
 * bare part key in styles.json must lower to the marker selector.
 *
 * Before this, Tooltip's `content` block compiled to `.tooltip__content`, which
 * matched zero elements: all 11 declared surface properties (background,
 * border, padding, max-width) were inert and the tooltip rendered as bare text.
 * Popover had worked around it by hand-writing `[data-popover-content]` as its
 * styles key, and had ALSO left a duplicate copy of the surface chrome on
 * `root`, so a closed Popover painted its trigger as a filled panel.
 *
 * These tests read the REAL corpus contracts, not fixtures: the defect was a
 * mismatch between what the contract declared and what the corpus rendered, and
 * a fixture would not have caught the Popover root duplication.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ComponentContract } from "../contract.js";
import { getCssPrefix } from "../contract.js";
import {
  computeCssBlocks,
  expandOptionsForContract,
  expandStylesKey,
} from "../ir.js";

const CONTRACTS_ROOT = path.resolve(__dirname, "..", "..", "..", "ds-contracts");

/**
 * Read a corpus contract with its styles sidecar merged, mirroring how the CLI
 * assembles the two before handing them to the IR. Reading the real files is
 * the point: the defect was a divergence between declared and rendered, which a
 * fixture cannot reproduce.
 */
function loadContract(name: string): ComponentContract {
  const dir = path.join(CONTRACTS_ROOT, "components", name);
  const contract = JSON.parse(
    fs.readFileSync(path.join(dir, `${name}.contract.json`), "utf-8"),
  ) as ComponentContract;
  const stylesPath = path.join(dir, `${name}.styles.json`);
  if (fs.existsSync(stylesPath)) {
    (contract as { styles?: unknown }).styles = JSON.parse(
      fs.readFileSync(stylesPath, "utf-8"),
    );
  }
  return contract;
}

/** The anchored-surface family in the corpus today. */
const SURFACES = ["Tooltip", "Popover"] as const;

describe("anchored-surface part keys lower to their marker selectors", () => {
  for (const name of SURFACES) {
    it(`${name} emits marker selectors for trigger and content, never part classes`, () => {
      const contract = loadContract(name);
      const prefix = getCssPrefix(contract);
      // Guard the guard: a wrong/undefined prefix would make every
      // not.toContain below pass vacuously.
      expect(prefix).toBe(name.toLowerCase());
      const selectors = computeCssBlocks(contract, prefix).map((b) => b.selector);

      // The part class form is what matched nothing. It must not appear.
      expect(selectors).not.toContain(`.${prefix}__content`);
      expect(selectors).not.toContain(`.${prefix}__trigger`);

      // The content selector must be reachable. Portaled content escapes the
      // root ancestor, so it is emitted unqualified.
      const contentSelector = selectors.find((s) =>
        s.includes(`[data-${prefix}-content]`),
      );
      expect(contentSelector, "no content marker selector emitted").toBeDefined();
      if (contract.portal?.enabled === true) {
        expect(contentSelector).toBe(`[data-${prefix}-content]`);
      }

      expect(
        selectors.some((s) => s.includes(`[data-${prefix}-trigger]`)),
        "no trigger marker selector emitted",
      ).toBe(true);
    });

    it(`${name} authors its parts by part key, not by hand-written selector`, () => {
      const contract = loadContract(name);
      const keys = Object.keys(contract.styles ?? {});
      // A raw attribute/descendant selector as a styles key is the workaround
      // this slice removes; the part vocabulary is the only authoring surface.
      const rawSelectorKeys = keys.filter(
        (k) => k.includes("[data-") || k.includes(" "),
      );
      expect(rawSelectorKeys).toEqual([]);
    });
  }

  it("Popover's root paints nothing — surface chrome belongs to content", () => {
    // The contract calls root "a host that coordinates trigger and content".
    // A closed Popover must not render a filled panel around its trigger.
    const contract = loadContract("Popover");
    const root = (contract.styles ?? {}).root ?? {};
    for (const property of [
      "background-color",
      "border-color",
      "box-shadow",
      "border-radius",
      "padding",
    ]) {
      expect(
        Object.keys(root),
        `Popover root must not declare ${property}`,
      ).not.toContain(property);
    }
    // …while the content surface still carries all of it.
    const content = (contract.styles ?? {}).content ?? {};
    for (const property of [
      "background-color",
      "border-color",
      "box-shadow",
      "border-radius",
      "padding",
    ]) {
      expect(Object.keys(content)).toContain(property);
    }
  });

  it("leaves non-surface components on the part-class lowering", () => {
    // Guard against over-reach: this must not change how ordinary compounds
    // lower their parts. Accordion's subcomponents DO emit part classes.
    const contract = loadContract("Accordion");
    expect(expandOptionsForContract(contract, "accordion")?.surfacePartSelectors)
      .toBeUndefined();
    expect(expandStylesKey("content", "accordion")).toBe(".accordion__content");
  });

  it("keeps the data-* marker in every framework's generated CSS", () => {
    // The marker is the behavioural hook the generated surface tests assert;
    // the selector is the styling hook. Both must survive. Verified per
    // framework from its own emitted CSS, not inferred from React.
    const targets = {
      react: (n: string) => `packages/ds-react/src/components/${n}/${n}.css`,
      vue: (n: string) => `packages/ds-vue/src/components/${n}/${n}.css`,
      svelte: (n: string) => `packages/ds-svelte/src/components/${n}/${n}.css`,
      angular: (n: string) => `packages/ds-angular/src/components/${n}/${n}.css`,
      lit: (n: string) => `packages/ds-lit/src/components/${n}/${n}.css`,
    };
    const repoRoot = path.resolve(__dirname, "..", "..", "..", "..");
    for (const name of SURFACES) {
      const prefix = getCssPrefix(loadContract(name));
      for (const [target, rel] of Object.entries(targets)) {
        const file = path.join(repoRoot, rel(name));
        if (!fs.existsSync(file)) continue;
        const css = fs.readFileSync(file, "utf-8");
        expect(css, `${target} ${name}: no content marker selector`).toContain(
          `[data-${prefix}-content]`,
        );
        expect(css, `${target} ${name}: no trigger marker selector`).toContain(
          `[data-${prefix}-trigger]`,
        );
        expect(css, `${target} ${name}: inert part class still emitted`).not.toContain(
          `.${prefix}__content`,
        );
      }
    }
  });
});
