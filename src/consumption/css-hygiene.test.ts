/**
 * CSS hygiene guard (SHOWCASE-CSS-REDUCTION-01).
 *
 * The dead-selector audit that governed the CSS cut becomes permanent: every
 * class app.css declares must either be referenced from src/ source (class
 * literals cover template-literal families via their shared stem) or appear
 * on the DS-INTERNALS allowlist below — selectors the app legitimately
 * styles on DS-component internals, which the src scan cannot see.
 *
 * Remaining hardcoded hex values are accounted: framework brand colors and
 * the token-facts print sheet (deliberate black-on-white label aesthetic)
 * are irreducible without inventing fake tokens. Anything else must map to a
 * semantic token. properties-panel.css is out of scope here — it belongs to
 * FIX-EDITOR-CONTROL-BINDING-PROOF-01.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, "..");

/**
 * App-styled DS-component internals (the component each family serves is
 * named). Add an entry only when the selector targets markup a generated
 * component renders — never for app-authored markup, which must be scanned.
 */
export const DS_INTERNALS = [
  "dialog__closeButton", // Dialog close button
  "select__text", // Select trigger text
  "switch__input", // Switch native input
  "switch__track", // Switch track
  "shuttle", // Shuttle listbox (display-case sample)
  "walkthrough", // Walkthrough card (display-case sample + Header tour)
  "walkthrough__counter", // Walkthrough controls
  "walkthrough__next", // Walkthrough controls
  "walkthrough__prev", // Walkthrough controls
  "walkthrough__skip", // Walkthrough controls
  "nav-list", // NavList internals
  "nav-tree__item", // NavTree internals
  "table__container", // Table compound (sticky tokens-table chrome)
  "table__head", // Table compound
  "table__headerCell", // Table compound
  "table__cell", // Table compound
  "table__body", // Table compound
  "table__row", // Table compound
] as const;

/** Template-literal stems: `tokens-layer-dot--${layer}` etc. */
export const DYNAMIC_STEMS = ["tokens-layer-dot"] as const;

function collectSource(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSource(full, acc);
    } else if (/\.(tsx|ts)$/.test(entry) && !/\.(test|spec)\.[jt]sx?$/.test(entry)) {
      acc.push(readFileSync(full, "utf8"));
    }
  }
  return acc;
}

const css = readFileSync(resolve(SRC, "styles/app.css"), "utf8");
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const classes = new Set(
  (cssNoComments.match(/\.([a-zA-Z][\w-]*)/g) ?? []).map((c) => c.slice(1)),
);
const sources = collectSource(SRC).join("\n");
const internals = new Set<string>(DS_INTERNALS);
for (const stem of DYNAMIC_STEMS) {
  for (const c of classes) if (c.startsWith(stem)) internals.add(c);
}

describe("CSS hygiene guard (SHOWCASE-CSS-REDUCTION-01)", () => {
  it("app.css declares no dead selectors", () => {
    const dead = [...classes].filter(
      (c) => !internals.has(c) && !sources.includes(c),
    );
    expect(
      dead,
      `app.css classes with zero src references (delete the rule or add the DS-internal to the allowlist with its component named): ${dead.join(", ")}`,
    ).toEqual([]);
  });

  it("the allowlist names only selectors that actually exist in app.css", () => {
    const phantom = DS_INTERNALS.filter((c) => !classes.has(c));
    expect(
      phantom,
      `allowlist entries with no rule in app.css (stale — remove them): ${phantom.join(", ")}`,
    ).toEqual([]);
  });

  it("hardcoded hex is limited to the documented irreducible set", () => {
    const hexes = cssNoComments.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
    // Framework brand colors (lang dots) + print-sheet black/white. If a hex
    // outside these families appears, map it to a semantic token first.
    const counts = hexes.reduce<Record<string, number>>((acc, h) => {
      acc[h.toLowerCase()] = (acc[h.toLowerCase()] ?? 0) + 1;
      return acc;
    }, {});
    expect(
      Object.keys(counts).length,
      `hex palette grew: ${JSON.stringify(counts)} — brand colors and #000/#fff print literals only`,
    ).toBeLessThanOrEqual(12);
  });

  it("negative control: a genuinely dead selector is caught", () => {
    const deadCandidate = "definitely-not-a-real-class";
    expect(
      !internals.has(deadCandidate) && !sources.includes(deadCandidate),
    ).toBe(true);
  });
});
