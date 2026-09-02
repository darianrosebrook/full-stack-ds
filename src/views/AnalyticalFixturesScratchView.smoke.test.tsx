// Render-smoke + leak guards for the analytical fixture playground.
// A1: the view renders index/structure/assertions/evidence from the dump.
// A2: the dump itself carries zero answer-key material (mirrors the sync
//     script's refusal — this asserts the COMMITTED bytes, not the writer).
// A3: qualifier badges render; the realization area is placeholder only.
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { FIXTURES } from "../data/analytical-fixtures/fixtures";
import { AnalyticalFixturesScratchView } from "./AnalyticalFixturesScratchView";
import { buildHref, useRoute } from "../router";

afterEach(cleanup);

const ALLOWED_TOP_LEVEL = new Set(["id", "structure", "assertions", "evidence"]);
// Exact-match key names that would smuggle the answer key into the showcase.
const FORBIDDEN_KEYS = new Set([
  "case",
  "case_id",
  "caseid",
  "cases",
  "verdict",
  "verdicts",
  "diagnostic",
  "diagnostics",
  "obligation",
  "obligations",
  "binding",
  "bindings",
  "holdout",
  "holdouts",
  "expected",
  "expectedverdict",
  "expected_diagnostic",
]);

function assertNoForbiddenKeys(node: unknown, path: string): void {
  if (Array.isArray(node)) {
    node.forEach((child, i) => assertNoForbiddenKeys(child, `${path}[${i}]`));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      expect(
        FORBIDDEN_KEYS.has(key.toLowerCase()),
        `answer-key material leaked into the dump at ${path}: key "${key}"`,
      ).toBe(false);
      assertNoForbiddenKeys(child, `${path}.${key}`);
    }
  }
}

function indexButtons(): HTMLElement[] {
  const list = document.querySelector(".afx-index__list");
  expect(list, "fixture index list is rendered").toBeTruthy();
  return Array.from(list!.querySelectorAll("button"));
}

describe("AnalyticalFixturesScratchView", () => {
  it("renders one index entry per dumped fixture, grouped by family", () => {
    render(<AnalyticalFixturesScratchView />);
    const buttons = indexButtons();
    expect(buttons.length).toBe(FIXTURES.length);
    expect(FIXTURES.length).toBeGreaterThan(0);
    // Every fixture id appears exactly once in the index.
    const ids = buttons.map((b) => b.textContent);
    expect(new Set(ids).size).toBe(FIXTURES.length);
    // Family grouping is present with real data behind it.
    expect(document.querySelector(".afx-index__group")).toBeTruthy();
  });

  it("renders structure and assertions for the default selection", () => {
    render(<AnalyticalFixturesScratchView />);
    const first = FIXTURES[0];
    expect(document.querySelector(".afx-detail__id")?.textContent).toBe(first.id);
    // The relation name and every assertion rendered as the question being asked.
    expect(document.body.textContent).toContain("survey");
    expect(document.body.textContent).toContain("mean of survey.satisfaction");
    const items = document.querySelectorAll(".afx-assertions li");
    expect(items.length).toBe(first.assertions.length);
  });

  it("renders evidence rows with per-observation qualifier badges", () => {
    render(<AnalyticalFixturesScratchView />);
    // The survival fixture carries a censored observation; select it.
    fireEvent.click(
      screen.getByRole("button", { name: "FX_SURVIVAL_MEAN_WITH_CENSORED_ROWS" }),
    );
    expect(document.body.textContent).toContain("censored");
    // Its evidence table has one row per grain member (s1, s2, s3).
    const cells = document.querySelectorAll(".afx-evidence tbody tr");
    expect(cells.length).toBe(3);
  });

  it("realization area is the explicit no-engine placeholder — nothing fabricated", () => {
    render(<AnalyticalFixturesScratchView />);
    const panel = document.querySelector(".afx-realization");
    expect(panel?.textContent).toContain("no projection engine exists yet");
    expect(panel?.querySelectorAll("svg, canvas, img")).toHaveLength(0);
    // It still names what a future projection must answer, from the dump only.
    expect(panel?.textContent).toContain("mean of survey.satisfaction");
  });

  it("scale filter narrows the index exactly as the data implies", () => {
    render(<AnalyticalFixturesScratchView />);
    const withCount = FIXTURES.filter((f) =>
      Object.values(f.structure.relations).some((r) =>
        Object.values(r.fields).some((fd) => fd.scale === "count"),
      ),
    );
    expect(withCount.length).toBeGreaterThan(0);
    expect(withCount.length).toBeLessThan(FIXTURES.length);
    fireEvent.change(screen.getByLabelText("Filter by field scale"), {
      target: { value: "count" },
    });
    expect(indexButtons().length).toBe(withCount.length);
  });

  it("the scratch URL resolves the analytical-fixtures route (URL-only surface)", () => {
    window.location.hash = "#/scratch/analytical-fixtures";
    const { result } = renderHook(() => useRoute());
    expect(result.current[0]).toEqual({ kind: "scratch", name: "analytical-fixtures" });
    expect(buildHref({ kind: "scratch", name: "analytical-fixtures" })).toBe(
      "#/scratch/analytical-fixtures",
    );
  });

  it("the committed dump is closed and answer-free (A2 leak guard)", () => {
    const seen = new Set<string>();
    for (const fixture of FIXTURES) {
      expect(seen.has(fixture.id), `duplicate fixture id ${fixture.id}`).toBe(false);
      seen.add(fixture.id);
      for (const key of Object.keys(fixture)) {
        expect(ALLOWED_TOP_LEVEL.has(key), `non-closed top-level key "${key}"`).toBe(true);
      }
      assertNoForbiddenKeys(fixture, fixture.id);
    }
  });
});
