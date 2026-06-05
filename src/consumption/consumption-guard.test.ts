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
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(HERE, ".."); // src/consumption -> src
const read = (rel: string) => readFileSync(resolve(SRC, rel), "utf8");
const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Exported so the negative-control test can prove these patterns actually bite.
export const BARE_CARD_RULE = /\.card(?![-\w])\s*[^{}]*\{/g;
export const BARE_TABS_RULE = /\.tabs(?![-\w])\s*[^{}]*\{/g;
// SHOWCASE-CONSUMPTION-03 A3/A4: DS Chip renders `class="chip chip--<variant>"`,
// so a bare `.chip {}` app rule cascades onto every DS Chip — same failure mode
// as .card/.tabs. The app pill family is `.pill`.
export const BARE_CHIP_RULE = /\.chip(?![-\w])\s*[^{}]*\{/g;

// A hand-rolled data table is signalled by a raw `<table>` element in the JSX.
// After SHOWCASE-CONSUMPTION-02/03 every showcase data table renders via the DS
// Table compound (`<Table>`, capital T) whose `<table>` lives in the generated
// package, never in src/. Code samples that show raw `<table>` markup as a
// string are not real DOM, so we strip template literals + comments first.
export const RAW_DATA_TABLE_TAG = /<table[\s/>]/g;

const stripCodeSamples = (src: string) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/\/\/[^\n]*/g, "") // line comments
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, "``"); // template-literal bodies

function collectTsx(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      collectTsx(full, acc);
    } else if (/\.tsx$/.test(entry) && !/\.(test|spec)\.tsx$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

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

  it("SHOWCASE-CONSUMPTION-03 A3: app.css does not declare a bare `.chip {}` rule (collides with DS Chip.css)", () => {
    const css = stripCssComments(read("styles/app.css"));
    const hits = css.match(BARE_CHIP_RULE) ?? [];
    expect(
      hits,
      `app.css declared a .chip rule (use .pill for the app pill label): ${hits.join(" | ")}`,
    ).toEqual([]);
  });

  it("SHOWCASE-CONSUMPTION-03 A4: no showcase view/section renders a raw data <table> (use the DS Table compound)", () => {
    const roots = [resolve(SRC, "views"), resolve(SRC, "layout")];
    const offenders: string[] = [];
    for (const root of roots) {
      for (const file of collectTsx(root)) {
        if (stripCodeSamples(readFileSync(file, "utf8")).match(RAW_DATA_TABLE_TAG)) {
          offenders.push(relative(SRC, file));
        }
      }
    }
    expect(
      offenders,
      `raw <table> markup found — render data tables via the DS Table compound (<Table>/<TableRow>/<TableCell>): ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("negative control: the collision + raw-table guards actually bite, and stay silent on legitimate code", () => {
    // If someone pasted these back into app.css, the CSS guards MUST fire.
    const regressed =
      ".card { border: 1px solid red; }\n.tabs { display: flex; }\n.chip { padding: 2px; }";
    expect(regressed.match(BARE_CARD_RULE)).not.toBeNull();
    expect(regressed.match(BARE_TABS_RULE)).not.toBeNull();
    expect(regressed.match(BARE_CHIP_RULE)).not.toBeNull();
    // ...and they must NOT fire on the legitimately-renamed classes.
    const renamed =
      ".panel {} .card--inset {} .card-toolbar {} .tokens-card {} .view-tabs {} .fw-tabs {} .pill {} .pill--mono {} .tokens-layer-dot {}";
    expect(renamed.match(BARE_CARD_RULE)).toBeNull();
    expect(renamed.match(BARE_TABS_RULE)).toBeNull();
    expect(renamed.match(BARE_CHIP_RULE)).toBeNull();

    // The raw-table guard fires on a hand-rolled <table> but not on the DS
    // compound (<Table>) nor on a <table> shown inside a doc code-sample string.
    expect(`<table className="x">`.match(RAW_DATA_TABLE_TAG)).not.toBeNull();
    expect(`<Table ariaLabel="x">`.match(RAW_DATA_TABLE_TAG)).toBeNull();
    expect(
      stripCodeSamples("const sample = `<table><tr><td>x</td></tr></table>`;").match(
        RAW_DATA_TABLE_TAG,
      ),
    ).toBeNull();
  });
});
