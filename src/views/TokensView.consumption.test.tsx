import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TokensView } from "./TokensView";
import type { Bundle, FoundationToken } from "../types/data";

// SHOWCASE-CONSUMPTION-03 A2 — the token explorer (the showcase's last raw
// <table>) is rebuilt from the DS Table compound. These render the view and
// assert the rendered DOM: cell-count conservation, the section-header
// colSpan rows, and the :target row id anchoring — all preserved through the
// migration, and every cell now a DS-generated element (no hand-rolled markup).

function token(
  layer: FoundationToken["layer"],
  path: string,
  value: string,
): FoundationToken {
  return { layer, path, value, type: "color", description: `${path} description` };
}

function makeBundle(): Bundle {
  return {
    components: [],
    primitives: [],
    schema: {},
    tokensCss: "",
    // core: 2 tokens, semantic: 1 token, no brand tokens → grouped yields a
    // core section (2 rows) and a semantic section (1 row).
    foundationTokens: [
      token("core", "color.bg", "#ffffff"),
      token("core", "color.fg", "#000000"),
      token("semantic", "color.accent", "{color.fg}"),
    ],
    brandTokens: [],
    generatedAt: 0,
  };
}

describe("TokensView token table — DS Table consumption", () => {
  it("renders the token explorer through the DS Table compound (no raw cells)", () => {
    const { container } = render(<TokensView bundle={makeBundle()} />);

    // DS Table renders <div class="table tokens-table"><table class="table__container">.
    const wrapper = container.querySelector("div.table.tokens-table");
    expect(wrapper).not.toBeNull();
    const table = wrapper!.querySelector("table.table__container");
    expect(table).not.toBeNull();

    // Header: 4 DS header cells (conserved vs the old <th>×4).
    const headerCells = table!.querySelectorAll(
      "thead.table__head th.table__headerCell",
    );
    expect(headerCells.length).toBe(4);
    expect([...headerCells].map((c) => c.textContent)).toEqual([
      "Token",
      "Value",
      "Type",
      "Description",
    ]);

    // Every rendered row/cell is a DS-generated element — no hand-rolled markup
    // slipped through (a raw <tr>/<td>/<th> would lack the DS BEM class).
    expect(table!.querySelectorAll("tr:not(.table__row)").length).toBe(0);
    expect(table!.querySelectorAll("td:not(.table__cell)").length).toBe(0);
    expect(table!.querySelectorAll("th:not(.table__headerCell)").length).toBe(0);
  });

  it("preserves the section-header colSpan rows", () => {
    const { container } = render(<TokensView bundle={makeBundle()} />);
    // core + semantic each contribute one section row spanning all 4 columns.
    const sectionCells = container.querySelectorAll(
      "tr.tokens-section-row td.table__cell[colspan='4']",
    );
    expect(sectionCells.length).toBe(2);
  });

  it("preserves the :target row id anchoring and conserves data-cell count", () => {
    const { container } = render(<TokensView bundle={makeBundle()} />);

    // Each token row carries id=token-<layer>-<path> for `:target` highlight.
    for (const id of [
      "token-core-color.bg",
      "token-core-color.fg",
      "token-semantic-color.accent",
    ]) {
      const row = container.querySelector(`tr[id="${id}"]`);
      expect(row, `expected anchored row #${id}`).not.toBeNull();
      expect(row!.classList.contains("table__row")).toBe(true);
    }

    // 3 token rows × 4 cells each (section rows excluded).
    const dataCells = container.querySelectorAll(
      "tbody.table__body tr.table__row:not(.tokens-section-row) td.table__cell",
    );
    expect(dataCells.length).toBe(3 * 4);
  });
});
