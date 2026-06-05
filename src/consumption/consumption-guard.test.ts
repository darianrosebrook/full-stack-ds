/**
 * DS consumption regression guard (SHOWCASE-CONSUMPTION-02, acceptance A7).
 *
 * Pass 1 (SHOWCASE-CONSUMPTION-01) removed two global CSS cascade collisions
 * and swapped two hand-rolled controls for DS components. Those fixes were
 * verified visually, but the test suite renders none of these views — so a
 * regression (someone reintroducing a bare `.card {}` rule, or swapping the DS
 * Input back to a raw `<input>`) would leave `pnpm test` 100% green.
 *
 * This is the static guard that closes that gap. It reads the source/CSS as
 * text and asserts the invariants that the cascade collisions stay dead and
 * TokensView keeps consuming the DS components. Cheap, fast, no DOM.
 *
 * Note on the regexes: `\.card(?![-\w])` matches the *bare* `.card` selector
 * but NOT `.card--inset`, `.card-toolbar`, `.tokens-card`, or `.cardiac` — and
 * we strip CSS comments first so the explanatory comment that mentions
 * `.card`/`.tabs` by name does not trip the guard.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, ".."); // src/consumption -> src
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");
const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Exported so the negative-control test can prove these patterns actually bite.
export const BARE_CARD_RULE = /\.card(?![-\w])\s*[^{}]*\{/g;
export const BARE_TABS_RULE = /\.tabs(?![-\w])\s*[^{}]*\{/g;

describe("DS consumption guard (A7) — Pass 1 fixes must not silently regress", () => {
  it("A5: app.css does not reintroduce a bare `.card {}` rule (collides with DS Card.css)", () => {
    const css = stripCssComments(read("styles/app.css"));
    const hits = css.match(BARE_CARD_RULE) ?? [];
    expect(
      hits,
      `app.css reintroduced a .card rule (use .panel for the app surface): ${hits.join(" | ")}`,
    ).toEqual([]);
  });

  it("A6: app.css does not reintroduce a bare `.tabs {}` rule (collides with DS Tabs.css)", () => {
    const css = stripCssComments(read("styles/app.css"));
    const hits = css.match(BARE_TABS_RULE) ?? [];
    expect(
      hits,
      `app.css reintroduced a .tabs rule (use .view-tabs for the view-mode nav): ${hits.join(" | ")}`,
    ).toEqual([]);
  });

  it("A4: TokensView consumes DS Input + Chip and renders no raw <input>", () => {
    const src = read("views/TokensView.tsx");
    const dsImport =
      src.match(
        /import\s*\{([^}]*)\}\s*from\s*["']@full-stack-ds\/react["']/,
      )?.[1] ?? "";
    expect(dsImport, "TokensView must import a DS component from @full-stack-ds/react").not.toBe(
      "",
    );
    expect(dsImport, "TokensView must import DS Input").toMatch(/\bInput\b/);
    expect(dsImport, "TokensView must import DS Chip").toMatch(/\bChip\b/);
    // The token filter must be the DS Input, never a raw <input> again.
    expect(src, "TokensView must not render a raw <input> (use DS Input)").not.toMatch(
      /<input[\s/>]/,
    );
  });

  it("negative control: the .card/.tabs guard regexes actually match a reintroduced collision", () => {
    // If someone pasted these back into app.css, the guards above MUST fire.
    const regressed = ".card { border: 1px solid red; }\n.tabs { display: flex; }";
    expect(regressed.match(BARE_CARD_RULE)).not.toBeNull();
    expect(regressed.match(BARE_TABS_RULE)).not.toBeNull();
    // ...and they must NOT fire on the legitimately-renamed classes.
    const renamed =
      ".panel { border: 0 } .card--inset {} .card-toolbar {} .tokens-card {} .view-tabs {} .fw-tabs {}";
    expect(renamed.match(BARE_CARD_RULE)).toBeNull();
    expect(renamed.match(BARE_TABS_RULE)).toBeNull();
  });
});
